// This file is intended to manage the MongoDB client connection.
// It should only be imported by server-side code (e.g., API routes, server components with direct DB access).

import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const activeDataSource = process.env.ACTIVE_DATA_SOURCE_TYPE || 'mock';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (activeDataSource === 'mongodb') {
  if (!uri) {
    throw new Error('ACTIVE_DATA_SOURCE_TYPE is "mongodb" but MONGODB_URI environment variable is not defined.');
  }

  const options = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  };

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    // @ts-ignore
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      // @ts-ignore
      global._mongoClientPromise = client.connect();
    }
    // @ts-ignore
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // If not using MongoDB, create a dummy promise that won't be used or will reject if accidentally awaited.
  // This prevents errors if this module is imported but MongoDB isn't the active source.
  clientPromise = Promise.reject(new Error("MongoDB is not the active data source."));
  if (process.env.NODE_ENV === 'development') {
    console.warn("MongoDB module loaded, but ACTIVE_DATA_SOURCE_TYPE is not 'mongodb'. MongoDB client will not be initialized.");
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
