import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const localUri = (
    process.env.MONGODB_LOCAL_URI ||
    process.env.MONGO_COMPASS_URI ||
    process.env.LOCAL_MONGO_URI ||
    ''
  ).trim();

  if (!localUri) {
    return NextResponse.json(
      {
        connected: false,
        error: 'MONGODB_LOCAL_URI is not set in .env file',
      },
      { status: 400 }
    );
  }

  let client: MongoClient | null = null;
  const startTime = Date.now();

  try {
    client = new MongoClient(localUri, { serverSelectionTimeoutMS: 3000 });
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
      databaseType: 'Local MongoDB Compass',
      database: db.databaseName,
      collections: collectionNames,
      counts,
      latencyMs,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    const isLocalhost = localUri.includes('localhost') || localUri.includes('127.0.0.1');
    const smartExplanation = isLocalhost
      ? `Local MongoDB (127.0.0.1) is unreachable from the hosted web server container. Your MONGODB_LOCAL_URI is preserved intact and will connect automatically when running locally in Antigravity or desktop Node.`
      : error.message || 'Failed to connect to Local MongoDB Compass.';

    return NextResponse.json(
      {
        connected: false,
        databaseType: 'Local MongoDB Compass',
        error: smartExplanation,
        rawError: error.message,
        isLocalhost,
        checkedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } finally {
    await client?.close();
  }
}

