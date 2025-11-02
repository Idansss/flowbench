"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";

export function PDFFillerTool() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Web Form to PDF Filler</h1>
          <p className="text-muted-foreground">
            Fill PDF forms programmatically
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload PDF Template</CardTitle>
          <CardDescription>PDF template with form fields</CardDescription>
        </CardHeader>
        <CardContent>
          <Dropzone
            onFilesSelected={setFiles}
            selectedFiles={files}
            onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))}
            accept={{
              "application/pdf": [".pdf"],
            }}
            maxSize={50 * 1024 * 1024}
          />
          <Button className="w-full mt-4" disabled={files.length === 0}>
            Configure Form
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

