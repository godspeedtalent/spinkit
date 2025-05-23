
"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Star } from 'lucide-react';
import Image from "next/image"; // Import next/image

export type InteractionItem = {
  id: string;
  userName: string;
  userAvatar: string; // This will now be an Unsplash URL or seed
  text: string;
  date: string;
  rating?: number; 
};

interface ContentInteractionSectionProps {
  title: string;
  items: InteractionItem[];
  currentUserAvatarSeed?: string; // Seed for placeholder
  enableRating?: boolean; 
  onPostInteraction: (text: string, rating?: number) => void; 
  textareaPlaceholder: string;
  postButtonText: string;
  emptyStateText: string;
}

const generatePlaceholderAvatarSeed = (hint: string = "person face random") => {
  let Skeywords = (hint || "person").trim().toLowerCase();
  Skeywords = Skeywords.replace(/\s\s+/g, ' ').replace(/\s/g, '-');
  Skeywords = Skeywords.replace(/[^a-z0-9-]/g, '');
  Skeywords = Skeywords.replace(/^-,|-$/g, '').replace(/--+/g, '-');
  if (!Skeywords) Skeywords = "generic-avatar";
  return `https://source.unsplash.com/featured/40x40/?${Skeywords},face,person`;
};


export default function ContentInteractionSection({
  title,
  items,
  currentUserAvatarSeed, 
  enableRating = false,
  onPostInteraction,
  textareaPlaceholder,
  postButtonText,
  emptyStateText,
}: ContentInteractionSectionProps) {
  const [newInteractionText, setNewInteractionText] = React.useState("");
  const [currentRating, setCurrentRating] = React.useState(0);

  const handleSubmit = () => {
    if (newInteractionText.trim() === "") return;
    onPostInteraction(newInteractionText, enableRating ? currentRating : undefined);
    setNewInteractionText("");
    setCurrentRating(0);
  };

  const effectiveCurrentUserAvatarUrl = currentUserAvatarSeed ? generatePlaceholderAvatarSeed(currentUserAvatarSeed) : generatePlaceholderAvatarSeed("current user avatar");

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4 text-primary flex items-center">
        <MessageSquare className="mr-2 h-6 w-6" /> {title}
      </h3>
      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-4">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10 relative overflow-hidden">
               <Image 
                  src={effectiveCurrentUserAvatarUrl} 
                  alt="Current User Avatar"
                  fill
                  className="object-cover"
                  data-ai-hint={currentUserAvatarSeed || "current user avatar"}
                  placeholder="empty"
                />
                <AvatarFallback>{title.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder={textareaPlaceholder}
              className="flex-1 resize-none bg-background"
              rows={enableRating ? 2 : 3}
              value={newInteractionText}
              onChange={(e) => setNewInteractionText(e.target.value)}
            />
          </div>
          {enableRating && (
            <div className="ml-[52px] flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 cursor-pointer ${
                    currentRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'
                  }`}
                  onClick={() => setCurrentRating(star)}
                />
              ))}
               <span className="text-sm text-muted-foreground">({currentRating}/5)</span>
            </div>
          )}
          <div className="text-right">
            <Button size="sm" onClick={handleSubmit} disabled={!newInteractionText.trim() || (enableRating && currentRating === 0)}>
              {postButtonText} (Mock)
            </Button>
          </div>

          {items && items.length > 0 ? (
            <div className="space-y-4 pt-4 border-t">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-3">
                  <Avatar className="h-10 w-10 relative overflow-hidden">
                     <Image 
                        src={generatePlaceholderAvatarSeed(item.userAvatar || item.userName)} 
                        alt={`${item.userName}'s avatar`}
                        fill
                        className="object-cover"
                        data-ai-hint={item.userAvatar || item.userName}
                        placeholder="empty"
                      />
                       <AvatarFallback>{item.userName.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-background p-3 rounded-md shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-sm">{item.userName}</p>
                      <div className="flex items-center">
                        {item.rating !== undefined && (
                          <div className="flex items-center mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < item.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center pt-4 border-t">{emptyStateText}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
