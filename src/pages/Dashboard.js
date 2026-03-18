import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, CheckCircle2, Clock, AlertTriangle, TrendingUp, Calendar, Users } from 'lucide-react';

const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

export default function Dashboard() {
  const { assignments, courses, clubTasks, clubs } = useApp();
  const [tab, setTab] = useState('today');

  const now = new Date();
  const todayStr = fmt(now);
  const weekEnd = fmt(addDays(now, 7));

  // Merge academic + club tasks into unified list
  const allTasks = [
    ...assignments.map(a => ({ ...a, _type: 'academic', _label: courses.find(c => c.id === a.courseId)?.code, _color: courses.find(c => c.id === a.courseId)?.color })),
    ...clubTasks.map(t => ({ ...t, _type: 'club', _label: clubs.find(c => c.id === t.clubId)?.shortName, _color: clubs.find(c => c.id === t.clubId)?.color })),
  ];

  const active = allTasks.filter(a => a.status !== 'Completed');
  const overdue = active.filter(a => a.dueDate < todayStr);
  const todayItems = active.filter(a => a.dueDate === todayStr);
  const thisWeek = active.filter(a => a.dueDate > todayStr && a.dueDate <= weekEnd);
  const upcoming = active.filter(a => a.dueDate > weekEnd);
  const completed = allTasks.filter(a => a.status === 'Completed');

  const tabData = { today: todayItems, week: thisWeek, upcoming, overdue };
  const priorityColor = { High: 'var(--danger)', Medium: 'var(--warning)', Low: '#60a5fa' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Active', value: active.length, icon: <BookOpen size={18} />, color: 'var(--indigo)' },
          { label: 'Due Today', value: todayItems.length, icon: <Calendar size={18} />, color: 'var(--warning)' },
          { label: 'Overdue', value: overdue.length, icon: <AlertTriangle size={18} />, color: 'var(--danger)' },
          { label: 'This Week', value: thisWeek.length, icon: <Clock size={18} />, color: '#14b8a6' },
          { label: 'Completed', value: completed.length, icon: <CheckCircle2 size={18} />, color: 'var(--success)' },
          { label: 'Club Tasks', value: clubTasks.filter(t => t.status !== 'Completed').length, icon: <Users size={18} />, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="stat-label">{s.label}</span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 16, width: 'fit-content' }}>
        {[['today', 'Today'], ['week', 'This Week'], ['upcoming', 'Upcoming'], ['overdue', 'Overdue']].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {l} {tabData[k].length > 0 && <span style={{ fontSize: 11, opacity: 0.7 }}>({tabData[k].length})</span>}
          </button>
        ))}
      </div>

      {tabData[tab].length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <p>Nothing here — you're all caught up!</p>
        </div>
      ) : (
        <div className="flex-col gap-8">
          {tabData[tab].map(a => (
            <div key={a.id} className="card card-sm flex items-center gap-12" style={{ borderLeft: `3px solid ${priorityColor[a.priority]}` }}>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-8">
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</span>
                  <span className={`badge badge-${a.priority === 'High' ? 'danger' : a.priority === 'Medium' ? 'warning' : 'indigo'}`}>{a.priority}</span>
                  <span className="badge badge-muted">{a.type}</span>
                  {a._type === 'club' && <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: 10 }}>Club</span>}
                </div>
                <div className="flex items-center gap-12 mt-8" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {a._label && (
                    <span className="flex items-center gap-8">
                      <span className="course-dot" style={{ background: a._color || '#666' }} />
                      {a._label}
                    </span>
                  )}
                  <span>Due {a.dueDate} at {a.dueTime}</span>
                </div>
              </div>
              <span className={`badge badge-${a.status === 'Completed' ? 'success' : a.status === 'In Progress' ? 'warning' : 'muted'}`}>{a.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
