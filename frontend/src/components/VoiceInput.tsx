import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { translateText } from "../services/api";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

type BrowserSpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

export default function VoiceInput({ onTranscript, isRecording, setIsRecording }: VoiceInputProps) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recognitionTextRef = useRef("");

  const [transcript, setTranscript] = useState("");
  const [originalTranscript, setOriginalTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioMimeType, setAudioMimeType] = useState("audio/webm");

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      recognitionRef.current?.stop();
      mediaRecorder.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, [audioUrl]);

  const getSupportedAudioMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];

    return candidates.find(
      (type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)
    );
  };

  const startRecording = async () => {
    try {
      const SpeechRecognitionApi =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionApi) {
        alert("Browser cua ban khong ho tro speech recognition. Hay dung Chrome hoac Edge.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeType = getSupportedAudioMimeType();
      mediaRecorder.current = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      audioChunks.current = [];
      recognitionTextRef.current = "";
      setAudioUrl("");
      setAudioMimeType(supportedMimeType || mediaRecorder.current.mimeType || "audio/webm");
      setTranscript("");
      setOriginalTranscript("");
      setMessage("");
      onTranscript("");

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blobType =
          audioChunks.current[0]?.type || mediaRecorder.current?.mimeType || supportedMimeType || "audio/webm";
        const audioBlob = new Blob(audioChunks.current, { type: blobType });

        if (audioBlob.size > 0) {
          setAudioMimeType(blobType);
          setAudioUrl(URL.createObjectURL(audioBlob));
        }

        mediaRecorder.current?.stream.getTracks().forEach((track) => track.stop());
      };

      const recognition = new SpeechRecognitionApi();
      recognition.lang = "vi-VN";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = async (event) => {
        const chunks: string[] = [];
        for (let index = 0; index < event.results.length; index += 1) {
          chunks.push(event.results[index][0]?.transcript ?? "");
        }

        const spokenText = chunks.join(" ").trim();
        recognitionTextRef.current = spokenText;
        setOriginalTranscript(spokenText);
        setTranscript(spokenText);
        onTranscript(spokenText);
      };

      recognition.onerror = (event) => {
        if (event.error !== "aborted") {
          setMessage(`Speech recognition loi: ${event.error}`);
        }
      };

      recognition.onend = async () => {
        const spokenText = recognitionTextRef.current.trim();

        if (!spokenText) {
          setMessage("Chua nhan duoc transcript. Hay noi ro hon va dung Chrome/Edge.");
          setIsRecording(false);
          return;
        }

        setIsProcessing(true);
        setMessage("Dang hoan tat transcript...");

        try {
          const translatedText = await translateText(spokenText, "vi", "auto");
          const finalText = translatedText || spokenText;
          setTranscript(finalText);
          onTranscript(finalText);
          setMessage("Transcript da san sang.");
        } catch {
          setTranscript(spokenText);
          onTranscript(spokenText);
          setMessage("Khong dich duoc, dang hien thi transcript goc.");
        } finally {
          setIsProcessing(false);
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      mediaRecorder.current.start();
      recognition.start();
      setIsRecording(true);
    } catch (error) {
      alert("Microphone access denied: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
          } disabled:opacity-50`}
        >
          {isProcessing ? "Dang xu ly..." : isRecording ? "End Recording" : "Start Recording"}
        </motion.button>

        {isRecording && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="h-4 w-4 rounded-full bg-red-500"
          />
        )}
      </div>

      {(transcript || originalTranscript || message) && (
        <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">Transcript tieng Viet:</p>
          {originalTranscript && (
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Transcript goc: {originalTranscript}
            </p>
          )}
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              onTranscript(e.target.value);
            }}
            className="w-full rounded border p-2 text-gray-900 dark:border-gray-500 dark:bg-gray-600 dark:text-white"
            rows={3}
            placeholder="Noi dung transcript se hien thi o day sau khi dung ghi am"
          />
          {message && (
            <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">{message}</p>
          )}
        </div>
      )}

      {audioUrl && (
        <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">Nghe lai ban ghi am:</p>
          <audio key={audioUrl} controls className="w-full">
            <source src={audioUrl} type={audioMimeType} />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}
