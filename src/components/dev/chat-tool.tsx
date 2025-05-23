
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, UserPlus, Pin } from "lucide-react";
import type { PinnedItemType } from "@/config/site";
import ToolWindowWrapper from "@/components/shared/tool-window-wrapper";

interface ChatToolProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  addPinnedItem: (item: { type: PinnedItemType; name: string; href: string }) => void;
}

interface MockUser {
  id: string;
  name: string;
  avatar: string;
}

interface MockMessage {
  id: string;
  sender: MockUser;
  text: string;
  timestamp: string;
}

interface MockConversation {
  id: string;
  participants: MockUser[];
  messages: MockMessage[];
  lastMessagePreview: string;
}

const currentUser: MockUser = { id: "currUser", name: "Me", avatar: "https://placehold.co/40x40.png?text=ME" };
const otherUser1: MockUser = { id: "djSparkle", name: "DJ Sparkle", avatar: "https://placehold.co/40x40.png?text=DS" };
const otherUser2: MockUser = { id: "venueGroove", name: "Groove Lounge", avatar: "https://placehold.co/40x40.png?text=GL" };

const initialConversations: MockConversation[] = [
  { 
    id: "conv1", 
    participants: [currentUser, otherUser1], 
    messages: [
        {id: "m1", sender: otherUser1, text: "Hey! Got your booking request, looks good!", timestamp: "10:30 AM"},
        {id: "m2", sender: currentUser, text: "Awesome, thanks for confirming!", timestamp: "10:32 AM"},
    ],
    lastMessagePreview: "Awesome, thanks for confirming!"
  },
  { 
    id: "conv2", 
    participants: [currentUser, otherUser2], 
    messages: [
         {id: "m3", sender: otherUser2, text: "Just checking in about the new lighting setup.", timestamp: "Yesterday"},
    ],
    lastMessagePreview: "Just checking in about the new..."
   },
];

export default function ChatTool({ isExpanded, onToggleExpand, addPinnedItem }: ChatToolProps) {
  const [mounted, setMounted] = React.useState(false);
  const [conversations, setConversations] = useState<MockConversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<MockConversation | null>(initialConversations[0] || null);
  const [inputValue, setInputValue] = useState("");

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (!isExpanded) return null;

  const handleSendMessage = () => {
    if (inputValue.trim() === "" || !selectedConversation) return;
    const newMessage: MockMessage = { 
        id: Date.now().toString(), 
        sender: currentUser, 
        text: inputValue, 
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    setSelectedConversation(prev => {
        if (!prev) return null;
        const updatedMessages = [...prev.messages, newMessage];
        return {...prev, messages: updatedMessages, lastMessagePreview: inputValue };
    });
    setConversations(prevConvs => prevConvs.map(conv => 
        conv.id === selectedConversation.id 
        ? {...conv, messages: [...conv.messages, newMessage], lastMessagePreview: inputValue} 
        : conv
    ));
    setInputValue("");
  };
  
  const getOtherParticipant = (conv: MockConversation | null) => {
      if (!conv) return undefined;
      return conv.participants.find(p => p.id !== currentUser.id);
  }

  const handlePinChat = (conv: MockConversation | null) => {
    if (!conv) return;
    const participant = getOtherParticipant(conv);
    if (participant) {
      addPinnedItem({
        type: "Chat",
        name: `Chat with ${participant.name}`,
        href: `/messages#${conv.id}`, 
      });
    }
  };

  const toolSpecificHeaderActions = selectedConversation ? (
    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" title="Pin Chat" onClick={() => handlePinChat(selectedConversation)}>
      <Pin className="h-3.5 w-3.5" />
    </Button>
  ) : null;

  return (
    <ToolWindowWrapper
      title="Chat (Mock)"
      icon={MessageSquare}
      onToggleExpand={onToggleExpand}
      className="w-96 h-[500px] border-primary/50"
      headerClassName="border-primary/30"
      titleClassName="text-primary"
      contentClassName="p-0 flex" // No padding for inner layout
      toolSpecificHeaderActions={toolSpecificHeaderActions}
    >
      {/* Conversation List Sidebar */}
      <div className="w-1/3 border-r bg-muted/20 flex flex-col">
          <div className="p-2 border-b">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Conversations</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" title="New Message">
                      <UserPlus className="h-3.5 w-3.5"/>
                  </Button>
              </div>
              <Input type="search" placeholder="Search users..." className="h-7 text-xs"/>
          </div>
          <ScrollArea className="flex-1">
              {conversations.map(conv => {
                  const otherP = getOtherParticipant(conv);
                  if (!otherP) return null;
                  return (
                      <Button 
                          key={conv.id} 
                          variant={selectedConversation?.id === conv.id ? "secondary" : "ghost"}
                          className="w-full h-auto justify-start p-2 rounded-none text-left"
                          onClick={() => setSelectedConversation(conv)}
                      >
                          <Avatar className="h-7 w-7 mr-2">
                              <AvatarImage src={otherP.avatar} alt={otherP.name} data-ai-hint="user avatar"/>
                              <AvatarFallback>{otherP.name.substring(0,1)}</AvatarFallback>
                          </Avatar>
                          <div className="overflow-hidden">
                              <p className="text-xs font-medium truncate">{otherP.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{conv.lastMessagePreview}</p>
                          </div>
                      </Button>
                  )
              })}
          </ScrollArea>
      </div>
      {/* Main Chat Area */}
      <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
              <>
                  <div className="p-2 border-b flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                          <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar} alt={getOtherParticipant(selectedConversation)?.name} data-ai-hint="user avatar"/>
                          <AvatarFallback>{getOtherParticipant(selectedConversation)?.name.substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="text-sm font-semibold">{getOtherParticipant(selectedConversation)?.name}</p>
                      </div>
                  </div>
                  <ScrollArea className="flex-grow p-2 space-y-3">
                      {selectedConversation.messages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender.id === currentUser.id ? "items-end" : "items-start"}`}>
                          <div className={`max-w-[75%] p-1.5 px-2.5 rounded-lg text-xs ${msg.sender.id === currentUser.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          {msg.text}
                          </div>
                          <span className="text-xs text-muted-foreground/70 mt-0.5 px-1">{msg.timestamp}</span>
                      </div>
                      ))}
                  </ScrollArea>
                  <div className="p-2 border-t flex items-center space-x-1.5">
                      <Textarea
                          placeholder="Type a message..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="h-9 text-xs flex-grow resize-none"
                          onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                      />
                      <Button size="icon" className="h-9 w-9" onClick={handleSendMessage} aria-label="Send Message" disabled={!inputValue.trim()}>
                          <Send className="h-4 w-4" />
                      </Button>
                  </div>
              </>
          ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  <p>Select a conversation to start chatting.</p>
              </div>
          )}
      </div>
    </ToolWindowWrapper>
  );
}
