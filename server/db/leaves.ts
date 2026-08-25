import { LeaveRequest, LeaveStatus, LeaveType, UserRole } from '../../src/types';
import { memoryAttendance, isMongoConnected } from './connection';
import { AttendanceModel } from './models';
import { getAllUsers } from './users';
import { formatLeaveDoc, compareBatch, compareSection } from './helpers';

export async function getAllLeaveRequests(): Promise<LeaveRequest[]> {
  const allUsers = await getAllUsers();
  const userMap = new Map(allUsers.map((u) => [u.email.toLowerCase(), u]));

  if (isMongoConnected) {
    try {
      const docs = await (AttendanceModel as any)
        .find({
          $or: [
            { status: 'leave' },
            { leaveStatus: { $in: ['Pending', 'Approved', 'Rejected'] } },
          ],
        })
        .sort({ date: -1 })
        .lean();
      if (docs && docs.length > 0) {
        return docs.map((doc: any) => {
          const email = (doc.email || '').toLowerCase();
          const user = userMap.get(email);
          return formatLeaveDoc(doc, user);
        });
      }
    } catch {
      // fallback
    }
  }

  return memoryAttendance
    .filter((a) => a.status === 'leave' || (a.leaveStatus && a.leaveStatus !== 'None'))
    .map((l) => {
      const email = (l.email || l.studentEmail || '').toLowerCase();
      const user = userMap.get(email);
      return formatLeaveDoc(l, user);
    })
    .sort((a, b) => new Date(b.startDate || b.submittedAt || 0).getTime() - new Date(a.startDate || a.submittedAt || 0).getTime());
}

export async function getLeavesByStudent(identifier: string, email?: string): Promise<LeaveRequest[]> {
  const allUsers = await getAllUsers();
  const targetUser = allUsers.find(
    (u) =>
      u.id === identifier ||
      (email && u.email.toLowerCase() === email.trim().toLowerCase()) ||
      (u.rollNumber && u.rollNumber.toUpperCase() === identifier.toUpperCase())
  );
  const targetEmail = targetUser?.email.toLowerCase() || (email ? email.trim().toLowerCase() : '');

  if (isMongoConnected && targetEmail) {
    try {
      const docs = await (AttendanceModel as any)
        .find({
          email: { $regex: new RegExp(`^${targetEmail}$`, 'i') },
          $or: [
            { status: 'leave' },
            { leaveStatus: { $in: ['Pending', 'Approved', 'Rejected'] } },
          ],
        })
        .sort({ date: -1 })
        .lean();
      if (docs && docs.length > 0) {
        return docs.map((doc: any) => formatLeaveDoc(doc, targetUser));
      }
    } catch {
      // fallback
    }
  }

  return memoryAttendance
    .filter(
      (l) =>
        ((targetEmail && (l.email || l.studentEmail)?.toLowerCase() === targetEmail) ||
          l.studentId === identifier) &&
        (l.status === 'leave' || (l.leaveStatus && l.leaveStatus !== 'None'))
    )
    .map((l) => formatLeaveDoc(l, targetUser))
    .sort((a, b) => new Date(b.startDate || b.submittedAt || 0).getTime() - new Date(a.startDate || a.submittedAt || 0).getTime());
}

export async function getLeavesBySection(batch: string, section: string): Promise<LeaveRequest[]> {
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
          $or: [
            { status: 'leave' },
            { leaveStatus: { $in: ['Pending', 'Approved', 'Rejected'] } },
          ],
        })
        .sort({ date: -1 })
        .lean();
      if (docs && docs.length > 0) {
        return docs.map((doc: any) => {
          const email = (doc.email || '').toLowerCase();
          const user = userMap.get(email);
          return formatLeaveDoc(doc, user);
        });
      }
    } catch {
      // fallback
    }
  }

  return memoryAttendance
    .filter((l) => {
      const email = (l.email || l.studentEmail || '').toLowerCase();
      return (
        userMap.has(email) &&
        (l.status === 'leave' || (l.leaveStatus && l.leaveStatus !== 'None'))
      );
    })
    .map((l) => {
      const email = (l.email || l.studentEmail || '').toLowerCase();
      const user = userMap.get(email);
      return formatLeaveDoc(l, user);
    })
    .sort((a, b) => new Date(b.startDate || b.submittedAt || 0).getTime() - new Date(a.startDate || a.submittedAt || 0).getTime());
}

export async function createLeaveRequest(leave: LeaveRequest): Promise<LeaveRequest> {
  const allUsers = await getAllUsers();
  const email = (leave.studentEmail || (leave as any).email || '').trim().toLowerCase();
  const user = allUsers.find((u) => u.email.toLowerCase() === email || u.id === leave.studentId);
  const targetEmail = user?.email.toLowerCase() || email;
  const leaveDate = leave.startDate || (leave as any).leaveDate || new Date().toISOString().split('T')[0];

  const now = new Date().toISOString();
  const record = {
    id: `leave-${targetEmail}-${leaveDate}`,
    email: targetEmail,
    date: leaveDate,
    status: 'absent' as const,
    studentsNote: leave.reason || '',
    captainsNote: '',
    leaveType: leave.leaveType || 'General',
    leaveReason: leave.reason || '',
    leaveStatus: 'Pending' as const,
    submittedAt: now,
    timestamp: now,
  };

  const existingIdx = memoryAttendance.findIndex(
    (a) => a.email.toLowerCase() === targetEmail && a.date === leaveDate
  );
  if (existingIdx >= 0) {
    memoryAttendance[existingIdx] = { ...memoryAttendance[existingIdx], ...record };
  } else {
    memoryAttendance.unshift(record);
  }

  if (isMongoConnected) {
    try {
      await (AttendanceModel as any).findOneAndUpdate(
        { email: { $regex: new RegExp(`^${targetEmail}$`, 'i') }, date: leaveDate },
        record,
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('[DB] Failed to insert unified single-day leave in Mongo:', err);
    }
  }

  return formatLeaveDoc(record, user);
}

export async function updateLeaveRequestStatus(
  id: string,
  status: LeaveStatus,
  reviewedBy: { id: string; name: string; role: UserRole },
  reviewNote?: string
): Promise<LeaveRequest | null> {
  const allUsers = await getAllUsers();
  const userMap = new Map(allUsers.map((u) => [u.email.toLowerCase(), u]));

  const now = new Date().toISOString();
  let matchedRecord: any = null;

  for (let i = 0; i < memoryAttendance.length; i++) {
    const item = memoryAttendance[i];
    const matchId = item.id === id || `leave-${item.email}-${item.date}` === id;
    if (matchId) {
      item.leaveStatus = status;
      if (status === 'Approved') {
        item.status = 'leave';
      } else if (status === 'Rejected') {
        item.status = 'absent';
      }
      item.reviewedBy = reviewedBy;
      item.reviewNote = reviewNote || '';
      item.reviewedAt = now;
      matchedRecord = item;
      break;
    }
  }

  if (isMongoConnected) {
    try {
      const updateData: any = {
        leaveStatus: status,
        reviewedBy,
        reviewNote: reviewNote || '',
        reviewedAt: now,
      };
      if (status === 'Approved') {
        updateData.status = 'leave';
      } else if (status === 'Rejected') {
        updateData.status = 'absent';
      }

      const updated = await (AttendanceModel as any).findOneAndUpdate(
        {
          $or: [
            { id },
            {
              $expr: {
                $eq: [
                  { $concat: ['leave-', '$email', '-', '$date'] },
                  id,
                ],
              },
            },
          ],
        },
        updateData,
        { new: true }
      );
      if (updated) matchedRecord = updated;
    } catch (err) {
      console.error('[DB] Failed to update unified leave status in Mongo:', err);
    }
  }

  if (matchedRecord) {
    const user = userMap.get((matchedRecord.email || '').toLowerCase());
    return formatLeaveDoc(matchedRecord, user);
  }
  return null;
}

export async function updateStudentLeaveRequest(
  id: string,
  updates: { leaveType?: LeaveType; date?: string; reason?: string },
  studentUser: { id: string; email: string; rollNumber?: string }
): Promise<LeaveRequest | null> {
  const allUsers = await getAllUsers();
  const userMap = new Map(allUsers.map((u) => [u.email.toLowerCase(), u]));
  const user = allUsers.find(
    (u) =>
      u.id === studentUser.id ||
      (studentUser.email && u.email.toLowerCase() === studentUser.email.toLowerCase()) ||
      (studentUser.rollNumber && u.rollNumber && u.rollNumber.toUpperCase() === studentUser.rollNumber.toUpperCase())
  );
  const targetEmail = user?.email.toLowerCase() || studentUser.email.toLowerCase();

  // Find in memory
  let matchedIdx = -1;
  for (let i = 0; i < memoryAttendance.length; i++) {
    const item = memoryAttendance[i];
    const matchId = item.id === id || `leave-${item.email}-${item.date}` === id;
    if (matchId) {
      const itemEmail = (item.email || item.studentEmail || '').toLowerCase();
      if (itemEmail && targetEmail && itemEmail !== targetEmail && item.studentId !== studentUser.id) {
        return null;
      }
      if (item.leaveStatus && item.leaveStatus !== 'Pending') {
        throw new Error(`Cannot edit leave request with status '${item.leaveStatus}'. Only Pending requests can be edited.`);
      }
      matchedIdx = i;
      break;
    }
  }

  const newDate = updates.date;
  const newReason = updates.reason;
  const newLeaveType = updates.leaveType;
  const now = new Date().toISOString();

  let updatedRecord: any = null;

  if (matchedIdx >= 0) {
    const item = memoryAttendance[matchedIdx];
    const oldDate = item.date;
    if (newReason !== undefined) {
      item.studentsNote = newReason;
      item.leaveReason = newReason;
    }
    if (newLeaveType !== undefined) {
      item.leaveType = newLeaveType;
    }
    if (newDate && newDate !== oldDate) {
      item.date = newDate;
      item.id = `leave-${targetEmail}-${newDate}`;
    }
    item.updatedAt = now;
    item.timestamp = now;
    updatedRecord = item;
  }

  if (isMongoConnected) {
    try {
      const existingDoc = await (AttendanceModel as any).findOne({
        $or: [
          { id },
          {
            $expr: {
              $eq: [{ $concat: ['leave-', '$email', '-', '$date'] }, id],
            },
          },
        ],
      }).lean();

      if (existingDoc) {
        const itemEmail = (existingDoc.email || '').toLowerCase();
        if (itemEmail && targetEmail && itemEmail !== targetEmail) {
          return null;
        }
        if (existingDoc.leaveStatus && existingDoc.leaveStatus !== 'Pending') {
          throw new Error(`Cannot edit leave request with status '${existingDoc.leaveStatus}'. Only Pending requests can be edited.`);
        }

        const updateFields: any = {
          updatedAt: now,
          timestamp: now,
        };
        if (newReason !== undefined) {
          updateFields.studentsNote = newReason;
          updateFields.leaveReason = newReason;
        }
        if (newLeaveType !== undefined) {
          updateFields.leaveType = newLeaveType;
        }
        if (newDate && newDate !== existingDoc.date) {
          updateFields.date = newDate;
          updateFields.id = `leave-${targetEmail}-${newDate}`;
        }

        const resDoc = await (AttendanceModel as any).findByIdAndUpdate(
          existingDoc._id,
          { $set: updateFields },
          { new: true }
        ).lean();

        if (resDoc) updatedRecord = resDoc;
      }
    } catch (err: any) {
      console.error('[DB] Failed to update student leave in Mongo:', err);
      if (err?.message?.includes('Cannot edit')) throw err;
    }
  }

  if (updatedRecord) {
    const foundUser = userMap.get((updatedRecord.email || targetEmail).toLowerCase()) || user;
    return formatLeaveDoc(updatedRecord, foundUser);
  }

  return null;
}

