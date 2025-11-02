"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";

export function QRGeneratorTool() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <QrCode className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Bulk QR Generator</h1>
          <p className="text-muted-foreground">
            Create QR codes for events with custom templates
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Data</CardTitle>
          <CardDescription>CSV of names and fields</CardDescription>
        </CardHeader>
        <CardContent>
          <Dropzone
            onFilesSelected={setFiles}
            selectedFiles={files}
            onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))}
            accept={{
              "text/csv": [".csv"],
            }}
            maxSize={50 * 1024 * 1024}
          />
          <Button className="w-full mt-4" disabled={files.length === 0}>
            Generate QR Codes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

