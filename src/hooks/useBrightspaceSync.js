import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316',
  '#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6',
];
const randColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export function useBrightspaceSync() {
  const { courses, assignments, addCourse, addAssignment } = useApp();
  const [pending,         setPending]         = useState(null);
  const [importing,       setImporting]       = useState(false);
  const [syncing,         setSyncing]         = useState(false);
  const [syncError,       setSyncError]       = useState('');
  const [extensionReady,  setExtensionReady]  = useState(false);

  const done = useCallback(() => {
    window.dispatchEvent(new CustomEvent('brightspace-sync-done'));
  }, []);

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
    // Detect extension via localStorage flag set by content-parhaify.js
    if (localStorage.getItem('__parhaify_ext')) setExtensionReady(true);

    // Check for pending sync data written before React mounted
    const stored = localStorage.getItem('brightspace_pending_sync');
    if (stored) {
      try {
        localStorage.removeItem('brightspace_pending_sync');
        processData(JSON.parse(stored));
      } catch { /* ignore */ }
    }

    // Poll in case content script writes after React mounts
    const poll = setInterval(() => {
      const s = localStorage.getItem('brightspace_pending_sync');
      if (s) {
        try {
          localStorage.removeItem('brightspace_pending_sync');
          processData(JSON.parse(s));
        } catch { /* ignore */ }
      }
    }, 1500);

    const onSync  = e => processData(e.detail);
    const onError = e => { setSyncing(false); setSyncError(e.detail || 'Sync failed.'); };

    window.addEventListener('brightspace-sync',  onSync);
    window.addEventListener('parhaify-sync-error', onError);

    return () => {
      clearInterval(poll);
      window.removeEventListener('brightspace-sync',  onSync);
      window.removeEventListener('parhaify-sync-error', onError);
    };
  }, [processData]);

  const requestSync = () => {
    setSyncing(true);
    setSyncError('');
    window.dispatchEvent(new CustomEvent('parhaify-request-sync'));
    // Auto-clear syncing state after 30s if no response
    setTimeout(() => setSyncing(false), 30000);
  };

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
      setSyncing(false);
      done(); // clear chrome.storage + localStorage
    }
  };

  const dismiss = () => {
    setPending(null);
    setSyncing(false);
    done(); // also clear on dismiss to prevent re-trigger
  };

  return {
    pending, importing, syncing, syncError, extensionReady,
    requestSync, doImport, dismiss,
  };
}
