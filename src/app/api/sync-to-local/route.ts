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
    // 1. Connect to Remote MongoDB Atlas Database (Source)
    atlasClient = new MongoClient(atlasUri, { serverSelectionTimeoutMS: 10000 });
    await atlasClient.connect();
    const atlasDb = atlasClient.db();

    // 2. Connect to Local MongoDB Compass Database (Target)
    localClient = new MongoClient(localUri);
    await localClient.connect();
    const localDb = localClient.db();

    // 3. Auto-discover collections from Atlas database
    const atlasCollectionsList = await atlasDb.listCollections({ type: 'collection' }).toArray();
    const discoveredNames = atlasCollectionsList
      .map((c) => c.name)
      .filter((name) => !name.startsWith('system.'));

    const collectionsToSync = Array.from(
      new Set([...DEFAULT_COLLECTIONS, ...discoveredNames])
    );

    const summary: Record<string, number> = {};

    // 4. Overwrite Local Compass data collection by collection
    for (const col of collectionsToSync) {
      // Read all documents from Atlas DB
      const atlasDocs = await atlasDb.collection(col).find({}).toArray();

      // Wipe existing collection on Local Compass DB
      await localDb.collection(col).deleteMany({});

      // Insert Atlas documents into Local Compass DB
      if (atlasDocs.length > 0) {
        await localDb.collection(col).insertMany(atlasDocs);
      }

      summary[col] = atlasDocs.length;
    }

    return NextResponse.json({
      success: true,
      message: `Global Atlas data ("${atlasDb.databaseName}") successfully overwrote Local Compass data ("${localDb.databaseName}").`,
      sourceDatabase: atlasDb.databaseName,
      targetDatabase: localDb.databaseName,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Sync to Local Error]:', error);
    let msg = error.message || 'Failed to overwrite Local Compass database with Global Atlas data.';
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
