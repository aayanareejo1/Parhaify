import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, ConfirmDialog, useToast } from '../components/UI';
import { Plus, Trash2, Pencil, CheckCircle2, Filter, Tag } from 'lucide-react';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Not Started', 'In Progress', 'Completed'];

function TaskForm({ initial = {}, onSave, onClose, colors, existingCategories }) {
  const [form, setForm] = useState({ title: '', category: '', dueDate: '', dueTime: '23:59', priority: 'Medium', status: 'Not Started', notes: '', color: colors[2], ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <div className="form-group">
        <label className="label">Title*</label>
        <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="What needs to be done?" autoFocus />
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="label">Category</label>
          <input className="input" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Job Apps, Personal" list="cat-suggestions" />
          <datalist id="cat-suggestions">
            {existingCategories.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div className="form-group">
          <label className="label">Color</label>
          <div className="flex gap-6" style={{ flexWrap: 'wrap', paddingTop: 4 }}>
            {colors.map(c => (
              <button key={c} onClick={() => set('color', c)} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
            ))}
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="label">Due Date</label>
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
        <button className="btn btn-primary" onClick={() => { if (form.title) { onSave(form); onClose(); } }}>Save Task</button>
      </div>
    </>
  );
}

export default function Tasks() {
  const { tasks, COLORS, addTask, updateTask, deleteTask } = useApp();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
  const priorityColor = { High: 'danger', Medium: 'warning', Low: 'indigo' };

  const filtered = tasks.filter(t =>
    (!filterCat || t.category === filterCat) &&
    (!filterStatus || t.status === filterStatus) &&
    (!filterPriority || t.priority === filterPriority)
  );

  const grouped = filtered.reduce((acc, t) => {
    const cat = t.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  const toggle = (t) => updateTask(t.id, { status: t.status === 'Completed' ? 'Not Started' : 'Completed' });

  const activeCount = tasks.filter(t => t.status !== 'Completed').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-subtitle">{activeCount} active · {completedCount} completed · {categories.length} categories</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Task</button>
      </div>

      {/* Filters */}
      <div className="flex gap-8 items-center" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <Filter size={14} color="var(--text-muted)" />
        <select className="select" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="select" style={{ width: 'auto' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        {(filterCat || filterStatus || filterPriority) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterCat(''); setFilterStatus(''); setFilterPriority(''); }}>Clear</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <p>No tasks yet. Add your first task to get started.</p>
        </div>
      ) : (
        <div className="flex-col gap-20">
          {Object.entries(grouped).map(([cat, catTasks]) => (
            <div key={cat}>
              <div className="flex items-center gap-8" style={{ marginBottom: 10 }}>
                <Tag size={13} color="var(--text-muted)" />
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>{cat}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({catTasks.length})</span>
              </div>
              <div className="flex-col gap-6">
                {catTasks.map(t => {
                  const done = t.status === 'Completed';
                  return (
                    <div key={t.id} className="card card-sm flex items-center gap-12"
                      style={{ opacity: done ? 0.6 : 1, borderLeft: `3px solid ${t.color || 'var(--indigo)'}` }}>
                      <button className="btn-icon" style={{ color: done ? 'var(--success)' : 'var(--text-muted)', padding: 2 }} onClick={() => toggle(t)}>
                        <CheckCircle2 size={18} />
                      </button>
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center gap-8">
                          <span style={{ fontWeight: 600, fontSize: 14, textDecoration: done ? 'line-through' : 'none' }}>{t.title}</span>
                          <span className={`badge badge-${priorityColor[t.priority]}`}>{t.priority}</span>
                        </div>
                        <div className="flex gap-12 mt-8" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {t.dueDate && <span>Due {t.dueDate} at {t.dueTime}</span>}
                          <span className={`badge badge-${t.status === 'Completed' ? 'success' : t.status === 'In Progress' ? 'warning' : 'muted'}`}>{t.status}</span>
                        </div>
                        {t.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{t.notes}</div>}
                      </div>
                      <div className="flex gap-6">
                        <button className="btn-icon" onClick={() => setEditing(t)}><Pencil size={14} /></button>
                        <button className="btn-icon" onClick={() => setDeleting(t)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Task">
        <TaskForm colors={COLORS} existingCategories={categories} onClose={() => setShowAdd(false)} onSave={(d) => { addTask(d); toast('Task added!', 'success'); }} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Task">
        {editing && <TaskForm initial={editing} colors={COLORS} existingCategories={categories} onClose={() => setEditing(null)} onSave={(d) => { updateTask(editing.id, d); toast('Updated!', 'success'); }} />}
      </Modal>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        title="Delete Task" message={`Delete "${deleting?.title}"?`}
        onConfirm={() => { deleteTask(deleting.id); toast('Deleted.'); }} />
    </div>
  );
}
