
"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Building2, FileText, DollarSign } from "lucide-react";
import Link from 'next/link';

// Mock data - in a real app, this would be fetched based on artistId and venueId
const mockArtistVenueReport = {
  artistName: "DJ Sparkle",
  venueName: "The Groove Lounge",
  totalOwed: 300.00,
  outstandingInvoices: [
    { id: "inv123", eventName: "Techno Night - July 15", amount: 300.00, status: "Pending Payment", dueDate: "2024-07-22" },
  ],
  paymentHistory: [
    { id: "pay456", eventName: "House Grooves - June 28", amount: 200.00, status: "Paid", paymentDate: "2024-07-05" },
  ]
};

export default function ArtistVenueReportPage() {
  const searchParams = useSearchParams();
  const artistId = searchParams.get('artistId');
  const venueId = searchParams.get('venueId');

  // In a real app, you'd fetch data based on artistId and venueId
  const reportData = {
    ...mockArtistVenueReport,
    artistName: artistId ? `Artist ID: ${artistId.replace('mockArtist', 'Example Artist')}` : mockArtistVenueReport.artistName,
    venueName: venueId ? `Venue ID: ${venueId.replace('venue-', '')}` : mockArtistVenueReport.venueName,
  };


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/payments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Artist-Venue Payment Report</CardTitle>
          <CardDescription>
            Detailed payment overview between {reportData.artistName} and {reportData.venueName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-muted/30 p-4">
              <h3 className="font-semibold text-lg flex items-center"><User className="mr-2 h-5 w-5 text-primary"/>Artist</h3>
              <p>{reportData.artistName}</p>
            </Card>
            <Card className="bg-muted/30 p-4">
              <h3 className="font-semibold text-lg flex items-center"><Building2 className="mr-2 h-5 w-5 text-primary"/>Venue/Buyer</h3>
              <p>{reportData.venueName}</p>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-500"/>Total Amount Owed</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">${reportData.totalOwed.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Outstanding Invoices/Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.outstandingInvoices.length > 0 ? (
                <ul className="space-y-3">
                  {reportData.outstandingInvoices.map(invoice => (
                    <li key={invoice.id} className="p-3 border rounded-md">
                      <p className="font-medium">{invoice.eventName}</p>
                      <p className="text-sm">Amount: <span className="font-semibold">${invoice.amount.toFixed(2)}</span></p>
                      <p className="text-sm">Status: <span className="text-yellow-600 dark:text-yellow-400">{invoice.status}</span></p>
                      <p className="text-sm">Due: {invoice.dueDate}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No outstanding invoices from this buyer.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.paymentHistory.length > 0 ? (
                <ul className="space-y-3">
                  {reportData.paymentHistory.map(payment => (
                    <li key={payment.id} className="p-3 border rounded-md">
                      <p className="font-medium">{payment.eventName}</p>
                      <p className="text-sm">Amount: <span className="font-semibold">${payment.amount.toFixed(2)}</span></p>
                      <p className="text-sm">Status: <span className="text-green-600 dark:text-green-400">{payment.status}</span></p>
                      <p className="text-sm">Paid on: {payment.paymentDate}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No past payment history with this buyer.</p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground text-center">This is a mock report page. Data is illustrative.</p>
    </div>
  );
}
