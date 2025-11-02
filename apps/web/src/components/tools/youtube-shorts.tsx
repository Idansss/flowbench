"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function YoutubeShortsTool() {
  const [url, setUrl] = useState("");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">YouTube Shorts Generator</h1>
          <p className="text-muted-foreground">
            Create captions, hooks, and tags for short-form videos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Input</CardTitle>
          <CardDescription>YouTube URL or pasted transcript</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="url">YouTube URL</Label>
            <Input
              id="url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button className="w-full" disabled={!url}>
            Generate Content
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

