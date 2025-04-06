import React from "react";

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(0, progress), 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${normalizedProgress}%` }}
      />
    </div>
  );
};
