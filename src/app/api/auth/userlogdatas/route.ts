import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '../../../../services/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getMongoDb();
    // Smart DB Migration: Standardize isApproved values in database to [yes, no, pending]
    try {
      await db.collection('userlogdatas').updateMany(
        { isApproved: 'disapproved' },
        { $set: { isApproved: 'no' } }
      );
      await db.collection('userlogdatas').updateMany(
        {
          userType: 'student',
          $or: [
            { isApproved: { $exists: false } },
            { isApproved: null },
            { isApproved: '' },
          ],
        },
        { $set: { isApproved: 'pending' } }
      );
    } catch (e) {
      // Ignore migration errors if collection is empty
    }

    const userlogs = await db.collection('userlogdatas').find({}).toArray();
    const students = await db.collection('students').find({}).toArray();

    // Map student data by SID and email
    const studentBySid = new Map<string, any>();
    const studentByEmail = new Map<string, any>();
    
    let maxSidNum = 100;

    students.forEach((s) => {
      if (s.sid) {
        studentBySid.set(String(s.sid).toUpperCase(), s);
        const match = String(s.sid).match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxSidNum) maxSidNum = num;
        }
      }
      if (s.email) {
        studentByEmail.set(String(s.email).toLowerCase(), s);
      }
    });

    userlogs.forEach((u) => {
      if (u.sid) {
        const match = String(u.sid).match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxSidNum) maxSidNum = num;
        }
      }
    });

    const list = userlogs.map((ul) => {
      const emailKey = String(ul.email || '').toLowerCase();
      const sidKey = String(ul.sid || '').toUpperCase();

      const st = (sidKey && studentBySid.get(sidKey)) || (emailKey && studentByEmail.get(emailKey));

      return {
        _id: ul._id ? String(ul._id) : undefined,
        sid: ul.sid || st?.sid || '',
        email: ul.email,
        password: ul.password,
        isApproved: ul.isApproved === 'disapproved' ? 'no' : (ul.isApproved || (ul.userType === 'admin' ? 'yes' : 'pending')),
        userType: ul.userType || 'student',
        name: ul.name || st?.name || 'N/A',
        college: ul.college || st?.college || '',
        hscBatch: ul.hscBatch || st?.hscBatch || '',
        subject: ul.subject || st?.subject || '',
        group: ul.group || st?.group || '',
        mobile: ul.mobile || st?.mobile || ul.phone || '',
        guardiansPhone: ul.guardiansPhone || st?.guardiansPhone || '',
        address: ul.address || st?.address || '',
        createdAt: ul.createdAt || '',
      };
    });

    const suggestedNextSid = `S${maxSidNum + 1}`;

    return NextResponse.json({
      users: list,
      suggestedNextSid,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      sid,
      isApproved,
      userType,
      password,
      name,
      college,
      hscBatch,
      subject,
      group,
      mobile,
      guardiansPhone,
      address,
    } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanSid = sid !== undefined ? String(sid).trim().toUpperCase() : undefined;

    const db = await getMongoDb();
    const userlogCollection = db.collection('userlogdatas');
    const studentsCollection = db.collection('students');

    // 1. Find target user record
    const targetUser = await userlogCollection.findOne({ email: cleanEmail });
    if (!targetUser) {
      return NextResponse.json({ error: 'User record not found in database.' }, { status: 404 });
    }

    const finalUserType = userType || targetUser.userType || 'student';
    const finalIsApproved = isApproved !== undefined ? (isApproved === 'disapproved' ? 'no' : isApproved) : (targetUser.isApproved || 'pending');
    const finalSid = cleanSid !== undefined ? cleanSid : targetUser.sid || '';

    // 2. Validate Approval Constraint: Admin MUST assign an SID when approving a student
    if (finalIsApproved === 'yes' && finalUserType === 'student' && !finalSid) {
      return NextResponse.json(
        { error: 'An SID must be assigned by Admin to approve a student account.' },
        { status: 400 }
      );
    }

    // 3. Validate SID Uniqueness if SID is provided
    if (finalSid) {
      // Check in userlogdatas (excluding current user)
      const existingUserWithSid = await userlogCollection.findOne({
        email: { $ne: cleanEmail },
        sid: finalSid,
      });

      // Check in students (excluding current user's email)
      const existingStudentWithSid = await studentsCollection.findOne({
        email: { $ne: cleanEmail },
        sid: finalSid,
      });

      if (existingUserWithSid || existingStudentWithSid) {
        const takenByName = existingUserWithSid?.name || existingStudentWithSid?.name || 'another student';
        return NextResponse.json(
          { error: `SID '${finalSid}' is already assigned to ${takenByName}. Please enter a unique SID.` },
          { status: 400 }
        );
      }
    }

    // 4. Update userlogdatas
    const updateFields: any = { updatedAt: new Date().toISOString() };
    if (cleanSid !== undefined) updateFields.sid = cleanSid;
    if (isApproved !== undefined) updateFields.isApproved = isApproved;
    if (userType !== undefined) updateFields.userType = userType;
    if (password !== undefined) updateFields.password = password;
    if (name !== undefined) updateFields.name = String(name).trim();
    if (college !== undefined) updateFields.college = String(college).trim();
    if (hscBatch !== undefined) updateFields.hscBatch = String(hscBatch).trim();
    if (subject !== undefined) updateFields.subject = String(subject).trim();
    if (group !== undefined) updateFields.group = String(group).trim();
    if (mobile !== undefined) updateFields.mobile = String(mobile).trim();
    if (guardiansPhone !== undefined) updateFields.guardiansPhone = String(guardiansPhone).trim();
    if (address !== undefined) updateFields.address = String(address).trim();

    await userlogCollection.updateOne({ email: cleanEmail }, { $set: updateFields });

    // 5. If approved as a student, create/update student record in 'students' collection
    if (finalIsApproved === 'yes' && finalUserType === 'student' && finalSid) {
      const studentDoc = {
        sid: finalSid,
        name: updateFields.name || targetUser.name || 'Student',
        college: updateFields.college !== undefined ? updateFields.college : targetUser.college || '',
        hscBatch: updateFields.hscBatch !== undefined ? updateFields.hscBatch : targetUser.hscBatch || '',
        subject: updateFields.subject !== undefined ? updateFields.subject : targetUser.subject || '',
        group: updateFields.group !== undefined ? updateFields.group : targetUser.group || '',
        mobile: updateFields.mobile !== undefined ? updateFields.mobile : targetUser.mobile || targetUser.phone || '',
        guardiansPhone: updateFields.guardiansPhone !== undefined ? updateFields.guardiansPhone : targetUser.guardiansPhone || '',
        address: updateFields.address !== undefined ? updateFields.address : targetUser.address || '',
        email: cleanEmail,
        updatedAt: new Date().toISOString(),
      };

      await studentsCollection.updateOne(
        { $or: [{ sid: finalSid }, { email: cleanEmail }] },
        {
          $set: studentDoc,
          $setOnInsert: { createdAt: new Date().toISOString() },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User record updated successfully. (SID: ${finalSid || 'N/A'}, Approved: ${finalIsApproved})`,
      sid: finalSid,
      isApproved: finalIsApproved,
      userType: finalUserType,
    });
  } catch (err: any) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const db = await getMongoDb();
    const userDoc = await db.collection('userlogdatas').findOne({ email: cleanEmail });
    const studentDoc = await db.collection('students').findOne({ email: cleanEmail });

    const targetSid = userDoc?.sid || studentDoc?.sid;

    if (targetSid) {
      const cleanSid = String(targetSid).trim();
      const upperSid = cleanSid.toUpperCase();
      await db.collection('activities').deleteMany({ $or: [{ studentSid: cleanSid }, { studentSid: upperSid }] });
      await db.collection('exams').deleteMany({ $or: [{ studentSid: cleanSid }, { studentSid: upperSid }] });
      await db.collection('payments').deleteMany({ $or: [{ studentSid: cleanSid }, { studentSid: upperSid }] });
      await db.collection('students').deleteOne({ $or: [{ sid: cleanSid }, { sid: upperSid }, { email: cleanEmail }] });
    } else {
      await db.collection('students').deleteOne({ email: cleanEmail });
    }

    await db.collection('userlogdatas').deleteOne({ email: cleanEmail });

    return NextResponse.json({ success: true, message: 'User account and student records deleted.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
