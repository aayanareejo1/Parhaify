// Fall 2026 term data, built from the course outlines Aayan uploaded:
// CMF_CPS633FALL2026.pdf, cps393_course_outline_f2026.pdf,
// CPS510-Course-Outline-F26.pdf, pcs110-outline-f26.pdf, and the
// CPS721 Course Management Form (cs.ryerson.ca/~mes/courses/cps721).
//
// Some dates are only given as "week of X" in the outlines rather than an
// exact day. Those are set to a placeholder day in that week and flagged
// "confirm on D2L" in the notes so they don't get treated as certain.
// Final exam dates are TBA in every outline and are left out entirely.

export const FALL_2026_COURSES = [
  {
    code: 'CPS633',
    name: 'Computer Security',
    instructor: 'Dr. Isaac Woungang',
    color: '#ec4899',
    credits: null,
  },
  {
    code: 'CPS393',
    name: 'Systems Programming (Unix, C)',
    instructor: 'Alex Ufkes',
    color: '#f97316',
    credits: null,
  },
  {
    code: 'CPS510',
    name: 'Database Systems I',
    instructor: 'Dr. Abhari or Dr. Tajali (confirm your section)',
    color: '#3b82f6',
    credits: null,
  },
  {
    code: 'PCS110',
    name: 'Physics',
    instructor: 'Catherine Beauchemin',
    color: '#22c55e',
    credits: null,
  },
  {
    code: 'CPS721',
    name: 'Intro to Artificial Intelligence',
    instructor: 'Prof. Soutchanski or Prof. Valenzano (confirm your section)',
    color: '#8b5cf6',
    credits: null,
  },
];

// type must be one of: Assignment, Quiz, Lab, Exam, Reading, Other
export const FALL_2026_ASSIGNMENTS = [
  // ── CPS633 Computer Security ─────────────────────────────────────────
  { courseCode: 'CPS633', title: 'Lab 2: Secret Key Encryption', type: 'Lab', dueDate: '2026-10-09', dueTime: '23:59', priority: 'Medium', notes: 'SEED lab, week of Oct 5. Confirm exact due date on D2L.' },
  { courseCode: 'CPS633', title: 'Lab 3: PKI', type: 'Lab', dueDate: '2026-10-23', dueTime: '23:59', priority: 'Medium', notes: 'SEED lab, week of Oct 19. Confirm exact due date on D2L.' },
  { courseCode: 'CPS633', title: 'Lab 4: RSA', type: 'Lab', dueDate: '2026-10-30', dueTime: '23:59', priority: 'Medium', notes: 'SEED lab, week of Oct 26. Confirm exact due date on D2L.' },
  { courseCode: 'CPS633', title: 'Midterm', type: 'Exam', dueDate: '2026-11-16', dueTime: '11:00', priority: 'High', notes: 'Mon Nov 16 for sections 1-5, Tue Nov 17 for sections 6-11. Confirm your section.' },
  { courseCode: 'CPS633', title: 'Lab 5: Buffer Overflow', type: 'Lab', dueDate: '2026-11-06', dueTime: '23:59', priority: 'Medium', notes: 'SEED lab, week of Nov 2. Confirm exact due date on D2L.' },
  { courseCode: 'CPS633', title: 'Lab 6: Packet Sniffing and Spoofing', type: 'Lab', dueDate: '2026-11-13', dueTime: '23:59', priority: 'Medium', notes: 'SEED lab, week of Nov 9. Confirm exact due date on D2L.' },
  { courseCode: 'CPS633', title: 'Lab 7: VPN Tunneling', type: 'Lab', dueDate: '2026-11-27', dueTime: '23:59', priority: 'Medium', notes: 'SEED lab, week of Nov 23. Confirm exact due date on D2L.' },
  { courseCode: 'CPS633', title: 'Lab 8: Firewall Evasion', type: 'Lab', dueDate: '2026-12-04', dueTime: '23:59', priority: 'Medium', notes: 'SEED lab, week of Nov 30. Confirm exact due date on D2L.' },

  // ── CPS393 Systems Programming ───────────────────────────────────────
  { courseCode: 'CPS393', title: 'Midterm 1 (Linux and Bash)', type: 'Exam', dueDate: '2026-10-20', dueTime: '23:59', priority: 'High', notes: 'Practical exam on lab computers, week of Oct 19. Exact date and time TBA, confirm on D2L.' },
  { courseCode: 'CPS393', title: 'Midterm 2 (C programming)', type: 'Exam', dueDate: '2026-11-24', dueTime: '23:59', priority: 'High', notes: 'Practical exam on lab computers, week of Nov 23. Exact date and time TBA, confirm on D2L.' },

  // ── CPS510 Database Systems I ────────────────────────────────────────
  { courseCode: 'CPS510', title: 'Assignment 3: Schema Design in Oracle', type: 'Assignment', dueDate: '2026-09-30', dueTime: '23:59', priority: 'High', notes: 'Source code due before your lab this week.' },
  { courseCode: 'CPS510', title: 'Assignment 4 Part 1: Simple Queries', type: 'Assignment', dueDate: '2026-10-09', dueTime: '23:59', priority: 'Medium', notes: '7 to 8 simple queries, week of Oct 5. Confirm exact due date on D2L.' },
  { courseCode: 'CPS510', title: 'Assignment 4 Part 2: Views and Queries', type: 'Assignment', dueDate: '2026-10-23', dueTime: '23:59', priority: 'Medium', notes: 'Week of Oct 19. Confirm exact due date on D2L.' },
  { courseCode: 'CPS510', title: 'Midterm', type: 'Exam', dueDate: '2026-10-31', dueTime: '11:00', priority: 'High', notes: 'Listed as tentative for Sat Oct 31, same day as the CPS721 midterm. This is unconfirmed, email your instructor to check for a conflict.' },
  { courseCode: 'CPS510', title: 'Assignment 5: Unix Shell Demo', type: 'Assignment', dueDate: '2026-10-30', dueTime: '23:59', priority: 'Medium', notes: 'Week of Oct 26. Confirm exact due date on D2L.' },
  { courseCode: 'CPS510', title: 'Assignment 6: Functional Dependencies', type: 'Assignment', dueDate: '2026-11-06', dueTime: '23:59', priority: 'Medium', notes: 'Week of Nov 2. Confirm exact due date on D2L.' },
  { courseCode: 'CPS510', title: 'Assignment 7: 3NF', type: 'Assignment', dueDate: '2026-11-13', dueTime: '23:59', priority: 'Medium', notes: 'Week of Nov 9. Confirm exact due date on D2L.' },
  { courseCode: 'CPS510', title: 'Assignment 8: BCNF', type: 'Assignment', dueDate: '2026-11-20', dueTime: '23:59', priority: 'Medium', notes: 'Week of Nov 16. Confirm exact due date on D2L.' },
  { courseCode: 'CPS510', title: 'Assignment 9: Project Demo', type: 'Assignment', dueDate: '2026-11-27', dueTime: '23:59', priority: 'High', notes: 'Oral evaluation in lab, roughly 30 percent of the assignment mark. Week of Nov 23, confirm exact date on D2L.' },
  { courseCode: 'CPS510', title: 'Assignment 10: Final Documentation Binder', type: 'Assignment', dueDate: '2026-12-04', dueTime: '23:59', priority: 'Medium', notes: 'Last lab of term, week of Nov 30. Confirm exact due date on D2L.' },

  // ── PCS110 Physics ───────────────────────────────────────────────────
  { courseCode: 'PCS110', title: 'HW-4', type: 'Assignment', dueDate: '2026-10-04', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'PCS110', title: 'HW-5', type: 'Assignment', dueDate: '2026-10-18', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'PCS110', title: 'HW-6', type: 'Assignment', dueDate: '2026-10-25', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'PCS110', title: 'Midterm', type: 'Exam', dueDate: '2026-10-26', dueTime: '23:59', priority: 'High', notes: 'About 80 minutes, closed book with a formula sheet provided. Confirm exact start time on D2L.' },
  { courseCode: 'PCS110', title: 'HW-7', type: 'Assignment', dueDate: '2026-11-01', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'PCS110', title: 'HW-8', type: 'Assignment', dueDate: '2026-11-08', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'PCS110', title: 'HW-9', type: 'Assignment', dueDate: '2026-11-15', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'PCS110', title: 'Last day to drop without academic penalty', type: 'Other', dueDate: '2026-11-20', dueTime: '23:59', priority: 'Low', notes: 'Not an assignment, a deadline to be aware of.' },
  { courseCode: 'PCS110', title: 'HW-10', type: 'Assignment', dueDate: '2026-11-22', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'PCS110', title: 'HW-11', type: 'Assignment', dueDate: '2026-11-29', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'PCS110', title: 'HW-12', type: 'Assignment', dueDate: '2026-12-06', dueTime: '23:59', priority: 'Medium', notes: '' },

  // ── CPS721 Intro to AI ───────────────────────────────────────────────
  { courseCode: 'CPS721', title: 'Assignment 1', type: 'Assignment', dueDate: '2026-10-01', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'CPS721', title: 'Assignment 2', type: 'Assignment', dueDate: '2026-10-15', dueTime: '23:59', priority: 'Medium', notes: 'Due during study week.' },
  { courseCode: 'CPS721', title: 'Assignment 3', type: 'Assignment', dueDate: '2026-10-29', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'CPS721', title: 'Midterm', type: 'Exam', dueDate: '2026-10-31', dueTime: '11:00', priority: 'High', notes: '100 minutes, room TBA. Same day as the CPS510 midterm is tentatively scheduled, watch D2L for changes.' },
  { courseCode: 'CPS721', title: 'Assignment 4', type: 'Assignment', dueDate: '2026-11-19', dueTime: '23:59', priority: 'Medium', notes: '' },
  { courseCode: 'CPS721', title: 'Assignment 5', type: 'Assignment', dueDate: '2026-11-30', dueTime: '23:59', priority: 'Medium', notes: '' },
];
