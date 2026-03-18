import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316',
  '#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6',
];
const randColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export function useBrightspaceSync() {
  const { courses, assignments, addCourse, addAssignment } = useApp();
  const [pending, setPending]     = useState(null);
  const [importing, setImporting] = useState(false);

  const processData = useCallback(data => {
    const newCourses = data.courses.filter(bc =>
      !courses.some(
        c => c.code.toLowerCase() === bc.code.toLowerCase() ||
             c.name.toLowerCase() === bc.name.toLowerCase()
      )
    );

    const newAssignments = data.assignments.filter(ba =>
      !assignments.some(
        a => a.title.toLowerCase() === ba.title.toLowerCase() &&
             a.dueDate === ba.dueDate
      )
    );

    setPending({
      raw: data,
      newCourses,
      newAssignments,
      skipped: data.assignments.length - newAssignments.length,
    });
  }, [courses, assignments]);

  useEffect(() => {
    // Check localStorage on mount — set by content-parhaify.js before React loads
    const stored = localStorage.getItem('brightspace_pending_sync');
    if (stored) {
      try {
        localStorage.removeItem('brightspace_pending_sync');
        processData(JSON.parse(stored));
      } catch { /* ignore malformed data */ }
    }

    // Also check every 2s in case the content script writes to localStorage
    // after React has already mounted (timing race)
    const poll = setInterval(() => {
      const s = localStorage.getItem('brightspace_pending_sync');
      if (s) {
        try {
          localStorage.removeItem('brightspace_pending_sync');
          processData(JSON.parse(s));
        } catch { /* ignore */ }
      }
    }, 2000);

    const handler = e => processData(e.detail);
    window.addEventListener('brightspace-sync', handler);
    return () => {
      window.removeEventListener('brightspace-sync', handler);
      clearInterval(poll);
    };
  }, [processData]);

  const doImport = async () => {
    if (!pending) return;
    setImporting(true);

    try {
      const bsToAppId = {};
      pending.raw.courses.forEach(bc => {
        const match = courses.find(
          c => c.code.toLowerCase() === bc.code.toLowerCase() ||
               c.name.toLowerCase() === bc.name.toLowerCase()
        );
        if (match) bsToAppId[bc.id] = match.id;
      });

      for (const bc of pending.newCourses) {
        const created = await addCourse({
          code:       bc.code || bc.name.slice(0, 12).toUpperCase(),
          name:       bc.name,
          color:      randColor(),
          instructor: '',
          credits:    null,
        });
        if (created) bsToAppId[bc.id] = created.id;
      }

      for (const ba of pending.newAssignments) {
        const courseId = bsToAppId[ba.courseId];
        if (!courseId) continue;
        await addAssignment({
          courseId,
          title:    ba.title,
          type:     ba.type || 'Assignment',
          dueDate:  ba.dueDate,
          dueTime:  ba.dueTime,
          priority: 'Medium',
          status:   'Not Started',
          notes:    '',
        });
      }
    } finally {
      setImporting(false);
      setPending(null);
    }
  };

  return { pending, importing, doImport, dismiss: () => setPending(null) };
}
