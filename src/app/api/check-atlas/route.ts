import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const atlasUri = (
    process.env.MONGODB_GLOBAL_URI ||
    process.env.MONGODB_ATLAS_URI ||
    process.env.GLOBAL_MONGO_URI ||
    process.env.MONGODB_URI ||
    ''
  ).trim();

  if (!atlasUri) {
    return NextResponse.json(
      {
        connected: false,
        error: 'MONGODB_GLOBAL_URI is not set in .env',
      },
      { status: 400 }
    );
  }

  let client: MongoClient | null = null;
  const startTime = Date.now();

  try {
    client = new MongoClient(atlasUri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();

    const db = client.db();
    const collections = await db.listCollections({ type: 'collection' }).toArray();
    const collectionNames = collections
      .map((c) => c.name)
      .filter((name) => !name.startsWith('system.'));

    const counts: Record<string, number> = {};
    for (const col of collectionNames) {
      counts[col] = await db.collection(col).countDocuments();
    }

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      connected: true,
      databaseType: 'Global MongoDB Atlas',
      database: db.databaseName,
      collections: collectionNames,
      counts,
      latencyMs,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        databaseType: 'Global MongoDB Atlas',
        error: error.message || 'Failed to connect to MongoDB Atlas.',
        checkedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await client?.close();
  }
}
