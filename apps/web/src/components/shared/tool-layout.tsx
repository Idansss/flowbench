"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ToolLayoutProps {
  // Tool metadata
  icon: LucideIcon;
  title: string;
  description: string;
  
  // Panels
  inputPanel: ReactNode;
  optionsPanel: ReactNode;
  resultsPanel: ReactNode;
  
  // Optional
  className?: string;
}

export function ToolLayout({
  icon: Icon,
  title,
  description,
  inputPanel,
  optionsPanel,
  resultsPanel,
  className = "",
}: ToolLayoutProps) {
  return (
    <div className={`max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Three-panel layout: Input | Options | Results */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Upload your files or data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">{inputPanel}</CardContent>
        </Card>

        {/* Options Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription>Configure processing rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">{optionsPanel}</CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Download processed files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">{resultsPanel}</CardContent>
        </Card>
      </div>
    </div>
  );
}

