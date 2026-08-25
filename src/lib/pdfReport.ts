import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User, AttendanceRecord, LeaveRequest } from '../types';

interface GenerateReportOptions {
  user: User | null;
  selectedMonth: string; // e.g. "2026-08" or "All"
  records: AttendanceRecord[];
  leaves: LeaveRequest[];
}

export function generateMonthlyAttendancePDF({
  user,
  selectedMonth,
  records,
  leaves,
}: GenerateReportOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor: [number, number, number] = [5, 150, 105]; // Emerald green
  const navyColor: [number, number, number] = [15, 23, 42]; // Navy dark slate

  // 1. Header Banner - BANGLADESH NAVY COLLEGE, CHITTAGONG
  doc.setFillColor(15, 23, 42); // Navy background header
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Decorative Accent line
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 32, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('BANGLADESH NAVY COLLEGE, CHITTAGONG', pageWidth / 2, 11, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Sailor Colony, New Mooring, Chattogram | Official Attendance & Leave Ledger', pageWidth / 2, 17, { align: 'center' });

  // Month label format
  let monthLabel = 'Complete Historical Log';
  if (selectedMonth && selectedMonth !== 'All') {
    try {
      const [year, month] = selectedMonth.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      monthLabel = selectedMonth;
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(52, 211, 153);
  doc.text(`MONTHLY AUDIT REPORT: ${monthLabel.toUpperCase()}`, pageWidth / 2, 25, { align: 'center' });

  let currentY = 40;

  // 2. Student Details Box (Width = 186mm from x=12 to x=198)
  const cardHeight = 32;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, currentY, pageWidth - 24, cardHeight, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('STUDENT INFORMATION & ACADEMIC PROFILE', 17, currentY + 6.5);

  // Separator line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(16, currentY + 9.5, pageWidth - 16, currentY + 9.5);

  const studentName = user?.fullName || 'N/A';
  const rollNo = user?.rollNumber || 'N/A';
  const batchSection = `${user?.batch || 'HSC'} - Section ${user?.section || 'A'}`;
  const group = user?.group || 'Science';
  const email = user?.email || 'N/A';
  const reportDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(8.5);

  // Left Column (Label at x=17, Value at x=42)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Student Name:', 17, currentY + 15);
  doc.setTextColor(15, 23, 42);
  doc.text(studentName, 42, currentY + 15);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Roll Number:', 17, currentY + 21);
  doc.setTextColor(15, 23, 42);
  doc.text(rollNo, 42, currentY + 21);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Email Address:', 17, currentY + 27);
  doc.setTextColor(15, 23, 42);
  doc.text(email, 42, currentY + 27);

  // Right Column (Label at x=110, Value at x=142)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Batch & Section:', 110, currentY + 15);
  doc.setTextColor(15, 23, 42);
  doc.text(batchSection, 142, currentY + 15);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Academic Group:', 110, currentY + 21);
  doc.setTextColor(15, 23, 42);
  doc.text(group, 142, currentY + 21);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Report Issued:', 110, currentY + 27);
  doc.setTextColor(15, 23, 42);
  doc.text(reportDate, 142, currentY + 27);

  currentY += cardHeight + 6;

  // 3. Attendance Statistics Summary Cards (5 Equal Segments)
  const filteredRecords = selectedMonth === 'All'
    ? records
    : records.filter((r) => r.date && r.date.startsWith(selectedMonth));

  const totalDays = filteredRecords.length;
  const presentDays = filteredRecords.filter((r) => String(r.status).toLowerCase() === 'present').length;
  const absentDays = filteredRecords.filter((r) => String(r.status).toLowerCase() === 'absent').length;
  const leaveDays = filteredRecords.filter((r) => ['leave', 'excused', 'late'].includes(String(r.status).toLowerCase())).length;
  const rate = totalDays > 0 ? Math.round(((presentDays + leaveDays) / totalDays) * 100) : 0;

  const kpiHeight = 18;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(12, currentY, pageWidth - 24, kpiHeight, 3, 3, 'FD');

  const colWidth = (pageWidth - 24) / 5;
  const kpiData = [
    { label: 'TOTAL DAYS', value: `${totalDays}` },
    { label: 'PRESENT', value: `${presentDays}` },
    { label: 'ABSENT', value: `${absentDays}` },
    { label: 'LEAVE / LATE', value: `${leaveDays}` },
    { label: 'ATTENDANCE', value: `${rate}%` },
  ];

  kpiData.forEach((kpi, idx) => {
    const colLeft = 12 + idx * colWidth;
    const colCenter = colLeft + colWidth / 2;

    // Draw vertical divider between columns
    if (idx > 0) {
      doc.setDrawColor(167, 243, 208);
      doc.setLineWidth(0.3);
      doc.line(colLeft, currentY + 3, colLeft, currentY + kpiHeight - 3);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(4, 120, 87);
    doc.text(kpi.label, colCenter, currentY + 6.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(6, 78, 59);
    doc.text(kpi.value, colCenter, currentY + 13.5, { align: 'center' });
  });

  currentY += kpiHeight + 8;

  // 4. Daily Attendance Ledger Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Daily Attendance Ledger', 12, currentY);

  currentY += 4;

  const attendanceTableHead = [['Date & Day', 'Status', 'Session Remarks / Cause', 'Certified By', 'Timestamp']];
  const attendanceTableBody = filteredRecords.map((r) => {
    let dayOfWeek = '';
    try {
      const d = new Date(r.date);
      if (!isNaN(d.getTime())) {
        dayOfWeek = ` (${d.toLocaleDateString('en-US', { weekday: 'short' })})`;
      }
    } catch {
      // ignore
    }

    const st = String(r.status).toUpperCase();
    const remarksText = r.remarks || 'No remarks recorded';
    const certifiedBy = r.markedBy?.name ? `${r.markedBy.name} (${r.markedBy.role})` : 'Class Captain';
    const timeStr = r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

    return [`${r.date}${dayOfWeek}`, st, remarksText, certifiedBy, timeStr];
  });

  autoTable(doc, {
    startY: currentY,
    head: attendanceTableHead,
    body: attendanceTableBody.length > 0 ? attendanceTableBody : [['-', 'No Records', 'No attendance logs for this period', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 32, halign: 'left' },
      1: { cellWidth: 22, fontStyle: 'bold', halign: 'center' },
      2: { cellWidth: 72, halign: 'left' },
      3: { cellWidth: 38, halign: 'left' },
      4: { cellWidth: 22, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'head') {
        if (data.column.index === 1 || data.column.index === 4) {
          data.cell.styles.halign = 'center';
        }
      }
      if (data.section === 'body' && data.column.index === 1) {
        const val = String(data.cell.raw);
        if (val === 'PRESENT') {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (val === 'ABSENT') {
          data.cell.styles.textColor = [225, 29, 72];
        } else {
          data.cell.styles.textColor = [217, 119, 6];
        }
      }
    },
    margin: { left: 12, right: 12 },
  });

  // Get Y position after attendance table
  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 30;
  let leaveY = finalY + 10;

  // Check if we need a new page for Leave Table
  if (leaveY > 230) {
    doc.addPage();
    leaveY = 25;
  }

  // 5. Leave Applications Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Monthly Leave Applications & Approvals', 12, leaveY);

  leaveY += 4;

  const filteredLeaves = selectedMonth === 'All'
    ? leaves
    : leaves.filter((lv) => lv.startDate && lv.startDate.startsWith(selectedMonth));

  const leaveTableHead = [['Leave Type', 'Period / Days', 'Reason / Cause', 'Status', 'Approved / Reviewed By', 'Review Note']];
  const leaveTableBody = filteredLeaves.map((lv) => {
    const periodStr = `${lv.startDate} to ${lv.endDate} (${lv.daysCount}d)`;
    const statusText = String(lv.status).toUpperCase();
    const approvedBy = lv.reviewedBy
      ? `${lv.reviewedBy.name} (${lv.reviewedBy.role})`
      : 'Pending Review';
    const noteText = lv.reviewNote || (lv.status === 'Approved' ? 'Approved by authority' : 'Under evaluation');

    return [
      lv.leaveType || 'General',
      periodStr,
      lv.reason || 'No cause specified',
      statusText,
      approvedBy,
      noteText,
    ];
  });

  autoTable(doc, {
    startY: leaveY,
    head: leaveTableHead,
    body: leaveTableBody.length > 0 ? leaveTableBody : [['-', '-', 'No leave applications filed for this month', 'N/A', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: navyColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold', halign: 'left' },
      1: { cellWidth: 36, halign: 'left' },
      2: { cellWidth: 46, halign: 'left' },
      3: { cellWidth: 22, fontStyle: 'bold', halign: 'center' },
      4: { cellWidth: 32, halign: 'left' },
      5: { cellWidth: 26, halign: 'left' },
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index === 3) {
        data.cell.styles.halign = 'center';
      }
      if (data.section === 'body' && data.column.index === 3) {
        const val = String(data.cell.raw);
        if (val === 'APPROVED') {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (val === 'REJECTED') {
          data.cell.styles.textColor = [225, 29, 72];
        } else {
          data.cell.styles.textColor = [217, 119, 6];
        }
      }
    },
    margin: { left: 12, right: 12 },
  });

  const sigStartY = (doc as any).lastAutoTable?.finalY || leaveY + 30;

  // 6. Signatures & Official Stamp Footer
  let sigY = sigStartY + 22;
  if (sigY > 260) {
    doc.addPage();
    sigY = 45;
  }

  doc.setLineWidth(0.3);
  doc.setDrawColor(148, 163, 184);

  // Left signature (Class Captain) - 60mm width line centered at x=46
  doc.line(16, sigY, 76, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Class Captain Signature', 46, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Bangladesh Navy College, Chittagong', 46, sigY + 9, { align: 'center' });

  // Right signature (Dean / Principal) - 60mm width line centered at x=164
  doc.line(pageWidth - 76, sigY, pageWidth - 16, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Academic Head / Principal Signature', 164, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Bangladesh Navy College, Chittagong', 164, sigY + 9, { align: 'center' });

  // 7. Page Numbers and Document Footer on All Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Official Computer-Generated Monthly Audit Ledger | Bangladesh Navy College, Chittagong',
      12,
      287
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 12, 287, { align: 'right' });
  }

  // Save the PDF file
  const fileNameStr = selectedMonth && selectedMonth !== 'All' ? selectedMonth : 'Historical';
  const cleanStudentName = (user?.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`BNC_Chittagong_Attendance_Report_${cleanStudentName}_${fileNameStr}.pdf`);
}

