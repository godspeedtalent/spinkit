
"use client";

import Link from "next/link";
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { CreditCard, AlertTriangle, Landmark, FileText, Clock, CheckCircle, Hourglass, Users, Filter, DollarSign, Send, ExternalLink, Pin, Building2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";
import { useToast } from "@/hooks/use-toast";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { ArtistTransaction } from '@/types';
import { cn } from "@/lib/utils";
import { usePinnedItemsStore } from "@/stores/pinnedItemsStore";


const genericMockPayments = {
  proposed: [
    { id: "prop1", description: "DJ Sparkle - Event Aug 10", amount: "$300.00", status: "Awaiting Approval" },
  ],
  upcoming: [
    { id: "up1", description: "Groove Master G - Event Jul 25", amount: "$250.00", dueDate: "Jul 25, 2024" },
  ],
  inTransit: [
    { id: "trans1", description: "Payout for July 15 Gig", amount: "$400.00", expectedDate: "Jul 20, 2024" },
  ],
  completed: [
    { id: "comp1", description: "Payment for June Mix Vol. 1", amount: "$150.00", date: "Jul 01, 2024" },
    { id: "comp2", description: "Booking - Beatrix Kiddo", amount: "$500.00", date: "Jun 15, 2024" },
  ],
};


const mockArtistTransactions: ArtistTransaction[] = [
  { id: "at1", buyerId: "venue-groove", buyerName: "The Groove Lounge", eventName: "Techno Night", date: "2024-07-15", amount: 300, status: "Paid" },
  { id: "at2", buyerId: "venue-skyline", buyerName: "Skyline Rooftop Bar", eventName: "Sunset Session", date: "2024-07-20", amount: 250, status: "Pending Payment" },
  { id: "at3", buyerId: "venue-warehouse", buyerName: "The Warehouse Project", eventName: "Rave Vol. 3", date: "2024-07-05", amount: 500, status: "Processing Payout" },
  { id: "at4", buyerId: "venue-groove", buyerName: "The Groove Lounge", eventName: "House Grooves", date: "2024-06-28", amount: 200, status: "Paid" },
  { id: "at5", buyerId: "venue-aqua", buyerName: "Aqua Beach Club", eventName: "Day Party", date: "2024-07-25", amount: 400, status: "Pending Payment" },
  { id: "at6", buyerId: "venue-skyline", buyerName: "Skyline Rooftop Bar", eventName: "Chill Vibes", date: "2024-06-10", amount: 150, status: "Overdue" },
  { id: "at7", buyerId: "venue-velvet", buyerName: "The Velvet Room", eventName: "Indie Night", date: "2024-07-18", amount: 180, status: "Paid" },
  { id: "at8", buyerId: "venue-cellar", buyerName: "The Underground Cellar", eventName: "Dark Techno", date: "2024-07-22", amount: 220, status: "Pending Payment" },
  { id: "at9", buyerId: "venue-neon", buyerName: "Neon Garden", eventName: "Synthwave Dreams", date: "2024-07-12", amount: 350, status: "Processing Payout" },
];

type PaymentItemProps = {
  id: string;
  description: string;
  amount: string;
  status?: string;
  dueDate?: string;
  expectedDate?: string;
  date?: string;
};

const PaymentItemCard: React.FC<PaymentItemProps> = ({ description, amount, status, dueDate, expectedDate, date }) => (
  <Card className="mb-3 bg-background/70 shadow-sm">
    <CardContent className="p-3 text-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{description}</p>
          {status && <p className="text-xs text-muted-foreground">Status: {status}</p>}
          {dueDate && <p className="text-xs text-muted-foreground">Due: {dueDate}</p>}
          {expectedDate && <p className="text-xs text-muted-foreground">Expected: {expectedDate}</p>}
          {date && <p className="text-xs text-muted-foreground">Completed: {date}</p>}
        </div>
        <p className="font-semibold text-primary">{amount}</p>
      </div>
    </CardContent>
  </Card>
);

export default function PaymentsPage() {
  const { currentUserRole } = useAuthStore();
  const { isBankAccountLinked } = useUserPreferencesStore();
  const { toast } = useToast();
  const router = useRouter();
  const { addPinnedItem } = usePinnedItemsStore();
  
  const [buyerFilter, setBuyerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArtistTransaction['status'] | "All">("All");
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);


  const showBankLinkingPrompt = (currentUserRole === "Buyer" || currentUserRole === "Artist") && !isBankAccountLinked;

  const totalPendingPayout = useMemo(() => {
    return mockArtistTransactions
      .filter(t => t.status === "Processing Payout") 
      .reduce((sum, t) => sum + t.amount, 0);
  }, []);

  const owedByBuyers = useMemo(() => {
    const owedMap: Record<string, { amount: number, buyerId: string }> = {};
    mockArtistTransactions
      .filter(t => t.status === "Pending Payment" || t.status === "Overdue")
      .forEach(t => {
        owedMap[t.buyerName] = {
            amount: (owedMap[t.buyerName]?.amount || 0) + t.amount,
            buyerId: t.buyerId
        };
      });
    return Object.entries(owedMap).map(([name, data]) => ({ name, ...data }));
  }, []);

  const filteredArtistTransactions = useMemo(() => {
    return mockArtistTransactions.filter(transaction => {
      const buyerMatch = buyerFilter === "" || transaction.buyerName.toLowerCase().includes(buyerFilter.toLowerCase());
      const statusMatch = statusFilter === "All" || transaction.status === statusFilter;
      return buyerMatch && statusMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [buyerFilter, statusFilter]);

  const handleDepositNow = () => {
    toast({
        title: "Deposit Initiated (Mock)",
        description: "Your pending payout deposit has been initiated. This is a simulation.",
    });
  };

  const handleTransactionClick = (transactionId: string) => {
    setSelectedTransactionId(prevId => prevId === transactionId ? null : transactionId);
  };

  const handlePinTransaction = (transaction: ArtistTransaction) => {
    addPinnedItem({
      type: "Transaction",
      name: `TXN: ${transaction.eventName} - ${transaction.buyerName}`,
      href: `/transactions/${transaction.id}`, // Assuming a detail page
      aiHint: "transaction payment money"
    });
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CreditCard className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl">Payment Management</CardTitle>
          <CardDescription>
            {showBankLinkingPrompt 
              ? "Link your bank account to manage payments and payouts."
              : currentUserRole === "Artist"
              ? "Oversee your earnings, track payouts, and manage payments from buyers."
              : "Secure and easy payment processing for DJ bookings."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showBankLinkingPrompt ? (
            <Card className="p-6 bg-yellow-50 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-700 border-l-4 shadow-md text-center">
              <Landmark className="h-12 w-12 text-yellow-600 dark:text-yellow-500 mx-auto mb-4" />
              <CardTitle className="text-xl text-yellow-700 dark:text-yellow-400 mb-2">Link Your Bank Account</CardTitle>
              <p className="text-yellow-600 dark:text-yellow-300 mb-4">
                To send or receive payments, please link your bank account. This is a secure process powered by Stripe (Simulated).
              </p>
              <Button asChild size="lg">
                <Link href="/payments/link-bank">
                  <Landmark className="mr-2 h-5 w-5" /> Link Bank Account
                </Link>
              </Button>
            </Card>
          ) : currentUserRole === "Artist" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary" />Pending Payout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">${totalPendingPayout.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Total amount currently processing for deposit.</p>
                     <Button size="sm" onClick={handleDepositNow} className="mt-3" disabled={totalPendingPayout === 0}>
                        <Send className="mr-2 h-4 w-4"/> Deposit Now (Mock)
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Owed by Buyers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {owedByBuyers.length > 0 ? (
                      <ScrollArea className="max-h-[130px] pr-3"> {/* Max height for ~5 items */}
                        <ul className="space-y-1 text-sm">
                          {owedByBuyers.map(buyer => (
                            <li key={buyer.buyerId} className="flex justify-between items-center hover:bg-muted/30 p-1 rounded-md">
                              <Link href={`/reports/artist-venue?artistId=mockArtist&venueId=${buyer.buyerId}`} 
                                    className="flex-grow hover:underline text-primary"
                                    title={`View payment details for ${buyer.name}`}>
                                {buyer.name}
                              </Link>
                              <span className="font-semibold ml-2">${buyer.amount.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    ) : (
                      <p className="text-sm text-muted-foreground">No outstanding payments from buyers.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5 text-primary" />Filter Transactions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buyerFilter">Filter by Buyer Name</Label>
                    <Input 
                      id="buyerFilter" 
                      placeholder="Enter buyer name..." 
                      value={buyerFilter}
                      onChange={(e) => setBuyerFilter(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="statusFilter">Filter by Status</Label>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ArtistTransaction['status'] | "All")}>
                      <SelectTrigger id="statusFilter" className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Pending Payment">Pending Payment</SelectItem>
                        <SelectItem value="Processing Payout">Processing Payout</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Recent Transactions</CardTitle>
                  <CardDescription>Click to select, double-click or right-click for more options.</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredArtistTransactions.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredArtistTransactions.map(transaction => (
                        <ContextMenu key={transaction.id}>
                          <ContextMenuTrigger asChild>
                            <Card 
                                className={cn(
                                  "p-3 bg-muted/30 hover:shadow-md cursor-pointer transition-all",
                                  selectedTransactionId === transaction.id && "ring-2 ring-primary shadow-lg"
                                )}
                                onClick={() => handleTransactionClick(transaction.id)}
                                onDoubleClick={() => router.push(`/transactions/${transaction.id}`)}
                                title="Click to select, double-click to view details"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <p className="font-semibold">{transaction.eventName}</p>
                                  <p className="text-xs text-muted-foreground">Buyer: {transaction.buyerName}</p>
                                </div>
                                <div className="text-left sm:text-center">
                                  <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground">Date: {transaction.date}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    transaction.status === "Paid" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                                    transaction.status === "Pending Payment" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400" :
                                    transaction.status === "Processing Payout" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" :
                                    "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                                  }`}>
                                    {transaction.status}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-56">
                            <ContextMenuItem onSelect={() => router.push(`/transactions/${transaction.id}`)}>
                              <ExternalLink className="mr-2 h-4 w-4" /> Inspect Transaction
                            </ContextMenuItem>
                            <ContextMenuItem onSelect={() => router.push(`/reports/artist-venue?artistId=mockArtist&venueId=${transaction.buyerId}`)}>
                              <FileText className="mr-2 h-4 w-4" /> Venue Booking History
                            </ContextMenuItem>
                            <ContextMenuItem onSelect={() => handlePinTransaction(transaction)}>
                              <Pin className="mr-2 h-4 w-4" /> Pin Transaction
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                             <ContextMenuItem onSelect={() => router.push(`/venues/${transaction.buyerId}`)}>
                              <Building2 className="mr-2 h-4 w-4" /> Go to Venue Profile
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem onSelect={() => setSelectedTransactionId(null)}>
                              Cancel
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No transactions match your filters.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="p-4 mb-6 bg-blue-100 border-l-4 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300 rounded-md shadow text-sm">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p className="font-semibold">Feature Under Development</p>
                </div>
                <p className="mt-1">
                  Full payment processing and history are coming soon. The data below is for demonstration purposes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Proposed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {genericMockPayments.proposed.map(item => <PaymentItemCard key={item.id} {...item} />)}
                    {genericMockPayments.proposed.length === 0 && <p className="text-xs text-muted-foreground">No proposed payments.</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" />Upcoming</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {genericMockPayments.upcoming.map(item => <PaymentItemCard key={item.id} {...item} />)}
                    {genericMockPayments.upcoming.length === 0 && <p className="text-xs text-muted-foreground">No upcoming payments.</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center"><Hourglass className="mr-2 h-5 w-5 text-primary" />In Transit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {genericMockPayments.inTransit.map(item => <PaymentItemCard key={item.id} {...item} />)}
                    {genericMockPayments.inTransit.length === 0 && <p className="text-xs text-muted-foreground">No payments in transit.</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-primary" />Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {genericMockPayments.completed.map(item => <PaymentItemCard key={item.id} {...item} />)}
                    {genericMockPayments.completed.length === 0 && <p className="text-xs text-muted-foreground">No completed payments.</p>}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

