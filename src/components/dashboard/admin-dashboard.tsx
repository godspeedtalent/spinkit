
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, Disc3, DollarSign, Activity, AlertTriangle } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, LineChart as RechartsLineChart, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid } from 'recharts'; // Renamed to avoid conflict if any

const mockUserGrowthData = [
  { month: "Jan", users: 65 }, { month: "Feb", users: 59 },
  { month: "Mar", users: 80 }, { month: "Apr", users: 81 },
  { month: "May", users: 56 }, { month: "Jun", users: 55 },
  { month: "Jul", users: 70 },
];

const mockTransactionData = [
  { date: "2024-07-01", volume: 2500, count: 30 },
  { date: "2024-07-02", volume: 1800, count: 22 },
  { date: "2024-07-03", volume: 3200, count: 45 },
  { date: "2024-07-04", volume: 2000, count: 28 },
  { date: "2024-07-05", volume: 4500, count: 55 },
];

const chartConfig = {
  users: { label: "Users", color: "hsl(var(--chart-1))" },
  volume: { label: "Volume ($)", color: "hsl(var(--chart-2))" },
  count: { label: "Count", color: "hsl(var(--chart-3))" },
}

export default function AdminDashboard() {
  // Mock data
  const totalUsers = 1250;
  const totalVenues = 150;
  const totalDJs = 300;
  const totalTransactions = 5800;
  const activeSessions = 75;
  const systemAlerts = 2;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">System-wide overview and analytics for SpinKit.</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues (Buyers)</CardTitle>
            <Building className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVenues.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5 new this week</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total DJs (Sellers)</CardTitle>
            <Disc3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDJs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12 new this week</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Value processed this month</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">System Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{systemAlerts}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </section>
      
      <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
         <Card className="shadow-md">
            <CardHeader>
                <CardTitle>User Growth Over Time</CardTitle>
                <CardDescription>Monthly new user registrations.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                 <ChartContainer config={chartConfig} className="w-full h-full">
                    <RechartsLineChart data={mockUserGrowthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <RechartsLineChart.Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={false} name="Users" />
                    </RechartsLineChart>
                </ChartContainer>
            </CardContent>
        </Card>
         <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Daily transaction volume and count.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                 <ChartContainer config={chartConfig} className="w-full h-full">
                    <RechartsBarChart data={mockTransactionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}/>
                        <YAxis yAxisId="left" orientation="left" stroke="var(--color-volume)" />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-count)" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar yAxisId="left" dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} name="Volume" />
                        <Bar yAxisId="right" dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} name="Count" />
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </section>

    </div>
  );
}

