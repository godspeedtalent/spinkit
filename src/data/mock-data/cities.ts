// src/data/mock-data/cities.ts
import type { CityDetails, DJ, Venue, CityObject as AppCityObject } from '@/types';
import allCitiesJson from './json/cities.json'; 
import djsDataJson from './json/djs.json';
import venuesDataJson from './json/venues.json';
import allGenresJson from './json/genres.json';
import { generateUnsplashUrl } from '@/lib/utils'; // Import centralized helper

const djs: DJ[] = djsDataJson as DJ[];
const venues: Venue[] = venuesDataJson as Venue[];
const allGenresList: string[] = allGenresJson.map(g => g.name);

export const allMockCities: AppCityObject[] = allCitiesJson.map(cityJson => {
  const finalProfilePic = (cityJson.profilePic && cityJson.profilePic.startsWith('http'))
                          ? cityJson.profilePic
                          : generateUnsplashUrl(600, 400, cityJson.aiHint || cityJson.name, "cityscape");
  return {
    name: cityJson.name,
    slug: cityJson.slug,
    profilePic: finalProfilePic,
    aiHint: cityJson.aiHint,
  };
});

export const allMockCityNames: string[] = allMockCities.map(city => city.name);

export const getCityDetailsData = (cityName: string): CityDetails | null => {
  const cityObject = allMockCities.find(city => city.name === cityName);
  
  let description = `Explore the vibrant music scene of ${cityName}!`; 
  let profilePicForDetails = cityObject?.profilePic || generateUnsplashUrl(800, 600, cityName, "city skyline");
  let aiHintForDetails = cityObject?.aiHint || cityName;


  let cityDjs: Pick<DJ, 'id' | 'name' | 'genres' | 'imageUrl' | 'aiHint' | 'location'>[] = [];
  let cityVenues: Pick<Venue, 'id' | 'name' | 'location' | 'imageUrl' | 'aiHint'>[] = [];
  let cityPopularGenres: string[] = [];

  if (cityName === "Worldwide" || cityName === "National") {
    cityDjs = djs.sort(() => 0.5 - Math.random()).slice(0, 4).map(dj => ({
      id: dj.id, name: dj.name, genres: dj.genres, 
      imageUrl: (dj.profilePic && dj.profilePic.startsWith('http')) ? dj.profilePic : generateUnsplashUrl(400,300, dj.aiHint || dj.name, "dj person"), 
      aiHint: dj.aiHint, location: dj.location
    }));
    cityVenues = venues.sort(() => 0.5 - Math.random()).slice(0, 4).map(v => ({
      id: v.id, name: v.name, location: v.location, 
      imageUrl: (v.imageUrl && v.imageUrl.startsWith('http')) ? v.imageUrl : generateUnsplashUrl(400,300, v.aiHint || v.name, "venue building"), 
      aiHint: v.aiHint
    }));
    const randomStart = Math.floor(Math.random() * (allGenresList.length - Math.min(3, allGenresList.length)));
    cityPopularGenres = allGenresList.slice(randomStart, randomStart + 3 + Math.floor(Math.random() * 2));
    description = cityName === "Worldwide" 
      ? "Explore music from every corner of the globe. Discover international artists, iconic venues, and trending genres worldwide."
      : "Discover the nation's top artists, renowned venues, and the most popular music genres defining the sound of the country.";
    profilePicForDetails = generateUnsplashUrl(800, 600, cityName === "Worldwide" ? "globe earth map" : "national landscape map", "abstract");

  } else {
    cityDjs = djs
      .filter(dj => dj.location && dj.location.toLowerCase().includes(cityName.toLowerCase()))
      .slice(0, 4)
      .map(dj => ({
        id: dj.id, name: dj.name, genres: dj.genres, 
        imageUrl: (dj.profilePic && dj.profilePic.startsWith('http')) ? dj.profilePic : generateUnsplashUrl(400,300, dj.aiHint || dj.name, "dj person"), 
        aiHint: dj.aiHint, location: dj.location
      }));

    cityVenues = venues
      .filter(venue => venue.location && venue.location.toLowerCase().includes(cityName.toLowerCase()))
      .slice(0, 4)
      .map(v => ({
        id: v.id, name: v.name, location: v.location, 
        imageUrl: (v.imageUrl && v.imageUrl.startsWith('http')) ? v.imageUrl : generateUnsplashUrl(400,300, v.aiHint || v.name, "venue building"), 
        aiHint: v.aiHint
      }));

    let derivedGenres: string[] = [];
    cityDjs.forEach(dj => derivedGenres.push(...(dj.genres || [])));
    cityVenues.forEach(vCard => {
        const fullVenue = venues.find(v => v.id === vCard.id);
        if (fullVenue) derivedGenres.push(...(fullVenue.djNeeds || []));
    });

    if (derivedGenres.length === 0 && allGenresList.length > 0) {
      const randomStart = Math.floor(Math.random() * (allGenresList.length - Math.min(3, allGenresList.length)));
      cityPopularGenres = allGenresList.slice(randomStart, randomStart + 3 + Math.floor(Math.random() * 2));
    } else {
      const genreCounts = derivedGenres.reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      cityPopularGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(entry => entry[0]);
    }
    if (cityObject?.description) description = cityObject.description;
  }

  return {
    name: cityName,
    slug: cityObject?.slug || cityName.toLowerCase().replace(/\s+/g, '-'),
    profilePicSeed: profilePicForDetails, 
    aiHint: aiHintForDetails,
    description: description,
    topDjs: cityDjs,
    topVenues: cityVenues,
    popularGenres: cityPopularGenres,
  };
};
