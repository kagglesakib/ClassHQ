import { MongoClient, Db } from 'mongodb';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let connectionPromise: Promise<Db> | null = null;
let useMemoryFallback = false;
let activeSource: 'local' | 'global' | 'memory' | null = null;

// Clean In-Memory Storage for offline/fallback mode (No dummy data)
const inMemoryData: Record<string, any[]> = {
  students: [],
  activities: [],
  exams: [],
  payments: [],
  users: [],
  userlogdatas: [],
};

function createMemoryCollection(colName: string) {
  if (!inMemoryData[colName]) {
    inMemoryData[colName] = [];
  }

  return {
    find: (query: any = {}, options?: any) => {
      let results = [...inMemoryData[colName]];

      if (query && Object.keys(query).length > 0) {
        results = results.filter((item) =>
          Object.entries(query).every(([k, v]) => item[k] === v)
        );
      }

      let sortField: string | null = null;
      let sortOrder = 1;
      let limitVal: number | null = null;

      const cursor = {
        sort: (sortObj: any) => {
          const keys = Object.keys(sortObj);
          if (keys.length > 0) {
            sortField = keys[0];
            sortOrder = sortObj[sortField] === -1 ? -1 : 1;
          }
          return cursor;
        },
        limit: (n: number) => {
          limitVal = n;
          return cursor;
        },
        toArray: async () => {
          let list = [...results];
          if (sortField) {
            list.sort((a, b) => {
              const valA = a[sortField!] ?? '';
              const valB = b[sortField!] ?? '';
              if (valA < valB) return -1 * sortOrder;
              if (valA > valB) return 1 * sortOrder;
              return 0;
            });
          }
          if (limitVal !== null && limitVal >= 0) {
            list = list.slice(0, limitVal);
          }
          return list.map((item) => ({ ...item }));
        },
      };

      return cursor;
    },

    findOne: async (query: any = {}) => {
      if (!query || Object.keys(query).length === 0) {
        return inMemoryData[colName][0] ? { ...inMemoryData[colName][0] } : null;
      }
      const item = inMemoryData[colName].find((doc) =>
        Object.entries(query).every(([k, v]) => doc[k] === v)
      );
      return item ? { ...item } : null;
    },

    countDocuments: async (query: any = {}) => {
      let results = [...inMemoryData[colName]];
      if (query && Object.keys(query).length > 0) {
        results = results.filter((item) =>
          Object.entries(query).every(([k, v]) => item[k] === v)
        );
      }
      return results.length;
    },

    estimatedDocumentCount: async () => {
      return inMemoryData[colName]?.length || 0;
    },

    insertOne: async (doc: any) => {
      const copy = { ...doc };
      inMemoryData[colName].push(copy);
      return { insertedId: copy.sid || copy.aid || copy.eid || copy.pid };
    },

    insertMany: async (docs: any[]) => {
      docs.forEach((doc) => inMemoryData[colName].push({ ...doc }));
      return { insertedCount: docs.length };
    },

    findOneAndUpdate: async (query: any, update: any, options?: any) => {
      const idx = inMemoryData[colName].findIndex((doc) =>
        Object.entries(query).every(([k, v]) => doc[k] === v)
      );
      if (idx === -1) return null;

      if (update.$set) {
        inMemoryData[colName][idx] = {
          ...inMemoryData[colName][idx],
          ...update.$set,
        };
      }
      return { ...inMemoryData[colName][idx] };
    },

    deleteOne: async (query: any) => {
      const idx = inMemoryData[colName].findIndex((doc) =>
        Object.entries(query).every(([k, v]) => doc[k] === v)
      );
      if (idx !== -1) {
        inMemoryData[colName].splice(idx, 1);
      }
      return { deletedCount: idx !== -1 ? 1 : 0 };
    },

    deleteMany: async (query: any = {}) => {
      if (Object.keys(query).length === 0) {
        const count = inMemoryData[colName].length;
        inMemoryData[colName] = [];
        return { deletedCount: count };
      }
      const initial = inMemoryData[colName].length;
      inMemoryData[colName] = inMemoryData[colName].filter(
        (doc) => !Object.entries(query).every(([k, v]) => doc[k] === v)
      );
      return { deletedCount: initial - inMemoryData[colName].length };
    },
  };
}

function getMemoryDb(): any {
  return {
    databaseName: 'TutorHQ-InMemory',
    collection: (colName: string) => createMemoryCollection(colName),
  };
}

export function getActiveDatabaseSource() {
  return activeSource;
}

export async function connectMongoDB(): Promise<Db> {
  if (mongoDb && !useMemoryFallback) {
    return mongoDb;
  }

  // Local MongoDB URIs
  const localUri = (
    process.env.MONGODB_LOCAL_URI ||
    process.env.MONGO_COMPASS_URI ||
    process.env.LOCAL_MONGO_URI ||
    ''
  ).trim();

  // Global MongoDB URIs
  const globalUri = (
    process.env.MONGODB_GLOBAL_URI ||
    process.env.MONGODB_ATLAS_URI ||
    process.env.GLOBAL_MONGO_URI ||
    process.env.MONGODB_URI ||
    ''
  ).trim();

  // If URIs are present, allow fresh connection attempt
  if (localUri || globalUri) {
    useMemoryFallback = false;
  } else if (useMemoryFallback) {
    return getMemoryDb() as Db;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    function parseDbName(uri: string): string | undefined {
      try {
        const formattedUri = uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')
          ? uri
          : `mongodb://${uri}`;
        const urlObj = new URL(formattedUri);
        const pathPart = urlObj.pathname.replace(/^\//, '').trim();
        if (pathPart) {
          const name = pathPart.split('/')[0].split('?')[0].trim();
          if (name) return name;
        }
      } catch {
        // Fall back to undefined so MongoClient uses connection string default
      }
      return undefined;
    }

    // 1. Try Global MongoDB (Atlas) first if specified
    if (globalUri) {
      try {
        console.log('🔄 Attempting connection to Global MongoDB (Atlas)...');
        const client = new MongoClient(globalUri, {
          serverSelectionTimeoutMS: 8000,
          connectTimeoutMS: 8000,
        });
        await client.connect();

        const dbName = parseDbName(globalUri);
        mongoClient = client;
        mongoDb = client.db(dbName);
        activeSource = 'global';
        useMemoryFallback = false;
        console.log(`✅ Connected to Global MongoDB (Atlas) successfully. Database: "${mongoDb.databaseName}"`);
        return mongoDb;
      } catch (err: any) {
        console.warn(`⚠️ Global MongoDB connection failed (${err?.message || err}). Trying Local MongoDB if available...`);
      }
    }

    // 2. Try Local MongoDB if global fails or is missing
    if (localUri) {
      try {
        console.log('🔄 Attempting connection to Local MongoDB...');
        const client = new MongoClient(localUri, {
          serverSelectionTimeoutMS: 2500,
          connectTimeoutMS: 2500,
        });
        await client.connect();

        const dbName = parseDbName(localUri);
        mongoClient = client;
        mongoDb = client.db(dbName);
        activeSource = 'local';
        useMemoryFallback = false;
        console.log(`✅ Connected to Local MongoDB successfully. Database: "${mongoDb.databaseName}"`);
        return mongoDb;
      } catch (err: any) {
        console.warn(`⚠️ Local MongoDB connection unavailable (${err?.message || err}).`);
      }
    }

    // 3. Fallback to clean in-memory store without dummy data if no URI works
    console.warn('⚠️ No active database connection could be established. Using clean in-memory store.');
    useMemoryFallback = true;
    activeSource = 'memory';
    return getMemoryDb() as Db;
  })().catch((err) => {
    connectionPromise = null;
    useMemoryFallback = true;
    activeSource = 'memory';
    return getMemoryDb() as Db;
  });

  return connectionPromise;
}

export async function getMongoDb(): Promise<Db> {
  return connectMongoDB();
}

