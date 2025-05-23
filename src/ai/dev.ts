
import { config } from 'dotenv';
config();

import '@/ai/flows/dj-performance-summary.ts';
// import '@/ai/flows/generate-dj-profile-from-input.ts'; // Removed as feature was deleted
import '@/ai/flows/suggest-dj-booking-times.ts';
import '@/ai/flows/generate-city-dj-scene-description.ts';
