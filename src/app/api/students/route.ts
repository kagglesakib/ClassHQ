import { NextRequest, NextResponse } from 'next/server';
import { getStudents, createStudent } from '../../../services/studentService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await getStudents();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createStudent(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
