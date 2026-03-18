import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AppContext = createContext();

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6'
];
const SPACE_ICONS = ['💼','🎯','🏋️','✈️','🎨','🔬','💡','📚','🎵','🏠','❤️','⚡'];
const randColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

// ─── DB → App mappers ───────────────────────────────────────────────────────
const fromCourse    = r => ({ id: r.id, code: r.code, name: r.name, color: r.color, instructor: r.instructor, credits: r.credits });
const fromAssign    = r => ({ id: r.id, courseId: r.course_id, title: r.title, type: r.type, dueDate: r.due_date, dueTime: r.due_time, priority: r.priority, status: r.status, notes: r.notes });
const fromNote      = r => ({ id: r.id, courseId: r.course_id, clubId: r.club_id, title: r.title, content: r.content, updatedAt: r.updated_at, isMeetingNote: r.is_meeting_note });
const fromBlock     = r => ({ id: r.id, courseId: r.course_id, title: r.title, date: r.date, startTime: r.start_time, endTime: r.end_time, color: r.color });
const fromLog       = r => ({ id: r.id, courseId: r.course_id, date: r.date, hours: r.hours, notes: r.notes });
const fromPrompt    = r => ({ id: r.id, prompt: r.prompt, outputType: r.output_type, outputTypeLabel: r.output_type_label, courseId: r.course_id, courseName: r.course_name, sourceFile: r.source_file, savedAt: r.saved_at });
const fromReflect   = r => ({ id: r.id, mood: r.mood, wins: r.wins, struggles: r.struggles, notes: r.notes, week: r.week, createdAt: r.created_at });
const fromClub      = r => ({ id: r.id, name: r.name, shortName: r.short_name, color: r.color, role: r.role, description: r.description });
const fromClubTask  = r => ({ id: r.id, clubId: r.club_id, title: r.title, type: r.type, dueDate: r.due_date, dueTime: r.due_time, priority: r.priority, status: r.status, notes: r.notes });
const fromMeeting   = r => ({ id: r.id, clubId: r.club_id, title: r.title, date: r.date, time: r.time, location: r.location, attendees: r.attendees, agenda: r.agenda, noteId: r.note_id });
const fromTask      = r => ({ id: r.id, title: r.title, category: r.category, dueDate: r.due_date, dueTime: r.due_time, priority: r.priority, status: r.status, notes: r.notes, color: r.color });
const fromSpace     = r => ({ id: r.id, name: r.name, icon: r.icon, color: r.color });
const fromSection   = r => ({ id: r.id, spaceId: r.space_id, name: r.name });
const fromSpaceTask = r => ({ id: r.id, spaceId: r.space_id, sectionId: r.section_id, title: r.title, dueDate: r.due_date, dueTime: r.due_time, priority: r.priority, status: r.status, notes: r.notes });

export function AppProvider({ children, userId, userProfile }) {
  const name = userProfile?.user_metadata?.full_name || userProfile?.email?.split('@')[0] || 'User';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const [user] = useState({
    name,
    email: userProfile?.email || '',
    avatar: userProfile?.user_metadata?.avatar_url || null,
    initials,
  });

  const [courses,      setCourses]      = useState([]);
  const [assignments,  setAssignments]  = useState([]);
  const [notes,        setNotes]        = useState([]);
  const [meetingNotes, setMeetingNotes] = useState([]);
  const [timeBlocks,   setTimeBlocks]   = useState([]);
  const [studyLogs,    setStudyLogs]    = useState([]);
  const [studyPrompts, setStudyPrompts] = useState([]);
  const [reflections,  setReflections]  = useState([]);
  const [clubs,        setClubs]        = useState([]);
  const [clubTasks,    setClubTasks]    = useState([]);
  const [meetings,     setMeetings]     = useState([]);
  const [tasks,        setTasks]        = useState([]);
  const [spaces,       setSpaces]       = useState([]);
  const [spaceTasks,   setSpaceTasks]   = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dataLoaded,   setDataLoaded]   = useState(false);

  // ─── Load all data on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const eq = (table) => supabase.from(table).select('*').eq('user_id', userId);
      const [
        { data: coursesD },
        { data: assignsD },
        { data: notesD },
        { data: blocksD },
        { data: logsD },
        { data: promptsD },
        { data: reflectsD },
        { data: clubsD },
        { data: clubTasksD },
        { data: meetingsD },
        { data: tasksD },
        { data: spacesD },
        { data: sectionsD },
        { data: spaceTasksD },
      ] = await Promise.all([
        eq('courses'), eq('assignments'), eq('notes'), eq('time_blocks'),
        eq('study_logs'), eq('study_prompts'), eq('reflections'),
        eq('clubs'), eq('club_tasks'), eq('meetings'), eq('tasks'),
        eq('spaces'), eq('space_sections'), eq('space_tasks'),
      ]);

      setCourses((coursesD || []).map(fromCourse));
      setAssignments((assignsD || []).map(fromAssign));

      const allNotes = (notesD || []).map(fromNote);
      setNotes(allNotes.filter(n => !n.isMeetingNote));
      setMeetingNotes(allNotes.filter(n => n.isMeetingNote));

      setTimeBlocks((blocksD || []).map(fromBlock));
      setStudyLogs((logsD || []).map(fromLog));
      setStudyPrompts((promptsD || []).map(fromPrompt));
      setReflections((reflectsD || []).map(fromReflect));
      setClubs((clubsD || []).map(fromClub));
      setClubTasks((clubTasksD || []).map(fromClubTask));
      setMeetings((meetingsD || []).map(fromMeeting));
      setTasks((tasksD || []).map(fromTask));

      const sections = (sectionsD || []).map(fromSection);
      const spacesWithSections = (spacesD || []).map(s => ({
        ...fromSpace(s),
        sections: sections.filter(sec => sec.spaceId === s.id),
      }));
      setSpaces(spacesWithSections);
      setSpaceTasks((spaceTasksD || []).map(fromSpaceTask));
      setDataLoaded(true);
    };
    load();
  }, [userId]);

  // ─── Notifications ──────────────────────────────────────────────────────
  useEffect(() => {
    const notifs = [];
    const allDeadlines = [
      ...assignments.map(a => ({ ...a, label: `"${a.title}"` })),
      ...clubTasks.map(t => ({ ...t, label: `Club: "${t.title}"` })),
      ...tasks.map(t => ({ ...t, label: `"${t.title}"` })),
      ...spaceTasks.map(t => ({ ...t, label: `"${t.title}"` })),
    ];
    allDeadlines.forEach(a => {
      if (a.status === 'Completed' || !a.dueDate) return;
      const due = new Date(a.dueDate + 'T' + (a.dueTime || '23:59'));
      const diff = (due - new Date()) / (1000 * 60 * 60);
      if (diff > 0 && diff <= 24)
        notifs.push({ id: a.id, message: `${a.label} due in ${Math.round(diff)}h`, read: false });
    });
    setNotifications(notifs);
  }, [assignments, clubTasks, tasks, spaceTasks]);

  // ─── Courses ────────────────────────────────────────────────────────────
  const addCourse = async (c) => {
    const { data, error } = await supabase.from('courses').insert({
      user_id: userId, code: c.code, name: c.name,
      color: c.color || randColor(), instructor: c.instructor, credits: c.credits,
    }).select().single();
    if (!error) { setCourses(p => [...p, fromCourse(data)]); return fromCourse(data); }
  };
  const updateCourse = async (id, data) => {
    const { error } = await supabase.from('courses').update({
      code: data.code, name: data.name, color: data.color,
      instructor: data.instructor, credits: data.credits,
    }).eq('id', id);
    if (!error) setCourses(p => p.map(c => c.id === id ? { ...c, ...data } : c));
  };
  const deleteCourse = async (id) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) setCourses(p => p.filter(c => c.id !== id));
  };

  // ─── Assignments ────────────────────────────────────────────────────────
  const addAssignment = async (a) => {
    const { data, error } = await supabase.from('assignments').insert({
      user_id: userId, course_id: a.courseId, title: a.title, type: a.type,
      due_date: a.dueDate, due_time: a.dueTime, priority: a.priority,
      status: a.status || 'Not Started', notes: a.notes,
    }).select().single();
    if (!error) setAssignments(p => [...p, fromAssign(data)]);
  };
  const updateAssignment = async (id, data) => {
    const { error } = await supabase.from('assignments').update({
      course_id: data.courseId, title: data.title, type: data.type,
      due_date: data.dueDate, due_time: data.dueTime, priority: data.priority,
      status: data.status, notes: data.notes,
    }).eq('id', id);
    if (!error) setAssignments(p => p.map(a => a.id === id ? { ...a, ...data } : a));
  };
  const deleteAssignment = async (id) => {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (!error) setAssignments(p => p.filter(a => a.id !== id));
  };

  // ─── Notes ──────────────────────────────────────────────────────────────
  const addNote = async (n) => {
    const { data, error } = await supabase.from('notes').insert({
      user_id: userId, course_id: n.courseId, title: n.title,
      content: n.content, is_meeting_note: false,
    }).select().single();
    if (!error) setNotes(p => [...p, fromNote(data)]);
  };
  const updateNote = async (id, data) => {
    const { error } = await supabase.from('notes').update({
      title: data.title, content: data.content, updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (!error) setNotes(p => p.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n));
  };
  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) setNotes(p => p.filter(n => n.id !== id));
  };
  const updateMeetingNote = async (id, data) => {
    const { error } = await supabase.from('notes').update({
      title: data.title, content: data.content, updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (!error) setMeetingNotes(p => p.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n));
  };

  // ─── Time Blocks ────────────────────────────────────────────────────────
  const addTimeBlock = async (b) => {
    const { data, error } = await supabase.from('time_blocks').insert({
      user_id: userId, course_id: b.courseId, title: b.title,
      date: b.date, start_time: b.startTime, end_time: b.endTime, color: b.color,
    }).select().single();
    if (!error) setTimeBlocks(p => [...p, fromBlock(data)]);
  };
  const deleteTimeBlock = async (id) => {
    const { error } = await supabase.from('time_blocks').delete().eq('id', id);
    if (!error) setTimeBlocks(p => p.filter(b => b.id !== id));
  };

  // ─── Study Logs ─────────────────────────────────────────────────────────
  const addStudyLog = async (l) => {
    const { data, error } = await supabase.from('study_logs').insert({
      user_id: userId, course_id: l.courseId, date: l.date, hours: l.hours, notes: l.notes,
    }).select().single();
    if (!error) setStudyLogs(p => [...p, fromLog(data)]);
  };
  const deleteStudyLog = async (id) => {
    const { error } = await supabase.from('study_logs').delete().eq('id', id);
    if (!error) setStudyLogs(p => p.filter(l => l.id !== id));
  };

  // ─── Study Prompts ──────────────────────────────────────────────────────
  const addStudyPrompt = async (pr) => {
    const { data, error } = await supabase.from('study_prompts').insert({
      user_id: userId, prompt: pr.prompt, output_type: pr.outputType,
      output_type_label: pr.outputTypeLabel, course_id: pr.courseId,
      course_name: pr.courseName, source_file: pr.sourceFile,
    }).select().single();
    if (!error) setStudyPrompts(p => [fromPrompt(data), ...p]);
  };
  const deleteStudyPrompt = async (id) => {
    const { error } = await supabase.from('study_prompts').delete().eq('id', id);
    if (!error) setStudyPrompts(p => p.filter(s => s.id !== id));
  };

  // ─── Reflections ────────────────────────────────────────────────────────
  const addReflection = async (r) => {
    const { data, error } = await supabase.from('reflections').insert({
      user_id: userId, mood: r.mood, wins: r.wins, struggles: r.struggles,
      notes: r.notes, week: r.week,
    }).select().single();
    if (!error) setReflections(p => [fromReflect(data), ...p]);
  };
  const deleteReflection = async (id) => {
    const { error } = await supabase.from('reflections').delete().eq('id', id);
    if (!error) setReflections(p => p.filter(r => r.id !== id));
  };

  // ─── Clubs ──────────────────────────────────────────────────────────────
  const addClub = async (c) => {
    const { data, error } = await supabase.from('clubs').insert({
      user_id: userId, name: c.name, short_name: c.shortName,
      color: c.color || randColor(), role: c.role, description: c.description,
    }).select().single();
    if (!error) setClubs(p => [...p, fromClub(data)]);
  };
  const updateClub = async (id, data) => {
    const { error } = await supabase.from('clubs').update({
      name: data.name, short_name: data.shortName, color: data.color,
      role: data.role, description: data.description,
    }).eq('id', id);
    if (!error) setClubs(p => p.map(c => c.id === id ? { ...c, ...data } : c));
  };
  const deleteClub = async (id) => {
    const { error } = await supabase.from('clubs').delete().eq('id', id);
    if (!error) {
      setClubs(p => p.filter(c => c.id !== id));
      setClubTasks(p => p.filter(t => t.clubId !== id));
      setMeetings(p => p.filter(m => m.clubId !== id));
    }
  };

  // ─── Club Tasks ─────────────────────────────────────────────────────────
  const addClubTask = async (t) => {
    const { data, error } = await supabase.from('club_tasks').insert({
      user_id: userId, club_id: t.clubId, title: t.title, type: t.type,
      due_date: t.dueDate, due_time: t.dueTime, priority: t.priority,
      status: t.status || 'Not Started', notes: t.notes,
    }).select().single();
    if (!error) setClubTasks(p => [...p, fromClubTask(data)]);
  };
  const updateClubTask = async (id, data) => {
    const { error } = await supabase.from('club_tasks').update({
      title: data.title, type: data.type, due_date: data.dueDate,
      due_time: data.dueTime, priority: data.priority, status: data.status, notes: data.notes,
    }).eq('id', id);
    if (!error) setClubTasks(p => p.map(t => t.id === id ? { ...t, ...data } : t));
  };
  const deleteClubTask = async (id) => {
    const { error } = await supabase.from('club_tasks').delete().eq('id', id);
    if (!error) setClubTasks(p => p.filter(t => t.id !== id));
  };

  // ─── Meetings ───────────────────────────────────────────────────────────
  const addMeeting = async (m) => {
    const club = clubs.find(c => c.id === m.clubId);
    const noteContent = `Club: ${club?.name || 'Unknown'}\nDate: ${m.date} at ${m.time}\nLocation: ${m.location || 'TBD'}\nAttendees: ${m.attendees || 'N/A'}\n\nAgenda:\n${m.agenda || '—'}\n\nMeeting Notes:\n`;
    const noteTitle = `${club?.shortName || 'Club'} — ${m.title} (${m.date})`;

    const { data: noteData, error: noteErr } = await supabase.from('notes').insert({
      user_id: userId, club_id: m.clubId, title: noteTitle,
      content: noteContent, is_meeting_note: true,
    }).select().single();
    if (noteErr) return;

    const { data: meetData, error: meetErr } = await supabase.from('meetings').insert({
      user_id: userId, club_id: m.clubId, title: m.title,
      date: m.date, time: m.time, location: m.location,
      attendees: m.attendees, agenda: m.agenda, note_id: noteData.id,
    }).select().single();
    if (!meetErr) {
      setMeetingNotes(p => [fromNote(noteData), ...p]);
      setMeetings(p => [...p, fromMeeting(meetData)]);
    }
  };
  const deleteMeeting = async (id) => {
    const meeting = meetings.find(m => m.id === id);
    if (meeting?.noteId) {
      await supabase.from('notes').delete().eq('id', meeting.noteId);
      setMeetingNotes(p => p.filter(n => n.id !== meeting.noteId));
    }
    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (!error) setMeetings(p => p.filter(m => m.id !== id));
  };

  // ─── General Tasks ──────────────────────────────────────────────────────
  const addTask = async (t) => {
    const { data, error } = await supabase.from('tasks').insert({
      user_id: userId, title: t.title, category: t.category,
      due_date: t.dueDate, due_time: t.dueTime, priority: t.priority,
      status: t.status || 'Not Started', notes: t.notes, color: t.color,
    }).select().single();
    if (!error) setTasks(p => [...p, fromTask(data)]);
  };
  const updateTask = async (id, data) => {
    const { error } = await supabase.from('tasks').update({
      title: data.title, category: data.category, due_date: data.dueDate,
      due_time: data.dueTime, priority: data.priority, status: data.status,
      notes: data.notes, color: data.color,
    }).eq('id', id);
    if (!error) setTasks(p => p.map(t => t.id === id ? { ...t, ...data } : t));
  };
  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) setTasks(p => p.filter(t => t.id !== id));
  };

  // ─── Spaces ─────────────────────────────────────────────────────────────
  const addSpace = async (s) => {
    const { data, error } = await supabase.from('spaces').insert({
      user_id: userId, name: s.name, icon: s.icon, color: s.color,
    }).select().single();
    if (!error) setSpaces(p => [...p, { ...fromSpace(data), sections: [] }]);
  };
  const updateSpace = async (id, data) => {
    const { error } = await supabase.from('spaces').update({
      name: data.name, icon: data.icon, color: data.color,
    }).eq('id', id);
    if (!error) setSpaces(p => p.map(s => s.id === id ? { ...s, ...data } : s));
  };
  const deleteSpace = async (id) => {
    const { error } = await supabase.from('spaces').delete().eq('id', id);
    if (!error) {
      setSpaces(p => p.filter(s => s.id !== id));
      setSpaceTasks(p => p.filter(t => t.spaceId !== id));
    }
  };

  // ─── Space Sections ─────────────────────────────────────────────────────
  const addSection = async (spaceId, section) => {
    const { data, error } = await supabase.from('space_sections').insert({
      user_id: userId, space_id: spaceId, name: section.name,
    }).select().single();
    if (!error) {
      setSpaces(p => p.map(s => s.id === spaceId
        ? { ...s, sections: [...s.sections, fromSection(data)] }
        : s
      ));
    }
  };
  const updateSection = async (spaceId, sectionId, data) => {
    const { error } = await supabase.from('space_sections').update({ name: data.name }).eq('id', sectionId);
    if (!error) {
      setSpaces(p => p.map(s => s.id === spaceId
        ? { ...s, sections: s.sections.map(sec => sec.id === sectionId ? { ...sec, ...data } : sec) }
        : s
      ));
    }
  };
  const deleteSection = async (spaceId, sectionId) => {
    const { error } = await supabase.from('space_sections').delete().eq('id', sectionId);
    if (!error) {
      setSpaces(p => p.map(s => s.id === spaceId
        ? { ...s, sections: s.sections.filter(sec => sec.id !== sectionId) }
        : s
      ));
      setSpaceTasks(p => p.filter(t => !(t.spaceId === spaceId && t.sectionId === sectionId)));
    }
  };

  // ─── Space Tasks ────────────────────────────────────────────────────────
  const addSpaceTask = async (t) => {
    const { data, error } = await supabase.from('space_tasks').insert({
      user_id: userId, space_id: t.spaceId, section_id: t.sectionId,
      title: t.title, due_date: t.dueDate, due_time: t.dueTime,
      priority: t.priority, status: t.status || 'Not Started', notes: t.notes,
    }).select().single();
    if (!error) setSpaceTasks(p => [...p, fromSpaceTask(data)]);
  };
  const updateSpaceTask = async (id, data) => {
    const { error } = await supabase.from('space_tasks').update({
      title: data.title, due_date: data.dueDate, due_time: data.dueTime,
      priority: data.priority, status: data.status, notes: data.notes,
    }).eq('id', id);
    if (!error) setSpaceTasks(p => p.map(t => t.id === id ? { ...t, ...data } : t));
  };
  const deleteSpaceTask = async (id) => {
    const { error } = await supabase.from('space_tasks').delete().eq('id', id);
    if (!error) setSpaceTasks(p => p.filter(t => t.id !== id));
  };

  const markNotificationRead = (id) =>
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <AppContext.Provider value={{
      user, dataLoaded, COLORS, SPACE_ICONS,
      courses, assignments, notes, meetingNotes, timeBlocks,
      studyLogs, studyPrompts, reflections, notifications,
      clubs, clubTasks, meetings,
      tasks, spaces, spaceTasks,
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
      addTask, updateTask, deleteTask,
      addSpace, updateSpace, deleteSpace,
      addSection, updateSection, deleteSection,
      addSpaceTask, updateSpaceTask, deleteSpaceTask,
      markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
