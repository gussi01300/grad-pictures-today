"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = "image/jpeg,image/png,image/webp",
  maxSize = 10 * 1024 * 1024,
  className,
  disabled,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    setError(null);

    const allowedTypes = accept.split(",").map((t) => t.trim());
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
      return false;
    }

    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
        <div className="space-y-2">
          <div className="text-4xl">📷</div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-muted-foreground">
            JPEG, PNG or WebP (max {maxSize / 1024 / 1024}MB)
          </div>
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}