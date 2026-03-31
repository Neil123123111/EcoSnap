import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      className={`
        bg-white dark:bg-gray-800
        rounded-lg shadow-md hover:shadow-lg
        transition-shadow duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
