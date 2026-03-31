import React from "react";
import { motion } from "framer-motion";
import Card from "./Card";
import Badge from "./Badge";

interface CommunityDataTransparencyProps {
  communityReports?: any[];
}

export default function CommunityDataTransparency({ communityReports = [] }: CommunityDataTransparencyProps) {
  // Mock data
  const mockReports = [
    {
      id: 1,
      uploaderName: "Alice Johnson",
      type: "Pollution",
      verificationCount: 12,
      source: "user_upload",
      timestamp: "2 hours ago",
      area: "District 1",
    },
    {
      id: 2,
      uploaderName: "AI Detection",
      type: "Waste",
      verificationCount: 8,
      source: "AI_generated",
      timestamp: "1 hour ago",
      area: "District 2",
    },
    {
      id: 3,
      uploaderName: "Community",
      type: "Water Contamination",
      verificationCount: 15,
      source: "community_verified",
      timestamp: "30 minutes ago",
      area: "District 3",
    },
  ];

  const getSourcBadge = (source: string) => {
    const badges: Record<string, { variant: any; label: string }> = {
      user_upload: { variant: "info", label: "👤 User Upload" },
      AI_generated: { variant: "success", label: "🤖 AI Generated" },
      community_verified: { variant: "warning", label: "✓ Community Verified" },
    };
    return badges[source] || badges.user_upload;
  };

  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg mb-4">📊 Community Reports ({mockReports.length})</h3>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {mockReports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{report.uploaderName}</p>
                <p className="text-xs text-gray-500">{report.area} • {report.timestamp}</p>
              </div>
              <Badge variant={getSourcBadge(report.source).variant}>
                {getSourcBadge(report.source).label}
              </Badge>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{report.type}</p>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600 dark:text-green-400">✓ {report.verificationCount} verified</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t dark:border-gray-600">
        <button className="w-full py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          View All Reports →
        </button>
      </div>
    </Card>
  );
}
