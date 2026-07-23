import { Character, Power, Team, Universe } from '@/types';
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;

let client: MongoClient;

// add declaration to avoid "Element implicitly has an 'any' type"
declare global {
    // eslint-disable-next-line no-var
    var _mongoClient: MongoClient | undefined;
}

// In development → use global to survive hot-reloads
if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClient) {
        client = new MongoClient(uri, {
            maxPoolSize: 10,
            // you can add other options here
        });

        // Connect once and store
        global._mongoClient = client;
    }
    client = global._mongoClient!;
} else {
    // Production: fresh client per instance (serverless is fine)
    client = new MongoClient(uri, {
        maxPoolSize: 10,
    });
}

// Optional: you can await client.connect() here if you want eager connection
// but most people connect lazily when first used

export const db = client.db('test');

// Export your collections (safe because client is now always defined)
export const collectionCharacters = db.collection<Character>('characters');
export const collectionUniverses = db.collection<Universe>('universes');
export const collectionTeams = db.collection<Team>('teams');
export const collectionPowers = db.collection<Power>('powers'); 