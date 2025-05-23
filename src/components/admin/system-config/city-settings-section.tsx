
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Save, MapPin } from "lucide-react";

export default function CitySettingsSection() {
  const { toast } = useToast();
  const [marketRate, setMarketRate] = useState<string>("100"); // Default mock rate

  const handleSave = () => {
    // In a real app, you'd save this to a backend/database
    console.log("Market rate saved:", marketRate);
    toast({
      title: "Settings Saved",
      description: `Market rate for the city set to $${marketRate}/hr.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <MapPin className="mr-3 h-6 w-6 text-primary" />
            City Market Rate Settings
          </CardTitle>
          <CardDescription>
            Configure the baseline market rate for DJ services in this city. This can influence AI recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="marketRate" className="text-base flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-primary" />
              Set Market Rate (USD per hour)
            </Label>
            <Input
              id="marketRate"
              type="number"
              value={marketRate}
              onChange={(e) => setMarketRate(e.target.value)}
              placeholder="e.g., 150"
              className="mt-1 max-w-xs text-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This rate helps calibrate AI suggestions for DJ pricing and negotiations.
            </p>
          </div>
          <Button onClick={handleSave} size="lg">
            <Save className="mr-2 h-4 w-4" /> Save Market Rate
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Other City Parameters (Future)</CardTitle>
            <CardDescription>More city-specific configurations will be available here.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                <li>Peak demand seasons or days of the week.</li>
                <li>Local event calendars integration.</li>
                <li>Currency and localization settings.</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
