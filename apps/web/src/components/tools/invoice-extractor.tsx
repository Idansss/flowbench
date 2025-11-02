"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";

export function InvoiceExtractorTool() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Receipt className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Invoice & Receipt Extractor</h1>
          <p className="text-muted-foreground">
            Extract structured data from invoices and receipts
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Invoices</CardTitle>
          <CardDescription>PDF invoices or image receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <Dropzone
            onFilesSelected={setFiles}
            selectedFiles={files}
            onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))}
            accept={{
              "application/pdf": [".pdf"],
              "image/*": [".jpg", ".jpeg", ".png"],
            }}
            maxSize={50 * 1024 * 1024}
            multiple
          />
          <Button className="w-full mt-4" disabled={files.length === 0}>
            Extract Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

