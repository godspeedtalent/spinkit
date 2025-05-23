'use server';

/**
 * @fileOverview An AI agent to suggest optimal DJ booking times.
 *
 * - suggestDjBookingTimes - A function that suggests optimal DJ booking times.
 * - SuggestDjBookingTimesInput - The input type for the suggestDjBookingTimes function.
 * - SuggestDjBookingTimesOutput - The return type for the suggestDjBookingTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDjBookingTimesInputSchema = z.object({
  venueId: z.string().describe('The ID of the venue.'),
  historicalSalesData: z.string().describe('Historical sales data for the venue.'),
  weatherData: z.string().describe('Historical weather data.'),
  eventSchedule: z.string().describe('The venue event schedule.'),
});
export type SuggestDjBookingTimesInput = z.infer<typeof SuggestDjBookingTimesInputSchema>;

const SuggestDjBookingTimesOutputSchema = z.object({
  suggestedBookingTimes: z
    .string()
    .describe('Suggested optimal booking times for DJs.'),
  reasoning: z.string().describe('The AI reasoning behind the suggestions.'),
});
export type SuggestDjBookingTimesOutput = z.infer<typeof SuggestDjBookingTimesOutputSchema>;

export async function suggestDjBookingTimes(
  input: SuggestDjBookingTimesInput
): Promise<SuggestDjBookingTimesOutput> {
  return suggestDjBookingTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDjBookingTimesPrompt',
  input: {schema: SuggestDjBookingTimesInputSchema},
  output: {schema: SuggestDjBookingTimesOutputSchema},
  prompt: `You are an AI assistant that suggests optimal DJ booking times for venues.

  Analyze the provided historical sales data, weather patterns, and event schedules to determine the best times to book a DJ to maximize revenue.

  Venue ID: {{{venueId}}}
  Historical Sales Data: {{{historicalSalesData}}}
  Weather Data: {{{weatherData}}}
  Event Schedule: {{{eventSchedule}}}

  Consider all factors and provide a suggestion with reasoning.  The suggested booking times should specify date and time, such as "July 6, 2024, 9:00 PM - 1:00 AM". The reasoning should include the factors leading to your conclusion.

  Output your suggestion in a markdown list with one list item: "- Suggestion: " followed by the suggested time, then "- Reasoning:" followed by the reasoning.
  `,
});

const suggestDjBookingTimesFlow = ai.defineFlow(
  {
    name: 'suggestDjBookingTimesFlow',
    inputSchema: SuggestDjBookingTimesInputSchema,
    outputSchema: SuggestDjBookingTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
