import { useState } from "react";
import { motion } from "framer-motion";
import Badge from "./Badge";
import Alert from "./Alert";

interface DangerZoneDetectionProps {
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function DangerZoneDetection({ onLocationUpdate }: DangerZoneDetectionProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [dangerLevel, setDangerLevel] = useState<"safe" | "warning" | "danger">("safe");
  const [nearbyReports, setNearbyReports] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getDangerLevel = (reportCount: number): "safe" | "warning" | "danger" => {
    if (reportCount > 10) return "danger";
    if (reportCount > 5) return "warning";
    return "safe";
  };

  const detectLocation = () => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          onLocationUpdate?.(latitude, longitude);

          // Simulate fetching nearby reports
          const simulatedReports = Math.floor(Math.random() * 15);
          setNearbyReports(simulatedReports);
          setDangerLevel(getDangerLevel(simulatedReports));
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
          alert("Unable to access location. Please enable GPS.");
        }
      );
    }
  };

  const dangerColors = {
    safe: { bg: "bg-green-50 dark:bg-green-900/20", badge: "success", banner: "bg-green-500" } as const,
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      badge: "warning",
      banner: "bg-yellow-500",
    } as const,
    danger: { bg: "bg-red-50 dark:bg-red-900/20", badge: "danger", banner: "bg-red-500" } as const,
  };

  const color = dangerColors[dangerLevel];

  return (
    <div className="space-y-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={detectLocation}
        disabled={isLoading}
        className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 disabled:opacity-50 transition"
      >
        {isLoading ? "🔍 Detecting location..." : "📍 Check Danger Zone"}
      </motion.button>

      {location && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-lg ${color.bg}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Location</span>
              <Badge variant={color.badge}>
                {dangerLevel === "safe" ? "🟢 Safe" : dangerLevel === "warning" ? "🟡 Warning" : "🔴 Danger"}
              </Badge>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400">
              Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
            </p>

            <div className="pt-2 border-t dark:border-gray-600">
              <p className="text-sm font-semibold mb-2">Nearby Reports: {nearbyReports}</p>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${color.banner}`}
                  style={{ width: `${Math.min((nearbyReports / 15) * 100, 100)}%` }}
                />
              </div>
            </div>

            {dangerLevel !== "safe" && (
              <Alert
                variant={dangerLevel === "warning" ? "warning" : "danger"}
                message={
                  dangerLevel === "warning"
                    ? "Caution: Multiple reports in this area"
                    : "Alert: High danger zone detected"
                }
                duration={0}
              />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
