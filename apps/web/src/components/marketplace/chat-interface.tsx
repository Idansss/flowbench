"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isMe: boolean;
}

interface ChatInterfaceProps {
  orderId: string;
}

export function ChatInterface({ orderId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "seller1",
      senderName: "John Doe",
      message: "Hi! I've received your order. I'll start working on it right away!",
      timestamp: "2025-11-02T11:30:00Z",
      isMe: false,
    },
    {
      id: "2",
      senderId: "buyer1",
      senderName: "You",
      message: "Great! Looking forward to seeing the result.",
      timestamp: "2025-11-02T11:45:00Z",
      isMe: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      // TODO: Send message to API
      const message: Message = {
        id: Date.now().toString(),
        senderId: "buyer1",
        senderName: "You",
        message: newMessage,
        timestamp: new Date().toISOString(),
        isMe: true,
      };

      setMessages([...messages, message]);
      setNewMessage("");

      // TODO: Real-time update with WebSocket
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[70%] ${msg.isMe ? "order-2" : "order-1"}`}>
              {!msg.isMe && (
                <p className="text-xs text-muted-foreground mb-1 px-3">
                  {msg.senderName}
                </p>
              )}
              <div
                className={`rounded-2xl px-4 py-2 ${
                  msg.isMe
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-accent rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 px-3">
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" disabled>
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending}
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || sending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

