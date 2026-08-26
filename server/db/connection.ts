import mongoose from 'mongoose';
import { User, AttendanceRecord, LeaveRequest } from '../../src/types.ts';
import { UserModel, AttendanceModel } from './models.ts';

// Default initial accounts for seamless out-of-the-box operation and demo testing
export const initialDefaultUsers: User[] = [
  {
    id: 'usr-admin-01',
    fullName: 'Commander Academic Dean',
    email: 'admin@classhq.edu',
    rollNumber: 'ADMIN-01',
    phoneNumber: '+880 1711-000001',
    gender: 'Male',
    batch: 'HSC 2026',
    group: 'Science',
    section: 'A',
    address: 'Faculty Quarters, BNCC Campus',
    role: 'admin',
    approval: 'approved',
    password: 'admin123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-captain-01',
    fullName: 'Tanvir Hossain (Class Captain)',
    email: 'captain@classhq.edu',
    rollNumber: '260101',
    phoneNumber: '+880 1711-000002',
    gender: 'Male',
    batch: 'HSC 2026',
    group: 'Science',
    section: 'A',
    assignedBatch: 'HSC 2026',
    assignedSection: 'A',
    address: 'Sector 4, Agrabad, Chittagong',
    role: 'captain',
    approval: 'approved',
    password: 'captain123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-student-01',
    fullName: 'Mahmudul Hasan Sakib',
    email: 'student@classhq.edu',
    rollNumber: '260102',
    phoneNumber: '+880 1711-000003',
    gender: 'Male',
    batch: 'HSC 2026',
    group: 'Science',
    section: 'A',
    address: 'Halishahar, Chittagong',
    role: 'student',
    approval: 'approved',
    password: 'student123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-student-02',
    fullName: 'Nusrat Jahan',
    email: 'nusrat@classhq.edu',
    rollNumber: '260103',
    phoneNumber: '+880 1711-000004',
    gender: 'Female',
    batch: 'HSC 2026',
    group: 'Science',
    section: 'A',
    address: 'Nasirabad Housing Society, Chittagong',
    role: 'student',
    approval: 'approved',
    password: 'student123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// In-Memory store initialized for dynamic users & unified attendance records
export const memoryUsers: User[] = [...initialDefaultUsers];
export const memoryAttendance: any[] = [];
export const memoryLeaves: LeaveRequest[] = [];

export let isMongoConnected = false;
export let mongoConnectionError: string | null = null;
export let isConnecting = false;
let mongoConnectPromise: Promise<boolean> | null = null;

export async function initMongoDB(): Promise<boolean> {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri || uri.trim() === '') {
    // No URI provided yet - run in robust in-memory mode
    return false;
  }

  if (isMongoConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  if (mongoConnectPromise) {
    return mongoConnectPromise;
  }

  mongoConnectPromise = (async () => {
    try {
      isConnecting = true;
      console.log('[ClassHQ DB] Connecting to MongoDB...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      });
      isMongoConnected = true;
      mongoConnectionError = null;
      console.log('[ClassHQ DB] Successfully connected to MongoDB cluster.');

      // Seed database if empty and memory has default items
      try {
        const userCount = await UserModel.countDocuments();
        if (userCount === 0 && memoryUsers.length > 0) {
          console.log('[ClassHQ DB] Seeding initial users into MongoDB...');
          await UserModel.insertMany(memoryUsers as any, { ordered: false });
        }
      } catch (seedErr) {
        console.warn('[ClassHQ DB] User seed notice:', seedErr);
      }

      isConnecting = false;
      return true;
    } catch (err: any) {
      isConnecting = false;
      isMongoConnected = false;
      mongoConnectionError = err?.message || 'MongoDB connection error';
      console.warn('[ClassHQ DB] MongoDB connection failed. Falling back to active in-memory store:', mongoConnectionError);
      return false;
    } finally {
      mongoConnectPromise = null;
    }
  })();

  return mongoConnectPromise;
}

export async function getDatabaseStatus() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  let totalUsers = memoryUsers.length;
  let totalAttendanceLogs = memoryAttendance.length;
  let totalLeaves = memoryAttendance.filter(
    (a) => a.status === 'leave' || a.leaveStatus === 'Pending' || a.leaveStatus === 'Approved'
  ).length;

  if (isMongoConnected) {
    try {
      totalUsers = await UserModel.countDocuments();
      totalAttendanceLogs = await AttendanceModel.countDocuments();
      totalLeaves = await AttendanceModel.countDocuments({
        $or: [{ status: 'leave' }, { leaveStatus: { $in: ['Pending', 'Approved', 'Rejected'] } }],
      });
    } catch (err) {
      console.error('[ClassHQ DB] Error counting Mongo documents for status:', err);
    }
  }

  return {
    isConfigured: Boolean(uri && uri.trim() !== ''),
    isConnected: isMongoConnected,
    mode: isMongoConnected ? 'MongoDB Cloud Database' : 'In-Memory State Store (Active & Persistent)',
    error: mongoConnectionError,
    stats: {
      totalUsers,
      totalAttendanceLogs,
      totalLeaves,
    },
  };
}
