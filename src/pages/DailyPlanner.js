import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, useToast } from '../components/UI';
import { Plus, Trash2, Clock } from 'lucide-react';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7am–10pm

export default function DailyPlanner() {
  const { timeBlocks, courses, addTimeBlock, deleteTimeBlock } = useApp();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ title: '', courseId: '', startTime: '09:00', endTime: '10:00', date: selectedDate });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const getCourse = (id) => courses.find(c => c.id === id);
  const todayBlocks = timeBlocks.filter(b => b.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const timeToY = (t) => {
    const [h, m] = t.split(':').map(Number);
    return ((h - 7) * 60 + m) * (48 / 60); // 48px per hour
  };
  const duration = (s, e) => {
    const [sh, sm] = s.split(':').map(Number);
    const [eh, em] = e.split(':').map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) * (48 / 60);
  };

  const handleSave = () => {
    if (!form.title) return;
    const course = getCourse(form.courseId);
    addTimeBlock({ ...form, color: course?.color || 'var(--indigo)' });
    toast('Time block added!', 'success');
    setShowAdd(false);
    setForm({ title: '', courseId: '', startTime: '09:00', endTime: '10:00', date: selectedDate });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Daily Planner</div>
          <div className="page-subtitle">Schedule your study blocks</div>
        </div>
        <div className="flex gap-12 items-center">
          <input className="input" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: 'auto' }} />
          <button className="btn btn-primary" onClick={() => { setForm(p => ({ ...p, date: selectedDate })); setShowAdd(true); }}>
            <Plus size={15} /> Add Block
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Timeline */}
        <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px', overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: HOURS.length * 48 }}>
            {/* Hour lines */}
            {HOURS.map(h => (
              <div key={h} style={{ position: 'absolute', top: (h - 7) * 48, left: 0, right: 0, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', paddingTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 44, fontVariantNumeric: 'tabular-nums' }}>
                  {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
                </span>
              </div>
            ))}
            {/* Blocks */}
            {todayBlocks.map(b => (
              <div key={b.id} style={{
                position: 'absolute', left: 52, right: 8,
                top: timeToY(b.startTime) + 2,
                height: Math.max(duration(b.startTime, b.endTime) - 4, 24),
                background: b.color + '22', border: `1px solid ${b.color}55`,
                borderLeft: `3px solid ${b.color}`, borderRadius: 6,
                padding: '4px 10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: b.color }}>{b.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.startTime} – {b.endTime}</div>
                </div>
                <button className="btn-icon" style={{ padding: 2 }} onClick={() => { deleteTimeBlock(b.id); toast('Block removed.'); }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Today's blocks list */}
        <div style={{ width: 220 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>
            <Clock size={14} style={{ display: 'inline', marginRight: 6 }} />
            Today's Schedule
          </div>
          {todayBlocks.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No blocks scheduled</p>
          ) : todayBlocks.map(b => {
            const course = getCourse(b.courseId);
            return (
              <div key={b.id} className="card card-sm" style={{ marginBottom: 8, borderLeft: `3px solid ${b.color}` }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{b.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{b.startTime} – {b.endTime}</div>
                {course && <div style={{ fontSize: 11, color: b.color, marginTop: 2 }}>{course.code}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Time Block">
        <div className="form-group">
          <label className="label">Title*</label>
          <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. CPS406 Study Session" />
        </div>
        <div className="form-group">
          <label className="label">Course</label>
          <select className="select" value={form.courseId} onChange={e => set('courseId', e.target.value)}>
            <option value="">No course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Start Time</label>
            <input className="input" type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">End Time</label>
            <input className="input" type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer" style={{ padding: 0 }}>
          <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Add Block</button>
        </div>
      </Modal>
    </div>
  );
}
