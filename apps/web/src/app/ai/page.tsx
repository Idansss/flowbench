import { ChatInterface } from "@/components/ai/chat-interface";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Shield, Brain } from "lucide-react";

export default function IdansssAIPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 bg-primary/10 rounded-full">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">Idansss AI</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your intelligent assistant for Flowbench. Get instant help, tool
          recommendations, and workflow optimization.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <Brain className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Multi-Provider Routing</h3>
            <p className="text-sm text-muted-foreground">
              Intelligently routes between GPT-4 and Gemini for optimal results
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Zap className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">RAG-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Answers backed by Flowbench documentation with source citations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Shield className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              Conversations not stored, PII filtered, disable-logging headers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="p-6">
        <ChatInterface />
      </Card>

      {/* Capabilities */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p><strong>What I can help with:</strong></p>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-1 max-w-2xl mx-auto text-left">
          <p>• Recommend the right tool for your task</p>
          <p>• Explain how to configure options</p>
          <p>• Troubleshoot processing errors</p>
          <p>• Suggest workflow optimizations</p>
          <p>• Compare tool capabilities</p>
          <p>• Guide you through setup steps</p>
        </div>
      </div>
    </div>
  );
}

