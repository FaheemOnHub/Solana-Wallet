import React from "react";

const IsLoading = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      <span>{text}</span>
    </div>
  );
};

export default IsLoading;
