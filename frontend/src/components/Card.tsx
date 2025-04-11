import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-3 border border-gray-200 hover:border-blue-500 transition-colors duration-200 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
