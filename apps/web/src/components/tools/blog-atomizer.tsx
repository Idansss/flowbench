"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BlogAtomizerTool() {
  const [url, setUrl] = useState("");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Share2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Blog to Social Atomizer</h1>
          <p className="text-muted-foreground">
            Convert blog posts into social media content
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog URL</CardTitle>
          <CardDescription>Public blog URL or pasted HTML</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="blog-url">Article URL</Label>
            <Input
              id="blog-url"
              placeholder="https://example.com/blog-post"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button className="w-full" disabled={!url}>
            Generate Social Content
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

