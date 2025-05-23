
"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { UserRole } from "@/config/site";
import { Code, LogOutIcon } from "lucide-react";
import { useAuthStore } from '@/stores/authStore';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';
import ToolWindowWrapper from "@/components/shared/tool-window-wrapper";
import { Separator } from "@/components/ui/separator";

interface DevToolsProps {
  onToggleExpand: () => void;
}

export default function DevTools({ onToggleExpand }: DevToolsProps) {
  const [mounted, setMounted] = React.useState(false);

  const {
    currentUserRole,
    isAuthenticated,
    login,
    logout,
    // setRole, // setRole is not directly used, login/logout handles role changes
  } = useAuthStore();

  const {
    isBankAccountLinked,
    setIsBankAccountLinked,
    featureToggles,
    toggleFeature
  } = useUserPreferencesStore();

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  const handleRoleChange = (newRoleValue: string) => {
    const newRole = newRoleValue as UserRole;
    if (newRole === "Guest") {
      logout();
    } else {
      login(newRole); // login also sets isAuthenticated to true and updates role
    }
  };

  return (
    <ToolWindowWrapper
      title="Dev Tools"
      icon={Code}
      onToggleExpand={onToggleExpand}
      className="w-72 border-primary/50" 
      headerClassName="border-primary/30"
      titleClassName="text-primary"
      contentClassName="p-2.5 space-y-3" 
    >
      <div className="space-y-1">
        <Label htmlFor="role-select" className="text-xs font-medium text-muted-foreground">
          Simulate Role:
        </Label>
        <Select
          value={isAuthenticated ? currentUserRole : "Guest"}
          onValueChange={handleRoleChange}
          name="role-select"
        >
          <SelectTrigger id="role-select" className="h-8 text-xs">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent className="z-[150]">
            {(["Admin", "Buyer", "Artist", "Fan", "Guest"] as UserRole[]).map((role) => (
              <SelectItem key={role} value={role} className="text-xs">
                {role === "Guest" ? "Logged Out (Guest)" : role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(currentUserRole === "Buyer" || currentUserRole === "Artist") && (
        <div className="flex items-center space-x-2 pt-1">
          <Switch
            id="bank-linked-toggle"
            checked={isBankAccountLinked}
            onCheckedChange={(checked) => setIsBankAccountLinked(Boolean(checked))}
          />
          <Label htmlFor="bank-linked-toggle" className="text-xs font-normal text-muted-foreground cursor-pointer">
            Bank Account Linked
          </Label>
        </div>
      )}

      <Separator />

      <div>
        <Label className="text-xs font-medium text-muted-foreground">
          Enable Features:
        </Label>
        <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="social-features-toggle" className="text-xs font-normal text-muted-foreground cursor-pointer">
                  Social
              </Label>
              <Switch
                  id="social-features-toggle"
                  checked={featureToggles ? featureToggles.social : false}
                  onCheckedChange={() => featureToggles && toggleFeature('social')}
                  disabled={!featureToggles}
                  size="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="discovery-features-toggle" className="text-xs font-normal text-muted-foreground cursor-pointer">
                  Discovery
              </Label>
              <Switch
                  id="discovery-features-toggle"
                  checked={featureToggles ? featureToggles.discovery : false}
                  onCheckedChange={() => featureToggles && toggleFeature('discovery')}
                  disabled={!featureToggles}
                  size="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="music-player-toggle" className="text-xs font-normal text-muted-foreground cursor-pointer">
                  Music Player
              </Label>
              <Switch
                  id="music-player-toggle"
                  checked={featureToggles ? featureToggles.musicPlayer : false}
                  onCheckedChange={() => featureToggles && toggleFeature('musicPlayer')}
                  disabled={!featureToggles}
                  size="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-features-toggle" className="text-xs font-normal text-muted-foreground cursor-pointer">
                  AI Features
              </Label>
              <Switch
                  id="ai-features-toggle"
                  checked={featureToggles ? featureToggles.aiFeatures : false}
                  onCheckedChange={() => featureToggles && toggleFeature('aiFeatures')}
                  disabled={!featureToggles}
                  size="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="transactions-features-toggle" className="text-xs font-normal text-muted-foreground cursor-pointer">
                  Transactions
              </Label>
              <Switch
                  id="transactions-features-toggle"
                  checked={featureToggles ? featureToggles.transactions : false}
                  onCheckedChange={() => featureToggles && toggleFeature('transactions')}
                  disabled={!featureToggles}
                  size="sm"
              />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="notifications-features-toggle" className="text-xs font-normal text-muted-foreground cursor-pointer">
                  Notifications
              </Label>
              <Switch
                  id="notifications-features-toggle"
                  checked={featureToggles ? featureToggles.notifications : false}
                  onCheckedChange={() => featureToggles && toggleFeature('notifications')}
                  disabled={!featureToggles}
                  size="sm"
              />
            </div>
        </div>
      </div>

      {isAuthenticated && currentUserRole !== "Guest" && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50 mt-2"
          onClick={() => logout()}
        >
          <LogOutIcon className="mr-1.5 h-3.5 w-3.5" /> Log Out
        </Button>
      )}
    </ToolWindowWrapper>
  );
}
