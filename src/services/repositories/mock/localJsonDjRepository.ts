// src/services/repositories/mock/localJsonDjRepository.ts
import type { IDjRepository } from '../interfaces/djRepository.interface';
import type { DJ, PaginatedResponse, DjFilters, Recording } from '@/types';
import djsDataJson from '@/data/mock-data/json/djs.json';
import { generateUnsplashUrl } from '@/lib/utils';

const PAGE_SIZE = 8; // Default page size if not provided

export class LocalJsonDjRepository implements IDjRepository {
  private djs: DJ[] = (djsDataJson as unknown as Array<Omit<DJ, 'imageUrl'> & { profilePic?: string }>).map(rawDjData => {
    const { profilePic, aiHint, name, ...rest } = rawDjData;
    const finalImageUrl = (profilePic && profilePic.startsWith('http')) 
                         ? profilePic 
                         : generateUnsplashUrl(600, 800, aiHint || name, "dj portrait cool");
    return {
      ...rest,
      name,
      aiHint: aiHint || name || "dj",
      imageUrl: finalImageUrl,
      genres: rawDjData.genres || ["Open Format"],
      location: rawDjData.location || "Various Locations",
      score: rawDjData.score || 0,
      addedDate: rawDjData.addedDate || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      bio: rawDjData.bio || `An enigmatic DJ known for captivating sets. ${name} brings a unique energy to every performance.`,
      specialties: rawDjData.specialties || ["Crowd Reading", "Seamless Transitions"],
      recordings: rawDjData.recordings || [],
    };
  });

  async findAll(
    filters?: DjFilters,
    pagination: { page: number; limit: number } = { page: 1, limit: PAGE_SIZE }
  ): Promise<PaginatedResponse<Omit<DJ, 'bio' | 'specialties' | 'recordings'>>> {
    let filteredDjs = [...this.djs];

    if (filters) {
      if (filters.genres && filters.genres.length > 0) {
        filteredDjs = filteredDjs.filter(dj =>
          filters!.genres!.some(fg => dj.genres.includes(fg))
        );
      }
      if (filters.location) {
        filteredDjs = filteredDjs.filter(dj =>
          dj.location.toLowerCase().includes(filters!.location!.toLowerCase())
        );
      }
      if (filters.minScore !== undefined) {
        filteredDjs = filteredDjs.filter(dj => dj.score >= filters!.minScore!);
      }
      if (filters.maxScore !== undefined) {
        filteredDjs = filteredDjs.filter(dj => dj.score <= filters!.maxScore!);
      }
    }
    
    filteredDjs.sort((a, b) => new Date(b.addedDate || 0).getTime() - new Date(a.addedDate || 0).getTime());

    const totalItems = filteredDjs.length;
    const limit = pagination.limit || PAGE_SIZE;
    const page = pagination.page || 1;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const end = page * limit;

    const paginatedItems = filteredDjs
      .map(({ bio, specialties, recordings, ...rest }) => rest)
      .slice(start, end);

    return {
      items: paginatedItems,
      totalItems,
      hasMore: page < totalPages,
      currentPage: page,
      totalPages,
    };
  }

  async findById(id: string): Promise<DJ | undefined> {
    const dj = this.djs.find(dj => dj.id === id);
    if (dj) {
      const recordings = dj.recordings?.map(r => ({
          ...r,
          addedDate: r.addedDate ? new Date(r.addedDate).toISOString() : undefined
      })) as Recording[] | undefined; // Ensure correct type for recordings
      return { ...dj, recordings };
    }
    return undefined;
  }

  async getAllGenres(): Promise<string[]> {
    return Array.from(new Set(this.djs.flatMap(dj => dj.genres))).sort();
  }

  async upsert(djData: Omit<DJ, 'id'> & { id?: string }): Promise<DJ | null> {
    console.log('[LocalJsonDjRepository] upsert called (mock):', djData);
    const existingIndex = this.djs.findIndex(d => d.id === djData.id);
    let newOrUpdatedDj: DJ;

    if (existingIndex > -1) {
      newOrUpdatedDj = { ...this.djs[existingIndex], ...djData, id: this.djs[existingIndex].id }; // Ensure id is not overwritten if djData has no id
      this.djs[existingIndex] = newOrUpdatedDj;
    } else {
      const newId = djData.id || `mock-${Date.now()}`;
      newOrUpdatedDj = { 
        ...djData, 
        id: newId,
        genres: djData.genres || ["Open Format"],
        location: djData.location || "Unknown",
        score: djData.score || 0,
        imageUrl: djData.imageUrl || generateUnsplashUrl(600, 800, djData.aiHint || djData.name, "dj"),
        aiHint: djData.aiHint || djData.name || "dj",
        addedDate: djData.addedDate || new Date().toISOString(),
      };
      this.djs.push(newOrUpdatedDj);
    }
    return Promise.resolve(newOrUpdatedDj);
  }
}
