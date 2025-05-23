
"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import ToolWindowWrapper from "@/components/shared/tool-window-wrapper";

interface AiSandboxToolProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function AiSandboxTool({ isExpanded, onToggleExpand }: AiSandboxToolProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (!isExpanded) return null;

  return (
    <ToolWindowWrapper
      title="AI Sandbox"
      icon={Sparkles}
      onToggleExpand={onToggleExpand}
      className="w-80 h-[400px] border-yellow-500/50"
      headerClassName="border-yellow-500/30"
      titleClassName="text-yellow-600 dark:text-yellow-400"
      contentClassName="p-3 flex flex-col items-center justify-center"
    >
      <Sparkles className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <p className="text-sm text-muted-foreground text-center">
        AI experimentation zone.
      </p>
      <p className="text-xs text-muted-foreground/70 text-center mt-1">
        (Content TBD)
      </p>
    </ToolWindowWrapper>
  );
}
