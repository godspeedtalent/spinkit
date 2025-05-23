
"use client";

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, User, Building2, CalendarDays, DollarSign, AlertOctagon, Send } from "lucide-react";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import React, { useState, useEffect } from 'react';
import type { ArtistTransaction } from '@/types';

const getMockTransactionById = (id: string | string[] | undefined): ArtistTransaction => {
  const mockTransactions: ArtistTransaction[] = [
    { id: "at1", buyerId: "venue-groove", buyerName: "The Groove Lounge", eventName: "Techno Night", date: "2024-07-15", amount: 300, status: "Paid" },
    { id: "at2", buyerId: "venue-skyline", buyerName: "Skyline Rooftop Bar", eventName: "Sunset Session", date: "2024-07-20", amount: 250, status: "Pending Payment" },
    { id: "at3", buyerId: "venue-warehouse", buyerName: "The Warehouse Project", eventName: "Rave Vol. 3", date: "2024-07-05", amount: 500, status: "Processing Payout" },
  ];
  
  if (typeof id !== 'string') {
    return { 
      id: "unknown-txn", 
      buyerId: "unknown-buyer",
      buyerName: "Unknown Buyer", 
      eventName: "Unknown Event", 
      date: new Date().toISOString().split('T')[0], 
      amount: 0, 
      status: "Pending Payment" 
    };
  }

  const found = mockTransactions.find(t => t.id === id);
  if (found) return found;

  // If not found, return a generic one using the passed ID
  return { 
    id: id, 
    buyerId: `buyer-for-${id}`,
    buyerName: `Buyer for TXN ${id}`, 
    eventName: `Event for TXN ${id}`, 
    date: new Date().toISOString().split('T')[0], 
    amount: Math.floor(Math.random() * 500) + 50, 
    status: "Pending Payment" 
  };
};

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [disputeReason, setDisputeReason] = useState("");
  const [transaction, setTransaction] = useState<ArtistTransaction | null>(null);

  const transactionIdFromParam = params.id;

  useEffect(() => {
    if (transactionIdFromParam) {
      const fetchedTransaction = getMockTransactionById(transactionIdFromParam);
      setTransaction(fetchedTransaction);
    }
  }, [transactionIdFromParam]);


  const handleDisputeSubmit = () => {
    if (!disputeReason.trim()) {
        toast({ title: "Dispute Reason Required", description: "Please provide a reason for your dispute.", variant: "destructive"});
        return;
    }
    toast({
        title: "Dispute Submitted (Mock)",
        description: `Your dispute for transaction ${transaction?.id} has been submitted. Reason: ${disputeReason}`,
    });
    setDisputeReason(""); 
  };

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertOctagon className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Loading Transaction...</h1>
        <p className="text-muted-foreground">Details are being fetched.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Transaction Details</CardTitle>
          <CardDescription>
            Detailed information for transaction ID: {transaction.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="font-medium text-muted-foreground flex items-center"><User className="mr-2 h-4 w-4 text-primary"/> Payer/Buyer</p>
              <p className="text-base">{transaction.buyerName}</p>
            </div>
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="font-medium text-muted-foreground flex items-center"><Building2 className="mr-2 h-4 w-4 text-primary"/> Event/Service</p>
              <p className="text-base">{transaction.eventName}</p>
            </div>
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="font-medium text-muted-foreground flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-primary"/> Date</p>
              <p className="text-base">{new Date(transaction.date).toLocaleDateString()}</p>
            </div>
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="font-medium text-muted-foreground flex items-center"><DollarSign className="mr-2 h-4 w-4 text-primary"/> Amount</p>
              <p className="text-base font-semibold">${transaction.amount.toFixed(2)}</p>
            </div>
             <div className="p-3 border rounded-md bg-muted/20">
              <p className="font-medium text-muted-foreground">Status</p>
              <p className={`text-base font-semibold ${
                transaction.status === "Paid" ? "text-green-600 dark:text-green-400" :
                transaction.status === "Pending Payment" ? "text-yellow-600 dark:text-yellow-400" :
                transaction.status === "Processing Payout" ? "text-blue-600 dark:text-blue-400" :
                "text-red-600 dark:text-red-400"
              }`}>{transaction.status}</p>
            </div>
            {/* @ts-ignore */}
            {transaction.paymentMethod && (
              <div className="p-3 border rounded-md bg-muted/20">
                <p className="font-medium text-muted-foreground">Payment Method</p>
                {/* @ts-ignore */}
                <p className="text-base">{transaction.paymentMethod}</p>
              </div>
            )}
            {/* @ts-ignore */}
            {transaction.reference && (
              <div className="p-3 border rounded-md bg-muted/20 md:col-span-2">
                <p className="font-medium text-muted-foreground">Reference ID</p>
                {/* @ts-ignore */}
                <p className="text-base font-mono">{transaction.reference}</p>
              </div>
            )}
             {/* @ts-ignore */}
            {transaction.details && (
              <div className="p-3 border rounded-md bg-muted/20 md:col-span-2">
                <p className="font-medium text-muted-foreground">Description/Details</p>
                 {/* @ts-ignore */}
                <p className="text-base">{transaction.details}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><AlertOctagon className="mr-2 h-5 w-5 text-destructive"/> Dispute Transaction</CardTitle>
          <CardDescription>If you believe there is an issue with this transaction, please provide details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea 
            placeholder="Explain the reason for your dispute..." 
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className="min-h-[100px]"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!disputeReason.trim()}>
                    <Send className="mr-2 h-4 w-4"/> Submit Dispute (Mock)
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Dispute Submission</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to submit this dispute? This action will be logged (simulated).
                        Reason: "{disputeReason}"
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisputeSubmit} className="bg-destructive hover:bg-destructive/90">Confirm and Submit</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
       <p className="text-xs text-muted-foreground text-center">Transaction details are mock data for demonstration.</p>
    </div>
  );
}
