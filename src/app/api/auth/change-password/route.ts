import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '../../../../services/db';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../../../../lib/auth';

function escapeRegex(str: string) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const session = verifySessionToken(cookieToken || bearerToken);

    const body = await req.json();
    const { oldPassword, newPassword, confirmPassword, sid, email } = body;

    const userSid = session?.sid || sid || '';
    const userEmail = session?.email || email || '';

    if (!userSid && !userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const cleanOldPass = String(oldPassword || '').trim();
    const cleanNewPass = String(newPassword || '').trim();
    const cleanConfirmPass = String(confirmPassword || '').trim();

    if (!cleanOldPass) {
      return NextResponse.json({ error: 'Current (old) password is required.' }, { status: 400 });
    }
    if (!cleanNewPass) {
      return NextResponse.json({ error: 'New password is required.' }, { status: 400 });
    }
    if (!cleanConfirmPass) {
      return NextResponse.json({ error: 'Please confirm your new password.' }, { status: 400 });
    }

    if (cleanNewPass !== cleanConfirmPass) {
      return NextResponse.json(
        { error: 'New password and Confirm password do not match.' },
        { status: 400 }
      );
    }

    if (cleanNewPass.length < 4) {
      return NextResponse.json(
        { error: 'New password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    const userlogCollection = db.collection('userlogdatas');

    // Find user record in userlogdatas by SID or Email
    const queryConditions: any[] = [];
    if (userSid) {
      queryConditions.push({ sid: { $regex: new RegExp(`^${escapeRegex(userSid)}$`, 'i') } });
    }
    if (userEmail) {
      queryConditions.push({ email: userEmail.toLowerCase() });
    }

    let userlog = await userlogCollection.findOne({ $or: queryConditions });

    if (!userlog) {
      return NextResponse.json(
        { error: 'User account record not found.' },
        { status: 404 }
      );
    }

    // Verify Old Password
    if (userlog.password !== cleanOldPass) {
      return NextResponse.json(
        { error: 'Current (old) password is incorrect. Please try again.' },
        { status: 400 }
      );
    }

    // Update password in userlogdatas
    await userlogCollection.updateOne(
      { _id: userlog._id },
      {
        $set: {
          password: cleanNewPass,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully! You can use your new password next time you sign in.',
    });
  } catch (err: any) {
    console.error('Change password error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to change password.' },
      { status: 500 }
    );
  }
}
