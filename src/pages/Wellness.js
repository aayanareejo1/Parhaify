import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast, Modal } from '../components/UI';
import { Activity, AlertTriangle, BookOpen, Clock, TrendingUp, Plus, Trash2, CheckCircle, Smile, Meh, Frown, Zap } from 'lucide-react';

const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

// ── Workload stress calculator ────────────────────────────────
function calcStress(assignments) {
  const now = new Date();
  const active = assignments.filter(a => a.status !== 'Completed');
  let score = 0;
  const warnings = [];

  // Overdue items
  const overdue = active.filter(a => new Date(a.dueDate) < now);
  score += overdue.length * 20;
  if (overdue.length > 0) warnings.push(`${overdue.length} overdue item${overdue.length > 1 ? 's' : ''} need attention`);

  // Due in next 48h
  const urgent = active.filter(a => {
    const diff = (new Date(a.dueDate + 'T' + a.dueTime) - now) / (1000 * 60 * 60);
    return diff > 0 && diff <= 48;
  });
  score += urgent.length * 15;
  if (urgent.length >= 3) warnings.push(`${urgent.length} deadlines in the next 48 hours`);

  // High priority items this week
  const weekEnd = addDays(now, 7);
  const highPriority = active.filter(a => a.priority === 'High' && new Date(a.dueDate) <= weekEnd);
  score += highPriority.length * 10;
  if (highPriority.length >= 3) warnings.push(`${highPriority.length} high-priority items this week`);

  // Total active items
  score += Math.min(active.length * 3, 30);

  // Deadline clustering — multiple due same day
  const byDate = {};
  active.forEach(a => { byDate[a.dueDate] = (byDate[a.dueDate] || 0) + 1; });
  const clusters = Object.entries(byDate).filter(([d, count]) => count >= 2 && new Date(d) >= now);
  clusters.forEach(([d, count]) => {
    score += count * 8;
    const dateStr = new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    warnings.push(`${count} deadlines clustered on ${dateStr}`);
  });

  score = Math.min(score, 100);

  let level, color, label, advice;
  if (score < 25) { level = 'low'; color = '#22c55e'; label = 'Low'; advice = "You're in good shape! A great time to get ahead on upcoming work."; }
  else if (score < 50) { level = 'moderate'; color = '#f59e0b'; label = 'Moderate'; advice = 'Manageable workload. Stay on top of your schedule and take regular breaks.'; }
  else if (score < 75) { level = 'high'; color = '#f97316'; label = 'High'; advice = "Heavy week ahead. Prioritize ruthlessly and don't forget to rest."; }
  else { level = 'critical'; color = '#f43f5e'; label = 'Critical'; advice = 'Burnout risk detected. Consider talking to your professor about extensions or dropping lower-priority tasks.'; }

  return { score, level, color, label, advice, warnings, clusters };
}

// ── Busy week chart ───────────────────────────────────────────
function BusyWeekChart({ assignments, courses }) {
  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(now, i);
    return { date: fmt(d), label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), short: d.toLocaleDateString('en-US', { weekday: 'short' }), dayNum: d.getDate() };
  });

  const getCourse = (id) => courses.find(c => c.id === id);
  const active = assignments.filter(a => a.status !== 'Completed');

  const dayData = days.map(day => {
    const items = active.filter(a => a.dueDate === day.date);
    const highCount = items.filter(a => a.priority === 'High').length;
    return { ...day, items, count: items.length, highCount };
  });

  const maxCount = Math.max(...dayData.map(d => d.count), 1);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, padding: '0 4px' }}>
        {dayData.map(day => {
          const heightPct = day.count === 0 ? 4 : (day.count / maxCount) * 100;
          const isToday = day.date === fmt(now);
          const barColor = day.highCount > 0 ? '#f43f5e' : day.count >= 2 ? '#f59e0b' : '#6366f1';
          return (
            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {day.count > 0 && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{day.count}</span>
              )}
              <div style={{ width: '100%', position: 'relative' }}>
                <div style={{
                  width: '100%', height: `${heightPct}px`, minHeight: 4,
                  background: day.count === 0 ? 'var(--bg-elevated)' : barColor + 'cc',
                  borderRadius: 4, border: isToday ? `2px solid ${barColor}` : 'none',
                  transition: 'height 0.3s ease',
                }} title={`${day.label}: ${day.count} item${day.count !== 1 ? 's' : ''}`} />
              </div>
              <span style={{ fontSize: 9, color: isToday ? 'var(--indigo-hover)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 400 }}>
                {isToday ? 'Today' : day.short}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-12" style={{ marginTop: 12, flexWrap: 'wrap' }}>
        {[['#6366f1', '1 item'], ['#f59e0b', '2+ items'], ['#f43f5e', 'High priority']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-8" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, background: c + 'cc', borderRadius: 2, display: 'inline-block' }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Study time tracker ────────────────────────────────────────
function StudyTracker({ studyLogs, courses, addStudyLog, deleteStudyLog }) {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ courseId: courses[0]?.id || '', date: fmt(new Date()), hours: 1, notes: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const getCourse = (id) => courses.find(c => c.id === id);

  // Weekly totals per course
  const now = new Date();
  const weekStart = fmt(addDays(now, -7));
  const weekLogs = studyLogs.filter(l => l.date >= weekStart);
  const totalsByHour = {};
  weekLogs.forEach(l => { totalsByHour[l.courseId] = (totalsByHour[l.courseId] || 0) + parseFloat(l.hours); });
  const totalWeekHours = Object.values(totalsByHour).reduce((a, b) => a + b, 0);

  const handleSave = () => {
    if (!form.courseId || !form.hours) return;
    addStudyLog(form);
    toast('Study session logged!', 'success');
    setShowAdd(false);
    setForm({ courseId: courses[0]?.id || '', date: fmt(new Date()), hours: 1, notes: '' });
  };

  const recent = [...studyLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Study Time Tracker</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{totalWeekHours.toFixed(1)}h logged this week</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={13} /> Log Session</button>
      </div>

      {/* Per-course breakdown */}
      {courses.length > 0 && (
        <div className="flex-col gap-8" style={{ marginBottom: 16 }}>
          {courses.map(c => {
            const hours = totalsByHour[c.id] || 0;
            const pct = totalWeekHours > 0 ? (hours / totalWeekHours) * 100 : 0;
            return (
              <div key={c.id}>
                <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                  <span className="flex items-center gap-8" style={{ fontSize: 12 }}>
                    <span className="course-dot" style={{ background: c.color }} />{c.code}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hours.toFixed(1)}h</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: c.color, borderRadius: 99, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent logs */}
      {recent.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 12 }}>No sessions logged yet</div>
      ) : (
        <div className="flex-col gap-6">
          {recent.map(l => {
            const course = getCourse(l.courseId);
            return (
              <div key={l.id} className="flex items-center gap-10" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="course-dot" style={{ background: course?.color || '#666' }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{course?.code || 'Unknown'}</span>
                  {l.notes && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{l.notes}</span>}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.date}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--indigo-hover)' }}>{l.hours}h</span>
                <button className="btn-icon" style={{ padding: 2 }} onClick={() => { deleteStudyLog(l.id); toast('Log removed.'); }}><Trash2 size={12} /></button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Log Study Session">
        <div className="form-group">
          <label className="label">Course</label>
          <select className="select" value={form.courseId} onChange={e => set('courseId', e.target.value)}>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Date</label>
            <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Hours spent</label>
            <input className="input" type="number" min={0.5} max={12} step={0.5} value={form.hours} onChange={e => set('hours', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Notes (optional)</label>
          <input className="input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="What did you work on?" />
        </div>
        <div className="modal-footer" style={{ padding: 0 }}>
          <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Session</button>
        </div>
      </Modal>
    </div>
  );
}

// ── Weekly reflection ─────────────────────────────────────────
const MOODS = [
  { value: 1, icon: <Frown size={22} />, label: 'Struggling', color: '#f43f5e' },
  { value: 2, icon: <Frown size={22} />, label: 'Stressed', color: '#f97316' },
  { value: 3, icon: <Meh size={22} />, label: 'Okay', color: '#f59e0b' },
  { value: 4, icon: <Smile size={22} />, label: 'Good', color: '#22c55e' },
  { value: 5, icon: <Smile size={22} />, label: 'Great', color: '#6366f1' },
];

function WeeklyReflection({ reflections, addReflection, deleteReflection }) {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState(3);
  const [wins, setWins] = useState('');
  const [struggles, setStruggles] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!wins.trim() && !struggles.trim()) { toast('Add at least a win or struggle.', 'error'); return; }
    addReflection({ mood, wins, struggles, notes, week: fmt(new Date()) });
    toast('Reflection saved!', 'success');
    setShowForm(false);
    setMood(3); setWins(''); setStruggles(''); setNotes('');
  };

  const moodInfo = (v) => MOODS.find(m => m.value === v) || MOODS[2];

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>Weekly Reflection</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><Plus size={13} /> New Check-in</button>
      </div>

      {reflections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
          No reflections yet. Check in at the end of each week to track your wellbeing.
        </div>
      ) : (
        <div className="flex-col gap-10">
          {reflections.slice(0, 5).map(r => {
            const m = moodInfo(r.mood);
            return (
              <div key={r.id} className="card card-sm" style={{ borderLeft: `3px solid ${m.color}` }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-8">
                    <span style={{ color: m.color }}>{m.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: m.color }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button className="btn-icon" style={{ padding: 2 }} onClick={() => { deleteReflection(r.id); toast('Reflection deleted.'); }}><Trash2 size={12} /></button>
                </div>
                {r.wins && <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Win: </span>{r.wins}</div>}
                {r.struggles && <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ color: '#f43f5e', fontWeight: 600 }}>↯ Struggle: </span>{r.struggles}</div>}
                {r.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.notes}</div>}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Weekly Check-in">
        <div className="form-group">
          <label className="label">How are you feeling this week?</label>
          <div className="flex gap-8" style={{ justifyContent: 'space-between' }}>
            {MOODS.map(m => (
              <button key={m.value} onClick={() => setMood(m.value)}
                style={{ flex: 1, padding: '12px 4px', borderRadius: 8, border: `2px solid ${mood === m.value ? m.color : 'var(--border)'}`, background: mood === m.value ? m.color + '22' : 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
                <span style={{ color: mood === m.value ? m.color : 'var(--text-muted)' }}>{m.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: mood === m.value ? m.color : 'var(--text-muted)' }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="label" style={{ color: '#22c55e' }}>✓ What went well this week?</label>
          <textarea className="textarea" style={{ minHeight: 70 }} value={wins} onChange={e => setWins(e.target.value)} placeholder="Completed assignments, understood a concept, good study session..." />
        </div>
        <div className="form-group">
          <label className="label" style={{ color: '#f43f5e' }}>↯ What was challenging?</label>
          <textarea className="textarea" style={{ minHeight: 70 }} value={struggles} onChange={e => setStruggles(e.target.value)} placeholder="Fell behind, hard topic, time management issues..." />
        </div>
        <div className="form-group">
          <label className="label">Additional notes</label>
          <textarea className="textarea" style={{ minHeight: 56 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything else on your mind..." />
        </div>
        <div className="modal-footer" style={{ padding: 0 }}>
          <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Reflection</button>
        </div>
      </Modal>
    </div>
  );
}

// ── Main Wellness Page ────────────────────────────────────────
export default function Wellness() {
  const { assignments, courses, studyLogs, reflections, addStudyLog, deleteStudyLog, addReflection, deleteReflection } = useApp();
  const stress = useMemo(() => calcStress(assignments), [assignments]);

  const now = new Date();
  const active = assignments.filter(a => a.status !== 'Completed');
  const weekEnd = addDays(now, 7);
  const thisWeek = active.filter(a => new Date(a.dueDate) <= weekEnd);
  const weekStudyHours = studyLogs.filter(l => l.date >= fmt(addDays(now, -7))).reduce((acc, l) => acc + parseFloat(l.hours), 0);

  // Deadline clusters
  const byDate = {};
  active.forEach(a => {
    if (new Date(a.dueDate) >= now) byDate[a.dueDate] = (byDate[a.dueDate] || []).concat(a);
  });
  const clusters = Object.entries(byDate).filter(([, items]) => items.length >= 2).sort((a, b) => a[0].localeCompare(b[0]));

  const stressGradient = `conic-gradient(${stress.color} ${stress.score * 3.6}deg, var(--bg-elevated) 0deg)`;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Wellness & Workload</div>
          <div className="page-subtitle">Track your academic stress, study habits, and wellbeing</div>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
            <Activity size={16} color={stress.color} />
            <span className="stat-label">Stress Level</span>
          </div>
          <div className="stat-value" style={{ color: stress.color }}>{stress.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Score: {stress.score}/100</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
            <Clock size={16} color="var(--indigo)" />
            <span className="stat-label">Study Hours (7d)</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--indigo)' }}>{weekStudyHours.toFixed(1)}h</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Across {courses.length} courses</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
            <BookOpen size={16} color="var(--warning)" />
            <span className="stat-label">Due This Week</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{thisWeek.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{active.length} total active</div>
        </div>
      </div>

      {/* Stress indicator + warnings */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 16 }}>
            <Zap size={16} color={stress.color} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Stress Indicator</span>
          </div>
          <div className="flex items-center gap-20">
            {/* Gauge */}
            <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: stressGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: stress.color }}>{stress.score}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: stress.color, marginBottom: 6 }}>{stress.label} Stress</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{stress.advice}</div>
            </div>
          </div>

          {stress.warnings.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {stress.warnings.map((w, i) => (
                <div key={i} className="flex items-center gap-8" style={{ padding: '6px 10px', background: stress.color + '11', borderRadius: 6, marginBottom: 4, fontSize: 12, color: stress.color }}>
                  <AlertTriangle size={12} /> {w}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deadline clustering */}
        <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 16 }}>
            <AlertTriangle size={16} color="var(--warning)" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Deadline Clusters</span>
          </div>
          {clusters.length === 0 ? (
            <div className="flex items-center gap-8" style={{ color: 'var(--success)', fontSize: 13 }}>
              <CheckCircle size={16} /> No clustered deadlines — nicely spread out!
            </div>
          ) : clusters.map(([date, items]) => {
            const d = new Date(date + 'T12:00:00');
            const daysAway = Math.round((d - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <div key={date} style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--warning)' }}>
                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `in ${daysAway} days`}
                  </span>
                </div>
                {items.map(a => (
                  <div key={a.id} className="flex items-center gap-8" style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>
                    <span className={`badge badge-${a.priority === 'High' ? 'danger' : a.priority === 'Medium' ? 'warning' : 'indigo'}`} style={{ fontSize: 10 }}>{a.priority}</span>
                    {a.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Busy week chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-8" style={{ marginBottom: 16 }}>
          <TrendingUp size={16} color="var(--indigo)" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Workload — Next 14 Days</span>
        </div>
        <BusyWeekChart assignments={assignments} courses={courses} />
      </div>

      {/* Study tracker + weekly reflection side by side */}
      <div className="grid-2">
        <div className="card">
          <StudyTracker studyLogs={studyLogs} courses={courses} addStudyLog={addStudyLog} deleteStudyLog={deleteStudyLog} />
        </div>
        <div className="card">
          <WeeklyReflection reflections={reflections} addReflection={addReflection} deleteReflection={deleteReflection} />
        </div>
      </div>
    </div>
  );
}
