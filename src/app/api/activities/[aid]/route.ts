import { NextRequest, NextResponse } from 'next/server';
import { updateActivity, deleteActivity } from '../../../../services/activityService';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ aid: string }> }
) {
  try {
    const { aid } = await params;
    const body = await request.json();
    const result = await updateActivity(aid, body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ aid: string }> }
) {
  try {
    const { aid } = await params;
    await deleteActivity(aid);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
