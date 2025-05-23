
"use server";

import {
  suggestDjBookingTimes,
  type SuggestDjBookingTimesInput,
  type SuggestDjBookingTimesOutput,
} from "@/ai/flows/suggest-dj-booking-times";
import {
  djPerformanceSummary,
  type DjPerformanceSummaryInput,
  type DjPerformanceSummaryOutput,
} from "@/ai/flows/dj-performance-summary";
import {
  generateCityDjSceneDescription,
  type GenerateCityDjSceneDescriptionInput,
  type GenerateCityDjSceneDescriptionOutput,
} from "@/ai/flows/generate-city-dj-scene-description";

// generateProfile action was removed as AI DJ Profile Tool feature was deleted.

export async function suggestBookingTimes(
  input: SuggestDjBookingTimesInput
): Promise<SuggestDjBookingTimesOutput> {
  try {
    const result = await suggestDjBookingTimes(input);
    
    let suggestedBookingTimes = "Could not parse suggestion.";
    let reasoning = "Could not parse reasoning.";

    if (result.suggestedBookingTimes && result.reasoning) {
        suggestedBookingTimes = result.suggestedBookingTimes;
        reasoning = result.reasoning;
    } else if (typeof result === 'string') { 
        const suggestionMatch = result.match(/- Suggestion: (.*)/);
        const reasoningMatch = result.match(/- Reasoning: (.*)/s);
        if (suggestionMatch && suggestionMatch[1]) {
            suggestedBookingTimes = suggestionMatch[1].trim();
        }
        if (reasoningMatch && reasoningMatch[1]) {
            reasoning = reasoningMatch[1].trim();
        }
    }

    return { suggestedBookingTimes, reasoning };
  } catch (error: any) {
    console.error("Error suggesting booking times:", error);
    throw new Error(error.message || "Failed to suggest booking times. Please try again.");
  }
}

export async function getPerformanceSummary(
  input: DjPerformanceSummaryInput
): Promise<DjPerformanceSummaryOutput> {
  try {
    if (!input.djName || !input.venueName || !input.date || !input.salesData || !input.weatherData) {
        throw new Error("Missing required fields for performance summary.");
    }
    if (input.date && isNaN(new Date(input.date).getTime())) {
        throw new Error("Invalid date format provided for performance summary.");
    }

    const result = await djPerformanceSummary(input);

    if (!result || typeof result.summary !== 'string' || typeof result.effectivenessRating !== 'string') {
        throw new Error("AI failed to generate a valid performance summary structure.");
    }
    return result;

  } catch (error: any) {
    console.error("Error getting performance summary:", error);
     if (error.message.includes("SAFETY")) {
        throw new Error("The generated content was blocked due to safety settings. Please try different inputs.");
    }
    throw new Error(error.message || "Failed to get performance summary. Please try again.");
  }
}

export async function getCitySceneDescription(
  input: GenerateCityDjSceneDescriptionInput
): Promise<GenerateCityDjSceneDescriptionOutput> {
  try {
    const result = await generateCityDjSceneDescription(input);
    return result;
  } catch (error: any) {
    console.error("Error generating city DJ scene description:", error);
    throw new Error(error.message || "Failed to generate city DJ scene description. Please try again.");
  }
}
