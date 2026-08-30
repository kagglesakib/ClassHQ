import { jsPDF } from 'jspdf';
import { Student, Activity, Exam } from '../types';

// ---- Professional Institution Color Palette ----
const INK: [number, number, number] = [25, 35, 48];            // #192330 - Deep slate for high-contrast legible text
const PARCHMENT: [number, number, number] = [248, 244, 235];   // #F8F4EB - Light warm elegant white
const PARCHMENT_ROW: [number, number, number] = [252, 250, 244]; // Lighter zebra row
const HEADER_BG: [number, number, number] = [228, 218, 198];    // #E4DCC6 - Visibly distinct, elegant light header background
const BRASS: [number, number, number] = [135, 100, 30];         // #87641E - Accent brass
const BRIGHT_GREEN: [number, number, number] = [16, 124, 16];   // High-contrast green for positive metrics
const BRIGHT_RED: [number, number, number] = [204, 0, 0];       // High-contrast red for alerts
const HAIRLINE: [number, number, number] = [215, 205, 180];     // #D7CDB4 - Light elegant separators
const MUTED: [number, number, number] = [90, 85, 75];           // Slate-gray for labels/subtexts

export const generatePdfReport = async (
  student: Student,
  activities: Activity[],
  exams: Exam[],
  reportMonth: string,
  setIsGeneratingPdf: (loading: boolean) => void
) => {
  setIsGeneratingPdf(true);
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Filter and sort month data
    const monthActivities = activities.filter(a => a.studentSid === student.sid && a.date.startsWith(reportMonth));
    const monthExams = exams.filter(e => e.studentSid === student.sid && e.date.startsWith(reportMonth));

    monthActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    monthExams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // --- Helpers ---
    const formatDateDMY = (dateStr: string) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}-${month}-${year}`;
      }
      return dateStr;
    };

    const formatMarkWithPercentage = (mark: number | string | undefined | null) => {
      if (mark === undefined || mark === null || mark === '') return '-';
      const num = Number(mark);
      if (isNaN(num)) return `${mark}`;
      return `${num}/10 (${Math.round(num * 10)}%)`;
    };

    const formatMonthName = (monthStr: string) => {
      if (!monthStr || monthStr.length < 7) return monthStr;
      const [year, month] = monthStr.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // Calculate core metrics
    const totalLessons = monthActivities.length;
    const presentLessons = monthActivities.filter(a => a.status === 'Present').length;
    const attendanceRate = totalLessons > 0 ? Math.round((presentLessons / totalLessons) * 100) : 0;

    // Filter out null/undefined/un-graded entries so average is computed ONLY over graded tasks
    const activitiesWithHw = monthActivities.filter(a => a.status === 'Present' && a.hwMarks !== undefined && a.hwMarks !== null);
    const averageHwScore = (() => {
      const validHw = activitiesWithHw.filter(a => !isNaN(Number(a.hwMarks)));
      if (validHw.length === 0) return null;
      const totalHw = validHw.reduce((acc, a) => acc + Number(a.hwMarks), 0);
      return Math.round((totalHw / (validHw.length * 10)) * 100);
    })();

    const activitiesWithCw = monthActivities.filter(a => a.status === 'Present' && a.cwMarks !== undefined && a.cwMarks !== null);
    const averageCwScore = (() => {
      const validCw = activitiesWithCw.filter(a => !isNaN(Number(a.cwMarks)));
      if (validCw.length === 0) return null;
      const totalCw = validCw.reduce((acc, a) => acc + Number(a.cwMarks), 0);
      return Math.round((totalCw / (validCw.length * 10)) * 100);
    })();

    const totalExams = monthExams.length;
    const averageExamScore = (() => {
      const presentWithMarks = monthExams.filter(e => e.status === 'Present' && e.obtainedMarks !== undefined);
      if (presentWithMarks.length === 0) return 0;
      const sumPct = presentWithMarks.reduce((acc, e) => {
        const pct = e.totalMarks > 0 ? (e.obtainedMarks || 0) / e.totalMarks : 0;
        return acc + pct;
      }, 0);
      return Math.round((sumPct / presentWithMarks.length) * 100);
    })();

    const pageHeight = 297;
    const margin = 15;

    let currentY = 33;

    // --- Elegant Minimal Footer & Header Decorations ---
    const drawPageDecorations = (pageNumber: number, totalPagesCount: number) => {
      // Thin header rule for page 2+
      if (pageNumber > 1) {
        doc.setDrawColor(...HAIRLINE);
        doc.setLineWidth(0.3);
        doc.line(15, 18, 195, 18);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...INK);
        doc.text('STUDENT PERFORMANCE REPORT', 15, 14);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...BRASS);
        doc.text(`${student.name} • REF: ${student.sid}`, 195, 14, { align: 'right' });
      }

      // Consistent Bottom Separator and Footer metadata
      doc.setDrawColor(...HAIRLINE);
      doc.setLineWidth(0.3);
      doc.line(15, 276, 195, 276);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`REPORT ID: ${student.sid}-${reportMonth}`, 15, 281);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 105, 281, { align: 'center' });
      doc.text(`Page ${pageNumber} of ${totalPagesCount}`, 195, 281, { align: 'right' });
    };

    const checkNewPage = (neededHeight: number) => {
      const currentPageNum = doc.getNumberOfPages();
      // Page 1 has signature block at y = 242, so limit printable area to 238.
      // Other pages can print up to 270.
      const limit = currentPageNum === 1 ? 238 : 270;
      if (currentY + neededHeight > limit) {
        doc.addPage();
        currentY = 25; // Reset starting position for page 2+ below header rule
      }
    };

    // ================= DYNAMIC MULTI-PAGE LAYOUT =================

    // --- SECTION: Letterhead Banner (Page 1) ---
    doc.setFillColor(254, 253, 251);
    doc.rect(15, 10, 180, 17, 'F');
    doc.setDrawColor(...BRASS);
    doc.setLineWidth(1.0);
    doc.line(15, 27, 195, 27);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...INK);
    doc.text('ACADEMIC PERFORMANCE REPORT', 15, 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...BRASS);
    doc.text(`EVALUATION PERIOD: ${formatMonthName(reportMonth).toUpperCase()}`, 15, 23.5);

    // Case reference number badge
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.4);
    doc.roundedRect(148, 11, 47, 13, 0.5, 0.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text('STUDENT ID', 151, 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(student.sid, 151, 20.5);

    currentY = 33;

    // --- SECTION: Student Profile Summary Table ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text('I. STUDENT PROFILE', 15, currentY);

    currentY += 4;
    doc.setFillColor(...PARCHMENT);
    doc.setDrawColor(...HAIRLINE);
    doc.roundedRect(15, currentY, 180, 23, 0.5, 0.5, 'FD');

    // Text rows inside Student Profile Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);

    // Row 1
    doc.setTextColor(...MUTED);
    doc.text('Full Name:', 18, currentY + 6.5);
    doc.setTextColor(...INK);
    doc.text(student.name || 'N/A', 48, currentY + 6.5);

    doc.setTextColor(...MUTED);
    doc.text('Academic Subject:', 110, currentY + 6.5);
    doc.setTextColor(...INK);
    doc.text(student.subject || 'General Studies', 145, currentY + 6.5);

    // Row 2
    doc.setTextColor(...MUTED);
    doc.text('Institute:', 18, currentY + 12.5);
    doc.setTextColor(...INK);
    let coll = student.college || 'N/A';
    if (coll.length > 35) coll = coll.substring(0, 35) + '...';
    doc.text(coll, 48, currentY + 12.5);

    doc.setTextColor(...MUTED);
    doc.text('Student Group:', 110, currentY + 12.5);
    doc.setTextColor(...INK);
    doc.text(student.group || 'N/A', 145, currentY + 12.5);

    // Row 3
    doc.setTextColor(...MUTED);
    doc.text('HSC Batch:', 18, currentY + 18.5);
    doc.setTextColor(...INK);
    const batchDisplay = (() => {
      const b = student.hscBatch || '';
      if (!b) return 'N/A';
      return b.trim().toUpperCase().startsWith('HSC') ? b : `HSC ${b}`;
    })();
    doc.text(batchDisplay, 48, currentY + 18.5);

    doc.setTextColor(...MUTED);
    doc.text('Contact Number:', 110, currentY + 18.5);
    doc.setTextColor(...INK);
    doc.text(student.mobile || 'N/A', 145, currentY + 18.5);

    currentY += 23 + 6;
    currentY += 5; // Extra spacing before Point II

    // --- SECTION: Guardian At-A-Glance Overview ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text('II. ACADEMIC PERFORMANCE SUMMARY (AT A GLANCE)', 15, currentY);

    currentY += 4;

    const cardW = 41;
    const cardH = 22;
    const gap = 5.3;
    const startX = 15;

    const metrics = [
      {
        label: 'ATTENDANCE',
        value: `${attendanceRate}%`,
        status: attendanceRate >= 80 ? 'Excellent' : 'Needs Focus',
        color: attendanceRate >= 80 ? BRIGHT_GREEN : BRIGHT_RED
      },
      {
        label: 'HOMEWORK AVG',
        value: averageHwScore !== null ? `${averageHwScore}%` : 'N/A',
        status: averageHwScore === null ? 'No Data' : (averageHwScore >= 75 ? 'Satisfactory' : 'Needs Focus'),
        color: averageHwScore === null ? MUTED : (averageHwScore >= 75 ? BRIGHT_GREEN : BRIGHT_RED)
      },
      {
        label: 'CLASSWORK AVG',
        value: averageCwScore !== null ? `${averageCwScore}%` : 'N/A',
        status: averageCwScore === null ? 'No Data' : (averageCwScore >= 75 ? 'Satisfactory' : 'Needs Focus'),
        color: averageCwScore === null ? MUTED : (averageCwScore >= 75 ? BRIGHT_GREEN : BRIGHT_RED)
      },
      {
        label: 'EXAM AVERAGE',
        value: totalExams > 0 ? `${averageExamScore}%` : 'N/A',
        status: totalExams === 0 ? 'No Exams' : (averageExamScore >= 75 ? 'Excellent' : 'Needs Focus'),
        color: totalExams === 0 ? MUTED : (averageExamScore >= 75 ? BRIGHT_GREEN : BRIGHT_RED)
      }
    ];

    metrics.forEach((m, idx) => {
      const x = startX + idx * (cardW + gap);
      doc.setFillColor(...PARCHMENT);
      doc.setDrawColor(...HAIRLINE);
      doc.roundedRect(x, currentY, cardW, cardH, 0.5, 0.5, 'FD');

      // Top label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(m.label, x + 3, currentY + 5);

      // Large numeric value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...INK);
      doc.text(m.value, x + 3, currentY + 12);

      // Status tag (now below the score)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...m.color);
      doc.text(m.status.toUpperCase(), x + 3, currentY + 18);
    });

    currentY += cardH + 6;
    currentY += 5; // Extra spacing before Point III

    // --- SECTION: Class Attendance & Detailed Performance Log (Table) ---
    checkNewPage(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text('III. CLASS ATTENDANCE & DETAILED PERFORMANCE LOG', 15, currentY);

    currentY += 4;

    if (monthActivities.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(...MUTED);
      doc.text('No interactive class lessons recorded for this evaluation cycle.', 15, currentY + 3);
      currentY += 8;
    } else {
      // Table Header
      checkNewPage(15); // Header + at least one row
      doc.setFillColor(...HEADER_BG);
      doc.rect(15, currentY, 180, 7.5, 'F');
      
      doc.setDrawColor(...BRASS);
      doc.setLineWidth(0.45);
      doc.line(15, currentY, 195, currentY);
      doc.line(15, currentY + 7.5, 195, currentY + 7.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text('DATE', 18, currentY + 5.2);
      doc.text('STATUS', 42, currentY + 5.2);
      doc.text('TOPIC / CHAPTER STUDIED', 76, currentY + 5.2);
      doc.text('HOMEWORK', 145, currentY + 5.2);
      doc.text('CLASSWORK', 172, currentY + 5.2);

      currentY += 7.5;

      monthActivities.forEach((act, idx) => {
        checkNewPage(6.6);
        if (idx % 2 === 0) {
          doc.setFillColor(...PARCHMENT_ROW);
          doc.rect(15, currentY, 180, 6.6, 'F');
        }
        doc.setDrawColor(...HAIRLINE);
        doc.setLineWidth(0.15);
        doc.line(15, currentY + 6.6, 195, currentY + 6.6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        doc.text(formatDateDMY(act.date), 18, currentY + 4.8);

        // Status highlight
        if (act.status === 'Present') {
          doc.setTextColor(...BRIGHT_GREEN);
          doc.text('PRESENT', 42, currentY + 4.8);
        } else {
          doc.setTextColor(...BRIGHT_RED);
          doc.text('ABSENT', 42, currentY + 4.8);
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...INK);
        let topic = act.status === 'Absent' ? 'N/A' : (act.subjectTuitioned || 'General Lesson');
        if (topic.length > 45) topic = topic.substring(0, 45) + '...';
        doc.text(topic, 76, currentY + 4.8);

        // Grade values
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...INK);
        doc.text(act.status === 'Absent' ? '-' : formatMarkWithPercentage(act.hwMarks), 145, currentY + 4.8);
        doc.text(act.status === 'Absent' ? '-' : formatMarkWithPercentage(act.cwMarks), 172, currentY + 4.8);

        currentY += 6.6;
      });
      currentY += 5;
    }

    currentY += 5; // Extra spacing before Point IV

    // --- SECTION: Periodic Academic Examinations ---
    checkNewPage(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text('IV. PERIODIC ACADEMIC EXAMINATIONS', 15, currentY);

    currentY += 4;

    if (monthExams.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(...MUTED);
      doc.text('No exams or monthly tests recorded for this student during this cycle.', 15, currentY + 3);
      currentY += 8;
    } else {
      // Table Header
      checkNewPage(15); // Header + at least one row
      doc.setFillColor(...HEADER_BG);
      doc.rect(15, currentY, 180, 7.5, 'F');

      doc.setDrawColor(...BRASS);
      doc.setLineWidth(0.45);
      doc.line(15, currentY, 195, currentY);
      doc.line(15, currentY + 7.5, 195, currentY + 7.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text('DATE', 18, currentY + 5.2);
      doc.text('ATTENDED', 40, currentY + 5.2);
      doc.text('TOPIC / SUBJECT', 66, currentY + 5.2);
      doc.text('TOTAL', 136, currentY + 5.2);
      doc.text('OBTAINED', 154, currentY + 5.2);
      doc.text('SCORE %', 175, currentY + 5.2);

      currentY += 7.5;

      monthExams.forEach((exam, idx) => {
        checkNewPage(6.6);
        if (idx % 2 === 0) {
          doc.setFillColor(...PARCHMENT_ROW);
          doc.rect(15, currentY, 180, 6.6, 'F');
        }
        doc.setDrawColor(...HAIRLINE);
        doc.setLineWidth(0.15);
        doc.line(15, currentY + 6.6, 195, currentY + 6.6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        doc.text(formatDateDMY(exam.date), 18, currentY + 4.8);

        if (exam.status === 'Present') {
          doc.setTextColor(...BRIGHT_GREEN);
          doc.text('ATTENDED', 40, currentY + 4.8);
        } else {
          doc.setTextColor(...BRIGHT_RED);
          doc.text('ABSENT', 40, currentY + 4.8);
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...INK);
        let topic = exam.subjectAndTopic || 'Subjective Assessment';
        if (topic.length > 42) topic = topic.substring(0, 42) + '...';
        doc.text(topic, 66, currentY + 4.8);

        const totalMarks = exam.totalMarks;
        const obtainedMarks = exam.obtainedMarks ?? 0;
        const pct = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;

        doc.setFont('helvetica', 'bold');
        doc.text(exam.status === 'Absent' ? '-' : `${totalMarks}`, 136, currentY + 4.8);
        doc.text(exam.status === 'Absent' ? '-' : `${obtainedMarks}`, 154, currentY + 4.8);

        if (exam.status === 'Present') {
          const scoreColor = pct >= 75 ? BRIGHT_GREEN : pct >= 50 ? BRASS : BRIGHT_RED;
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...scoreColor);
          doc.text(`${pct}%`, 175, currentY + 4.8);
        } else {
          doc.text('-', 175, currentY + 4.8);
        }

        currentY += 6.6;
      });
      currentY += 5;
    }

    // --- SECTION: Parent / Guardian Acknowledgement & Signature block ---
    doc.setPage(1); // ALWAYS draw signature block on the first page
    const sigY = 252;
    doc.setFillColor(...PARCHMENT);
    doc.setDrawColor(...HAIRLINE);
    doc.roundedRect(15, sigY, 180, 22, 0.5, 0.5, 'FD');

    const sigLineY = sigY + 13.5;
    doc.setDrawColor(...BRASS);
    doc.setLineWidth(0.4);
    doc.line(25, sigLineY, 75, sigLineY);
    doc.line(120, sigLineY, 170, sigLineY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text('TEACHERS ACKNOWLEDGEMENT', 25, sigLineY + 4);
    doc.text('GUARDIAN ACKNOWLEDGEMENT', 120, sigLineY + 4);

    // Finalize decorations and layout check on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawPageDecorations(i, totalPages);
    }

    doc.save(`${student.sid}.pdf`);
  } catch (error) {
    console.error('PDF generation failed', error);
  } finally {
    setIsGeneratingPdf(false);
  }
};
