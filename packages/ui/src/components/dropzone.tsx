import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { cn } from "../lib/utils";

interface DropzoneProps extends Omit<DropzoneOptions, "onDrop"> {
  onFilesSelected: (files: File[]) => void;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function Dropzone({
  onFilesSelected,
  selectedFiles = [],
  onRemoveFile,
  label = "Upload files",
  description = "Drag and drop files here, or click to browse",
  className,
  ...dropzoneOptions
}: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    ...dropzoneOptions,
    onDrop: onFilesSelected,
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && "border-border hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Upload
            className={cn(
              "w-12 h-12 mb-4",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )}
          />
          <p className="mb-2 text-sm font-medium">
            {isDragActive ? "Drop files here" : label}
          </p>
          <p className="text-xs text-muted-foreground">{description}</p>
          {dropzoneOptions.maxSize && (
            <p className="text-xs text-muted-foreground mt-2">
              Max file size: {formatSize(dropzoneOptions.maxSize)}
            </p>
          )}
          {dropzoneOptions.accept && (
            <p className="text-xs text-muted-foreground">
              Accepted: {Object.values(dropzoneOptions.accept).flat().join(", ")}
            </p>
          )}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected files:</p>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-accent rounded-md"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="ml-2 p-1 hover:bg-background rounded transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

