
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getPerformanceSummary } from "@/lib/actions";
import type { DjPerformanceSummaryOutput } from "@/ai/flows/dj-performance-summary";
import { Loader2, BarChartBig, CalendarIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";

const formSchema = z.object({
  djName: z.string().min(1, "DJ name is required."),
  venueName: z.string().min(1, "Venue name is required."),
  date: z.date({ required_error: "Performance date is required." }),
  salesData: z.string().min(10, "Sales data is required and should be descriptive."),
  weatherData: z.string().min(10, "Weather data is required and should be descriptive."),
  otherEvents: z.string().optional(),
});

export default function PerformanceInsightsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<DjPerformanceSummaryOutput | null>(null);
  const { toast } = useToast();
  const { featureToggles } = useUserPreferencesStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      djName: "",
      venueName: "",
      salesData: "",
      weatherData: "",
      otherEvents: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!featureToggles?.aiFeatures) {
        toast({ title: "AI Features Disabled", description: "Please enable AI features in Dev Tools to use this.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setSummary(null);
    try {
      const formattedValues = {
        ...values,
        date: format(values.date, "yyyy-MM-dd"),
      };
      const result = await getPerformanceSummary(formattedValues);
      setSummary(result);
      toast({
        title: "Performance Summary Generated!",
        description: "AI has analyzed the DJ's performance.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to generate summary.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!featureToggles?.aiFeatures) {
    return (
        <Card className="shadow-lg max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="text-3xl">DJ Performance Analysis</CardTitle>
                <CardDescription>
                    Provide performance details and let AI generate an effectiveness summary.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center bg-muted/30">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                    <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">AI Features Disabled</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Please enable "AI Features" in the Dev Tools to use this functionality.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">DJ Performance Analysis</CardTitle>
          <CardDescription>
            Provide performance details and let AI generate an effectiveness summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="djName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">DJ Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., DJ Sparkle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="venueName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Venue Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., The Groove Lounge" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-lg">Performance Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salesData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Sales Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Hourly sales, total sales, peak hours, average check, specific promotions, etc."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Provide detailed sales figures and context.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weatherData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Weather Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Temperature, precipitation, significant weather events (e.g., 'Sunny and warm, 75°F', 'Heavy rain started at 10 PM')."
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="otherEvents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Other Concurrent Events (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nearby concerts, city-wide festivals, competing venue promotions, etc."
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Any external factors that might have influenced attendance or sales.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || !featureToggles?.aiFeatures} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Performance...
                  </>
                ) : (
                  "Get AI Performance Summary"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {summary && (
        <Card className="mt-8 shadow-lg bg-secondary/50 border-secondary">
          <CardHeader className="flex flex-row items-center space-x-3">
            <BarChartBig className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="text-2xl text-primary">Performance Summary</CardTitle>
                <CardDescription className="text-primary/80">AI-generated analysis of the DJ's effectiveness.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">Summary:</h4>
              <p className="text-foreground whitespace-pre-wrap">{summary.summary}</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg">Effectiveness Rating:</h4>
              <p className="text-xl font-bold text-primary">{summary.effectivenessRating}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
