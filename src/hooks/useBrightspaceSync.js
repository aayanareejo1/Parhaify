import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316',
  '#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6',
];
const randColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export function useBrightspaceSync() {
  const { courses, assignments, addCourse, addAssignment } = useApp();
  const [pending,        setPending]        = useState(null);
  const [importing,      setImporting]      = useState(false);
  const [syncing,        setSyncing]        = useState(false);
  const [syncError,      setSyncError]      = useState('');
  const [extensionReady, setExtensionReady] = useState(false);

  // Always-current reference so the event listener never goes stale
  const coursesRef     = useRef(courses);
  const assignmentsRef = useRef(assignments);
  useEffect(() => { coursesRef.current     = courses;     }, [courses]);
  useEffect(() => { assignmentsRef.current = assignments; }, [assignments]);

  const processData = useCallback(data => {
    const cur = assignmentsRef.current;
    const newCourses = data.courses.filter(bc =>
      !coursesRef.current.some(
        c => c.code.toLowerCase() === bc.code.toLowerCase() ||
             c.name.toLowerCase() === bc.name.toLowerCase()
      )
    );
    const newAssignments = data.assignments.filter(ba =>
      !cur.some(
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
  }, []); // stable — reads from refs, no deps needed

  const done = useCallback(() => {
    localStorage.removeItem('brightspace_pending_sync');
    window.dispatchEvent(new CustomEvent('brightspace-sync-done'));
  }, []);

  // Set up listeners ONCE — uses refs so no re-subscription needed
  useEffect(() => {
    if (localStorage.getItem('__parhaify_ext')) setExtensionReady(true);

    // Check localStorage for data written by content script before React mounted
    const checkStorage = () => {
      const s = localStorage.getItem('brightspace_pending_sync');
      if (!s) return;
      localStorage.removeItem('brightspace_pending_sync');
      try { processData(JSON.parse(s)); } catch { /* ignore */ }
    };
    setTimeout(checkStorage, 600);

    const onSync  = e => {
      localStorage.removeItem('brightspace_pending_sync');
      setSyncing(false);
      processData(e.detail);
    };
    const onError = e => {
      setSyncing(false);
      setSyncError(e.detail || 'Sync failed.');
    };

    window.addEventListener('brightspace-sync',    onSync);
    window.addEventListener('parhaify-sync-error', onError);
    return () => {
      window.removeEventListener('brightspace-sync',    onSync);
      window.removeEventListener('parhaify-sync-error', onError);
    };
  }, []); // empty — runs once only

  const requestSync = () => {
    setSyncing(true);
    setSyncError('');
    window.dispatchEvent(new CustomEvent('parhaify-request-sync'));
    setTimeout(() => setSyncing(false), 30000);
  };

  const doImport = async () => {
    if (!pending) return;
    setImporting(true);
    try {
      const bsToAppId = {};
      pending.raw.courses.forEach(bc => {
        const match = coursesRef.current.find(
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
      setSyncing(false);
      done();
    }
  };

  const dismiss = () => {
    setPending(null);
    setSyncing(false);
    done();
  };

  return {
    pending, importing, syncing, syncError, extensionReady,
    requestSync, doImport, dismiss,
  };
}
