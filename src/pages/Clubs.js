import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, ConfirmDialog, useToast } from '../components/UI';
import { Plus, Pencil, Trash2, Users, CheckCircle2, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Not Started', 'In Progress', 'Completed'];
const TASK_TYPES = ['Task', 'Event', 'Deadline', 'Presentation', 'Other'];

// ── Club Form ─────────────────────────────────────────────────
function ClubForm({ initial = {}, onSave, onClose, colors }) {
  const [form, setForm] = useState({ name: '', shortName: '', role: '', description: '', color: colors[0], ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <div className="grid-2">
        <div className="form-group">
          <label className="label">Club Name*</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Google Developer Student Club" />
        </div>
        <div className="form-group">
          <label className="label">Short Name*</label>
          <input className="input" value={form.shortName} onChange={e => set('shortName', e.target.value)} placeholder="e.g. GDSC" />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Your Role</label>
        <input className="input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Member, VP Events, President" />
      </div>
      <div className="form-group">
        <label className="label">Description</label>
        <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of the club" />
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
        <button className="btn btn-primary" onClick={() => { if (form.name && form.shortName) { onSave(form); onClose(); } }}>Save Club</button>
      </div>
    </>
  );
}

// ── Club Task Form ────────────────────────────────────────────
function TaskForm({ initial = {}, clubId, onSave, onClose }) {
  const [form, setForm] = useState({ title: '', type: 'Task', dueDate: '', dueTime: '18:00', priority: 'Medium', status: 'Not Started', notes: '', clubId, ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <div className="form-group">
        <label className="label">Title*</label>
        <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" autoFocus />
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="label">Type</label>
          <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
            {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Priority</label>
          <select className="select" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
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
      <div className="form-group">
        <label className="label">Status</label>
        <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
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

// ── Meeting Form ──────────────────────────────────────────────
function MeetingForm({ clubId, onSave, onClose }) {
  const [form, setForm] = useState({ clubId, title: '', date: new Date().toISOString().split('T')[0], time: '18:00', location: '', attendees: '', agenda: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <div className="form-group">
        <label className="label">Meeting Title*</label>
        <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Weekly Sync, Planning Meeting" autoFocus />
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="label">Date</label>
          <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Time</label>
          <input className="input" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Location</label>
        <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. ENG 103, Online (Zoom)" />
      </div>
      <div className="form-group">
        <label className="label">Attendees</label>
        <input className="input" value={form.attendees} onChange={e => set('attendees', e.target.value)} placeholder="e.g. Alex, Sam, Jordan" />
      </div>
      <div className="form-group">
        <label className="label">Agenda</label>
        <textarea className="textarea" value={form.agenda} onChange={e => set('agenda', e.target.value)} placeholder="Topics to cover in this meeting..." />
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--indigo-dim2)', borderRadius: 6 }}>
        📝 A meeting note will be automatically created in your Notes tab
      </div>
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (form.title) { onSave(form); onClose(); } }}>Log Meeting</button>
      </div>
    </>
  );
}

// ── Club Card ─────────────────────────────────────────────────
function ClubCard({ club, tasks, meetings, onEdit, onDelete, onAddTask, onEditTask, onDeleteTask, onAddMeeting, onDeleteMeeting, onViewNote, meetingNotes }) {
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const priorityColor = { High: 'danger', Medium: 'warning', Low: 'indigo' };

  return (
    <div className="card" style={{ borderTop: `3px solid ${club.color}` }}>
      {/* Club header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-12">
          <div style={{ width: 40, height: 40, borderRadius: 10, background: club.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: club.color }}>
            {club.shortName.slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{club.name}</div>
            <div className="flex gap-8 items-center" style={{ marginTop: 2 }}>
              {club.role && <span style={{ fontSize: 11, background: club.color + '22', color: club.color, padding: '1px 8px', borderRadius: 99, fontWeight: 600 }}>{club.role}</span>}
              {club.description && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{club.description}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-8 items-center">
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{activeTasks.length} active · {meetings.length} meetings</span>
          <button className="btn-icon" onClick={onEdit}><Pencil size={14} /></button>
          <button className="btn-icon" onClick={onDelete}><Trash2 size={14} /></button>
          <button className="btn-icon" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex gap-16" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: expanded ? 16 : 0 }}>
        <span style={{ color: activeTasks.filter(t => t.priority === 'High').length > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
          {activeTasks.filter(t => t.priority === 'High').length} high priority
        </span>
        <span>{completedTasks.length} completed</span>
        <span>{meetings.length} meetings logged</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <>
          <div className="divider" />
          <div className="tab-bar" style={{ marginBottom: 14 }}>
            {[['tasks', 'Tasks'], ['meetings', 'Meetings']].map(([k, l]) => (
              <button key={k} className={`tab ${activeTab === k ? 'active' : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          {activeTab === 'tasks' && (
            <>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Tasks</span>
                <button className="btn btn-ghost btn-sm" onClick={onAddTask}><Plus size={13} /> Add Task</button>
              </div>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 12 }}>No tasks yet</div>
              ) : (
                <div className="flex-col gap-6">
                  {tasks.map(t => (
                    <div key={t.id} className="flex items-center gap-10" style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8, opacity: t.status === 'Completed' ? 0.6 : 1 }}>
                      <button className="btn-icon" style={{ padding: 2, color: t.status === 'Completed' ? 'var(--success)' : 'var(--text-muted)' }}
                        onClick={() => onEditTask(t.id, { status: t.status === 'Completed' ? 'Not Started' : 'Completed' })}>
                        <CheckCircle2 size={16} />
                      </button>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, textDecoration: t.status === 'Completed' ? 'line-through' : 'none' }}>{t.title}</span>
                        <div className="flex gap-8" style={{ marginTop: 2 }}>
                          <span className={`badge badge-${priorityColor[t.priority]}`} style={{ fontSize: 10 }}>{t.priority}</span>
                          <span className="badge badge-muted" style={{ fontSize: 10 }}>{t.type}</span>
                          {t.dueDate && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due {t.dueDate}</span>}
                        </div>
                      </div>
                      <button className="btn-icon" style={{ padding: 2 }} onClick={() => onDeleteTask(t.id)}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'meetings' && (
            <>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Meetings</span>
                <button className="btn btn-ghost btn-sm" onClick={onAddMeeting}><Plus size={13} /> Log Meeting</button>
              </div>
              {meetings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 12 }}>No meetings logged yet</div>
              ) : (
                <div className="flex-col gap-6">
                  {[...meetings].sort((a, b) => b.date.localeCompare(a.date)).map(m => (
                    <div key={m.id} style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, borderLeft: `3px solid ${club.color}` }}>
                      <div className="flex items-center justify-between">
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</div>
                        <div className="flex gap-8 items-center">
                          {m.noteId && (
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => onViewNote(m.noteId)}>
                              <FileText size={11} /> Notes
                            </button>
                          )}
                          <button className="btn-icon" style={{ padding: 2 }} onClick={() => onDeleteMeeting(m.id)}><Trash2 size={12} /></button>
                        </div>
                      </div>
                      <div className="flex gap-12" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        <span><Calendar size={10} style={{ display: 'inline', marginRight: 3 }} />{m.date} at {m.time}</span>
                        {m.location && <span>📍 {m.location}</span>}
                        {m.attendees && <span><Users size={10} style={{ display: 'inline', marginRight: 3 }} />{m.attendees}</span>}
                      </div>
                      {m.agenda && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Agenda: {m.agenda.slice(0, 80)}{m.agenda.length > 80 ? '...' : ''}</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── Meeting Note Viewer ───────────────────────────────────────
function MeetingNoteModal({ noteId, meetingNotes, updateMeetingNote, onClose }) {
  const note = meetingNotes.find(n => n.id === noteId);
  const [content, setContent] = useState(note?.content || '');
  if (!note) return null;
  return (
    <Modal open={true} onClose={() => { updateMeetingNote(noteId, { content }); onClose(); }} title={note.title} maxWidth={600}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
        Auto-saved to Notes tab · Last updated {new Date(note.updatedAt).toLocaleString()}
      </div>
      <textarea className="textarea" style={{ minHeight: 300, fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.8 }}
        value={content} onChange={e => setContent(e.target.value)} />
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-primary" onClick={() => { updateMeetingNote(noteId, { content }); onClose(); }}>Save & Close</button>
      </div>
    </Modal>
  );
}

// ── Main Clubs Page ───────────────────────────────────────────
export default function Clubs() {
  const { clubs, clubTasks, meetings, meetingNotes, COLORS, addClub, updateClub, deleteClub, addClubTask, updateClubTask, deleteClubTask, addMeeting, deleteMeeting, updateMeetingNote } = useApp();
  const toast = useToast();
  const [showAddClub, setShowAddClub] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [deletingClub, setDeletingClub] = useState(null);
  const [addTaskFor, setAddTaskFor] = useState(null);
  const [addMeetingFor, setAddMeetingFor] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);

  const getClubTasks = (clubId) => clubTasks.filter(t => t.clubId === clubId);
  const getClubMeetings = (clubId) => meetings.filter(m => m.clubId === clubId);

  const totalActiveTasks = clubTasks.filter(t => t.status !== 'Completed').length;
  const upcomingMeetings = meetings.filter(m => m.date >= new Date().toISOString().split('T')[0]).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Clubs & Extracurriculars</div>
          <div className="page-subtitle">{clubs.length} clubs · {totalActiveTasks} active tasks · {upcomingMeetings} upcoming meetings</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddClub(true)}><Plus size={15} /> Add Club</button>
      </div>

      {clubs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={36} /></div>
          <p>No clubs added yet. Add your first club to get started.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddClub(true)}><Plus size={15} /> Add Club</button>
        </div>
      ) : (
        <div className="flex-col gap-16">
          {clubs.map(club => (
            <ClubCard key={club.id} club={club}
              tasks={getClubTasks(club.id)}
              meetings={getClubMeetings(club.id)}
              meetingNotes={meetingNotes}
              onEdit={() => setEditingClub(club)}
              onDelete={() => setDeletingClub(club)}
              onAddTask={() => setAddTaskFor(club.id)}
              onEditTask={(id, data) => { updateClubTask(id, data); }}
              onDeleteTask={(id) => { deleteClubTask(id); toast('Task deleted.'); }}
              onAddMeeting={() => setAddMeetingFor(club.id)}
              onDeleteMeeting={(id) => { deleteMeeting(id); toast('Meeting deleted.'); }}
              onViewNote={(noteId) => setViewingNote(noteId)}
            />
          ))}
        </div>
      )}

      {/* Add Club */}
      <Modal open={showAddClub} onClose={() => setShowAddClub(false)} title="Add Club">
        <ClubForm colors={COLORS} onClose={() => setShowAddClub(false)} onSave={(d) => { addClub(d); toast('Club added!', 'success'); }} />
      </Modal>

      {/* Edit Club */}
      <Modal open={!!editingClub} onClose={() => setEditingClub(null)} title="Edit Club">
        {editingClub && <ClubForm initial={editingClub} colors={COLORS} onClose={() => setEditingClub(null)} onSave={(d) => { updateClub(editingClub.id, d); toast('Club updated!', 'success'); }} />}
      </Modal>

      {/* Delete Club */}
      <ConfirmDialog open={!!deletingClub} onClose={() => setDeletingClub(null)}
        title="Delete Club" message={`Delete "${deletingClub?.name}"? All tasks and meetings for this club will also be removed.`}
        onConfirm={() => { deleteClub(deletingClub.id); toast('Club deleted.'); }} />

      {/* Add Task */}
      <Modal open={!!addTaskFor} onClose={() => setAddTaskFor(null)} title="Add Club Task">
        {addTaskFor && <TaskForm clubId={addTaskFor} onClose={() => setAddTaskFor(null)} onSave={(d) => { addClubTask(d); toast('Task added!', 'success'); }} />}
      </Modal>

      {/* Log Meeting */}
      <Modal open={!!addMeetingFor} onClose={() => setAddMeetingFor(null)} title="Log Meeting">
        {addMeetingFor && <MeetingForm clubId={addMeetingFor} onClose={() => setAddMeetingFor(null)}
          onSave={(d) => { addMeeting(d); toast('Meeting logged + note created!', 'success'); }} />}
      </Modal>

      {/* View Meeting Note */}
      {viewingNote && <MeetingNoteModal noteId={viewingNote} meetingNotes={meetingNotes} updateMeetingNote={updateMeetingNote} onClose={() => setViewingNote(null)} />}
    </div>
  );
}
