import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '../../../../services/db';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '../../../../lib/auth';

function escapeRegex(str: string) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, sid: inputSid, email: inputEmail, password } = body;

    const cleanIdentifier = String(identifier || inputSid || inputEmail || '').trim();
    const cleanPassword = String(password || '').trim();

    if (!cleanIdentifier || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Student ID (SID) / Email and password are required.' },
        { status: 200 }
      );
    }

    const lowerIdentifier = cleanIdentifier.toLowerCase();
    const db = await getMongoDb();
    const userlogCollection = db.collection('userlogdatas');
    const usersCollection = db.collection('users');
    const studentsCollection = db.collection('students');

    // 1. Search in userlogdatas collection by SID (case-insensitive) OR Email
    let userlog: any = await userlogCollection.findOne({
      $or: [
        { sid: { $regex: new RegExp(`^${escapeRegex(cleanIdentifier)}$`, 'i') } },
        { email: lowerIdentifier },
      ],
    });

    // 2. If not found in userlogdatas, check students collection by SID or Email
    if (!userlog) {
      const studentDoc: any = await studentsCollection.findOne({
        $or: [
          { sid: { $regex: new RegExp(`^${escapeRegex(cleanIdentifier)}$`, 'i') } },
          { email: lowerIdentifier },
        ],
      });

      if (studentDoc && studentDoc.email) {
        userlog = await userlogCollection.findOne({ email: studentDoc.email.toLowerCase() });
      }
    }

    // 3. Admin Account Seeding & Verification (If log in via 'ADMIN' or admin email)
    if (!userlog) {
      const userlogCount = typeof userlogCollection.countDocuments === 'function'
        ? await userlogCollection.countDocuments()
        : 0;

      if (
        lowerIdentifier === 'sakib1514817122@gmail.com' ||
        cleanIdentifier.toUpperCase() === 'ADMIN' ||
        userlogCount === 0
      ) {
        const adminDoc = {
          sid: 'ADMIN',
          name: 'Sakibul Hasan',
          email: 'sakib1514817122@gmail.com',
          phone: '01516518418',
          password: cleanPassword,
          userType: 'admin',
          isApproved: 'yes',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await userlogCollection.updateOne(
          { email: 'sakib1514817122@gmail.com' },
          { $set: adminDoc },
          { upsert: true }
        );
        userlog = adminDoc;
        console.log(`✅ Configured admin account with SID 'ADMIN' for ${adminDoc.email}`);
      } else {
        return NextResponse.json(
          { success: false, error: `No user account found matching SID or Email '${cleanIdentifier}'.` },
          { status: 200 }
        );
      }
    }

    // 4. Verify Password
    if (userlog.password !== cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid Password. Please check your credentials and try again.' },
        { status: 200 }
      );
    }

    let userType: 'admin' | 'student' = (userlog.userType as 'admin' | 'student') || 'student';
    let isApproved = userlog.isApproved || (userType === 'admin' ? 'yes' : 'pending');
    if (isApproved === 'disapproved') isApproved = 'no';

    // Admin account fallback SID fix if missing
    if (userType === 'admin' && !userlog.sid) {
      userlog.sid = 'ADMIN';
      await userlogCollection.updateOne({ email: userlog.email }, { $set: { sid: 'ADMIN' } });
    }

    // 5. Check Approval Status for Students
    if (userType === 'student' && isApproved !== 'yes') {
      if (isApproved === 'no') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Your account registration was disapproved by the administrator. Please contact the admin if you believe this is an error.' 
          },
          { status: 200 }
        );
      }
      const studentSid = userlog.sid || cleanIdentifier;
      return NextResponse.json(
        { 
          success: false,
          error: `⏳ Your account (SID: ${studentSid}) is currently pending admin approval. Please wait for the administrator to review your request or contact your tutor/admin directly for quick activation.` 
        },
        { status: 200 }
      );
    }

    let sid = userlog.sid || '';
    let email = userlog.email || '';
    let name = userlog.name || (userType === 'admin' ? 'Admin User' : 'Student');
    let phone = userlog.mobile || userlog.phone || '';

    if (sid && userType === 'student') {
      const studentDoc = await studentsCollection.findOne({
        $or: [
          { sid: sid },
          { sid: sid.toUpperCase() },
          { email: email.toLowerCase() },
        ],
      });
      if (studentDoc) {
        name = studentDoc.name || name;
        phone = studentDoc.mobile || phone;
        if (studentDoc.email) email = studentDoc.email;
      }
    }

    // 6. Create Session Token (3-Hour duration)
    const { token, expiresAt } = createSessionToken({
      name,
      email,
      phone,
      sid,
      userType,
      isApproved,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful. Session active for 3 hours.',
      user: {
        name,
        email,
        phone,
        sid,
        userType,
        isApproved,
      },
      expiresAt,
      token,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    });

    return response;
  } catch (err: any) {
    console.error('Error during login:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server auth error' },
      { status: 500 }
    );
  }
}

