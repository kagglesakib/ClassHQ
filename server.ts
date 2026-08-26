import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import { createServer as createViteServer } from 'vite';

import {
  initMongoDB,
  getDatabaseStatus,
  findUserByEmail,
  findUserByRoll,
  findUserById,
  getAllUsers,
  createUser,
  updateUserApproval,
  updateUserRole,
  updateUserSection,
  updateUserPassword,
  getCaptainsBySectionAndBatch,
  getAttendanceByStudent,
  getAttendanceBySectionAndDate,
  getAllAttendance,
  saveOrUpdateAttendanceRecords,
  getAllLeaveRequests,
  getLeavesByStudent,
  getLeavesBySection,
  createLeaveRequest,
  updateLeaveRequestStatus,
  updateStudentLeaveRequest,
  compareBatch,
  compareSection,
  normalizeBatch,
  normalizeSection,
  getSystemSettingsDB,
  updateSystemSettingsDB,
} from './server/db';
import {
  generateToken,
  authMiddleware,
  requireAuth,
  requireRoles,
  AuthenticatedRequest,
} from './server/auth';
import {
  User,
  UserRole,
  HSCBatch,
  Section,
  AcademicGroup,
  Gender,
  AttendanceRecord,
  LeaveRequest,
  LeaveType,
  AttendanceStatus,
} from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize MongoDB lazily/in background
  initMongoDB().catch((err) => console.error('[ClassHQ] MongoDB init error:', err));

  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(authMiddleware);

  // ------------------------------------
  // System & Health Endpoints
  // ------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'ClassHQ Academic Attendance & Leave Management',
      time: new Date().toISOString(),
    });
  });

  app.get('/api/system/status', async (req, res) => {
    try {
      const status = await getDatabaseStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching system status' });
    }
  });

  // ------------------------------------
  // Authentication & Onboarding
  // ------------------------------------

  // Register New Student (Defaults to approval: 'pending')
  app.post('/api/auth/register', async (req, res) => {
    try {
      const {
        fullName,
        rollNumber,
        email,
        phoneNumber,
        gender,
        batch,
        group,
        section,
        address,
        password,
      } = req.body;

      if (
        !fullName ||
        !rollNumber ||
        !email ||
        !phoneNumber ||
        !gender ||
        !batch ||
        !group ||
        !section ||
        !address ||
        !password
      ) {
        res.status(400).json({ error: 'All fields are required for student registration.' });
        return;
      }

      // Check if email already exists
      const existingEmail = await findUserByEmail(email);
      if (existingEmail) {
        res.status(400).json({ error: `An account with email '${email}' is already registered.` });
        return;
      }

      // Check if roll number already exists
      const existingRoll = await findUserByRoll(rollNumber);
      if (existingRoll) {
        res.status(400).json({ error: `Roll number '${rollNumber}' is already registered.` });
        return;
      }

      const newUser: User = {
        id: `usr-student-${Date.now()}`,
        fullName: fullName.trim(),
        rollNumber: rollNumber.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        gender: gender as Gender,
        batch: batch as HSCBatch,
        group: group as AcademicGroup,
        section: section as Section,
        address: address.trim(),
        role: 'student',
        approval: 'pending', // Pending approval by Captain or Admin
        password: password,
        createdAt: new Date().toISOString(),
      };

      await createUser(newUser);

      res.status(201).json({
        success: true,
        message:
          'Student registration submitted successfully! Your account status is currently PENDING. Please wait for approval by your Class Captain or Academic Administrator before logging in.',
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          rollNumber: newUser.rollNumber,
          email: newUser.email,
          batch: newUser.batch,
          section: newUser.section,
          approval: newUser.approval,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Server error during registration.' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { emailOrRoll, password } = req.body;

      if (!emailOrRoll || !password) {
        res.status(400).json({ error: 'Please provide roll number / email and password.' });
        return;
      }

      let user = await findUserByEmail(emailOrRoll);
      if (!user) {
        user = await findUserByRoll(emailOrRoll);
      }

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials. No user found with this roll number or email.' });
        return;
      }

      // Check unhashed plain-text password directly
      const userStoredPassword = user.password || (user as any).passwordHash;
      if (userStoredPassword && userStoredPassword !== password) {
        res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
        return;
      }

      // Check approval status
      if (user.approval === 'pending') {
        res.status(403).json({
          error:
            'Your account registration is currently pending approval by your Class Captain or Academic Administrator. Please check back shortly.',
          approval: 'pending',
          user: {
            fullName: user.fullName,
            rollNumber: user.rollNumber,
            batch: user.batch,
            section: user.section,
            email: user.email,
          },
        });
        return;
      }

      if (user.approval === 'rejected') {
        res.status(403).json({
          error: 'Your student account registration was declined by the academic administration.',
          approval: 'rejected',
        });
        return;
      }

      const sessionPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        batch: user.batch,
        section: user.section,
        group: user.group,
        approval: user.approval,
        phoneNumber: user.phoneNumber,
        address: user.address,
        assignedBatch: user.assignedBatch || user.batch,
        assignedSection: user.assignedSection || user.section,
      };

      const token = generateToken(sessionPayload);

      // Reset any stale session cookie first
      res.clearCookie('token', { path: '/', sameSite: 'lax', httpOnly: false });
      // Set cookie for iframe and multi-tab resilience
      res.cookie('token', token, {
        httpOnly: false, // accessible to client script if needed
        sameSite: 'lax',
        maxAge: 3 * 60 * 60 * 1000, // 3 hours
        path: '/',
      });

      res.json({
        success: true,
        token,
        user: sessionPayload,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Server error during login.' });
    }
  });

  // Quick Demo Login Switcher (for testing convenience)
  app.post('/api/auth/quick-login', async (req, res) => {
    try {
      const { role, email } = req.body;
      const allUsers = await getAllUsers();
      let targetUser: User | undefined;

      if (email) {
        targetUser = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      } else if (role) {
        if (role === 'admin') {
          targetUser = allUsers.find((u) => u.role === 'admin');
        } else if (role === 'captain') {
          targetUser = allUsers.find((u) => u.role === 'captain');
        } else {
          targetUser = allUsers.find((u) => u.role === 'student' && u.approval === 'approved');
        }
      }

      if (!targetUser) {
        res.status(404).json({ error: 'Target demo account not found.' });
        return;
      }

      const sessionPayload = {
        userId: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        fullName: targetUser.fullName,
        rollNumber: targetUser.rollNumber,
        batch: targetUser.batch,
        section: targetUser.section,
        group: targetUser.group,
        approval: targetUser.approval,
        phoneNumber: targetUser.phoneNumber,
        address: targetUser.address,
        assignedBatch: targetUser.assignedBatch || targetUser.batch,
        assignedSection: targetUser.assignedSection || targetUser.section,
      };

      const token = generateToken(sessionPayload);

      res.clearCookie('token', { path: '/', sameSite: 'lax', httpOnly: false });
      res.cookie('token', token, {
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 3 * 60 * 60 * 1000,
        path: '/',
      });

      res.json({
        success: true,
        token,
        user: sessionPayload,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Quick login error.' });
    }
  });

  // Current session info
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({
      user: req.user,
    });
  });

  // Change Password
  app.post('/api/auth/change-password', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized session.' });
        return;
      }

      const user = await findUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'User profile not found.' });
        return;
      }

      // Check current password if user has one set
      if (user.password && currentPassword && user.password !== currentPassword) {
        res.status(400).json({ error: 'Current password does not match.' });
        return;
      }

      await updateUserPassword(userId, newPassword);

      res.json({
        success: true,
        message: 'Password updated successfully!',
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update password.' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // ------------------------------------
  // Time Window Logic for Attendance
  // ------------------------------------
  function parseTime(timeStr: string): { hours: number; minutes: number } {
    if (!timeStr) return { hours: 15, minutes: 0 };
    const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return { hours: 15, minutes: 0 };
    let [_, h, m, p] = match;
    let hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    if (p) {
      const period = p.toUpperCase();
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }
    return { hours, minutes };
  }

  function isTimeWithinWindow(now: Date, startStr: string, endStr: string): boolean {
    const start = parseTime(startStr);
    const end = parseTime(endStr);

    let dhakaHours = now.getHours();
    let dhakaMinutes = now.getMinutes();
    try {
      const dhakaTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour12: false, hour: '2-digit', minute: '2-digit' });
      const [h, m] = dhakaTimeStr.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        dhakaHours = h;
        dhakaMinutes = m;
      }
    } catch (e) {
      // fallback
    }

    const startMins = start.hours * 60 + start.minutes;
    const endMins = end.hours * 60 + end.minutes;

    const checkMins = (nowMins: number) => {
      if (startMins < endMins) {
        return nowMins >= startMins && nowMins <= endMins;
      } else {
        return nowMins >= startMins || (endMins > 0 && nowMins < endMins);
      }
    };

    const nativeMins = now.getHours() * 60 + now.getMinutes();
    const bgMins = dhakaHours * 60 + dhakaMinutes;

    return checkMins(nativeMins) || checkMins(bgMins);
  }

  // General Settings Access (available to students, captains, and admins)
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await getSystemSettingsDB();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.get('/api/system/settings', async (req, res) => {
    try {
      const settings = await getSystemSettingsDB();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // ------------------------------------
  // Student Portal API Endpoints
  // ------------------------------------

  // Student Dashboard Stats
  app.get('/api/student/dashboard-stats', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = (req.query.studentId as string) || req.user?.userId;
      if (!studentId) {
        res.status(400).json({ error: 'Student ID required.' });
        return;
      }

      const studentEmail = req.user?.email;
      const attendanceRecords = await getAttendanceByStudent(studentId, studentEmail);
      const leaveRequests = await getLeavesByStudent(studentId);

      const totalDays = attendanceRecords.length;
      let daysPresent = 0;
      let daysAbsent = 0;
      let daysLeave = 0;
      let daysFraud = 0;

      for (const rec of attendanceRecords) {
        const st = String(rec.status || '').toLowerCase();
        if (st === 'present') daysPresent++;
        else if (st === 'absent') daysAbsent++;
        else if (st === 'leave' || st === 'excused' || st === 'late') daysLeave++;
        else if (st === 'fraud') daysFraud++;
        else daysPresent++;
      }

      // Academic Percentage Calculation: (Present + Leave) / totalDays
      const rawRate = totalDays > 0 ? ((daysPresent + daysLeave) / totalDays) * 100 : 100;
      const attendancePercentage = Math.round(rawRate * 10) / 10;

      const totalLeaveRequests = leaveRequests.length;
      const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;
      const approvedLeaves = leaveRequests.filter((l) => l.status === 'Approved').length;

      res.json({
        attendancePercentage,
        totalDays,
        daysPresent,
        daysAbsent,
        daysLeave,
        daysFraud,
        daysLate: 0,
        daysExcused: 0,
        totalLeaveRequests,
        pendingLeaves,
        approvedLeaves,
        isWarning: attendancePercentage < 75,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching student dashboard stats.' });
    }
  });

  // Student Attendance History
  app.get('/api/student/attendance-history', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = (req.query.studentId as string) || req.user?.userId;
      if (!studentId) {
        res.status(400).json({ error: 'Student ID required.' });
        return;
      }

      const records = await getAttendanceByStudent(studentId, req.user?.email);
      res.json({ records });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching attendance history.' });
    }
  });

  // Student Self-Report Attendance (Present/Absent for Tomorrow strictly between 3 PM and 12 AM except Fri/Sat)
  app.post('/api/student/self-attendance', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { status, remarks } = req.body;
      const normalizedStatus = String(status || '').toLowerCase();
      if (!['present', 'absent'].includes(normalizedStatus)) {
        res.status(400).json({ error: 'Status must be either "present" or "absent".' });
        return;
      }

      const now = new Date();
      const settings = await getSystemSettingsDB();
      const startTime = settings.startTime || '3:00 PM';
      const endTime = settings.endTime || '12:00 AM';

      if (!isTimeWithinWindow(now, startTime, endTime)) {
        res.status(400).json({
          error: `Next-day attendance self-reporting window opens at ${startTime} today (Active window: ${startTime} – ${endTime}).`
        });
        return;
      }

      // Next academic working day target date (excluding Friday and Saturday)
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      while (targetDate.getDay() === 5 || targetDate.getDay() === 6) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      const calculatedDateStr = `${y}-${m}-${d}`;
      const dateStr =
        req.body.date && typeof req.body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.body.date)
          ? req.body.date
          : calculatedDateStr;

      // Validate that requested target date is not a weekend (Friday=5, Saturday=6)
      const requestedDateObj = new Date(dateStr + 'T00:00:00');
      const requestedDayOfWeek = requestedDateObj.getDay();
      if (requestedDayOfWeek === 5 || requestedDayOfWeek === 6) {
        res.status(400).json({
          error: 'The requested date is Friday/Saturday (Weekend Holiday). Attendance self-reporting is for academic working days only.'
        });
        return;
      }
      const user = req.user!;

      // Block student from marking/editing attendance if leave for that date is officially approved
      const userLeaves = await getLeavesByStudent(user.userId);
      const approvedLeaveForDate = userLeaves.find(
        (l) => l.status === 'Approved' && (l.startDate === dateStr || l.endDate === dateStr || (l as any).date === dateStr)
      );
      if (approvedLeaveForDate) {
        res.status(400).json({
          error: `Attendance for ${dateStr} is locked because your leave application has been officially approved by section captain. You cannot edit or mark yourself present/absent.`
        });
        return;
      }

      const fullUser = (await findUserById(user.userId)) || (await findUserByEmail(user.email));
      const gender = String(fullUser?.gender || (user as any).gender || '').toLowerCase();

      let studentNote = '';
      if (normalizedStatus === 'present') {
        if (gender.startsWith('m') || gender === 'male') {
          studentNote = 'Marked Himself As Present';
        } else if (gender.startsWith('f') || gender === 'female') {
          studentNote = 'Marked Herself As Present';
        } else {
          studentNote = 'Marked Himself/Herself As Present';
        }
      } else {
        if (gender.startsWith('m') || gender === 'male') {
          studentNote = 'Marked Himself As Absent';
        } else if (gender.startsWith('f') || gender === 'female') {
          studentNote = 'Marked Herself As Absent';
        } else {
          studentNote = 'Marked Himself/Herself As Absent';
        }
      }

      if (remarks && String(remarks).trim()) {
        studentNote = String(remarks).trim();
      }

      const newRecord: AttendanceRecord = {
        id: `att-${user.userId}-${dateStr}`,
        studentId: user.userId,
        studentName: user.fullName,
        email: user.email,
        batch: user.batch,
        section: user.section,
        group: user.group,
        date: dateStr,
        status: (normalizedStatus === 'present' ? 'Present' : 'Absent') as AttendanceStatus,
        studentsNote: studentNote,
        remarks: studentNote,
        markedBy: {
          id: user.userId,
          name: `${user.fullName} (Self)`,
          role: 'student',
        },
        timestamp: new Date().toISOString(),
      };

      await saveOrUpdateAttendanceRecords([newRecord]);

      res.json({
        success: true,
        message: `Your status for ${dateStr} has been recorded as ${normalizedStatus.toUpperCase()}.`,
        record: newRecord,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error recording self-attendance.' });
    }
  });

  // Student Leave Requests (List)
  app.get('/api/student/leave-requests', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = (req.query.studentId as string) || req.user?.userId;
      if (!studentId) {
        res.status(400).json({ error: 'Student ID required.' });
        return;
      }

      const leaves = await getLeavesByStudent(studentId);
      res.json({ leaves });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching leave requests.' });
    }
  });

  // Student Section Captain Info
  app.get('/api/student/captain-info', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const batch = (req.query.batch as string) || req.user?.batch || 'HSC 2026';
      const section = (req.query.section as string) || req.user?.section || 'A';

      const captains = await getCaptainsBySectionAndBatch(batch, section);
      res.json({
        batch,
        section,
        captains: captains.map((c) => ({
          id: c.id,
          fullName: c.fullName,
          rollNumber: c.rollNumber,
          email: c.email,
          phoneNumber: c.phoneNumber,
          assignedBatch: c.assignedBatch || c.batch,
          assignedSection: c.assignedSection || c.section,
          group: c.group,
          gender: c.gender,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching section captain information.' });
    }
  });

  // Submit Leave Request (Supports single date for any day among next 7 days with detailed reason)
  app.post('/api/student/leave-requests', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { leaveType, date, startDate, endDate, reason } = req.body;

      const targetDate = date || startDate;
      const targetEndDate = date || endDate || startDate;

      if (!leaveType || !targetDate || !reason || String(reason).trim().length < 5) {
        res.status(400).json({ error: 'Please provide a valid leave type, date, and a detailed reason for absence (minimum 5 characters).' });
        return;
      }

      const start = new Date(targetDate);
      const end = new Date(targetEndDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ error: 'Invalid date provided.' });
        return;
      }

      if (end < start) {
        res.status(400).json({ error: 'End date cannot be prior to start date.' });
        return;
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const existingLeaves = await getLeavesByStudent(req.user!.userId);
      const alreadyApproved = existingLeaves.find(
        (l) => l.status === 'Approved' && (l.startDate === targetDate || l.endDate === targetDate || (l as any).date === targetDate)
      );
      if (alreadyApproved) {
        res.status(400).json({ error: `An approved leave application already exists for ${targetDate}. Attendance is locked for this day.` });
        return;
      }

      const newLeave: LeaveRequest = {
        id: `leave-req-${Date.now()}`,
        studentId: req.user!.userId,
        studentRoll: req.user!.rollNumber,
        studentName: req.user!.fullName,
        studentEmail: req.user!.email,
        batch: req.user!.batch,
        section: req.user!.section,
        group: req.user!.group,
        leaveType: (leaveType as LeaveType) || 'Casual',
        startDate: targetDate,
        endDate: targetEndDate,
        daysCount,
        reason: reason.trim(),
        status: 'Pending',
        submittedAt: new Date().toISOString(),
      };

      const created = await createLeaveRequest(newLeave);
      res.status(201).json({
        success: true,
        message: `Leave application for ${targetDate} submitted successfully! Your Section Captain has been notified for review.`,
        leave: created,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error submitting leave request.' });
    }
  });

  // Edit / Update Pending Leave Request by Student (Before Approval or Disapproval)
  app.patch('/api/student/leave-requests/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { leaveType, date, startDate, reason } = req.body;

      const targetDate = date || startDate;

      if (!targetDate && !leaveType && !reason) {
        res.status(400).json({ error: 'Please provide valid updates for date, leave type, or reason.' });
        return;
      }

      if (targetDate) {
        const dObj = new Date(targetDate);
        if (isNaN(dObj.getTime())) {
          res.status(400).json({ error: 'Invalid date provided.' });
          return;
        }
        const day = dObj.getDay();
        if (day === 5 || day === 6) {
          res.status(400).json({ error: 'Leave applications cannot be filed for weekends (Friday and Saturday).' });
          return;
        }
      }

      if (reason !== undefined && String(reason).trim().length < 5) {
        res.status(400).json({ error: 'Please provide a detailed reason for absence (minimum 5 characters).' });
        return;
      }

      const updated = await updateStudentLeaveRequest(
        id,
        {
          leaveType: leaveType as LeaveType,
          date: targetDate,
          reason: reason ? String(reason).trim() : undefined,
        },
        {
          id: req.user!.userId,
          email: req.user!.email,
          rollNumber: req.user!.rollNumber,
        }
      );

      if (!updated) {
        res.status(404).json({ error: 'Leave request not found or does not belong to your student account.' });
        return;
      }

      res.json({
        success: true,
        message: 'Leave application updated successfully.',
        leave: updated,
      });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Error updating leave request.' });
    }
  });

  // ------------------------------------
  // Class Captain Portal API Endpoints
  // ------------------------------------

  // Section Roster with Attendance for Selected Date
  app.get('/api/captain/roster', authMiddleware, requireRoles(['captain', 'admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const userSection = req.user?.assignedSection || req.user?.section;
      const userBatch = req.user?.assignedBatch || req.user?.batch;
      const isCaptain = req.user?.role === 'captain';

      const section = (isCaptain && userSection) ? userSection : ((req.query.section as string) || userSection || 'A');
      const batch = (isCaptain && userBatch) ? userBatch : ((req.query.batch as string) || userBatch || 'HSC 2026');
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

      const allUsers = await getAllUsers();
      const sectionStudents = allUsers.filter((u) => {
        const uBatch = u.role === 'captain' ? (u.assignedBatch || u.batch) : (u.batch || u.assignedBatch);
        const uSection = u.role === 'captain' ? (u.assignedSection || u.section) : (u.section || u.assignedSection);
        const isApproved = u.approval === 'approved' || u.role === 'captain' || u.role === 'admin';
        return (
          compareBatch(uBatch, batch) &&
          compareSection(uSection, section) &&
          isApproved &&
          (u.role === 'student' || u.role === 'captain')
        );
      });

      const [existingRecords, sectionLeaves] = await Promise.all([
        getAttendanceBySectionAndDate(batch, section, date),
        getLeavesBySection(batch, section),
      ]);

      const recordMap = new Map<string, AttendanceRecord>();
      existingRecords.forEach((r) => {
        if (r.studentId) recordMap.set(r.studentId, r);
        if (r.email) recordMap.set(r.email.toLowerCase(), r);
      });

      const approvedLeaveMap = new Map<string, LeaveRequest>();
      sectionLeaves.forEach((l) => {
        if (l.status === 'Approved' && l.startDate <= date && l.endDate >= date) {
          if (l.studentId) approvedLeaveMap.set(l.studentId, l);
          if (l.studentEmail) approvedLeaveMap.set(l.studentEmail.toLowerCase(), l);
        }
      });

      const roster = sectionStudents.map((st) => {
        const rec = recordMap.get(st.id) || (st.email ? recordMap.get(st.email.toLowerCase()) : undefined);
        const approvedLeave = approvedLeaveMap.get(st.id) || (st.email ? approvedLeaveMap.get(st.email.toLowerCase()) : undefined);

        let status: AttendanceStatus = 'Absent';
        let studentsNote = '';

        if (!rec && !approvedLeave) {
          // 1. if no data of that specific date exist, then it is shown absent, and show studentsNote, "Auto Marked as Absent"
          status = 'Absent';
          studentsNote = 'Auto Marked as Absent';
        } else {
          // Data exists for that date
          if (rec) {
            status = rec.status;
          } else if (approvedLeave) {
            status = 'leave';
          }

          const existingNote = (
            rec?.studentsNote ||
            rec?.remarks ||
            approvedLeave?.reason ||
            approvedLeave?.studentsNote ||
            ''
          ).trim();

          // 2. if data of that specific date exist but remarks field is empty, then it is shown current status, and show studentsNote, "Empty And Unknown"
          if (!existingNote) {
            studentsNote = 'Empty And Unknown';
          } else {
            studentsNote = existingNote;
          }
        }

        let captainsNote = rec?.captainsNote || approvedLeave?.captainsNote || approvedLeave?.reviewNote || '';
        if (String(status).toLowerCase() === 'fraud' && (!captainsNote || captainsNote === 'Frauded The attendance')) {
          captainsNote = 'Fraud Present Detected.';
        }
        const isLeaveStatus = String(status).toLowerCase() === 'leave';
        const leaveReason = approvedLeave?.reason || rec?.leaveReason || (isLeaveStatus ? (studentsNote !== 'Empty And Unknown' && studentsNote !== 'Auto Marked as Absent' ? studentsNote : '') : '');
        const leaveStatus = approvedLeave ? 'Approved' : (rec?.leaveStatus || 'None');

        return {
          studentId: st.id,
          rollNumber: st.rollNumber,
          fullName: st.fullName,
          group: st.group,
          phoneNumber: st.phoneNumber,
          email: st.email,
          gender: st.gender || 'Male',
          role: st.role,
          status,
          isMarked: Boolean(rec),
          studentsNote,
          captainsNote,
          leaveReason,
          leaveStatus,
        };
      });

      res.json({
        batch,
        section,
        date,
        totalEnrolled: sectionStudents.length,
        roster,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching captain section roster.' });
    }
  });

  // Mark / Save Section Attendance
  app.post('/api/captain/attendance', authMiddleware, requireRoles(['captain', 'admin']), async (req: AuthenticatedRequest, res) => {
    try {
      let { batch, section, date, records } = req.body;
      const isCaptain = req.user?.role === 'captain';
      if (isCaptain) {
        batch = req.user?.assignedBatch || req.user?.batch || batch;
        section = req.user?.assignedSection || req.user?.section || section;
      }

      if (!batch || !section || !date || !Array.isArray(records)) {
        res.status(400).json({ error: 'batch, section, date, and records array are required.' });
        return;
      }

      const allUsers = await getAllUsers();
      const userMap = new Map(allUsers.map((u) => [u.id, u]));

      const formattedRecords: AttendanceRecord[] = records.map((r: any) => {
        const student = userMap.get(r.studentId) || allUsers.find((u) => u.email && r.email && u.email.toLowerCase() === r.email.toLowerCase());
        const email = student?.email || r.email || '';
        const rawStatus = (r.status || 'present').toString().toLowerCase();
        let status: AttendanceStatus = 'present';
        if (rawStatus === 'absent') status = 'absent';
        else if (rawStatus === 'fraud') status = 'Fraud';
        else if (rawStatus === 'leave' || rawStatus === 'excused' || rawStatus === 'late') status = 'leave';
        else status = 'present';

        let captainsNote = r.captainsNote || '';
        if (status === 'Fraud' && (!captainsNote.trim() || captainsNote === 'Frauded The attendance')) {
          captainsNote = 'Fraud Present Detected.';
        }
        const studentsNote = r.studentsNote || '';
        const leaveReason = r.leaveReason || (status === 'leave' ? studentsNote : '');
        const leaveStatus = status === 'leave' ? 'Approved' : 'None';

        return {
          id: `att-${date}-${student?.id || r.studentId}`,
          email,
          date,
          status,
          studentsNote,
          captainsNote,
          leaveReason,
          leaveStatus,
          studentId: student?.id || r.studentId,
          studentRoll: student?.rollNumber || r.rollNumber || 'N/A',
          studentName: student?.fullName || r.fullName || 'Student',
          batch: batch as HSCBatch,
          section: section as Section,
          group: student?.group || 'Science',
          reviewedBy: {
            id: req.user!.userId,
            email: req.user!.email,
            name: req.user!.fullName,
            role: req.user!.role,
          },
          markedBy: {
            id: req.user!.userId,
            name: req.user!.fullName,
            role: req.user!.role,
          },
          remarks: captainsNote,
          timestamp: new Date().toISOString(),
        };
      });

      await saveOrUpdateAttendanceRecords(formattedRecords);

      res.json({
        success: true,
        message: `Attendance marked successfully for ${formattedRecords.length} students on ${date}.`,
        count: formattedRecords.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error recording section attendance.' });
    }
  });

  // Section Leaves View (For Captain)
  app.get('/api/captain/section-leaves', authMiddleware, requireRoles(['captain', 'admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const userSection = req.user?.assignedSection || req.user?.section;
      const userBatch = req.user?.assignedBatch || req.user?.batch;
      const isCaptain = req.user?.role === 'captain';

      const section = (isCaptain && userSection) ? userSection : ((req.query.section as string) || userSection || 'A');
      const batch = (isCaptain && userBatch) ? userBatch : ((req.query.batch as string) || userBatch || 'HSC 2026');

      const leaves = await getLeavesBySection(batch, section);

      // When a captain is viewing Section Leaves to review/manage, filter out their own leave applications.
      // Captain's own leave applications are viewed under their own profile/student view and reviewed by Co-Captains or Admin.
      const filteredLeaves = isCaptain && req.user
        ? leaves.filter((lv) => {
            const isOwn =
              (req.user!.userId && lv.studentId === req.user!.userId) ||
              (req.user!.email && lv.studentEmail && lv.studentEmail.toLowerCase() === req.user!.email.toLowerCase()) ||
              (req.user!.rollNumber && lv.studentRoll && lv.studentRoll.toString() === req.user!.rollNumber.toString());
            return !isOwn;
          })
        : leaves;

      res.json({ leaves: filteredLeaves });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching section leaves.' });
    }
  });

  // Section Stats Overview
  app.get('/api/captain/section-stats', authMiddleware, requireRoles(['captain', 'admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const userSection = req.user?.assignedSection || req.user?.section;
      const userBatch = req.user?.assignedBatch || req.user?.batch;
      const isCaptain = req.user?.role === 'captain';

      const section = (isCaptain && userSection) ? userSection : ((req.query.section as string) || userSection || 'A');
      const batch = (isCaptain && userBatch) ? userBatch : ((req.query.batch as string) || userBatch || 'HSC 2026');
      const today = new Date().toISOString().split('T')[0];

      const allUsers = await getAllUsers();
      const sectionStudents = allUsers.filter((u) => {
        const uBatch = u.role === 'captain' ? (u.assignedBatch || u.batch) : (u.batch || u.assignedBatch);
        const uSection = u.role === 'captain' ? (u.assignedSection || u.section) : (u.section || u.assignedSection);
        const isApproved = u.approval === 'approved' || u.role === 'captain' || u.role === 'admin';
        return (
          compareBatch(uBatch, batch) &&
          compareSection(uSection, section) &&
          isApproved &&
          (u.role === 'student' || u.role === 'captain')
        );
      });

      const todayAttendance = await getAttendanceBySectionAndDate(batch, section, today);
      const sectionLeaves = await getLeavesBySection(batch, section);

      let todayPresent = 0;
      let todayAbsent = 0;
      let todayLeave = 0;

      todayAttendance.forEach((a) => {
        const st = String(a.status || '').toLowerCase();
        if (st === 'present') todayPresent++;
        else if (st === 'absent') todayAbsent++;
        else if (st === 'leave' || st === 'excused' || st === 'late') todayLeave++;
        else todayPresent++;
      });

      res.json({
        batch,
        section,
        totalStudents: sectionStudents.length,
        todayPresent,
        todayAbsent,
        todayLeave,
        todayLate: 0,
        todayExcused: 0,
        todayMarked: todayAttendance.length > 0,
        pendingLeaves: sectionLeaves.filter((l) => l.status === 'Pending').length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching captain section stats.' });
    }
  });

  // ------------------------------------
  // Academic Administrator Portal API
  // ------------------------------------

  // Settings
  app.get('/api/admin/settings', authMiddleware, requireRoles(['admin']), async (req, res) => {
    try {
      const settings = await getSystemSettingsDB();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.patch('/api/admin/settings', authMiddleware, requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const { startTime, endTime } = req.body;
      if (!startTime || !endTime) {
        return res.status(400).json({ error: 'startTime and endTime are required' });
      }

      const settings = await updateSystemSettingsDB(startTime, endTime, req.user?.fullName || 'System Admin');
      res.json({ success: true, message: 'Settings updated successfully', settings });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // Admin Overview Statistics
  app.get('/api/admin/overview-stats', authMiddleware, requireRoles(['admin']), async (req, res) => {
    try {
      const allUsers = await getAllUsers();
      const allLeaves = await getAllLeaveRequests();
      const allAttendance = await getAllAttendance();

      const students = allUsers.filter((u) => u.role === 'student');
      const captains = allUsers.filter((u) => u.role === 'captain');
      const pendingStudentApprovals = allUsers.filter((u) => u.approval === 'pending').length;
      const pendingLeaveApprovals = allLeaves.filter((l) => l.status === 'Pending').length;

      const today = new Date().toISOString().split('T')[0];
      const todayLogs = allAttendance.filter((a) => a.date === today);
      const todayPresentCount = todayLogs.filter((a) => {
        const s = String(a.status || '').toLowerCase();
        return s === 'present' || s === 'leave' || s === 'excused' || s === 'late';
      }).length;
      const todayInstitutionAttendanceRate =
        todayLogs.length > 0 ? Math.round((todayPresentCount / todayLogs.length) * 100) : 0;

      const enrolledApprovedUsers = allUsers.filter(
        (u) => (u.role === 'student' || u.role === 'captain') && u.approval === 'approved'
      );
      const batches = new Set(enrolledApprovedUsers.map((u) => u.batch));
      const sections = new Set(enrolledApprovedUsers.map((u) => u.section));

      // Build section-wise breakdown
      const sectionMap = new Map<string, { batch: HSCBatch; section: Section; students: User[]; records: AttendanceRecord[] }>();
      students.filter((s) => s.approval === 'approved').forEach((s) => {
        const key = `${s.batch}-${s.section}`;
        if (!sectionMap.has(key)) {
          sectionMap.set(key, { batch: s.batch, section: s.section, students: [], records: [] });
        }
        sectionMap.get(key)!.students.push(s);
      });

      allAttendance.forEach((rec) => {
        const key = `${rec.batch}-${rec.section}`;
        if (sectionMap.has(key)) {
          sectionMap.get(key)!.records.push(rec);
        }
      });

      const sectionAttendanceBreakdown = Array.from(sectionMap.values()).map((sec) => {
        const totalLogs = sec.records.length;
        const presentLogs = sec.records.filter((r) => {
          const s = String(r.status || '').toLowerCase();
          return s === 'present' || s === 'leave' || s === 'excused' || s === 'late';
        }).length;
        const attendanceRate = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 0;
        return {
          batch: sec.batch,
          section: sec.section,
          totalStudents: sec.students.length,
          attendanceRate,
        };
      });

      // Build low attendance student list (<75%) and compliance tiers
      const lowAttendanceStudents: Array<{
        studentId: string;
        rollNumber: string;
        fullName: string;
        batch: HSCBatch;
        section: Section;
        attendancePercentage: number;
        presentDays: number;
        totalClasses: number;
      }> = [];

      let distinctionCount = 0;
      let satisfactoryCount = 0;
      let atRiskCount = 0;
      let criticalCount = 0;

      const approvedStudents = students.filter((s) => s.approval === 'approved');

      approvedStudents.forEach((st) => {
        const stRecords = allAttendance.filter((r) => r.studentId === st.id);
        const total = stRecords.length;
        let rate = 100;
        let present = 0;

        if (total > 0) {
          present = stRecords.filter((r) => {
            const s = String(r.status || '').toLowerCase();
            return s === 'present' || s === 'leave' || s === 'excused' || s === 'late';
          }).length;
          rate = Math.round((present / total) * 100);
        }

        if (rate >= 90) distinctionCount++;
        else if (rate >= 75) satisfactoryCount++;
        else if (rate >= 60) atRiskCount++;
        else criticalCount++;

        if (total > 0 && rate < 75) {
          lowAttendanceStudents.push({
            studentId: st.id,
            rollNumber: st.rollNumber,
            fullName: st.fullName,
            batch: st.batch,
            section: st.section,
            attendancePercentage: rate,
            presentDays: present,
            totalClasses: total,
          });
        }
      });

      const totalEvaluated = approvedStudents.length || 1;
      const complianceTiers = [
        { tier: 'Distinction (≥90%)', range: '90-100%', count: distinctionCount, percentage: Math.round((distinctionCount / totalEvaluated) * 100), color: '#10b981' },
        { tier: 'Satisfactory (75-89%)', range: '75-89%', count: satisfactoryCount, percentage: Math.round((satisfactoryCount / totalEvaluated) * 100), color: '#3b82f6' },
        { tier: 'At Risk (60-74%)', range: '60-74%', count: atRiskCount, percentage: Math.round((atRiskCount / totalEvaluated) * 100), color: '#f59e0b' },
        { tier: 'Critical (<60%)', range: '<60%', count: criticalCount, percentage: Math.round((criticalCount / totalEvaluated) * 100), color: '#f43f5e' },
      ];

      // Daily Trend (Last 7 days or recorded dates)
      const dateMap = new Map<string, { present: number; absent: number; late: number; total: number }>();
      
      // Initialize past 7 days to guarantee continuous timeline
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        dateMap.set(iso, { present: 0, absent: 0, late: 0, total: 0 });
      }

      allAttendance.forEach((rec) => {
        if (rec.date && dateMap.has(rec.date)) {
          const entry = dateMap.get(rec.date)!;
          entry.total++;
          const st = String(rec.status || '').toLowerCase();
          if (st === 'present') entry.present++;
          else if (st === 'late') {
            entry.late++;
            entry.present++;
          } else if (st === 'absent') {
            entry.absent++;
          } else if (st === 'leave' || st === 'excused') {
            entry.present++;
          }
        }
      });

      const dailyTrend = Array.from(dateMap.entries()).map(([dt, data]) => {
        const dObj = new Date(dt);
        const formattedDate = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const rate = data.total > 0 ? Math.round((data.present / data.total) * 100) : todayInstitutionAttendanceRate || 92;
        return {
          date: dt,
          formattedDate,
          rate,
          present: data.present,
          absent: data.absent,
          late: data.late,
          total: data.total,
        };
      });

      // Overall Status Distribution
      let totalPresents = 0;
      let totalAbsents = 0;
      let totalLates = 0;
      let totalExcused = 0;

      allAttendance.forEach((rec) => {
        const st = String(rec.status || '').toLowerCase();
        if (st === 'present') totalPresents++;
        else if (st === 'absent') totalAbsents++;
        else if (st === 'late') totalLates++;
        else if (st === 'leave' || st === 'excused') totalExcused++;
      });

      const totalLogsAll = allAttendance.length || 1;
      const statusDistribution = [
        { name: 'Present', count: totalPresents || (allAttendance.length === 0 ? 85 : 0), percentage: Math.round(((totalPresents || 85) / totalLogsAll) * 100), color: '#10b981' },
        { name: 'Absent', count: totalAbsents, percentage: Math.round((totalAbsents / totalLogsAll) * 100), color: '#f43f5e' },
        { name: 'Late', count: totalLates, percentage: Math.round((totalLates / totalLogsAll) * 100), color: '#f59e0b' },
        { name: 'Excused / Leave', count: totalExcused, percentage: Math.round((totalExcused / totalLogsAll) * 100), color: '#06b6d4' },
      ];

      // Batch Breakdown
      const standardBatches = ['2024', '2025', '2026'];
      const batchBreakdown = standardBatches.map((b) => {
        const batchStudents = students.filter((s) => String(s.batch || '').replace(/\D+/g, '') === b);
        const approved = batchStudents.filter((s) => s.approval === 'approved');
        const batchCaptains = captains.filter((c) => String(c.batch || c.assignedBatch || '').replace(/\D+/g, '') === b);
        const batchRecords = allAttendance.filter((a) => String(a.batch || '').replace(/\D+/g, '') === b);
        const presentLogs = batchRecords.filter((r) => {
          const s = String(r.status || '').toLowerCase();
          return s === 'present' || s === 'leave' || s === 'excused' || s === 'late';
        }).length;
        const attendanceRate = batchRecords.length > 0 ? Math.round((presentLogs / batchRecords.length) * 100) : 90;
        return {
          batch: `HSC ${b}`,
          totalStudents: batchStudents.length,
          approvedStudents: approved.length,
          captainsCount: batchCaptains.length,
          attendanceRate,
        };
      });

      // Academic Group Breakdown
      const standardGroups = ['Science', 'Business Studies', 'Humanities'];
      const groupBreakdown = standardGroups.map((grp) => {
        const grpStudents = students.filter((s) => s.group === grp && s.approval === 'approved');
        const grpStudentIds = new Set(grpStudents.map((s) => s.id));
        const grpRecords = allAttendance.filter((a) => grpStudentIds.has(a.studentId));
        const presentLogs = grpRecords.filter((r) => {
          const s = String(r.status || '').toLowerCase();
          return s === 'present' || s === 'leave' || s === 'excused' || s === 'late';
        }).length;
        const attendanceRate = grpRecords.length > 0 ? Math.round((presentLogs / grpRecords.length) * 100) : 92;
        return {
          group: grp,
          totalStudents: grpStudents.length,
          attendanceRate,
        };
      });

      res.json({
        totalStudents: students.length,
        totalCaptains: captains.length,
        captainsCount: captains.length,
        pendingStudentApprovals,
        pendingLeaveApprovals,
        totalLeavesRecorded: allLeaves.length,
        todayInstitutionAttendanceRate,
        batchesCount: batches.size || 3,
        sectionsCount: sections.size || 4,
        sectionAttendanceBreakdown,
        lowAttendanceStudents,
        dailyTrend,
        statusDistribution,
        batchBreakdown,
        groupBreakdown,
        complianceTiers,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching admin overview stats.' });
    }
  });

  // Comprehensive Student & Captain Directory (Filterable & Searchable)
  app.get('/api/admin/students', authMiddleware, requireRoles(['admin', 'captain']), async (req: AuthenticatedRequest, res) => {
    try {
      const { batch, section, group, approval, role, search } = req.query;
      let users = await getAllUsers();
      const norm = (str?: string) => (str || '').trim().toUpperCase();

      // If Class Captain is viewing, restrict strictly to their assigned batch AND section
      if (req.user?.role === 'captain') {
        const capSection = req.user.assignedSection || req.user.section;
        const capBatch = req.user.assignedBatch || req.user.batch;
        users = users.filter((u) => {
          const uSection = u.section || u.assignedSection;
          const uBatch = u.batch || u.assignedBatch || (u as any).hscBatch;
          return compareSection(uSection, capSection) && compareBatch(uBatch, capBatch);
        });
      }

      if (role && role !== 'ALL') {
        users = users.filter((u) => norm(u.role) === norm(role as string));
      }
      if (batch && batch !== 'ALL') {
        users = users.filter((u) => {
          const uBatch = u.batch || u.assignedBatch || (u as any).hscBatch;
          return compareBatch(uBatch, batch as string);
        });
      }
      if (section && section !== 'ALL') {
        users = users.filter((u) => {
          const uSection = u.section || u.assignedSection;
          return compareSection(uSection, section as string);
        });
      }
      if (group && group !== 'ALL') {
        users = users.filter((u) => norm(u.group) === norm(group as string));
      }
      if (approval && approval !== 'ALL') {
        users = users.filter((u) => norm(u.approval) === norm(approval as string));
      }
      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        users = users.filter(
          (u) =>
            (u.fullName && typeof u.fullName === 'string' && u.fullName.toLowerCase().includes(q)) ||
            (u.rollNumber && typeof u.rollNumber === 'string' && u.rollNumber.toLowerCase().includes(q)) ||
            (u.email && typeof u.email === 'string' && u.email.toLowerCase().includes(q)) ||
            (u.phoneNumber && typeof u.phoneNumber === 'string' && u.phoneNumber.toLowerCase().includes(q))
        );
      }

      res.json({
        total: users.length,
        students: users,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching directory list.' });
    }
  });

  // Promote Student to Captain or Demote Captain to Student
  app.patch('/api/admin/users/:id/role', authMiddleware, requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { role, assignedBatch, assignedSection } = req.body;

      if (!role || !['student', 'captain'].includes(role)) {
        res.status(400).json({ error: "Invalid role. Role must be 'student' or 'captain'." });
        return;
      }

      const existingUser = await findUserById(id);
      if (!existingUser) {
        res.status(404).json({ error: 'User account not found.' });
        return;
      }

      if (existingUser.role === 'admin') {
        res.status(400).json({ error: 'Cannot modify Chief Administrator role.' });
        return;
      }

      const updated = await updateUserRole(
        id,
        role as UserRole,
        (assignedBatch as HSCBatch) || existingUser.batch,
        (assignedSection as Section) || existingUser.section
      );

      if (!updated) {
        res.status(404).json({ error: 'Failed to update user role.' });
        return;
      }

      const actionText = role === 'captain' ? 'promoted to Class Captain' : 'reverted to Student';
      res.json({
        success: true,
        message: `Account ${updated.fullName} (${updated.rollNumber}) has been successfully ${actionText}.`,
        user: updated,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error updating user role.' });
    }
  });

  // Shift Student or Captain to a Different Section (and optionally batch)
  app.patch('/api/admin/users/:id/section', authMiddleware, requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { section, batch } = req.body;

      if (!section) {
        res.status(400).json({ error: 'Section is required (e.g. A, B, C, D).' });
        return;
      }

      const existingUser = await findUserById(id);
      if (!existingUser) {
        res.status(404).json({ error: 'User account not found.' });
        return;
      }

      if (existingUser.role === 'admin') {
        res.status(400).json({ error: 'Cannot shift section for Chief Administrator.' });
        return;
      }

      const prevSection = existingUser.section || existingUser.assignedSection || 'A';
      const prevBatch = existingUser.batch || existingUser.assignedBatch || '2026';

      const updated = await updateUserSection(
        id,
        section as Section,
        batch ? (batch as HSCBatch) : undefined
      );

      if (!updated) {
        res.status(404).json({ error: 'Failed to update section for user.' });
        return;
      }

      const newSection = updated.section || updated.assignedSection || 'A';
      const newBatch = updated.batch || updated.assignedBatch || '2026';
      const roleLabel = updated.role === 'captain' ? 'Section Captain' : 'Student';

      res.json({
        success: true,
        message: `${roleLabel} ${updated.fullName} (Roll: ${updated.rollNumber}) successfully shifted from Section ${prevSection} to Section ${newSection} (${newBatch}).`,
        user: updated,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error shifting section.' });
    }
  });

  // Get Comprehensive User / Student Profile with stats, attendance history, and leaves
  app.get('/api/admin/users/:id/profile', authMiddleware, requireRoles(['admin', 'captain']), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const user = await findUserById(id);

      if (!user) {
        res.status(404).json({ error: 'User profile not found.' });
        return;
      }

      // If Class Captain is viewing, restrict to their assigned batch and section
      if (req.user?.role === 'captain') {
        const capSection = req.user.assignedSection || req.user.section;
        const capBatch = req.user.assignedBatch || req.user.batch;
        const studentSec = user.section || user.assignedSection;
        const studentBatch = user.batch || user.assignedBatch || (user as any).hscBatch;
        if (!compareSection(studentSec, capSection) || !compareBatch(studentBatch, capBatch)) {
          res.status(403).json({ error: "Class Captain can only view student profiles matching their assigned batch and section." });
          return;
        }
      }

      const [attendanceRecords, leaveRequests] = await Promise.all([
        getAttendanceByStudent(id),
        getLeavesByStudent(id),
      ]);

      const totalDays = attendanceRecords.length;
      let daysPresent = 0;
      let daysAbsent = 0;
      let daysLate = 0;
      let daysExcused = 0;

      for (const rec of attendanceRecords) {
        const st = String(rec.status || '').toLowerCase();
        if (st === 'present') daysPresent++;
        else if (st === 'absent') daysAbsent++;
        else if (st === 'leave' || st === 'excused' || st === 'late') daysLate++;
        else daysPresent++;
      }

      const rawRate = totalDays > 0 ? ((daysPresent + daysExcused + daysLate * 0.75) / totalDays) * 100 : 100;
      const attendancePercentage = Math.round(rawRate * 10) / 10;

      const totalLeaveRequests = leaveRequests.length;
      const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;
      const approvedLeaves = leaveRequests.filter((l) => l.status === 'Approved').length;

      const attendanceStats = {
        attendancePercentage,
        totalDays,
        daysPresent,
        daysAbsent,
        daysLate,
        daysExcused,
        totalLeaveRequests,
        pendingLeaves,
        approvedLeaves,
        isWarning: attendancePercentage < 75,
      };

      res.json({
        success: true,
        user,
        attendanceStats,
        attendanceRecords,
        leaveRequests,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching user profile.' });
    }
  });

  // Approve or Reject Student Registration
  app.patch('/api/admin/students/:id/approval', authMiddleware, requireRoles(['admin', 'captain']), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { approval } = req.body;

      if (!['approved', 'rejected', 'pending'].includes(approval)) {
        res.status(400).json({ error: "Invalid approval status. Must be 'approved', 'rejected', or 'pending'." });
        return;
      }

      const targetStudent = await findUserById(id);
      if (!targetStudent) {
        res.status(404).json({ error: 'Student account not found.' });
        return;
      }

      if (req.user?.role === 'captain') {
        const capSection = req.user.assignedSection || req.user.section;
        const capBatch = req.user.assignedBatch || req.user.batch;
        const studentSec = targetStudent.section || targetStudent.assignedSection;
        const studentBatch = targetStudent.batch || targetStudent.assignedBatch || (targetStudent as any).hscBatch;
        if (!compareSection(studentSec, capSection) || !compareBatch(studentBatch, capBatch)) {
          res.status(403).json({ error: "Class Captain can only approve students matching their assigned batch and section." });
          return;
        }

        if (targetStudent.role === 'captain' && approval !== 'approved') {
          res.status(403).json({ error: "Captains cannot revoke approval or reject other Captains." });
          return;
        }
      }

      const updated = await updateUserApproval(id, approval);
      if (!updated) {
        res.status(404).json({ error: 'Student not found.' });
        return;
      }

      res.json({
        success: true,
        message: `Student ${updated.fullName} (${updated.rollNumber}) status updated to '${approval}'.`,
        student: updated,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error updating student approval.' });
    }
  });

  // Admin All Leave Applications (With Filters)
  app.get('/api/admin/leaves', authMiddleware, requireRoles(['admin']), async (req, res) => {
    try {
      const { status, batch, section } = req.query;
      let leaves = await getAllLeaveRequests();

      if (status && status !== 'ALL') {
        leaves = leaves.filter((l) => l.status === status);
      }
      if (batch && batch !== 'ALL') {
        leaves = leaves.filter((l) => l.batch === batch);
      }
      if (section && section !== 'ALL') {
        leaves = leaves.filter((l) => l.section === section);
      }

      res.json({
        total: leaves.length,
        leaves,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error fetching all leave requests.' });
    }
  });

  // Approve or Reject Leave Request (with Reviewer Notes)
  app.patch('/api/admin/leaves/:id/review', authMiddleware, requireRoles(['admin', 'captain']), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNote } = req.body;

      if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
        res.status(400).json({ error: "Invalid status. Must be 'Approved', 'Rejected', or 'Pending'." });
        return;
      }

      if (req.user?.role === 'captain') {
        const allLeaves = await getAllLeaveRequests();
        const targetLeave = allLeaves.find(
          (l) =>
            l.id === id ||
            l.id.toLowerCase() === id.toLowerCase() ||
            `leave-${(l.studentEmail || '').toLowerCase()}-${l.startDate}` === id.toLowerCase()
        );
        if (targetLeave) {
          const isOwn =
            (req.user.userId && targetLeave.studentId === req.user.userId) ||
            (req.user.email && targetLeave.studentEmail && targetLeave.studentEmail.toLowerCase() === req.user.email.toLowerCase()) ||
            (req.user.rollNumber && targetLeave.studentRoll && targetLeave.studentRoll.toString() === req.user.rollNumber.toString());
          if (isOwn) {
            res.status(403).json({ error: 'Captains cannot review or approve their own leave applications. Another Captain or Admin must review it.' });
            return;
          }
        }
      }

      const reviewer = {
        id: req.user!.userId,
        name: req.user!.fullName,
        role: req.user!.role,
      };

      const updated = await updateLeaveRequestStatus(id, status, reviewer, reviewNote);
      if (!updated) {
        res.status(404).json({ error: 'Leave request not found.' });
        return;
      }

      res.json({
        success: true,
        message: `Leave application for ${updated.studentName} has been ${status}.`,
        leave: updated,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error reviewing leave application.' });
    }
  });

  // ------------------------------------
  // Vite Middleware & SPA Fallback
  // ------------------------------------
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { server: httpServer }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[ClassHQ Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
