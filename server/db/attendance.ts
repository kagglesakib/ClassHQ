import { AttendanceRecord } from '../../src/types';
import { memoryAttendance, isMongoConnected } from './connection';
import { AttendanceModel } from './models';
import { getAllUsers } from './users';
import { formatAttendanceDoc, compareBatch, compareSection } from './helpers';

export async function getAttendanceByStudent(identifier: string, email?: string): Promise<AttendanceRecord[]> {
  const users = await getAllUsers();
  const targetUser = users.find(
    (u) =>
      u.id === identifier ||
      (email && u.email.toLowerCase() === email.trim().toLowerCase()) ||
      (u.rollNumber && u.rollNumber.toUpperCase() === identifier.toUpperCase())
  );
  const targetEmail = targetUser?.email.toLowerCase() || (email ? email.trim().toLowerCase() : '');

  if (isMongoConnected && targetEmail) {
    try {
      const docs = await (AttendanceModel as any)
        .find({ email: { $regex: new RegExp(`^${targetEmail}$`, 'i') } })
        .sort({ date: -1 })
        .lean();
      if (docs && docs.length > 0) {
        return docs.map((doc: any) => formatAttendanceDoc(doc, targetUser));
      }
    } catch {
      // fallback
    }
  }

  return memoryAttendance
    .filter(
      (a) =>
        (targetEmail && a.email.toLowerCase() === targetEmail) ||
        a.studentId === identifier
    )
    .map((a) => formatAttendanceDoc(a, targetUser))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAttendanceBySectionAndDate(
  batch: string,
  section: string,
  date: string
): Promise<AttendanceRecord[]> {
  const allUsers = await getAllUsers();
  const sectionUsers = allUsers.filter(
    (u) =>
      compareBatch(u.batch || u.assignedBatch, batch) &&
      compareSection(u.section || u.assignedSection, section)
  );
  const userMap = new Map(sectionUsers.map((u) => [u.email.toLowerCase(), u]));
  const sectionEmails = sectionUsers.map((u) => u.email.toLowerCase());

  if (isMongoConnected && sectionEmails.length > 0) {
    try {
      const docs = await (AttendanceModel as any)
        .find({
          email: { $in: sectionEmails.map((e) => new RegExp(`^${e}$`, 'i')) },
          date,
        })
        .lean();
      if (docs && docs.length > 0) {
        return docs.map((doc: any) => {
          const user = userMap.get((doc.email || '').toLowerCase());
          return formatAttendanceDoc(doc, user);
        });
      }
    } catch {
      // fallback
    }
  }

  return memoryAttendance
    .filter((a) => {
      const user = userMap.get(a.email.toLowerCase());
      return user && a.date === date;
    })
    .map((a) => {
      const user = userMap.get(a.email.toLowerCase());
      return formatAttendanceDoc(a, user);
    });
}

export async function getAllAttendance(): Promise<AttendanceRecord[]> {
  const allUsers = await getAllUsers();
  const userMap = new Map(allUsers.map((u) => [u.email.toLowerCase(), u]));

  if (isMongoConnected) {
    try {
      const docs = await (AttendanceModel as any).find().sort({ date: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((doc: any) => {
          const user = userMap.get((doc.email || '').toLowerCase());
          return formatAttendanceDoc(doc, user);
        });
      }
    } catch {
      // fallback
    }
  }

  return memoryAttendance
    .map((a) => {
      const user = userMap.get(a.email.toLowerCase());
      return formatAttendanceDoc(a, user);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveOrUpdateAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
  const allUsers = await getAllUsers();
  const userMap = new Map(allUsers.map((u) => [u.email.toLowerCase(), u]));

  for (const record of records) {
    const email = (record.email || '').trim().toLowerCase();
    if (!email) continue;

    const user = userMap.get(email);
    const formatted = formatAttendanceDoc(record, user);

    // Save in in-memory store
    const existingIndex = memoryAttendance.findIndex(
      (a) => a.email.toLowerCase() === email && a.date === formatted.date
    );
    if (existingIndex >= 0) {
      memoryAttendance[existingIndex] = formatted;
    } else {
      memoryAttendance.unshift(formatted);
    }

    // Save only normalized non-redundant payload in MongoDB
    if (isMongoConnected) {
      try {
        const normalizedPayload = {
          email,
          date: formatted.date,
          status: formatted.status,
          studentsNote: formatted.studentsNote || '',
          captainsNote: formatted.captainsNote || formatted.remarks || '',
          markedBy: formatted.markedBy,
          timestamp: formatted.timestamp || new Date().toISOString(),
        };

        await (AttendanceModel as any).findOneAndUpdate(
          { email: { $regex: new RegExp(`^${email}$`, 'i') }, date: formatted.date },
          normalizedPayload,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error('[DB] Mongo attendance upsert error:', err);
      }
    }
  }
}
