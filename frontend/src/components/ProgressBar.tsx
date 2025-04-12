import React, { CSSProperties } from "react";

// Inline styles
const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    backgroundColor: "#e5e7eb",
    borderRadius: "9999px",
    height: "0.625rem",
  },
  progressBar: {
    backgroundColor: "#2563eb",
    height: "0.625rem",
    borderRadius: "9999px",
    transition: "width 300ms ease",
  },
};

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(0, progress), 100);

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.progressBar,
          width: `${normalizedProgress}%`,
        }}
      />
    </div>
  );
};
