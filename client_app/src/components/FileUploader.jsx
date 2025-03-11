import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

function FileUploader({ onFileSelect, acceptedTypes, currentFile }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      {currentFile ? (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">{currentFile.name}</span>
          <button
            onClick={() => onFileSelect(null)}
            className="text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${Math.random()}`}
          />
          <label
            htmlFor={`file-upload-${Math.random()}`}
            className="cursor-pointer flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </label>
        </div>
      )}
    </div>
  );
}

export default FileUploader; 