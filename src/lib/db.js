import { MongoClient } from "mongodb";

const globalForMongo = globalThis;

function createConnection() {
  const uri = process.env.BETTER_AUTH_DB_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("BETTER_AUTH_DB_URI is not set");
  }

  const client = new MongoClient(uri);

  return {
    client,
    db: client.db(process.env.BETTER_AUTH_DB_NAME || "wedplandb"),
  };
}

const mongo = globalForMongo.__wedplanMongo ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.__wedplanMongo = mongo;
}

export const mongoClient = mongo.client;
export const db = mongo.db;
