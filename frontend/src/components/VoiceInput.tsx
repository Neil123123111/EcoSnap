import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

export default function VoiceInput({ onTranscript, isRecording, setIsRecording }: VoiceInputProps) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        setIsProcessing(true);

        // Simple speech-to-text (would use real API like Whisper/Web Speech API)
        const text = await simulateSpeechToText(audioBlob);
        setTranscript(text);
        onTranscript(text);
        setIsProcessing(false);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      alert("Microphone access denied: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const simulateSpeechToText = async (blob: Blob): Promise<string> => {
    // Placeholder for real API call to Whisper/Web Speech API
    return `Voice transcription would appear here (audio: ${(blob.size / 1024).toFixed(2)}KB)`;
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
          {isProcessing ? "Processing..." : isRecording ? "🔴 Stop Recording" : "🎤 Start Recording"}
        </motion.button>

        {isRecording && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-4 h-4 bg-red-500 rounded-full"
          />
        )}
      </div>

      {transcript && (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Transcript:</p>
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              onTranscript(e.target.value);
            }}
            className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500"
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
