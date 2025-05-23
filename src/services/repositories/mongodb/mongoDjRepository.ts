// src/services/repositories/mongodb/mongoDjRepository.ts
import type { IDjRepository } from '../interfaces/djRepository.interface';
import type { DJ, PaginatedResponse, DjFilters } from '@/types';
import clientPromise from '@/lib/mongodb'; // Import the MongoDB client promise
import { ObjectId } from 'mongodb';

const MONGO_DB_NAME = process.env.MONGODB_DB_NAME || 'spinkit_db';
const DJS_COLLECTION_NAME = process.env.MONGODB_DJS_COLLECTION || 'djs';

export class MongoDjRepository implements IDjRepository {
  constructor() {
    if (process.env.NODE_ENV === 'development') {
      console.log('[MongoDjRepository] Instantiated. ACTIVE_DATA_SOURCE_TYPE:', process.env.ACTIVE_DATA_SOURCE_TYPE);
      console.log(`    Using Database: ${MONGO_DB_NAME}`);
      console.log(`    Using DJs Collection: ${DJS_COLLECTION_NAME}`);
    }
  }

  private async getDb() {
    const client = await clientPromise;
    return client.db(MONGO_DB_NAME);
  }

  async findAll(
    filters?: DjFilters,
    pagination: { page: number; limit: number } = { page: 1, limit: 8 }
  ): Promise<PaginatedResponse<Omit<DJ, 'bio' | 'specialties' | 'recordings'>>> {
    console.log('[MongoDjRepository] findAll called with filters:', JSON.stringify(filters), 'pagination:', pagination);
    try {
      const db = await this.getDb();
      const collection = db.collection<DJ>(DJS_COLLECTION_NAME);

      const query: any = {};
      if (filters) {
        if (filters.genres && filters.genres.length > 0) {
          query.genres = { $in: filters.genres };
        }
        if (filters.location) {
          query.location = { $regex: filters.location, $options: 'i' };
        }
        if (filters.minScore !== undefined) {
          query.score = { ...(query.score || {}), $gte: filters.minScore };
        }
        if (filters.maxScore !== undefined) {
          query.score = { ...(query.score || {}), $lte: filters.maxScore };
        }
      }
      console.log('[MongoDjRepository] findAll: Executing query:', JSON.stringify(query));

      const totalItems = await collection.countDocuments(query);
      console.log(`[MongoDjRepository] findAll: Query found ${totalItems} total matching items before pagination.`);
      const totalPages = Math.ceil(totalItems / pagination.limit);
      const skip = (pagination.page - 1) * pagination.limit;

      const djsFromDb = await collection
        .find(query)
        .project({ bio: 0, specialties: 0, recordings: 0 })
        .sort({ addedDate: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .toArray();

      if (djsFromDb.length === 0) {
        console.warn(`[MongoDjRepository] findAll: No DJs found in collection '${DJS_COLLECTION_NAME}' matching query for page ${pagination.page}.`);
      } else {
        console.log(`[MongoDjRepository] findAll: Fetched ${djsFromDb.length} DJs from MongoDB for page ${pagination.page}.`);
      }

      const items = djsFromDb.map(djDoc => {
        const { _id, ...rest } = djDoc as any;
        // Ensure 'id' is a string, preferring a dedicated 'id' field if it exists, otherwise use _id.toString()
        const stringId = rest.id || (_id ? _id.toString() : undefined);
        return { ...rest, id: stringId } as Omit<DJ, 'bio' | 'specialties' | 'recordings'>;
      });
      
      return {
        items,
        totalItems,
        currentPage: pagination.page,
        totalPages,
        hasMore: pagination.page < totalPages,
      };
    } catch (error) {
      console.error("[MongoDjRepository] findAll: Error fetching DJs from MongoDB:", error);
      return { items: [], totalItems: 0, currentPage: 1, totalPages: 0, hasMore: false };
    }
  }

  async findById(id: string): Promise<DJ | undefined> {
    console.log(`[MongoDjRepository] findById DJ, attempting with id: ${id}`);
    try {
      const db = await this.getDb();
      const collection = db.collection<DJ>(DJS_COLLECTION_NAME);
      let djDoc: any | null = null; // Use 'any' to accommodate documents before transformation

      // Try finding by a string 'id' field first, as this matches mock data and potential custom ID strategy
      console.log(`[MongoDjRepository] Attempting to find by string field 'id': "${id}"`);
      djDoc = await collection.findOne({ id: id });

      if (!djDoc && ObjectId.isValid(id)) {
        // If not found by string 'id', and if the provided id is a valid ObjectId string, try finding by _id
        console.log(`[MongoDjRepository] Not found by string field 'id'. ID "${id}" is a valid ObjectId. Attempting to find by _id.`);
        djDoc = await collection.findOne({ _id: new ObjectId(id) });
      }

      if (djDoc) {
        const { _id, ...rest } = djDoc;
        // Ensure 'id' is a string, preferring a dedicated 'id' field if it exists, otherwise use _id.toString()
        const stringId = rest.id || (_id ? _id.toString() : id); // Fallback to original id if all else fails
        const resultDj = { ...rest, id: stringId } as DJ;
        console.log(`[MongoDjRepository] Found DJ by id "${id}":`, resultDj);
        return resultDj;
      }
      console.warn(`[MongoDjRepository] findById: DJ with id "${id}" not found by any method.`);
      return undefined;
    } catch (error) {
      console.error(`[MongoDjRepository] findById: Error fetching DJ with id ${id} from MongoDB:`, error);
      return undefined;
    }
  }

  async getAllGenres(): Promise<string[]> {
    console.log("[MongoDjRepository] getAllGenres for DJs");
    try {
      const db = await this.getDb();
      const collection = db.collection<DJ>(DJS_COLLECTION_NAME);
      const genres = await collection.distinct("genres");
      const validGenres = genres.filter(g => typeof g === 'string' && g.trim() !== '').sort() as string[];
      console.log(`[MongoDjRepository] Found distinct genres: ${validGenres.join(', ')}`);
      return validGenres;
    } catch (error) {
      console.error("[MongoDjRepository] getAllGenres: Error fetching DJ genres from MongoDB:", error);
      return [];
    }
  }

  async upsert(djData: Omit<DJ, 'id'> & { id?: string }): Promise<DJ | null> {
    console.log('[MongoDjRepository] upsert called with DJ data:', JSON.stringify(djData));
    try {
      const db = await this.getDb();
      const collection = db.collection<DJ>(DJS_COLLECTION_NAME);

      const { id, ...djToUpsert } = djData;
      
      const documentToUpsert: any = { ...djToUpsert };
      
      // If an 'id' is provided (string from frontend), use it for the query and ensure it's in the document.
      // If no 'id' is provided (new DJ), generate one. MongoDB will also add its own `_id`.
      const queryId = id || new ObjectId().toString();
      documentToUpsert.id = queryId; // Ensure our string 'id' field is present

      // Default values for missing fields
      documentToUpsert.genres = documentToUpsert.genres || [];
      documentToUpsert.location = documentToUpsert.location || "Unknown";
      documentToUpsert.score = documentToUpsert.score === undefined ? 0 : documentToUpsert.score;
      documentToUpsert.imageUrl = documentToUpsert.imageUrl || "";
      documentToUpsert.aiHint = documentToUpsert.aiHint || "";
      documentToUpsert.addedDate = documentToUpsert.addedDate || new Date().toISOString();
      documentToUpsert.bio = documentToUpsert.bio || "";
      documentToUpsert.specialties = documentToUpsert.specialties || [];
      documentToUpsert.recordings = documentToUpsert.recordings || [];

      const query = { id: queryId }; // Query by our string 'id' field
      const update = { $set: documentToUpsert };
      const options = { upsert: true, returnDocument: 'after' as const };

      console.log('[MongoDjRepository] upsert: Executing findOneAndUpdate with query:', JSON.stringify(query), 'and update:', JSON.stringify(update).substring(0, 200) + '...');
      const result = await collection.findOneAndUpdate(query, update, options);

      if (result) {
        const { _id, ...restOfDoc } = result as any;
        // Prioritize the string 'id' we manage, but ensure _id is also mapped if needed elsewhere,
        // though our DJ type uses a string 'id'.
        const returnedDj = { ...restOfDoc, id: restOfDoc.id || (_id ? _id.toString() : queryId) } as DJ;
        console.log('[MongoDjRepository] upsert successful, returned DJ:', returnedDj);
        return returnedDj;
      } else {
        console.warn('[MongoDjRepository] upsert: findOneAndUpdate did not return a document as expected.');
        // Fallback: try to fetch the document using the ID we intended to upsert with
        const freshlyInsertedDoc = await collection.findOne({ id: queryId });
        if (freshlyInsertedDoc) {
            const { _id, ...rest } = freshlyInsertedDoc as any;
            const fallbackDj = { ...rest, id: rest.id || (_id ? _id.toString() : queryId) } as DJ;
            console.log('[MongoDjRepository] upsert: Fallback fetch successful:', fallbackDj);
            return fallbackDj;
        }
        console.error('[MongoDjRepository] upsert: Failed to retrieve document after upsert.');
        return null;
      }
    } catch (error) {
      console.error("[MongoDjRepository] upsert: Error upserting DJ in MongoDB:", error);
      return null;
    }
  }
}
