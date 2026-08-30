import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../services/queryService';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const result = await executeQuery(query);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
