import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type AlertVariant = "success" | "warning" | "danger" | "info";

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  duration?: number;
}

export default function Alert({ variant, title, message, onClose, duration = 5000 }: AlertProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const variants: Record<AlertVariant, { bg: string; border: string; icon: string }> = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-700",
      icon: "✓",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-700",
      icon: "⚠",
    },
    danger: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-700",
      icon: "✕",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-700",
      icon: "ℹ",
    },
  };

  const style = variants[variant];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`${style.bg} border ${style.border} rounded-lg p-4 mb-4`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{style.icon}</span>
            <div className="flex-1">
              {title && <h4 className="font-bold mb-1">{title}</h4>}
              <p className="text-sm">{message}</p>
            </div>
            {onClose && (
              <button onClick={() => setIsVisible(false)} className="text-lg">
                ✕
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
