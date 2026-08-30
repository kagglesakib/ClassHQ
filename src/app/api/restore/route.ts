import { NextRequest, NextResponse } from 'next/server';
import { restoreBackup } from '@/services/backupService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = await restoreBackup(body);
    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
