import React from "react";
import { motion } from "framer-motion";
import "../css/loading.css";

export default function Loading({ text = "Loading...", fullPage = false }) {
  const containerClass = fullPage ? "loading-container loading-fullpage" : "loading-container";

  return (
    <div className={containerClass}>
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
            stroke="#1E3A5F"
            strokeWidth="3"
            fill="none"
            strokeDasharray="80 40"
            strokeLinecap="round"
          />
        </motion.svg>
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
}

// Skeleton Loading Component
export function SkeletonLoader({ type = "text", count = 1 }) {
  const renderSkeleton = () => {
    switch (type) {
      case "title":
        return <div className="skeleton skeleton-title" />;
      case "avatar":
        return <div className="skeleton skeleton-avatar" />;
      case "button":
        return <div className="skeleton skeleton-button" />;
      case "card":
        return <div className="skeleton skeleton-card" />;
      default:
        return <div className="skeleton skeleton-text" />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
}

// Inline Loading Component
export function InlineLoading({ text = "Loading" }) {
  return (
    <div className="loading-inline">
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
          stroke="#1E3A5F"
          strokeWidth="3"
          fill="none"
          strokeDasharray="80 40"
          strokeLinecap="round"
        />
      </motion.svg>
      <span className="loading-text">{text}</span>
    </div>
  );
}
