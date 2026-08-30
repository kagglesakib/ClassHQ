import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '../../../../services/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      college,
      hscBatch,
      subject,
      group,
      mobile,
      guardiansPhone,
      address,
      email,
      password,
    } = body;

    if (!email || !password || !name || !mobile) {
      return NextResponse.json(
        { success: false, error: 'Name, Mobile, Email, and Password are required for registration.' },
        { status: 200 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    const cleanName = String(name).trim();

    if (cleanPassword.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 4 characters long.' },
        { status: 200 }
      );
    }

    const db = await getMongoDb();
    const userlogCollection = db.collection('userlogdatas');
    const studentsCollection = db.collection('students');
    const usersCollection = db.collection('users');

    // 1. Email Uniqueness Check
    const existingLog = await userlogCollection.findOne({ email: cleanEmail });
    const existingStudent = await studentsCollection.findOne({ email: cleanEmail });
    const existingUser = await usersCollection.findOne({ email: cleanEmail });

    if (existingLog || existingStudent || existingUser) {
      return NextResponse.json(
        { success: false, error: `An account with email address '${cleanEmail}' already exists. Please sign in instead.` },
        { status: 200 }
      );
    }

    // 2. Create userlogdatas entry (SID is intentionally empty "" until Admin assigns SID during approval)
    const userlogDoc = {
      sid: '', // Empty until Admin assigns SID upon approval
      email: cleanEmail,
      password: cleanPassword, // Stored as plain text per explicit prompt instruction
      isApproved: 'pending', // Default pending approval
      userType: 'student', // Always student on signup
      name: cleanName,
      college: college ? String(college).trim() : '',
      hscBatch: hscBatch ? String(hscBatch).trim() : '',
      subject: subject ? String(subject).trim() : '',
      group: group ? String(group).trim() : '',
      mobile: String(mobile).trim(),
      guardiansPhone: guardiansPhone ? String(guardiansPhone).trim() : '',
      address: address ? String(address).trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userlogCollection.insertOne(userlogDoc);

    return NextResponse.json({
      success: true,
      message: 'Student account registered successfully! Your account is pending admin approval and SID assignment.',
      sid: '',
      userType: 'student',
      isApproved: 'pending',
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to complete signup.' },
      { status: 500 }
    );
  }
}
