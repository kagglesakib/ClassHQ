import { getMongoDb } from './db';

export async function generateBackup(): Promise<any> {
  const mongoDb = await getMongoDb();

  const allStudents = await mongoDb.collection('students').find({}, { projection: { _id: 0 } }).toArray();
  const allActivities = await mongoDb.collection('activities').find({}, { projection: { _id: 0 } }).toArray();
  const allExams = await mongoDb.collection('exams').find({}, { projection: { _id: 0 } }).toArray();
  const allPayments = await mongoDb.collection('payments').find({}, { projection: { _id: 0 } }).toArray();

  return {
    students: allStudents,
    activities: allActivities,
    exams: allExams,
    payments: allPayments,
    exportedAt: new Date().toISOString(),
    version: 'TutorHQ-JSON-1.0'
  };
}

export async function restoreBackup(payload: any): Promise<string> {
  const { students: restoreStudents, activities: restoreActivities, exams: restoreExams, payments: restorePayments } = payload;

  if (!Array.isArray(restoreStudents)) {
    throw new Error('Invalid backup structure. The "students" array is mandatory.');
  }

  const mappedStudents = restoreStudents.map((s: any) => ({
    sid: s.sid || s.student_sid,
    name: s.name,
    college: s.college || null,
    hscBatch: s.hscBatch || s.hsc_batch || null,
    subject: s.subject || null,
    group: s.group || s.student_group || null,
    mobile: s.mobile || null,
    guardiansPhone: s.guardiansPhone || s.guardians_phone || null,
    address: s.address || null,
    createdAt: s.createdAt || s.created_at || new Date().toISOString(),
  }));

  const mappedActivities = Array.isArray(restoreActivities) ? restoreActivities.map((a: any) => ({
    aid: a.aid || a.id,
    studentSid: a.studentSid || a.student_sid,
    date: a.date,
    status: a.status,
    subjectTuitioned: a.subjectTuitioned || a.subject_tuitioned || a.subject_topic || 'N/A',
    hwMarks: a.hwMarks !== undefined ? a.hwMarks : (a.hw_marks !== undefined ? a.hw_marks : (a.homework_completed_percent !== undefined ? a.homework_completed_percent : null)),
    cwMarks: a.cwMarks !== undefined ? a.cwMarks : (a.cw_marks !== undefined ? a.cw_marks : (a.marks !== undefined ? a.marks : null)),
    comment: a.comment || null,
    createdAt: a.createdAt || a.created_at || new Date().toISOString()
  })) : [];

  const mappedExams = Array.isArray(restoreExams) ? restoreExams.map((e: any) => ({
    eid: e.eid || e.id,
    studentSid: e.studentSid || e.student_sid,
    date: e.date,
    subjectAndTopic: e.subjectAndTopic || e.subject_and_topic || 'N/A',
    status: e.status,
    totalMarks: e.totalMarks !== undefined ? e.totalMarks : (e.total_marks !== undefined ? e.total_marks : 100),
    obtainedMarks: e.obtainedMarks !== undefined ? e.obtainedMarks : (e.obtained_marks !== undefined ? e.obtained_marks : null),
    remarks: e.remarks || null,
    comment: e.comment || null,
    createdAt: e.createdAt || e.created_at || new Date().toISOString()
  })) : [];

  const mappedPayments = Array.isArray(restorePayments) ? restorePayments.map((p: any) => ({
    pid: p.pid || p.id,
    studentSid: p.studentSid || p.student_sid,
    date: p.date,
    amount: p.amount,
    paymentMonth: p.paymentMonth || p.payment_month,
    comment: p.comment || null,
    createdAt: p.createdAt || p.created_at || new Date().toISOString()
  })) : [];

  const mongoDb = await getMongoDb();
  await mongoDb.collection('students').deleteMany({});
  await mongoDb.collection('activities').deleteMany({});
  await mongoDb.collection('exams').deleteMany({});
  await mongoDb.collection('payments').deleteMany({});

  if (mappedStudents.length > 0) await mongoDb.collection('students').insertMany(mappedStudents);
  if (mappedActivities.length > 0) await mongoDb.collection('activities').insertMany(mappedActivities);
  if (mappedExams.length > 0) await mongoDb.collection('exams').insertMany(mappedExams);
  if (mappedPayments.length > 0) await mongoDb.collection('payments').insertMany(mappedPayments);

  return 'MongoDB database restored from JSON backup file.';
}
