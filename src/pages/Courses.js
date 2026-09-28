import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, ConfirmDialog, useToast } from '../components/UI';
import { Plus, Pencil, Trash2, BookOpen, Download } from 'lucide-react';
import { FALL_2026_COURSES, FALL_2026_ASSIGNMENTS } from '../data/fall2026Term';

function CourseForm({ initial = {}, onSave, onClose, colors }) {
  const [form, setForm] = useState({ code: '', name: '', instructor: '', credits: 3, color: colors[0], ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <div className="grid-2">
        <div className="form-group">
          <label className="label">Course Code*</label>
          <input className="input" value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. CPS406" />
        </div>
        <div className="form-group">
          <label className="label">Credits</label>
          <input className="input" type="number" min={1} max={6} value={form.credits} onChange={e => set('credits', +e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Course Name*</label>
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Software Engineering" />
      </div>
      <div className="form-group">
        <label className="label">Instructor</label>
        <input className="input" value={form.instructor} onChange={e => set('instructor', e.target.value)} placeholder="e.g. Dr. Smith" />
      </div>
      <div className="form-group">
        <label className="label">Color</label>
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          {colors.map(c => (
            <button key={c} onClick={() => set('color', c)}
              style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
          ))}
        </div>
      </div>
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (form.code && form.name) { onSave(form); onClose(); } }}>Save Course</button>
      </div>
    </>
  );
}

export default function Courses() {
  const { courses, assignments, addCourse, updateCourse, deleteCourse, addAssignment, COLORS } = useApp();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [importing, setImporting] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);

  const assignmentCount = (id) => assignments.filter(a => a.courseId === id).length;

  const termAlreadyImported = FALL_2026_COURSES.every(fc =>
    courses.some(c => c.code.trim().toUpperCase() === fc.code)
  );

  const importFallTerm = async () => {
    setImporting(true);
    try {
      const codeToId = {};
      courses.forEach(c => { codeToId[c.code.trim().toUpperCase()] = c.id; });

      for (const fc of FALL_2026_COURSES) {
        if (codeToId[fc.code]) continue;
        const created = await addCourse({
          code: fc.code, name: fc.name, instructor: fc.instructor,
          color: fc.color, credits: fc.credits,
        });
        if (created) codeToId[fc.code] = created.id;
      }

      for (const fa of FALL_2026_ASSIGNMENTS) {
        const courseId = codeToId[fa.courseCode];
        if (!courseId) continue;
        await addAssignment({
          courseId, title: fa.title, type: fa.type,
          dueDate: fa.dueDate, dueTime: fa.dueTime,
          priority: fa.priority, status: 'Not Started', notes: fa.notes,
        });
      }
      toast('Fall 2026 term imported.', 'success');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Courses</div>
          <div className="page-subtitle">{courses.length} course{courses.length !== 1 ? 's' : ''} enrolled</div>
        </div>
        <div className="flex gap-8">
          {!termAlreadyImported && (
            <button className="btn btn-ghost" disabled={importing} onClick={() => setConfirmImport(true)}>
              <Download size={15} /> {importing ? 'Importing…' : 'Import Fall 2026 Term'}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Course</button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><BookOpen size={36} /></div>
          <p>No courses yet. Add your first course to get started.</p>
        </div>
      ) : (
        <div className="grid-3">
          {courses.map(c => (
            <div key={c.id} className="card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <span style={{ background: c.color + '22', color: c.color, fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 99 }}>{c.code}</span>
                <div className="flex gap-8">
                  <button className="btn-icon" onClick={() => setEditing(c)}><Pencil size={14} /></button>
                  <button className="btn-icon" onClick={() => setDeleting(c)}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{c.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 12 }}>{c.instructor || 'No instructor'}</div>
              <div className="flex gap-12" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{c.credits} credits</span>
                <span>{assignmentCount(c.id)} assignments</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Course">
        <CourseForm colors={COLORS} onClose={() => setShowAdd(false)} onSave={(d) => { addCourse(d); toast('Course added!', 'success'); }} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Course">
        {editing && <CourseForm initial={editing} colors={COLORS} onClose={() => setEditing(null)} onSave={(d) => { updateCourse(editing.id, d); toast('Course updated!', 'success'); }} />}
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        title="Delete Course" message={`Delete "${deleting?.name}"? Assignments linked to this course will remain.`}
        onConfirm={() => { deleteCourse(deleting.id); toast('Course deleted.'); }} />

      <ConfirmDialog open={confirmImport} onClose={() => setConfirmImport(false)}
        title="Import Fall 2026 Term"
        message="This adds CPS633, CPS393, CPS510, PCS110 and CPS721, plus every assignment, lab and midterm from their outlines, based on what's known so far. Some dates are only given as a week in the outlines and are flagged in the notes to confirm on D2L. Continue?"
        onConfirm={() => { setConfirmImport(false); importFallTerm(); }} />
    </div>
  );
}
