import React from "react";

const LoadingSpinner = ({ size = "md", text = "Loading...", fullScreen = false }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const containerClass = fullScreen
    ? "flex items-center justify-center min-h-screen"
    : "flex items-center justify-center min-h-[200px]";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div
          className={`inline-block animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400 ${sizes[size]} mb-4`}
        ></div>
        {text && <p className="text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;


