import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../services/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await connectMongoDB();
    return NextResponse.json({
      status: 'ok',
      time: new Date().toISOString(),
      databaseMode: 'MongoDB',
      databaseName: db.databaseName,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 });
  }
}
