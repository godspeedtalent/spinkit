
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Code, AlertTriangle } from "lucide-react";

export default function DevToolsSettingsSection() {
  const { toast } = useToast();
  const [experimentalFeatures, setExperimentalFeatures] = useState(false);

  const handleToggleExperimental = (checked: boolean) => {
    setExperimentalFeatures(checked);
    toast({
      title: "Dev Setting Changed",
      description: `Experimental features ${checked ? "enabled" : "disabled"} (mock).`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Code className="mr-3 h-6 w-6 text-primary" />
            Developer Tools Settings
          </CardTitle>
          <CardDescription>
            Configure settings related to application development and testing features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <Label htmlFor="experimental-features" className="text-base flex-1">
              Enable Experimental Features
              <p className="text-xs text-muted-foreground">
                Access beta features that are still under development. May be unstable.
              </p>
            </Label>
            <Switch
              id="experimental-features"
              checked={experimentalFeatures}
              onCheckedChange={handleToggleExperimental}
            />
          </div>

          <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive-foreground/80 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              <p className="font-semibold">Caution</p>
            </div>
            <p className="text-xs mt-1">
              Developer settings are powerful and can impact application behavior. Use with care.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Other Developer Options (Future)</CardTitle>
          <CardDescription>More granular controls for developers will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                <li>API request logging verbosity.</li>
                <li>Mock data source selection.</li>
                <li>UI performance overlay.</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
