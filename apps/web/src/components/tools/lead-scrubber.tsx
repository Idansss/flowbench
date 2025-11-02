"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";

export function LeadScrubberTool() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Clipboard Lead Scrubber</h1>
          <p className="text-muted-foreground">
            Clean and validate contact lists with smart normalization
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Lead List</CardTitle>
          <CardDescription>CSV export or pasted table</CardDescription>
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
            Clean Leads
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

