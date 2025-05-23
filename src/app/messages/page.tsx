
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Paperclip, Send, Search, MessageSquarePlus, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type User = {
  id: string;
  name: string;
  avatarUrl: string; // Expect Unsplash URL or similar
  role: "Fan" | "DJ" | "Venue" | "Admin";
};

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
};

type Conversation = {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessagePreview: string;
  lastMessageAt: Date;
  unreadCount: number;
};

const mockCurrentUser: User = { id: "user-current", name: "Current User", avatarUrl: "https://source.unsplash.com/featured/40x40/?user,person,me", role: "Fan" };

const mockUsers: User[] = [
  { id: "dj-sparkle", name: "DJ Sparkle", avatarUrl: "https://source.unsplash.com/featured/40x40/?dj,party", role: "DJ" },
  { id: "venue-groove", name: "The Groove Lounge", avatarUrl: "https://source.unsplash.com/featured/40x40/?club,interior", role: "Venue" },
  { id: "fan-alex", name: "Alex Fan", avatarUrl: "https://source.unsplash.com/featured/40x40/?fan,music", role: "Fan" },
  { id: "admin-sys", name: "System Admin", avatarUrl: "https://source.unsplash.com/featured/40x40/?admin,system", role: "Admin" },
];

const mockConversations: Conversation[] = [
  {
    id: "conv1",
    participants: [mockCurrentUser, mockUsers[0]],
    messages: [
      { id: "m1", senderId: mockUsers[0].id, text: "Hey, thanks for reaching out! What's up?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { id: "m2", senderId: mockCurrentUser.id, text: "Just wanted to say I love your mixes!", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    ],
    lastMessagePreview: "Just wanted to say I love your mixes!",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
  },
  {
    id: "conv2",
    participants: [mockCurrentUser, mockUsers[1]],
    messages: [
      { id: "m3", senderId: mockUsers[1].id, text: "Your booking request for next Friday is confirmed.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    ],
    lastMessagePreview: "Your booking request for next Friday is confirmed.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 1,
  },
    {
    id: "conv3",
    participants: [mockCurrentUser, mockUsers[2]],
    messages: [
      { id: "m4", senderId: mockUsers[2].id, text: "Did you catch that new track by Cosmic Voyager?", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { id: "m5", senderId: mockCurrentUser.id, text: "Not yet, is it good?", timestamp: new Date(Date.now() - 1000 * 60 * 2) },
       { id: "m6", senderId: mockUsers[2].id, text: "It's amazing! You should check it out on their profile.", timestamp: new Date(Date.now() - 1000 * 60 * 1) },
    ],
    lastMessagePreview: "It's amazing! You should check it out...",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 1),
    unreadCount: 2,
  },
];


export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(mockConversations[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessageText, setNewMessageText] = useState(""); // For existing conversations
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [newComposedMessage, setNewComposedMessage] = useState("");

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const selectedConversation = !showNewMessageForm ? mockConversations.find(c => c.id === selectedConversationId) : null;


  useEffect(() => {
    if (selectedConversation && scrollAreaRef.current && !showNewMessageForm) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [selectedConversation?.messages.length, selectedConversationId, showNewMessageForm]);


  const filteredConversations = mockConversations.filter(conv =>
    conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.id !== mockCurrentUser.id)
  );
  
  const handleSendMessageToExisting = () => {
    if (!newMessageText.trim() || !selectedConversation) return;
    const _newMessageEntry: Message = {
        id: `msg-${Date.now()}`,
        senderId: mockCurrentUser.id,
        text: newMessageText,
        timestamp: new Date(),
    };
    
    const convIndex = mockConversations.findIndex(c => c.id === selectedConversation.id);
    if (convIndex > -1) {
        mockConversations[convIndex].messages.push(_newMessageEntry);
        mockConversations[convIndex].lastMessagePreview = newMessageText.length > 30 ? newMessageText.substring(0,27) + "..." : newMessageText;
        mockConversations[convIndex].lastMessageAt = new Date();
        mockConversations[convIndex].unreadCount = 0; 
    }
    setNewMessageText("");
  };

  const handleSendNewComposedMessage = () => {
    if (!newRecipient.trim() || !newComposedMessage.trim()) return;
    
    const existingRecipientUser = mockUsers.find(u => u.name.toLowerCase() === newRecipient.toLowerCase());
    const recipientUser = existingRecipientUser || { id: `new-${Date.now()}`, name: newRecipient, avatarUrl: `https://source.unsplash.com/featured/40x40/?person,${newRecipient.split(" ")[0]}`, role: "Fan"};
    if (!existingRecipientUser) mockUsers.push(recipientUser);

    const newConvId = `conv-${Date.now()}`;
    const newComposedConv: Conversation = {
      id: newConvId,
      participants: [mockCurrentUser, recipientUser],
      messages: [{ id: `msg-new-${Date.now()}`, senderId: mockCurrentUser.id, text: newComposedMessage, timestamp: new Date() }],
      lastMessagePreview: newComposedMessage.length > 30 ? newComposedMessage.substring(0,27) + "..." : newComposedMessage,
      lastMessageAt: new Date(),
      unreadCount: 0,
    };
    mockConversations.unshift(newComposedConv);
    
    setNewRecipient("");
    setNewComposedMessage("");
    setShowNewMessageForm(false); 
    setSelectedConversationId(newConvId); 
  };

  const handleOpenNewMessageForm = () => {
    setShowNewMessageForm(true);
    setSelectedConversationId(null); 
    setNewRecipient("");
    setNewComposedMessage("");
  };

  const handleCloseNewMessageForm = () => {
    setShowNewMessageForm(false);
    setNewRecipient("");
    setNewComposedMessage("");
    if (mockConversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(mockConversations[0].id);
    }
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    setShowNewMessageForm(false); 
    setNewRecipient(""); 
    setNewComposedMessage("");
  };

  const getParticipant = (convo: Conversation | null | undefined, currentUserId: string) => {
    if (!convo) return undefined;
    return convo.participants.find(p => p.id !== currentUserId);
  }

  const currentChatPartner = getParticipant(selectedConversation, mockCurrentUser.id);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] border-t">
      {/* Sidebar - Conversation List */}
      <aside className="w-full md:w-1/3 lg:w-1/4 border-r bg-muted/40 flex flex-col">
        <div className="p-4 border-b space-y-2">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Messaging</h2>
                <Button variant="ghost" size="icon" className="text-primary" onClick={handleOpenNewMessageForm} title="New Message">
                    <MessageSquarePlus className="h-5 w-5"/>
                    <span className="sr-only">New Message</span>
                </Button>
            </div>
            {!showNewMessageForm && (
              <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search conversations..."
                    className="pl-8 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
            )}
        </div>

        <ScrollArea className="flex-1">
          <nav className="py-2">
            {filteredConversations.sort((a,b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()).map((conv) => {
              const participant = getParticipant(conv, mockCurrentUser.id);
              if (!participant) return null;
              return (
                <Button
                  key={conv.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto py-3 px-4 rounded-none hover:bg-accent",
                    selectedConversationId === conv.id && !showNewMessageForm && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <Avatar className="h-10 w-10 mr-3 relative">
                    <AvatarImage src={participant.avatarUrl} alt={participant.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    {Math.random() > 0.6 && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-muted/40" />}
                  </Avatar>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center">
                        <p className="font-medium truncate text-sm">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(conv.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground truncate">{conv.unreadCount > 0 ? <strong>{conv.lastMessagePreview}</strong> : conv.lastMessagePreview}</p>
                        {conv.unreadCount > 0 && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">{conv.unreadCount}</span>
                        )}
                    </div>
                  </div>
                </Button>
              );
            })}
             {filteredConversations.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground text-center">No conversations found.</p>
            )}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Chat Area / New Message Composer */}
      <main className="flex-1 flex flex-col bg-background">
        {showNewMessageForm ? (
          <>
            {/* Header for New Message - mimicking chat header */}
            <header className="p-4 border-b flex items-center justify-between bg-card">
                <div className="flex items-center space-x-3 flex-grow">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={mockUsers.find(u=>u.name.toLowerCase() === newRecipient.toLowerCase())?.avatarUrl || `https://source.unsplash.com/featured/40x40/?person,abstract`} alt={newRecipient || "Recipient"} data-ai-hint="recipient avatar" />
                        <AvatarFallback>{newRecipient ? newRecipient.substring(0,2).toUpperCase() : <User className="h-5 w-5"/>}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <Input 
                            placeholder="Recipient's name..." 
                            value={newRecipient}
                            onChange={(e) => setNewRecipient(e.target.value)}
                            className="text-lg font-semibold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent"
                        />
                        <p className="text-xs text-muted-foreground">Enter recipient above</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCloseNewMessageForm} title="Cancel new message">
                    <X className="h-5 w-5 text-muted-foreground"/>
                </Button>
            </header>
            {/* Empty Message Area */}
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="p-4 space-y-4 h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
              </div>
            </ScrollArea>
            {/* Footer for New Message - mimicking chat footer */}
            <footer className="p-4 border-t bg-card">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" disabled><Paperclip className="h-5 w-5"/></Button>
                <Textarea 
                    placeholder="Type your message..." 
                    className="flex-1 resize-none text-sm" 
                    value={newComposedMessage} 
                    onChange={(e) => setNewComposedMessage(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendNewComposedMessage(); }}}
                    rows={1}
                />
                <Button onClick={handleSendNewComposedMessage} disabled={!newRecipient.trim() || !newComposedMessage.trim()}>
                    <Send className="h-5 w-5 mr-0 sm:mr-2"/> <span className="hidden sm:inline">Send</span>
                </Button>
              </div>
            </footer>
          </>
        ) : selectedConversation && currentChatPartner ? (
          <>
            <header className="p-4 border-b flex items-center space-x-3 bg-card">
              <Avatar className="h-10 w-10 relative">
                 <AvatarImage src={currentChatPartner.avatarUrl} alt={currentChatPartner.name} data-ai-hint="user avatar"/>
                 <AvatarFallback>{currentChatPartner.name.substring(0,2).toUpperCase()}</AvatarFallback>
                 {Math.random() > 0.3 && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />}
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{currentChatPartner.name}</h3>
                <p className="text-xs text-muted-foreground">
                    Role: {currentChatPartner.role}
                </p>
              </div>
            </header>
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="p-4 space-y-4">
                {selectedConversation.messages.map((msg) => {
                  const sender = selectedConversation.participants.find(p => p.id === msg.senderId) || mockCurrentUser;
                  const isCurrentUser = msg.senderId === mockCurrentUser.id;
                  return (
                    <div key={msg.id} className={cn("flex items-end space-x-2 max-w-full", isCurrentUser ? "justify-end" : "justify-start")}>
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 self-end mb-2 shrink-0">
                          <AvatarImage src={sender.avatarUrl} alt={sender.name} data-ai-hint="user avatar" />
                          <AvatarFallback>{sender.name.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("max-w-[70%] p-2.5 rounded-lg shadow-sm", isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                        <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left")}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      {isCurrentUser && (
                        <Avatar className="h-8 w-8 self-end mb-2 shrink-0">
                          <AvatarImage src={sender.avatarUrl} alt={sender.name} data-ai-hint="user avatar" />
                          <AvatarFallback>{sender.name.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <footer className="p-4 border-t bg-card">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" disabled><Paperclip className="h-5 w-5"/></Button>
                <Textarea 
                    placeholder="Type a message..." 
                    className="flex-1 resize-none text-sm" 
                    value={newMessageText} 
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessageToExisting(); }}}
                    rows={1}
                />
                <Button onClick={handleSendMessageToExisting} disabled={!newMessageText.trim()}>
                    <Send className="h-5 w-5 mr-0 sm:mr-2"/> <span className="hidden sm:inline">Send</span>
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquarePlus className="h-24 w-24 text-muted-foreground/50 mb-6" />
            <h2 className="text-2xl font-semibold text-muted-foreground">Select a conversation or start a new one</h2>
            <p className="text-muted-foreground">Choose a chat from the sidebar or click the <MessageSquarePlus className="inline h-4 w-4 align-middle"/> icon to begin a new message.</p>
          </div>
        )}
      </main>
    </div>
  );
}

    