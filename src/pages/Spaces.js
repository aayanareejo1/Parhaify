import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, ConfirmDialog, useToast } from '../components/UI';
import { Plus, Trash2, Pencil, CheckCircle2, ChevronDown, ChevronUp, Layout, FolderPlus } from 'lucide-react';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Not Started', 'In Progress', 'Completed'];

// ── Space Form ────────────────────────────────────────────────
function SpaceForm({ initial = {}, onSave, onClose, colors, icons }) {
  const [form, setForm] = useState({ name: '', icon: icons[0], color: colors[0], ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <div className="form-group">
        <label className="label">Space Name*</label>
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Job Applications, Research, Personal" autoFocus />
      </div>
      <div className="form-group">
        <label className="label">Icon</label>
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          {icons.map(ic => (
            <button key={ic} onClick={() => set('icon', ic)}
              style={{ width: 36, height: 36, borderRadius: 8, fontSize: 18, border: form.icon === ic ? '2px solid var(--indigo)' : '2px solid var(--border)', background: form.icon === ic ? 'var(--indigo-dim)' : 'var(--bg-elevated)', cursor: 'pointer' }}>
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="label">Color</label>
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          {colors.map(c => (
            <button key={c} onClick={() => set('color', c)} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
          ))}
        </div>
      </div>
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (form.name) { onSave(form); onClose(); } }}>Create Space</button>
      </div>
    </>
  );
}

// ── Space Task Form ───────────────────────────────────────────
function SpaceTaskForm({ spaceId, sectionId, sections, initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({ spaceId, sectionId: sectionId || sections[0]?.id || '', title: '', dueDate: '', dueTime: '23:59', priority: 'Medium', status: 'Not Started', notes: '', ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <div className="form-group">
        <label className="label">Title*</label>
        <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" autoFocus />
      </div>
      {sections.length > 1 && (
        <div className="form-group">
          <label className="label">Section</label>
          <select className="select" value={form.sectionId} onChange={e => set('sectionId', e.target.value)}>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
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

// ── Space Card ────────────────────────────────────────────────
function SpaceCard({ space, spaceTasks, onEdit, onDelete, onAddSection, onDeleteSection, onAddTask, onUpdateTask, onDeleteTask }) {
  const toast = useToast();
  const [expanded, setExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState(space.sections[0]?.id || null);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [addTaskFor, setAddTaskFor] = useState(null);

  const priorityColor = { High: 'danger', Medium: 'warning', Low: 'indigo' };
  const allSpaceTasks = spaceTasks.filter(t => t.spaceId === space.id);
  const activeTasks = allSpaceTasks.filter(t => t.status !== 'Completed');
  const sectionTasks = (sectionId) => spaceTasks.filter(t => t.spaceId === space.id && t.sectionId === sectionId);

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    onAddSection(space.id, { name: newSectionName.trim() });
    setNewSectionName('');
    setAddingSection(false);
    toast('Section added!', 'success');
  };

  return (
    <div className="card" style={{ borderTop: `3px solid ${space.color}` }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: expanded ? 16 : 0 }}>
        <div className="flex items-center gap-12">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: space.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {space.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{space.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {activeTasks.length} active · {space.sections.length} sections · {allSpaceTasks.filter(t => t.status === 'Completed').length} completed
            </div>
          </div>
        </div>
        <div className="flex gap-8 items-center">
          <button className="btn-icon" onClick={onEdit}><Pencil size={14} /></button>
          <button className="btn-icon" onClick={onDelete}><Trash2 size={14} /></button>
          <button className="btn-icon" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Section tabs */}
          {space.sections.length > 0 && (
            <div className="flex gap-6 items-center" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
              {space.sections.map(sec => (
                <div key={sec.id} className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveSection(sec.id)}
                    style={{ padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)', border: 'none', background: activeSection === sec.id ? space.color : 'var(--bg-elevated)', color: activeSection === sec.id ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                    {sec.name}
                    <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 10 }}>({sectionTasks(sec.id).length})</span>
                  </button>
                  <button className="btn-icon" style={{ padding: 2 }} onClick={() => { onDeleteSection(space.id, sec.id); if (activeSection === sec.id) setActiveSection(space.sections[0]?.id); }}>
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              <button className="btn-icon" title="Add section" onClick={() => setAddingSection(true)}>
                <FolderPlus size={14} />
              </button>
            </div>
          )}

          {/* Add section inline */}
          {addingSection && (
            <div className="flex gap-8 items-center" style={{ marginBottom: 12 }}>
              <input className="input" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="Section name..." autoFocus onKeyDown={e => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') setAddingSection(false); }} style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={handleAddSection}>Add</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setAddingSection(false)}>Cancel</button>
            </div>
          )}

          {/* No sections yet */}
          {space.sections.length === 0 && !addingSection && (
            <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
              No sections yet.
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => setAddingSection(true)}><FolderPlus size={12} /> Add Section</button>
            </div>
          )}

          {/* Tasks for active section */}
          {activeSection && (
            <>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {space.sections.find(s => s.id === activeSection)?.name}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => setAddTaskFor(activeSection)}>
                  <Plus size={12} /> Add Task
                </button>
              </div>
              {sectionTasks(activeSection).length === 0 ? (
                <div style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>No tasks in this section</div>
              ) : (
                <div className="flex-col gap-6">
                  {sectionTasks(activeSection).map(t => {
                    const done = t.status === 'Completed';
                    return (
                      <div key={t.id} className="flex items-center gap-10" style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, opacity: done ? 0.6 : 1, borderLeft: `3px solid ${space.color}` }}>
                        <button className="btn-icon" style={{ padding: 2, color: done ? 'var(--success)' : 'var(--text-muted)' }}
                          onClick={() => onUpdateTask(t.id, { status: done ? 'Not Started' : 'Completed' })}>
                          <CheckCircle2 size={16} />
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, textDecoration: done ? 'line-through' : 'none' }}>{t.title}</div>
                          <div className="flex gap-8" style={{ marginTop: 3 }}>
                            <span className={`badge badge-${priorityColor[t.priority]}`} style={{ fontSize: 10 }}>{t.priority}</span>
                            {t.dueDate && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due {t.dueDate}</span>}
                            <span className={`badge badge-${t.status === 'Completed' ? 'success' : t.status === 'In Progress' ? 'warning' : 'muted'}`} style={{ fontSize: 10 }}>{t.status}</span>
                          </div>
                          {t.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.notes}</div>}
                        </div>
                        <button className="btn-icon" style={{ padding: 2 }} onClick={() => { onDeleteTask(t.id); }}><Trash2 size={12} /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Add task modal */}
      <Modal open={!!addTaskFor} onClose={() => setAddTaskFor(null)} title={`Add Task to ${space.sections.find(s => s.id === addTaskFor)?.name || 'Section'}`}>
        {addTaskFor && (
          <SpaceTaskForm spaceId={space.id} sectionId={addTaskFor} sections={space.sections}
            onClose={() => setAddTaskFor(null)}
            onSave={(d) => { onAddTask(d); toast('Task added!', 'success'); setAddTaskFor(null); }} />
        )}
      </Modal>
    </div>
  );
}

// ── Main Spaces Page ──────────────────────────────────────────
export default function Spaces() {
  const { spaces, spaceTasks, COLORS, SPACE_ICONS, addSpace, updateSpace, deleteSpace, addSection, updateSection, deleteSection, addSpaceTask, updateSpaceTask, deleteSpaceTask } = useApp();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const totalActive = spaceTasks.filter(t => t.status !== 'Completed').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Spaces</div>
          <div className="page-subtitle">{spaces.length} spaces · {totalActive} active tasks</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> New Space</button>
      </div>

      {spaces.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Layout size={36} /></div>
          <p>No spaces yet. Create a space for anything — job apps, research, personal goals.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}><Plus size={15} /> Create Space</button>
        </div>
      ) : (
        <div className="flex-col gap-16">
          {spaces.map(space => (
            <SpaceCard key={space.id} space={space} spaceTasks={spaceTasks}
              onEdit={() => setEditing(space)}
              onDelete={() => setDeleting(space)}
              onAddSection={addSection}
              onDeleteSection={(spaceId, sectionId) => { deleteSection(spaceId, sectionId); toast('Section removed.'); }}
              onAddTask={addSpaceTask}
              onUpdateTask={updateSpaceTask}
              onDeleteTask={(id) => { deleteSpaceTask(id); toast('Task deleted.'); }}
            />
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Space">
        <SpaceForm colors={COLORS} icons={SPACE_ICONS} onClose={() => setShowAdd(false)} onSave={(d) => { addSpace(d); toast('Space created!', 'success'); }} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Space">
        {editing && <SpaceForm initial={editing} colors={COLORS} icons={SPACE_ICONS} onClose={() => setEditing(null)} onSave={(d) => { updateSpace(editing.id, d); toast('Updated!', 'success'); }} />}
      </Modal>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        title="Delete Space" message={`Delete "${deleting?.name}"? All sections and tasks inside will be removed.`}
        onConfirm={() => { deleteSpace(deleting.id); toast('Space deleted.'); }} />
    </div>
  );
}
