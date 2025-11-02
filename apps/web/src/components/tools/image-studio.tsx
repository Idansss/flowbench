"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";

export function ImageStudioTool() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <ImageIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Bulk Image Studio</h1>
          <p className="text-muted-foreground">
            Background removal, resizing, and batch conversion
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>Images or ZIP archives</CardDescription>
        </CardHeader>
        <CardContent>
          <Dropzone
            onFilesSelected={setFiles}
            selectedFiles={files}
            onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))}
            accept={{
              "image/*": [".jpg", ".jpeg", ".png", ".webp"],
              "application/zip": [".zip"],
            }}
            maxSize={50 * 1024 * 1024}
            multiple
          />
          <Button className="w-full mt-4" disabled={files.length === 0}>
            Process Images
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

