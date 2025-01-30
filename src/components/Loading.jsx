import React from "react";
import { motion } from "framer-motion";
import "../css/loading.css";

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <motion.svg
          className="loading-spinner"
          viewBox="0 0 50 50"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="blue"
            strokeWidth="3"
            fill="none"
            strokeDasharray="50 50"
            strokeDashoffset="0"
            strokeLinecap="round"
          />
        </motion.svg>
        <h1 className="loading-text">Loading...</h1>
      </div>
    </div>
  );
}
