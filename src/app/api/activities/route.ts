import { NextRequest, NextResponse } from 'next/server';
import { getActivities, createActivity } from '../../../services/activityService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await getActivities();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createActivity(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
