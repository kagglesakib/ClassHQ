import { NextResponse } from 'next/server';
import { generateBackup } from '@/services/backupService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const backup = await generateBackup();
    return NextResponse.json(backup);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
