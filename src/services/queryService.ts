import { getMongoDb } from './db';

export async function executeQuery(query: string): Promise<{
  command: string;
  rowCount: number | null;
  rows: any[];
  fields: { name: string }[];
}> {
  if (!query || typeof query !== 'string') {
    throw new Error('Query string is required');
  }

  // Safety check: Block DDL/DCL statements case-insensitively
  const ddlKeywords = ['create', 'drop', 'alter', 'truncate', 'rename', 'comment', 'grant', 'revoke', 'vacuum', 'analyze'];
  const lowerQuery = query.toLowerCase().trim();

  const hasDdl = ddlKeywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lowerQuery);
  });

  if (hasDdl) {
    throw new Error('DDL / DCL commands are blocked for database integrity. Only DML statements (SELECT, INSERT, UPDATE, DELETE) are permitted.');
  }

  const mongoDb = await getMongoDb();

  const matchSelect = query.match(/SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)/i);
  if (matchSelect) {
    let tableName = matchSelect[2].toLowerCase();
    if (tableName === 'student_activities') tableName = 'activities';

    let cursor = mongoDb.collection(tableName).find({}, { projection: { _id: 0 } });
    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      cursor = cursor.limit(parseInt(limitMatch[1]));
    }

    const rows = await cursor.toArray();
    const fields = rows.length > 0 ? Object.keys(rows[0]).map(k => ({ name: k })) : [];

    return {
      command: 'SELECT',
      rowCount: rows.length,
      rows,
      fields
    };
  }

  throw new Error('Query runner supports SELECT statements.');
}
