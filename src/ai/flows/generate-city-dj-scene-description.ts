
'use server';
/**
 * @fileOverview Generates a description of a city's DJ scene using AI.
 *
 * - generateCityDjSceneDescription - A function that generates the DJ scene description.
 * - GenerateCityDjSceneDescriptionInput - The input type.
 * - GenerateCityDjSceneDescriptionOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCityDjSceneDescriptionInputSchema = z.object({
  cityName: z.string().describe('The name of the city for which to generate the DJ scene description.'),
});
export type GenerateCityDjSceneDescriptionInput = z.infer<typeof GenerateCityDjSceneDescriptionInputSchema>;

const GenerateCityDjSceneDescriptionOutputSchema = z.object({
  description: z.string().describe("A vibrant description of the city's DJ scene, including popular genres, unique characteristics, and general atmosphere."),
});
export type GenerateCityDjSceneDescriptionOutput = z.infer<typeof GenerateCityDjSceneDescriptionOutputSchema>;

export async function generateCityDjSceneDescription(input: GenerateCityDjSceneDescriptionInput): Promise<GenerateCityDjSceneDescriptionOutput> {
  return generateCityDjSceneDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCityDjScenePrompt',
  input: {schema: GenerateCityDjSceneDescriptionInputSchema},
  output: {schema: GenerateCityDjSceneDescriptionOutputSchema},
  prompt: `You are a music journalist and travel writer specializing in nightlife and DJ culture.

Generate a vibrant and engaging description of the DJ scene in {{{cityName}}}.

Your description should be a concise paragraph (3-5 sentences) and touch upon:
- The general atmosphere and energy of the city's DJ scene.
- Popular or defining music genres (e.g., techno, house, hip-hop, eclectic).
- Any unique characteristics (e.g., known for underground venues, rooftop parties, specific local sounds).
- Mention if it's a globally recognized hub or more of a local gem.

Make it sound exciting and informative for someone looking to explore the music scene there.
Output only the description text.`,
});

const generateCityDjSceneDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCityDjSceneFlow',
    inputSchema: GenerateCityDjSceneDescriptionInputSchema,
    outputSchema: GenerateCityDjSceneDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
