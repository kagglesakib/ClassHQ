export interface UserLogItem {
  _id?: string;
  sid: string;
  email: string;
  password?: string;
  isApproved: 'yes' | 'no' | 'pending' | string;
  userType: 'admin' | 'student';
  name: string;
  college?: string;
  hscBatch?: string;
  subject?: string;
  group?: string;
  mobile?: string;
  guardiansPhone?: string;
  address?: string;
  createdAt?: string;
}

export interface AuthUser {
  name: string;
  email: string;
  phone?: string;
  sid?: string;
  userType?: 'admin' | 'student';
  isApproved?: 'yes' | 'no' | 'pending' | string;
}

export interface Student {
  sid: string; // Manually entered custom Student ID
  name: string;
  college: string;
  hscBatch: string;
  subject: string;
  group: string;
  mobile: string;
  guardiansPhone?: string;
  address: string;
  email?: string;
  createdAt?: string;
}

export interface Activity {
  aid: string;
  studentSid: string;
  date: string; // format YYYY-MM-DD
  status: string; // "Present" or "Absent"
  subjectTuitioned?: string;
  hwMarks?: number;
  cwMarks?: number;
  comment?: string;
  createdAt?: string;
}

export interface Exam {
  eid: string;
  studentSid: string;
  date: string; // format YYYY-MM-DD
  subjectAndTopic: string;
  status: string; // "Present" or "Absent"
  totalMarks: number;
  obtainedMarks?: number;
  remarks?: string;
  comment?: string;
  createdAt?: string;
}

export interface Payment {
  pid: string;
  studentSid: string;
  date: string; // format YYYY-MM-DD
  amount: number; // in taka
  paymentMonth: string; // format YYYY-MM (e.g., "2026-07")
  comment?: string;
  createdAt?: string;
}
