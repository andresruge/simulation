import React from "react";

interface ButtonProps {
  label?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

const Button: React.FC<ButtonProps> = ({
  label,
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  variant = "primary",
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md text-white font-medium transition-colors duration-200";
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-gray-600 hover:bg-gray-700",
    danger: "bg-red-600 hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
      }`}
    >
      {label || children}
    </button>
  );
};

export default Button;
