import { getMongoDb } from './db';
import { Student } from '../types';

export async function getStudents(): Promise<Student[]> {
  const mongoDb = await getMongoDb();
  const students = await mongoDb.collection<Student>('students').find({}, { projection: { _id: 0 } }).toArray();
  const userlogs = await mongoDb.collection('userlogdatas').find({}, { projection: { _id: 0 } }).toArray();

  const userlogMapBySid = new Map<string, any>();
  const userlogMapByEmail = new Map<string, any>();

  userlogs.forEach((u) => {
    if (u.sid) {
      userlogMapBySid.set(String(u.sid).trim().toUpperCase(), u);
    }
    if (u.email) {
      userlogMapByEmail.set(String(u.email).trim().toLowerCase(), u);
    }
  });

  // Enrich students with email & contact info from userlogdatas if missing
  const enrichedStudents: Student[] = students.map((s) => {
    const sSid = String(s.sid || '').trim().toUpperCase();
    const sEmail = String(s.email || '').trim().toLowerCase();
    const matchedLog = userlogMapBySid.get(sSid) || userlogMapByEmail.get(sEmail);

    return {
      ...s,
      email: s.email || matchedLog?.email || '',
      mobile: s.mobile || matchedLog?.mobile || matchedLog?.phone || '',
      college: s.college || matchedLog?.college || '',
      address: s.address || matchedLog?.address || '',
    };
  });

  // Include approved student accounts from userlogdatas if not present in students collection
  userlogs.forEach((u) => {
    if (u.sid && u.userType === 'student') {
      const uSid = String(u.sid).trim().toUpperCase();
      const exists = enrichedStudents.some((es) => String(es.sid).trim().toUpperCase() === uSid);
      if (!exists) {
        enrichedStudents.push({
          sid: u.sid,
          name: u.name || 'Student',
          email: u.email || '',
          mobile: u.mobile || u.phone || '',
          college: u.college || '',
          hscBatch: u.hscBatch || '',
          subject: u.subject || '',
          group: u.group || '',
          guardiansPhone: u.guardiansPhone || '',
          address: u.address || '',
          createdAt: u.createdAt || new Date().toISOString(),
        });
      }
    }
  });

  return enrichedStudents;
}

export async function createStudent(data: Student): Promise<Student> {
  const { sid, name, college, hscBatch, subject, group, mobile, guardiansPhone, address, email } = data;
  if (!sid || !name) {
    throw new Error('Student SID and Name are required');
  }

  const mongoDb = await getMongoDb();
  const cleanSid = String(sid).trim();
  const upperSid = cleanSid.toUpperCase();

  const existing = await mongoDb.collection('students').findOne({
    $or: [{ sid: cleanSid }, { sid: upperSid }]
  });
  if (existing) {
    throw new Error(`Student profile with SID ${sid} already exists.`);
  }

  const newStudent: Student = {
    sid: cleanSid,
    name,
    college: college || '',
    hscBatch: hscBatch || '',
    subject: subject || '',
    group: group || '',
    mobile: mobile || '',
    guardiansPhone: guardiansPhone || '',
    address: address || '',
    email: email ? String(email).trim().toLowerCase() : '',
    createdAt: new Date().toISOString(),
  };

  await mongoDb.collection('students').insertOne(newStudent);

  // Sync to userlogdatas if matching user exists
  if (newStudent.email || cleanSid) {
    const userlogQuery: any[] = [{ sid: cleanSid }, { sid: upperSid }];
    if (newStudent.email) userlogQuery.push({ email: newStudent.email });

    await mongoDb.collection('userlogdatas').updateMany(
      { $or: userlogQuery },
      {
        $set: {
          sid: cleanSid,
          college: newStudent.college,
          mobile: newStudent.mobile,
          address: newStudent.address,
        }
      }
    );
  }

  return newStudent;
}

export async function updateStudent(sid: string, data: Partial<Student>): Promise<Student> {
  const { name, college, hscBatch, subject, group, mobile, guardiansPhone, address, email } = data;
  const mongoDb = await getMongoDb();
  const cleanSid = String(sid).trim();
  const upperSid = cleanSid.toUpperCase();

  const updateFields: any = {};
  if (name !== undefined) updateFields.name = name;
  if (college !== undefined) updateFields.college = college || '';
  if (hscBatch !== undefined) updateFields.hscBatch = hscBatch || '';
  if (subject !== undefined) updateFields.subject = subject || '';
  if (group !== undefined) updateFields.group = group || '';
  if (mobile !== undefined) updateFields.mobile = mobile || '';
  if (guardiansPhone !== undefined) updateFields.guardiansPhone = guardiansPhone || '';
  if (address !== undefined) updateFields.address = address || '';
  if (email !== undefined) updateFields.email = email ? String(email).trim().toLowerCase() : '';

  let result = await mongoDb.collection<Student>('students').findOneAndUpdate(
    { $or: [{ sid: cleanSid }, { sid: upperSid }] },
    { $set: updateFields },
    { returnDocument: 'after', projection: { _id: 0 } }
  );

  // Sync update to userlogdatas collection
  const userlogUpdate: any = {};
  if (email !== undefined && email) userlogUpdate.email = String(email).trim().toLowerCase();
  if (mobile !== undefined) userlogUpdate.mobile = mobile;
  if (college !== undefined) userlogUpdate.college = college;
  if (address !== undefined) userlogUpdate.address = address;
  if (name !== undefined) userlogUpdate.name = name;

  if (Object.keys(userlogUpdate).length > 0) {
    const userlogCriteria: any[] = [{ sid: cleanSid }, { sid: upperSid }];
    if (updateFields.email) userlogCriteria.push({ email: updateFields.email });

    await mongoDb.collection('userlogdatas').updateMany(
      { $or: userlogCriteria },
      { $set: userlogUpdate }
    );
  }

  if (!result) {
    // Upsert into students collection if not created previously
    const newStudent: Student = {
      sid: cleanSid,
      name: name || 'Student',
      college: college || '',
      hscBatch: hscBatch || '',
      subject: subject || '',
      group: group || '',
      mobile: mobile || '',
      guardiansPhone: guardiansPhone || '',
      address: address || '',
      email: email ? String(email).trim().toLowerCase() : '',
      createdAt: new Date().toISOString(),
    };
    await mongoDb.collection('students').insertOne(newStudent);
    return newStudent;
  }

  return result as Student;
}

export async function deleteStudent(sid: string): Promise<boolean> {
  const mongoDb = await getMongoDb();
  const cleanSid = String(sid).trim();
  const upperSid = cleanSid.toUpperCase();

  // Find student doc to get email if available
  const studentDoc = await mongoDb.collection('students').findOne({
    $or: [{ sid: cleanSid }, { sid: upperSid }]
  });

  const studentEmail = studentDoc?.email ? String(studentDoc.email).trim().toLowerCase() : null;

  // Delete all related activity, exam, and payment records
  await mongoDb.collection('activities').deleteMany({
    $or: [{ studentSid: cleanSid }, { studentSid: upperSid }]
  });
  await mongoDb.collection('exams').deleteMany({
    $or: [{ studentSid: cleanSid }, { studentSid: upperSid }]
  });
  await mongoDb.collection('payments').deleteMany({
    $or: [{ studentSid: cleanSid }, { studentSid: upperSid }]
  });

  // Delete account from userlogdatas
  if (studentEmail) {
    await mongoDb.collection('userlogdatas').deleteOne({ email: studentEmail });
  }
  await mongoDb.collection('userlogdatas').deleteMany({
    $or: [{ sid: cleanSid }, { sid: upperSid }]
  });

  // Delete student profile from students
  await mongoDb.collection('students').deleteOne({
    $or: [{ sid: cleanSid }, { sid: upperSid }]
  });

  return true;
}
