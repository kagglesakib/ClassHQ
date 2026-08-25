import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { AttendanceStatus, LeaveRequest, CaptainSectionStats, User, ApprovalStatus } from '../../types';
import { CaptainNavbar } from './components/CaptainNavbar';
import { CaptainRollCallView, RosterItem } from './components/CaptainRollCallView';
import { CaptainRosterView } from './components/CaptainRosterView';
import { CaptainLeavesView } from './components/CaptainLeavesView';
import { CaptainMyProfileView } from './components/CaptainMyProfileView';
import { CaptainUserProfileModal } from './components/CaptainUserProfileModal';

export const CaptainPortal: React.FC = () => {
  const { user } = useAuth();
  const assignedBatch = user?.assignedBatch || user?.batch || 'HSC 2026';
  const assignedSection = user?.assignedSection || user?.section || 'A';

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [stats, setStats] = useState<CaptainSectionStats | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Student Profile Modal State for Captain
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<User | null>(null);

  const fetchCaptainData = useCallback(async () => {
    setLoading(true);
    setSaveError(null);
    try {
      const [rosterRes, statsRes, leavesRes] = await Promise.all([
        api.getCaptainRoster(selectedDate, assignedBatch, assignedSection).catch(() => null),
        api.getCaptainSectionStats(assignedBatch, assignedSection).catch(() => null),
        api.getCaptainSectionLeaves(assignedBatch, assignedSection).catch(() => null),
      ]);

      if (rosterRes?.roster) {
        setRoster(
          rosterRes.roster.map((r) => ({
            studentId: r.studentId,
            rollNumber: r.rollNumber,
            fullName: r.fullName,
            group: r.group,
            phoneNumber: r.phoneNumber,
            email: r.email,
            role: r.role,
            status: (r.status as AttendanceStatus) || 'Present',
            isMarked: r.isMarked,
            studentsNote: r.studentsNote || '',
            captainsNote: r.captainsNote || r.remarks || '',
            remarks: r.captainsNote || r.remarks || '',
          }))
        );
      }

      if (statsRes) setStats(statsRes);
      if (leavesRes?.leaves) setLeaves(leavesRes.leaves);
    } catch (err: any) {
      console.error('Error loading captain portal data:', err);
      setSaveError(err.message || 'Failed to fetch section records from database.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, assignedBatch, assignedSection]);

  useEffect(() => {
    fetchCaptainData();
  }, [fetchCaptainData]);

  const handleChangeRosterStatus = (studentId: string, status: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const handleChangeRosterRemarks = (studentId: string, remarks: string) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? { ...item, remarks, captainsNote: remarks }
          : item
      )
    );
  };

  const handleBulkSetStatus = (status: AttendanceStatus) => {
    setRoster((prev) => prev.map((item) => ({ ...item, status })));
  };

  const handleSaveAttendance = async () => {
    if (roster.length === 0) return;
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      const recordsToSave = roster.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        remarks: r.remarks,
      }));

      const res = await api.saveCaptainAttendance(
        assignedBatch,
        assignedSection,
        selectedDate,
        recordsToSave
      );

      if (res.success) {
        setSaveSuccess(`Attendance for ${selectedDate} saved and certified successfully.`);
        await fetchCaptainData();
        setTimeout(() => setSaveSuccess(null), 5000);
      } else {
        setSaveError('Failed to certify section attendance.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error occurred while saving attendance.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStudentApproval = async (id: string, approval: ApprovalStatus) => {
    return api.updateStudentApproval(id, approval);
  };

  return (
    <div className="min-h-screen bg-sky-50/40 text-slate-900 font-sans antialiased relative pb-16">
      {/* Light Sky Blue Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <CaptainNavbar
          assignedBatch={assignedBatch}
          assignedSection={assignedSection}
          todayMarked={stats?.todayMarked}
        />

        <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <Routes>
            <Route
              path="/"
              element={
                <CaptainRollCallView
                  assignedBatch={assignedBatch}
                  assignedSection={assignedSection}
                  selectedDate={selectedDate}
                  onChangeDate={setSelectedDate}
                  roster={roster}
                  onChangeRosterStatus={handleChangeRosterStatus}
                  onChangeRosterRemarks={handleChangeRosterRemarks}
                  onBulkSetStatus={handleBulkSetStatus}
                  onSaveAttendance={handleSaveAttendance}
                  saving={saving}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                  loading={loading}
                />
              }
            />
            <Route
              path="/roster"
              element={
                <CaptainRosterView
                  assignedBatch={assignedBatch}
                  assignedSection={assignedSection}
                  onSelectStudentForModal={(student) => setSelectedStudentForModal(student)}
                />
              }
            />
            <Route
              path="/leaves"
              element={
                <CaptainLeavesView
                  assignedBatch={assignedBatch}
                  assignedSection={assignedSection}
                  leaves={leaves}
                  loading={loading}
                  onRefresh={fetchCaptainData}
                />
              }
            />
            <Route
              path="/profile"
              element={<CaptainMyProfileView />}
            />
            <Route path="*" element={<Navigate to="/captain" replace />} />
          </Routes>
        </main>
      </div>

      {/* Student Profile & Approval Modal for Captain */}
      {selectedStudentForModal && (
        <CaptainUserProfileModal
          user={selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          onUpdateApproval={handleUpdateStudentApproval}
          onUserModified={() => fetchCaptainData()}
        />
      )}
    </div>
  );
};

