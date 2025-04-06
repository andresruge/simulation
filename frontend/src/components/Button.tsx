import React from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = "primary",
  type = "button",
}) => {
  const getVariantClass = (): string => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 hover:bg-blue-700";
      case "secondary":
        return "bg-gray-600 hover:bg-gray-700";
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "danger":
        return "bg-red-600 hover:bg-red-700";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-white rounded-md ${getVariantClass()} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {label}
    </button>
  );
};
