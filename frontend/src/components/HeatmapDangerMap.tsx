import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Card from "./Card";

interface HeatmapDangerMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
}

export default function HeatmapDangerMap({ lat = 10.7769, lng = 106.7009, zoom = 12 }: HeatmapDangerMapProps) {
  useEffect(() => {
    // Load Leaflet library dynamically
    if (!window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [lat, lng, zoom]);

  const initMap = () => {
    if (window.L) {
      const container = document.getElementById("heatmap-container");
      if (container && !container.innerHTML.includes("map")) {
        const map = window.L.map("heatmap-container").setView([lat, lng], zoom);

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);

        // Add sample heatmap data points
        const heatData = [
          [10.7769, 106.7009, 0.8], // Red - High
          [10.76, 106.71, 0.5], // Yellow - Medium
          [10.78, 106.69, 0.2], // Green - Low
        ];

        heatData.forEach(([lat, lng, intensity]) => {
          const color = intensity > 0.7 ? "red" : intensity > 0.4 ? "yellow" : "green";
          window.L.circleMarker([lat, lng], {
            radius: 10 + intensity * 20,
            fillColor: color,
            color: "white",
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6,
          }).addTo(map);
        });
      }
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-bold mb-3">🗺️ Danger Heatmap</h3>

      <div id="heatmap-container" className="w-full h-64 rounded-lg border dark:border-gray-600 bg-gray-100 dark:bg-gray-700" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 grid grid-cols-3 gap-2">
        {[
          { color: "bg-red-500", label: "High Risk" },
          { color: "bg-yellow-500", label: "Medium" },
          { color: "bg-green-500", label: "Safe" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <div className={`w-4 h-4 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </motion.div>
    </Card>
  );
}

// Extend window type for Leaflet
declare global {
  interface Window {
    L?: any;
  }
}
