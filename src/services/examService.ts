import { getMongoDb } from './db';
import { generateExamId } from '../utils/id';
import { Exam } from '../types';

export async function getExams(): Promise<Exam[]> {
  const mongoDb = await getMongoDb();
  return await mongoDb.collection<Exam>('exams')
    .find({}, { projection: { _id: 0 } })
    .sort({ date: -1 })
    .toArray();
}

export async function createExam(data: Exam): Promise<Exam> {
  const { eid, studentSid, date, subjectAndTopic, status, totalMarks, obtainedMarks, remarks, comment } = data;
  if (!studentSid || !date || !subjectAndTopic || !status || totalMarks === undefined) {
    throw new Error('studentSid, date, subjectAndTopic, status, and totalMarks are required');
  }

  const generatedEid = eid || generateExamId();
  const isAbsent = status === 'Absent';
  const newExam: Exam = {
    eid: generatedEid,
    studentSid,
    date,
    subjectAndTopic,
    status,
    totalMarks: parseInt(totalMarks as any),
    obtainedMarks: isAbsent ? 0 : (obtainedMarks !== undefined && obtainedMarks !== null ? parseInt(obtainedMarks as any) : undefined),
    remarks: remarks || '',
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  const mongoDb = await getMongoDb();
  await mongoDb.collection('exams').insertOne(newExam);
  return newExam;
}

export async function updateExam(eid: string, data: Partial<Exam>): Promise<Exam> {
  const { date, subjectAndTopic, status, totalMarks, obtainedMarks, remarks, comment } = data;
  if (!date || !subjectAndTopic || !status || totalMarks === undefined) {
    throw new Error('date, subjectAndTopic, status, and totalMarks are required');
  }

  const isAbsent = status === 'Absent';
  const updateFields: any = {
    date,
    subjectAndTopic,
    status,
    totalMarks: parseInt(totalMarks as any),
    obtainedMarks: isAbsent ? 0 : (obtainedMarks !== undefined && obtainedMarks !== null ? parseInt(obtainedMarks as any) : undefined),
    remarks: remarks || '',
    comment: comment || ''
  };

  const mongoDb = await getMongoDb();
  const result = await mongoDb.collection<Exam>('exams').findOneAndUpdate(
    { eid },
    { $set: updateFields },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  if (!result) {
    throw new Error('Exam not found');
  }
  return result as Exam;
}

export async function deleteExam(eid: string): Promise<boolean> {
  const mongoDb = await getMongoDb();
  await mongoDb.collection('exams').deleteOne({ eid });
  return true;
}
