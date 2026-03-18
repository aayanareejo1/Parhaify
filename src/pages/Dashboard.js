import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, CheckCircle2, Clock, AlertTriangle, Calendar, Users, ListTodo, Layout } from 'lucide-react';

const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

export default function Dashboard() {
  const { assignments, courses, clubTasks, clubs, tasks, spaceTasks, spaces } = useApp();
  const [tab, setTab] = useState('today');

  const now = new Date();
  const todayStr = fmt(now);
  const weekEnd = fmt(addDays(now, 7));

  const getSpaceName = (spaceId) => spaces.find(s => s.id === spaceId)?.name;
  const getSpaceColor = (spaceId) => spaces.find(s => s.id === spaceId)?.color;

  // Merge ALL task types into one unified list
  const allTasks = [
    ...assignments.map(a => ({ ...a, _source: 'academic', _tag: courses.find(c => c.id === a.courseId)?.code, _color: courses.find(c => c.id === a.courseId)?.color, _tagLabel: 'Course' })),
    ...clubTasks.map(t => ({ ...t, _source: 'club', _tag: clubs.find(c => c.id === t.clubId)?.shortName, _color: clubs.find(c => c.id === t.clubId)?.color, _tagLabel: 'Club' })),
    ...tasks.map(t => ({ ...t, _source: 'task', _tag: t.category || 'Task', _color: t.color, _tagLabel: 'Task' })),
    ...spaceTasks.map(t => ({ ...t, _source: 'space', _tag: getSpaceName(t.spaceId), _color: getSpaceColor(t.spaceId), _tagLabel: 'Space' })),
  ];

  const active = allTasks.filter(a => a.status !== 'Completed' && a.dueDate);
  const overdue = active.filter(a => a.dueDate < todayStr);
  const todayItems = active.filter(a => a.dueDate === todayStr);
  const thisWeek = active.filter(a => a.dueDate > todayStr && a.dueDate <= weekEnd);
  const upcoming = active.filter(a => a.dueDate > weekEnd);
  const completed = allTasks.filter(a => a.status === 'Completed');
  const tabData = { today: todayItems, week: thisWeek, upcoming, overdue };

  const sourceColors = { academic: 'var(--indigo)', club: '#8b5cf6', task: '#f97316', space: '#14b8a6' };
  const sourceBadge = { academic: 'Course', club: 'Club', task: 'Task', space: 'Space' };
  const priorityColor = { High: 'danger', Medium: 'warning', Low: 'indigo' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'All Active', value: active.length, icon: <BookOpen size={18} />, color: 'var(--indigo)' },
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

      <div className="tab-bar" style={{ marginBottom: 16, width: 'fit-content' }}>
        {[['today','Today'],['week','This Week'],['upcoming','Upcoming'],['overdue','Overdue']].map(([k,l]) => (
          <button key={k} className={`tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>
            {l} {tabData[k].length > 0 && <span style={{ fontSize: 11, opacity: 0.7 }}>({tabData[k].length})</span>}
          </button>
        ))}
      </div>

      {tabData[tab].length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">✓</div><p>Nothing here — you're all caught up!</p></div>
      ) : (
        <div className="flex-col gap-8">
          {tabData[tab].sort((a,b) => { const po = {High:0,Medium:1,Low:2}; return po[a.priority]-po[b.priority]; }).map(a => (
            <div key={a.id} className="card card-sm flex items-center gap-12"
              style={{ borderLeft: `3px solid ${a._color || sourceColors[a._source]}` }}>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-8" style={{ flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</span>
                  <span className={`badge badge-${priorityColor[a.priority]}`}>{a.priority}</span>
                  {a.type && <span className="badge badge-muted">{a.type}</span>}
                  <span className="badge" style={{ background: sourceColors[a._source]+'22', color: sourceColors[a._source], fontSize: 10 }}>{sourceBadge[a._source]}</span>
                </div>
                <div className="flex items-center gap-12 mt-8" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {a._tag && <span className="flex items-center gap-6"><span className="course-dot" style={{ background: a._color || '#666' }} />{a._tag}</span>}
                  <span>Due {a.dueDate} at {a.dueTime}</span>
                </div>
              </div>
              <span className={`badge badge-${a.status==='Completed'?'success':a.status==='In Progress'?'warning':'muted'}`}>{a.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
