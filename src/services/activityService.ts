import { getMongoDb } from './db';
import { Activity } from '../types';
import { generateActivityId } from '../utils/id';

const parseActivityMark = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export async function getActivities(): Promise<Activity[]> {
  const mongoDb = await getMongoDb();
  return await mongoDb.collection<Activity>('activities')
    .find({}, { projection: { _id: 0 } })
    .sort({ date: -1 })
    .toArray();
}

export async function createActivity(data: Activity): Promise<Activity> {
  const { aid, studentSid, date, status, subjectTuitioned, hwMarks, cwMarks, comment } = data;
  if (!studentSid || !date || !status) {
    throw new Error('studentSid, date, and status are required');
  }

  const generatedAid = aid || generateActivityId();
  const isAbsent = status === 'Absent';
  const newActivity: Activity = {
    aid: generatedAid,
    studentSid,
    date,
    status,
    subjectTuitioned: isAbsent ? 'N/A' : (subjectTuitioned || ''),
    hwMarks: isAbsent ? 0 : (parseActivityMark(hwMarks) ?? undefined),
    cwMarks: isAbsent ? 0 : (parseActivityMark(cwMarks) ?? undefined),
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  const mongoDb = await getMongoDb();
  await mongoDb.collection('activities').insertOne(newActivity);
  return newActivity;
}

export async function updateActivity(aid: string, data: Partial<Activity> & Record<string, any>): Promise<Activity> {
  const date = data.date;
  const status = data.status;
  const subjectTuitioned = data.subjectTuitioned ?? data.subject_tuitioned;
  const rawHw = data.hwMarks !== undefined ? data.hwMarks : data.hw_marks;
  const rawCw = data.cwMarks !== undefined ? data.cwMarks : data.cw_marks;
  const comment = data.comment;

  if (!date || !status) {
    throw new Error('date and status are required');
  }

  const isAbsent = status === 'Absent';
  const updateFields: any = {
    date,
    status,
    subjectTuitioned: isAbsent ? 'N/A' : (subjectTuitioned || ''),
    hwMarks: isAbsent ? 0 : parseActivityMark(rawHw),
    cwMarks: isAbsent ? 0 : parseActivityMark(rawCw),
    comment: comment || ''
  };

  const mongoDb = await getMongoDb();
  const result = await mongoDb.collection<Activity>('activities').findOneAndUpdate(
    { aid },
    { $set: updateFields },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  if (!result) {
    throw new Error(`Activity with AID ${aid} not found`);
  }
  return result as Activity;
}

export async function deleteActivity(aid: string): Promise<boolean> {
  const mongoDb = await getMongoDb();
  await mongoDb.collection('activities').deleteOne({ aid });
  return true;
}
