import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

declare global {
  // Reuse the client across dev hot reloads.
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClient(): Promise<MongoClient> {
  if (!uri) throw new Error("MONGODB_URI is not set");
  globalThis._mongoClientPromise ??= new MongoClient(uri).connect();
  return globalThis._mongoClientPromise;
}
