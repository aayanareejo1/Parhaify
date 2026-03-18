import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6'
];

const sampleCourses = [
  { id: '1', code: 'CPS406', name: 'Software Engineering', color: '#6366f1', instructor: 'Dr. Smith', credits: 3 },
  { id: '2', code: 'MTH110', name: 'Calculus I', color: '#ec4899', instructor: 'Dr. Lee', credits: 3 },
  { id: '3', code: 'CPS305', name: 'Data Structures', color: '#22c55e', instructor: 'Dr. Patel', credits: 3 },
];

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const sampleAssignments = [
  { id: '1', title: 'Lab Report #3', courseId: '1', type: 'Lab', dueDate: fmt(addDays(today, 1)), dueTime: '23:59', priority: 'High', status: 'In Progress', notes: '' },
  { id: '2', title: 'Midterm Exam', courseId: '2', type: 'Exam', dueDate: fmt(addDays(today, 3)), dueTime: '14:00', priority: 'High', status: 'Not Started', notes: '' },
  { id: '3', title: 'Assignment 2', courseId: '3', type: 'Assignment', dueDate: fmt(addDays(today, 5)), dueTime: '23:59', priority: 'Medium', status: 'Not Started', notes: '' },
  { id: '4', title: 'Reading: Ch. 5-6', courseId: '1', type: 'Reading', dueDate: fmt(today), dueTime: '23:59', priority: 'Low', status: 'Not Started', notes: '' },
  { id: '5', title: 'Quiz 3', courseId: '2', type: 'Quiz', dueDate: fmt(addDays(today, -1)), dueTime: '10:00', priority: 'Medium', status: 'Completed', notes: '' },
  { id: '6', title: 'Project Milestone 1', courseId: '3', type: 'Assignment', dueDate: fmt(addDays(today, 2)), dueTime: '23:59', priority: 'High', status: 'Not Started', notes: '' },
];

const sampleNotes = [
  { id: '1', title: 'Lecture 5 Notes', courseId: '1', content: 'Software design patterns: MVC, Observer, Factory...\n\nKey points:\n- Separation of concerns\n- DRY principle\n- SOLID principles', updatedAt: new Date().toISOString() },
  { id: '2', title: 'Derivatives Cheatsheet', courseId: '2', content: 'Power rule: d/dx[x^n] = nx^(n-1)\nChain rule: d/dx[f\'(g(x))] = f\'(g(x)) * g\'(x)', updatedAt: new Date().toISOString() },
];

const sampleTimeBlocks = [
  { id: '1', title: 'CPS406 Study', courseId: '1', startTime: '09:00', endTime: '10:30', date: fmt(today), color: '#6366f1' },
  { id: '2', title: 'MTH110 Practice', courseId: '2', startTime: '13:00', endTime: '14:00', date: fmt(today), color: '#ec4899' },
];

const sampleStudyLogs = [
  { id: '1', courseId: '1', date: fmt(addDays(today, -1)), hours: 2, notes: 'Reviewed design patterns' },
  { id: '2', courseId: '2', date: fmt(addDays(today, -1)), hours: 1.5, notes: 'Practice problems ch4' },
  { id: '3', courseId: '3', date: fmt(addDays(today, -2)), hours: 1, notes: 'Linked list implementation' },
];

const sampleClubs = [
  { id: 'c1', name: 'Google Developer Student Club', shortName: 'GDSC', color: '#06b6d4', role: 'Member', description: 'Tech community club' },
  { id: 'c2', name: 'Computer Science Society', shortName: 'CSS', color: '#8b5cf6', role: 'VP Events', description: 'CS student society' },
];

const sampleClubTasks = [
  { id: 'ct1', clubId: 'c1', title: 'Prepare workshop slides', dueDate: fmt(addDays(today, 4)), dueTime: '18:00', priority: 'High', status: 'Not Started', notes: '' },
  { id: 'ct2', clubId: 'c2', title: 'Send event invites', dueDate: fmt(addDays(today, 2)), dueTime: '12:00', priority: 'Medium', status: 'Not Started', notes: '' },
];

const sampleMeetings = [
  { id: 'm1', clubId: 'c1', title: 'Weekly Sync', date: fmt(addDays(today, -3)), time: '18:00', location: 'ENG 103', attendees: 'Alex, Sam, Jordan, Taylor', agenda: 'Project updates, upcoming hackathon planning', noteId: 'mn1' },
];

const sampleMeetingNotes = [
  { id: 'mn1', title: 'GDSC Weekly Sync — Meeting Notes', clubId: 'c1', content: 'Attendees: Alex, Sam, Jordan, Taylor\n\nAgenda:\n- Project updates\n- Upcoming hackathon planning\n\nNotes:\n- Hackathon is March 28, need 3 more volunteers\n- Next meeting same time next week', updatedAt: new Date().toISOString(), isMeetingNote: true },
];

export function AppProvider({ children }) {
  const [user] = useState({ name: 'Alex Johnson', email: 'alex@example.com', avatar: 'AJ' });
  const [courses, setCourses] = useState(sampleCourses);
  const [assignments, setAssignments] = useState(sampleAssignments);
  const [notes, setNotes] = useState(sampleNotes);
  const [timeBlocks, setTimeBlocks] = useState(sampleTimeBlocks);
  const [studyPrompts, setStudyPrompts] = useState([]);
  const [studyLogs, setStudyLogs] = useState(sampleStudyLogs);
  const [reflections, setReflections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clubs, setClubs] = useState(sampleClubs);
  const [clubTasks, setClubTasks] = useState(sampleClubTasks);
  const [meetings, setMeetings] = useState(sampleMeetings);
  const [meetingNotes, setMeetingNotes] = useState(sampleMeetingNotes);

  useEffect(() => {
    const notifs = [];
    assignments.forEach(a => {
      if (a.status === 'Completed') return;
      const due = new Date(a.dueDate + 'T' + a.dueTime);
      const diff = (due - new Date()) / (1000 * 60 * 60);
      if (diff > 0 && diff <= 24) notifs.push({ id: a.id, message: `"${a.title}" due in ${Math.round(diff)}h`, read: false });
    });
    clubTasks.forEach(t => {
      if (t.status === 'Completed') return;
      const due = new Date(t.dueDate + 'T' + t.dueTime);
      const diff = (due - new Date()) / (1000 * 60 * 60);
      if (diff > 0 && diff <= 24) notifs.push({ id: 'club-' + t.id, message: `Club task "${t.title}" due in ${Math.round(diff)}h`, read: false });
    });
    setNotifications(notifs);
  }, [assignments, clubTasks]);

  // Courses
  const addCourse = (c) => setCourses(p => [...p, { ...c, id: Date.now().toString(), color: c.color || COLORS[Math.floor(Math.random()*COLORS.length)] }]);
  const updateCourse = (id, data) => setCourses(p => p.map(c => c.id === id ? { ...c, ...data } : c));
  const deleteCourse = (id) => setCourses(p => p.filter(c => c.id !== id));

  // Assignments
  const addAssignment = (a) => setAssignments(p => [...p, { ...a, id: Date.now().toString(), status: a.status || 'Not Started' }]);
  const updateAssignment = (id, data) => setAssignments(p => p.map(a => a.id === id ? { ...a, ...data } : a));
  const deleteAssignment = (id) => setAssignments(p => p.filter(a => a.id !== id));

  // Notes
  const addNote = (n) => setNotes(p => [...p, { ...n, id: Date.now().toString(), updatedAt: new Date().toISOString() }]);
  const updateNote = (id, data) => setNotes(p => p.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n));
  const deleteNote = (id) => setNotes(p => p.filter(n => n.id !== id));

  // Time blocks
  const addTimeBlock = (b) => setTimeBlocks(p => [...p, { ...b, id: Date.now().toString() }]);
  const deleteTimeBlock = (id) => setTimeBlocks(p => p.filter(b => b.id !== id));

  // Study prompts
  const addStudyPrompt = (p) => setStudyPrompts(prev => [{ ...p, id: Date.now().toString(), savedAt: new Date().toISOString() }, ...prev]);
  const deleteStudyPrompt = (id) => setStudyPrompts(p => p.filter(s => s.id !== id));

  // Study logs
  const addStudyLog = (l) => setStudyLogs(p => [...p, { ...l, id: Date.now().toString() }]);
  const deleteStudyLog = (id) => setStudyLogs(p => p.filter(l => l.id !== id));

  // Reflections
  const addReflection = (r) => setReflections(p => [{ ...r, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...p]);
  const deleteReflection = (id) => setReflections(p => p.filter(r => r.id !== id));

  // Clubs
  const addClub = (c) => setClubs(p => [...p, { ...c, id: 'c' + Date.now(), color: c.color || COLORS[Math.floor(Math.random()*COLORS.length)] }]);
  const updateClub = (id, data) => setClubs(p => p.map(c => c.id === id ? { ...c, ...data } : c));
  const deleteClub = (id) => {
    setClubs(p => p.filter(c => c.id !== id));
    setClubTasks(p => p.filter(t => t.clubId !== id));
    setMeetings(p => p.filter(m => m.clubId !== id));
  };

  // Club tasks
  const addClubTask = (t) => setClubTasks(p => [...p, { ...t, id: 'ct' + Date.now(), status: t.status || 'Not Started' }]);
  const updateClubTask = (id, data) => setClubTasks(p => p.map(t => t.id === id ? { ...t, ...data } : t));
  const deleteClubTask = (id) => setClubTasks(p => p.filter(t => t.id !== id));

  // Meetings — auto-creates a note in meetingNotes
  const addMeeting = (m) => {
    const noteId = 'mn' + Date.now();
    const club = clubs.find(c => c.id === m.clubId);
    const noteContent = `Club: ${club?.name || 'Unknown'}\nDate: ${m.date} at ${m.time}\nLocation: ${m.location || 'TBD'}\nAttendees: ${m.attendees || 'N/A'}\n\nAgenda:\n${m.agenda || '—'}\n\nMeeting Notes:\n`;
    const newNote = { id: noteId, title: `${club?.shortName || 'Club'} — ${m.title} (${m.date})`, clubId: m.clubId, content: noteContent, updatedAt: new Date().toISOString(), isMeetingNote: true };
    setMeetingNotes(p => [newNote, ...p]);
    setMeetings(p => [...p, { ...m, id: 'm' + Date.now(), noteId }]);
    return noteId;
  };
  const deleteMeeting = (id) => {
    const meeting = meetings.find(m => m.id === id);
    if (meeting?.noteId) setMeetingNotes(p => p.filter(n => n.id !== meeting.noteId));
    setMeetings(p => p.filter(m => m.id !== id));
  };
  const updateMeetingNote = (id, data) => setMeetingNotes(p => p.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n));

  const markNotificationRead = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <AppContext.Provider value={{
      user, courses, assignments, notes, timeBlocks, studyPrompts,
      studyLogs, reflections, notifications, COLORS,
      clubs, clubTasks, meetings, meetingNotes,
      addCourse, updateCourse, deleteCourse,
      addAssignment, updateAssignment, deleteAssignment,
      addNote, updateNote, deleteNote,
      addTimeBlock, deleteTimeBlock,
      addStudyPrompt, deleteStudyPrompt,
      addStudyLog, deleteStudyLog,
      addReflection, deleteReflection,
      addClub, updateClub, deleteClub,
      addClubTask, updateClubTask, deleteClubTask,
      addMeeting, deleteMeeting, updateMeetingNote,
      markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
