
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, ShieldCheck, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LinkBankAccountPage() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, this would securely handle submission to Stripe or similar
    toast({
      title: "Bank Linking Simulated",
      description: "Your bank account linking process has been initiated (mock).",
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4 md:p-6 lg:p-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <Landmark className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl">Link Bank Account</CardTitle>
          <CardDescription>
            Securely link your bank account for payouts and payments via Stripe (Simulated).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 mb-6 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-md shadow">
            <div className="flex items-center">
              <ShieldCheck className="h-6 w-6 mr-3" />
              <p className="font-semibold">Powered by Stripe (Simulation)</p>
            </div>
            <p className="mt-1 text-sm">
              We partner with Stripe for secure payment processing. Your financial details are never stored on our servers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="accountHolderName" className="text-lg">Account Holder Name</Label>
              <Input id="accountHolderName" placeholder="e.g., John M. Doe" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="routingNumber" className="text-lg">Routing Number</Label>
              <Input id="routingNumber" placeholder="e.g., 123456789" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="accountNumber" className="text-lg">Account Number</Label>
              <Input id="accountNumber" placeholder="e.g., 000123456789" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="accountType" className="text-lg">Account Type (Placeholder)</Label>
              <Input id="accountType" placeholder="e.g., Checking or Savings" className="mt-1" />
            </div>
            
            <Button type="submit" className="w-full">
              Link Bank Account (Mock)
            </Button>
          </form>
          
          <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-md text-xs">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <p><strong>Note:</strong> This is a UI demonstration. No actual bank information will be processed or stored.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
