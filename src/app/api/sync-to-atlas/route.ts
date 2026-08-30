import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import dns from 'dns';

// Fix Windows Node.js DNS resolution issue for mongodb+srv:// URIs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Fall back silently if setServers fails
}

export const dynamic = 'force-dynamic';

// Default core collections, but route will also auto-detect any collections in local DB
const DEFAULT_COLLECTIONS = ['students', 'activities', 'exams', 'payments'];

export async function POST() {
  const localUri = (
    process.env.MONGODB_LOCAL_URI ||
    process.env.MONGO_COMPASS_URI ||
    process.env.LOCAL_MONGO_URI ||
    ''
  ).trim();
  const atlasUri = (
    process.env.MONGODB_GLOBAL_URI ||
    process.env.MONGODB_ATLAS_URI ||
    process.env.GLOBAL_MONGO_URI ||
    process.env.MONGODB_URI ||
    ''
  ).trim();

  if (!localUri) {
    return NextResponse.json(
      { error: 'MONGODB_LOCAL_URI is not configured in .env file.' },
      { status: 400 }
    );
  }

  if (!atlasUri) {
    return NextResponse.json(
      { error: 'MONGODB_GLOBAL_URI is not configured in .env file.' },
      { status: 400 }
    );
  }

  let localClient: MongoClient | null = null;
  let atlasClient: MongoClient | null = null;

  try {
    // 1. Connect to Local MongoDB Compass Database
    localClient = new MongoClient(localUri);
    await localClient.connect();
    // client.db() automatically selects the database name specified in localUri (e.g., TuitionTracks)
    const localDb = localClient.db();

    // 2. Connect to Remote MongoDB Atlas Database
    atlasClient = new MongoClient(atlasUri, { serverSelectionTimeoutMS: 10000 });
    await atlasClient.connect();
    // client.db() automatically selects the database name specified in atlasUri (e.g., TuitionDB)
    const atlasDb = atlasClient.db();

    // 3. Auto-discover collections from local database
    const localCollectionsList = await localDb.listCollections({ type: 'collection' }).toArray();
    const discoveredNames = localCollectionsList
      .map((c) => c.name)
      .filter((name) => !name.startsWith('system.'));

    // Combine discovered collections with default collections (unique set)
    const collectionsToSync = Array.from(
      new Set([...DEFAULT_COLLECTIONS, ...discoveredNames])
    );

    const summary: Record<string, number> = {};

    // 4. Overwrite Atlas data collection by collection
    for (const col of collectionsToSync) {
      // Read all local documents from local Compass DB
      const localDocs = await localDb.collection(col).find({}).toArray();

      // Wipe existing collection on Atlas DB
      await atlasDb.collection(col).deleteMany({});

      // Insert local documents into Atlas DB
      if (localDocs.length > 0) {
        await atlasDb.collection(col).insertMany(localDocs);
      }

      summary[col] = localDocs.length;
    }

    return NextResponse.json({
      success: true,
      message: `Local Compass data ("${localDb.databaseName}") successfully overwrote Atlas data ("${atlasDb.databaseName}").`,
      sourceDatabase: localDb.databaseName,
      targetDatabase: atlasDb.databaseName,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Sync to Atlas Error]:', error);
    let msg = error.message || 'Failed to overwrite Atlas database with local Compass data.';
    if (localUri.includes('localhost') || localUri.includes('127.0.0.1')) {
      msg = `Cannot access Local MongoDB (127.0.0.1) from the website cloud server. MONGODB_LOCAL_URI is preserved intact for your local Antigravity desktop environment. (Error: ${error.message})`;
    }
    return NextResponse.json(
      { error: msg },
      { status: 400 }
    );
  } finally {
    await localClient?.close();
    await atlasClient?.close();
  }
}
