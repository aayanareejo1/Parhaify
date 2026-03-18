import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, ConfirmDialog, useToast } from '../components/UI';
import { Plus, Trash2, Pencil, CheckCircle2, Filter } from 'lucide-react';

const TYPES = ['Assignment', 'Quiz', 'Lab', 'Exam', 'Reading', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Not Started', 'In Progress', 'Completed'];

function AssignmentForm({ initial = {}, courses, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '', courseId: courses[0]?.id || '', type: 'Assignment',
    dueDate: '', dueTime: '23:59', priority: 'Medium', status: 'Not Started', notes: '', ...initial
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <div className="form-group">
        <label className="label">Title*</label>
        <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Assignment title" />
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="label">Course</label>
          <select className="select" value={form.courseId} onChange={e => set('courseId', e.target.value)}>
            <option value="">No course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Type</label>
          <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="label">Due Date*</label>
          <input className="input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Due Time</label>
          <input className="input" type="time" value={form.dueTime} onChange={e => set('dueTime', e.target.value)} />
        </div>
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="label">Priority</label>
          <select className="select" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Status</label>
          <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="label">Notes</label>
        <textarea className="textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
      </div>
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (form.title && form.dueDate) { onSave(form); onClose(); } }}>Save</button>
      </div>
    </>
  );
}

export default function Assignments() {
  const { assignments, courses, addAssignment, updateAssignment, deleteAssignment } = useApp();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const getCourse = (id) => courses.find(c => c.id === id);
  const priorityColor = { High: 'danger', Medium: 'warning', Low: 'indigo' };

  const filtered = assignments
    .filter(a =>
      (!filterCourse || a.courseId === filterCourse) &&
      (!filterStatus || a.status === filterStatus) &&
      (!filterPriority || a.priority === filterPriority)
    )
    .sort((a, b) => {
      // Completed items sink to the bottom
      if (a.status === 'Completed' !== b.status === 'Completed')
        return a.status === 'Completed' ? 1 : -1;
      // Then sort by due date/time ascending
      const da = new Date(`${a.dueDate}T${a.dueTime || '23:59'}`);
      const db = new Date(`${b.dueDate}T${b.dueTime || '23:59'}`);
      return da - db;
    });

  const toggle = (a) => updateAssignment(a.id, { status: a.status === 'Completed' ? 'Not Started' : 'Completed' });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Assignments</div>
          <div className="page-subtitle">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Assignment</button>
      </div>

      {/* Filters */}
      <div className="flex gap-8 items-center" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <Filter size={14} color="var(--text-muted)" />
        <select className="select" style={{ width: 'auto' }} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
        </select>
        <select className="select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="select" style={{ width: 'auto' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        {(filterCourse || filterStatus || filterPriority) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterCourse(''); setFilterStatus(''); setFilterPriority(''); }}>Clear</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No assignments found.</p></div>
      ) : (
        <div className="flex-col gap-8">
          {filtered.map(a => {
            const course = getCourse(a.courseId);
            const done = a.status === 'Completed';
            return (
              <div key={a.id} className="card card-sm flex items-center gap-12"
                style={{ opacity: done ? 0.6 : 1, borderLeft: `3px solid ${course?.color || 'var(--border)'}` }}>
                <button className="btn-icon" style={{ color: done ? 'var(--success)' : 'var(--text-muted)' }} onClick={() => toggle(a)}>
                  <CheckCircle2 size={18} />
                </button>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-8">
                    <span style={{ fontWeight: 600, textDecoration: done ? 'line-through' : 'none' }}>{a.title}</span>
                    <span className={`badge badge-${priorityColor[a.priority]}`}>{a.priority}</span>
                    <span className="badge badge-muted">{a.type}</span>
                  </div>
                  <div className="flex gap-12 mt-8" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                    {course && <span className="flex items-center gap-8"><span className="course-dot" style={{ background: course.color }} />{course.code}</span>}
                    <span>Due {a.dueDate} {a.dueTime}</span>
                    <span className={`badge badge-${a.status === 'Completed' ? 'success' : a.status === 'In Progress' ? 'warning' : 'muted'}`}>{a.status}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="btn-icon" style={{ minWidth: 40, minHeight: 40 }} onClick={() => setEditing(a)}><Pencil size={15} /></button>
                  <button className="btn-icon" style={{ minWidth: 40, minHeight: 40 }} onClick={() => setDeleting(a)}><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Assignment">
        <AssignmentForm courses={courses} onClose={() => setShowAdd(false)} onSave={(d) => { addAssignment(d); toast('Assignment added!', 'success'); }} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Assignment">
        {editing && <AssignmentForm initial={editing} courses={courses} onClose={() => setEditing(null)} onSave={(d) => { updateAssignment(editing.id, d); toast('Updated!', 'success'); }} />}
      </Modal>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        title="Delete Assignment" message={`Delete "${deleting?.title}"?`}
        onConfirm={() => { deleteAssignment(deleting.id); toast('Deleted.'); }} />
    </div>
  );
}
