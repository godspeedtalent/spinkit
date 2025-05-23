
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, GripVertical, Minus, Sparkles } from "lucide-react";

interface AiChatToolProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

export default function AiChatTool({ isExpanded, onToggleExpand }: AiChatToolProps) {
  const [mounted, setMounted] = React.useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  // Note: This component is now conditionally rendered by AppLayout based on auth status
  // So, this explicit check for `isExpanded` might be redundant if AppLayout handles its mounting.
  // However, keeping it doesn't hurt and ensures it won't render if `isExpanded` is somehow false.
  if (!isExpanded) return null;


  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    const newUserMessage: Message = { id: Date.now().toString(), text: inputValue, sender: "user" };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Mock AI response
    setTimeout(() => {
      const aiResponse: Message = { id: (Date.now() + 1).toString(), text: `AI says: You typed '${inputValue}'`, sender: "ai" };
      setMessages(prev => [...prev, aiResponse]);
    }, 500);
    
    setInputValue("");
  };

  return (
    <Card className="w-80 h-[450px] shadow-2xl z-50 border-primary/50 bg-card/95 backdrop-blur-sm flex flex-col">
      <CardHeader className="py-2 px-3 border-b border-primary/30 flex flex-row items-center justify-between cursor-grab active:cursor-grabbing">
        <div className="flex items-center">
            <GripVertical className="h-4 w-4 text-primary/70 mr-1" />
            <CardTitle className="text-sm flex items-center text-primary">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Chat (Mock)
            </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpand}
          className="h-6 w-6 text-primary hover:bg-primary/10"
          title="Minimize AI Chat"
          aria-label="Minimize AI Chat"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 flex-grow flex flex-col space-y-2 overflow-hidden">
        <ScrollArea className="flex-grow pr-2">
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] p-2 rounded-lg text-sm ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center space-x-2 pt-2 border-t">
          <Textarea
            placeholder="Ask AI something..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-10 text-xs flex-grow resize-none"
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
          />
          <Button size="icon" onClick={handleSendMessage} aria-label="Send Message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
