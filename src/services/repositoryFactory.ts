// src/services/repositoryFactory.ts

// Import interfaces
import type { IDjRepository } from './repositories/interfaces/djRepository.interface';
import type { IVenueRepository } from './repositories/interfaces/venueRepository.interface';
import type { IRecordingRepository } from './repositories/interfaces/recordingRepository.interface';
import type { IEventRepository } from './repositories/interfaces/eventRepository.interface';
import type { IGenreRepository } from './repositories/interfaces/genreRepository.interface';
import type { ICityRepository } from './repositories/interfaces/cityRepository.interface';

// Import Local JSON Implementations
import { LocalJsonDjRepository } from './repositories/mock/localJsonDjRepository';
import { LocalJsonVenueRepository } from './repositories/mock/localJsonVenueRepository';
import { LocalJsonRecordingRepository } from './repositories/mock/localJsonRecordingRepository';
import { LocalJsonEventRepository } from './repositories/mock/localJsonEventRepository';
import { LocalJsonGenreRepository } from './repositories/mock/localJsonGenreRepository';
import { LocalJsonCityRepository } from './repositories/mock/localJsonCityRepository';

// Import Placeholder MongoDB Implementations
import { MongoDjRepository } from './repositories/mongodb/mongoDjRepository';
import { MongoVenueRepository } from './repositories/mongodb/mongoVenueRepository';
import { MongoRecordingRepository } from './repositories/mongodb/mongoRecordingRepository';
import { MongoEventRepository } from './repositories/mongodb/mongoEventRepository';
import { MongoGenreRepository } from './repositories/mongodb/mongoGenreRepository';
import { MongoCityRepository } from './repositories/mongodb/mongoCityRepository';

// Import Placeholder Notion Implementations
import { NotionDjRepository } from './repositories/notion/notionDjRepository';
import { NotionVenueRepository } from './repositories/notion/notionVenueRepository';
import { NotionRecordingRepository } from './repositories/notion/notionRecordingRepository';
import { NotionEventRepository } from './repositories/notion/notionEventRepository';
import { NotionGenreRepository } from './repositories/notion/notionGenreRepository';
import { NotionCityRepository } from './repositories/notion/notionCityRepository';


type DataSourceType = 'localJson' | 'mongodb' | 'notion';

const getActiveDataSourceType = (): DataSourceType => {
  const typeFromEnv = process.env.ACTIVE_DATA_SOURCE_TYPE;
  if (typeFromEnv === 'mongodb' || typeFromEnv === 'notion' || typeFromEnv === 'localJson') {
    return typeFromEnv as DataSourceType;
  }
  if (process.env.NODE_ENV === 'development' && typeFromEnv) {
    console.warn(`Invalid ACTIVE_DATA_SOURCE_TYPE: "${typeFromEnv}". Defaulting to "localJson".`);
  }
  return 'localJson'; // Default to localJson
};

const ACTIVE_DATA_SOURCE_TYPE: DataSourceType = getActiveDataSourceType();

if (process.env.NODE_ENV === 'development') {
    console.log(`[RepositoryFactory] Active Data Source Type: ${ACTIVE_DATA_SOURCE_TYPE}`);
}


export function getDjRepository(): IDjRepository {
  switch (ACTIVE_DATA_SOURCE_TYPE) {
    case 'mongodb':
      return new MongoDjRepository();
    case 'notion':
      return new NotionDjRepository();
    case 'localJson':
    default:
      return new LocalJsonDjRepository();
  }
}

export function getVenueRepository(): IVenueRepository {
  switch (ACTIVE_DATA_SOURCE_TYPE) {
    case 'mongodb':
      return new MongoVenueRepository();
    case 'notion':
      return new NotionVenueRepository();
    case 'localJson':
    default:
      return new LocalJsonVenueRepository();
  }
}

export function getRecordingRepository(): IRecordingRepository {
  switch (ACTIVE_DATA_SOURCE_TYPE) {
    case 'mongodb':
      return new MongoRecordingRepository();
    case 'notion':
      return new NotionRecordingRepository();
    case 'localJson':
    default:
      return new LocalJsonRecordingRepository();
  }
}

export function getEventRepository(): IEventRepository {
  switch (ACTIVE_DATA_SOURCE_TYPE) {
    case 'mongodb':
      return new MongoEventRepository();
    case 'notion':
      return new NotionEventRepository();
    case 'localJson':
    default:
      return new LocalJsonEventRepository();
  }
}

export function getGenreRepository(): IGenreRepository {
  switch (ACTIVE_DATA_SOURCE_TYPE) {
    case 'mongodb':
      return new MongoGenreRepository();
    case 'notion':
      return new NotionGenreRepository();
    case 'localJson':
    default:
      return new LocalJsonGenreRepository();
  }
}

export function getCityRepository(): ICityRepository {
  switch (ACTIVE_DATA_SOURCE_TYPE) {
    case 'mongodb':
      return new MongoCityRepository();
    case 'notion':
      return new NotionCityRepository();
    case 'localJson':
    default:
      return new LocalJsonCityRepository();
  }
}
