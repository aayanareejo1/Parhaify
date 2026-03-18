import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const fmt = (d) => d.toISOString().split('T')[0];

function useAllEvents({ assignments, courses, clubTasks, clubs, tasks, spaceTasks, spaces, timeBlocks, meetings }) {
  return useMemo(() => {
    const events = [];
    const getCourse = (id) => courses.find(c => c.id === id);
    const getClub = (id) => clubs.find(c => c.id === id);
    const getSpace = (id) => spaces.find(s => s.id === id);

    assignments.forEach(a => {
      if (!a.dueDate) return;
      const course = getCourse(a.courseId);
      events.push({ id: a.id, date: a.dueDate, time: a.dueTime, title: a.title, color: course?.color || '#6366f1', tag: course?.code || 'Course', source: 'academic', priority: a.priority, status: a.status, type: 'deadline' });
    });

    clubTasks.forEach(t => {
      if (!t.dueDate) return;
      const club = getClub(t.clubId);
      events.push({ id: t.id, date: t.dueDate, time: t.dueTime, title: t.title, color: club?.color || '#8b5cf6', tag: club?.shortName || 'Club', source: 'club', priority: t.priority, status: t.status, type: 'deadline' });
    });

    tasks.forEach(t => {
      if (!t.dueDate) return;
      events.push({ id: t.id, date: t.dueDate, time: t.dueTime, title: t.title, color: t.color || '#f97316', tag: t.category || 'Task', source: 'task', priority: t.priority, status: t.status, type: 'deadline' });
    });

    spaceTasks.forEach(t => {
      if (!t.dueDate) return;
      const space = getSpace(t.spaceId);
      events.push({ id: t.id, date: t.dueDate, time: t.dueTime, title: t.title, color: space?.color || '#14b8a6', tag: space?.name || 'Space', source: 'space', priority: t.priority, status: t.status, type: 'deadline' });
    });

    timeBlocks.forEach(b => {
      events.push({ id: b.id, date: b.date, time: b.startTime, endTime: b.endTime, title: b.title, color: b.color || '#6366f1', tag: 'Time Block', source: 'block', type: 'block' });
    });

    meetings.forEach(m => {
      events.push({ id: m.id, date: m.date, time: m.time, title: m.title, color: '#8b5cf6', tag: 'Meeting', source: 'meeting', type: 'meeting' });
    });

    return events;
  }, [assignments, courses, clubTasks, clubs, tasks, spaceTasks, spaces, timeBlocks, meetings]);
}

// ── Event pill ────────────────────────────────────────────────
function EventPill({ event, onClick }) {
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick(event); }}
      style={{ background: event.color + '22', borderLeft: `3px solid ${event.color}`, borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 500, color: event.color, cursor: 'pointer', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
      title={event.title}>
      {event.time && <span style={{ opacity: 0.7, marginRight: 4 }}>{event.time}</span>}
      {event.title}
    </div>
  );
}

// ── Event detail popup ────────────────────────────────────────
function EventPopup({ event, onClose }) {
  if (!event) return null;
  const sourceLabel = { academic: 'Assignment', club: 'Club Task', task: 'Task', space: 'Space Task', block: 'Time Block', meeting: 'Meeting' };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-elevated)', border: `1px solid ${event.color}`, borderRadius: 'var(--radius-lg)', padding: 20, minWidth: 280, maxWidth: 360, boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: event.color, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{event.title}</span>
          <button className="btn-icon" onClick={onClose} style={{ padding: 2 }}>✕</button>
        </div>
        <div className="flex-col gap-8" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <div className="flex gap-8"><span style={{ color: 'var(--text-muted)', minWidth: 70 }}>Type</span><span className="badge badge-muted">{sourceLabel[event.source]}</span></div>
          <div className="flex gap-8"><span style={{ color: 'var(--text-muted)', minWidth: 70 }}>Tag</span><span style={{ color: event.color }}>{event.tag}</span></div>
          <div className="flex gap-8"><span style={{ color: 'var(--text-muted)', minWidth: 70 }}>Date</span>{event.date}</div>
          {event.time && <div className="flex gap-8"><span style={{ color: 'var(--text-muted)', minWidth: 70 }}>Time</span>{event.time}{event.endTime ? ` – ${event.endTime}` : ''}</div>}
          {event.priority && <div className="flex gap-8"><span style={{ color: 'var(--text-muted)', minWidth: 70 }}>Priority</span><span className={`badge badge-${event.priority === 'High' ? 'danger' : event.priority === 'Medium' ? 'warning' : 'indigo'}`}>{event.priority}</span></div>}
          {event.status && <div className="flex gap-8"><span style={{ color: 'var(--text-muted)', minWidth: 70 }}>Status</span><span className={`badge badge-${event.status === 'Completed' ? 'success' : event.status === 'In Progress' ? 'warning' : 'muted'}`}>{event.status}</span></div>}
        </div>
      </div>
    </div>
  );
}

// ── Month view ────────────────────────────────────────────────
function MonthView({ date, events, onEventClick, onDayClick }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = fmt(new Date());
  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getDateStr = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const getDayEvents = (d) => events.filter(e => e.date === getDateStr(d)).sort((a,b) => (a.time||'').localeCompare(b.time||''));

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-subtle)' }}>
        {DAYS.map(d => <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{d}</div>)}
      </div>
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, i) => {
          const dateStr = day ? getDateStr(day) : null;
          const dayEvents = day ? getDayEvents(day) : [];
          const isToday = dateStr === todayStr;
          const isWeekend = i % 7 === 0 || i % 7 === 6;
          return (
            <div key={i}
              onClick={() => day && onDayClick(dateStr)}
              style={{ minHeight: 100, padding: '6px 4px', borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: isWeekend && day ? 'rgba(255,255,255,0.01)' : 'transparent', cursor: day ? 'pointer' : 'default', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (day) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={e => { if (day) e.currentTarget.style.background = isWeekend ? 'rgba(255,255,255,0.01)' : 'transparent'; }}>
              {day && (
                <>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: isToday ? 'var(--indigo)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? 'white' : 'var(--text-primary)' }}>{day}</span>
                  </div>
                  {dayEvents.slice(0, 3).map(e => <EventPill key={e.id} event={e} onClick={onEventClick} />)}
                  {dayEvents.length > 3 && <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 4 }}>+{dayEvents.length - 3} more</div>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week view ─────────────────────────────────────────────────
function WeekView({ date, events, onEventClick }) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(startOfWeek); d.setDate(d.getDate() + i); return d; });
  const todayStr = fmt(new Date());
  const HOURS = Array.from({ length: 17 }, (_, i) => i + 7);

  const getDayEvents = (d) => events.filter(e => e.date === fmt(d)).sort((a,b) => (a.time||'').localeCompare(b.time||''));
  const timeToTop = (t) => { if (!t) return 0; const [h,m] = t.split(':').map(Number); return ((h - 7) * 60 + m) * (48/60); };
  const duration = (s, e) => { if (!s || !e) return 48; const [sh,sm] = s.split(':').map(Number); const [eh,em] = e.split(':').map(Number); return Math.max(((eh*60+em)-(sh*60+sm))*(48/60), 24); };

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div />
        {days.map((d,i) => {
          const isToday = fmt(d) === todayStr;
          return (
            <div key={i} style={{ padding: '8px 4px', textAlign: 'center', borderLeft: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{DAYS[i]}</div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: isToday ? 'var(--indigo)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2px auto 0' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isToday ? 'white' : 'var(--text-primary)' }}>{d.getDate()}</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* Time grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', position: 'relative', flex: 1 }}>
        {/* Hour labels */}
        <div>
          {HOURS.map(h => (
            <div key={h} style={{ height: 48, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', paddingTop: 4, paddingRight: 8, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{h === 12 ? '12 PM' : h > 12 ? `${h-12} PM` : `${h} AM`}</span>
            </div>
          ))}
        </div>
        {/* Day columns */}
        {days.map((d, di) => {
          const dayEvents = getDayEvents(d);
          return (
            <div key={di} style={{ borderLeft: '1px solid var(--border-subtle)', position: 'relative' }}>
              {HOURS.map(h => <div key={h} style={{ height: 48, borderBottom: '1px solid var(--border-subtle)' }} />)}
              {dayEvents.map(e => (
                <div key={e.id} onClick={() => onEventClick(e)}
                  style={{ position: 'absolute', left: 2, right: 2, top: timeToTop(e.time) + 2, height: e.endTime ? duration(e.time, e.endTime) - 4 : 22, background: e.color + '33', border: `1px solid ${e.color}66`, borderLeft: `3px solid ${e.color}`, borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 500, color: e.color, cursor: 'pointer', overflow: 'hidden', zIndex: 1 }}>
                  {e.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Day view ──────────────────────────────────────────────────
function DayView({ date, events, onEventClick }) {
  const dateStr = fmt(date);
  const dayEvents = events.filter(e => e.date === dateStr).sort((a,b) => (a.time||'23:59').localeCompare(b.time||'23:59'));
  const HOURS = Array.from({ length: 17 }, (_, i) => i + 7);
  const timeToTop = (t) => { if (!t) return 0; const [h,m] = t.split(':').map(Number); return ((h - 7) * 60 + m) * (60/60); };
  const duration = (s, e) => { if (!s || !e) return 44; const [sh,sm] = s.split(':').map(Number); const [eh,em] = e.split(':').map(Number); return Math.max(((eh*60+em)-(sh*60+sm))*(60/60), 28); };

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', gap: 20 }}>
      {/* Timeline */}
      <div style={{ flex: 1, position: 'relative' }}>
        {HOURS.map(h => (
          <div key={h} style={{ height: 60, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', paddingTop: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 52, textAlign: 'right', paddingRight: 12 }}>{h === 12 ? '12 PM' : h > 12 ? `${h-12} PM` : `${h} AM`}</span>
          </div>
        ))}
        {/* Events */}
        {dayEvents.filter(e => e.time).map(e => (
          <div key={e.id} onClick={() => onEventClick(e)}
            style={{ position: 'absolute', left: 64, right: 8, top: timeToTop(e.time) + 2, height: e.endTime ? duration(e.time, e.endTime) - 4 : 40, background: e.color + '22', border: `1px solid ${e.color}55`, borderLeft: `4px solid ${e.color}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', zIndex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: e.color }}>{e.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.time}{e.endTime ? ` – ${e.endTime}` : ''} · {e.tag}</div>
          </div>
        ))}
      </div>
      {/* All-day / no-time events */}
      <div style={{ width: 240, flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-secondary)' }}>
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        {dayEvents.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nothing scheduled</div>
        ) : dayEvents.map(e => (
          <div key={e.id} onClick={() => onEventClick(e)}
            style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 6, background: e.color + '15', borderLeft: `3px solid ${e.color}`, cursor: 'pointer' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: e.color }}>{e.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{e.tag} {e.time ? `· ${e.time}` : ''}</div>
            {e.priority && <span className={`badge badge-${e.priority === 'High' ? 'danger' : e.priority === 'Medium' ? 'warning' : 'indigo'}`} style={{ fontSize: 10, marginTop: 4 }}>{e.priority}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Calendar Page ────────────────────────────────────────
export default function Calendar() {
  const { assignments, courses, clubTasks, clubs, tasks, spaceTasks, spaces, timeBlocks, meetings } = useApp();
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = useAllEvents({ assignments, courses, clubTasks, clubs, tasks, spaceTasks, spaces, timeBlocks, meetings });

  const navigate = (dir) => {
    const d = new Date(date);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setDate(d);
  };

  const goToday = () => setDate(new Date());

  const getTitle = () => {
    if (view === 'month') return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    if (view === 'week') {
      const start = new Date(date); start.setDate(date.getDate() - date.getDay());
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${end.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Legend
  const sources = [
    { label: 'Courses', color: '#6366f1' },
    { label: 'Clubs', color: '#8b5cf6' },
    { label: 'Tasks', color: '#f97316' },
    { label: 'Spaces', color: '#14b8a6' },
    { label: 'Time Blocks', color: '#06b6d4' },
    { label: 'Meetings', color: '#8b5cf6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 116px)', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="btn-icon" onClick={() => navigate(-1)}><ChevronLeft size={18} /></button>
            <button className="btn btn-ghost btn-sm" onClick={goToday}>Today</button>
            <button className="btn-icon" onClick={() => navigate(1)}><ChevronRight size={18} /></button>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.3 }}>{getTitle()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {sources.map(s => (
              <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />{s.label}
              </span>
            ))}
          </div>
          {/* View switcher */}
          <div className="tab-bar">
            {[['month','Month'],['week','Week'],['day','Day']].map(([k,l]) => (
              <button key={k} className={`tab ${view===k?'active':''}`} onClick={() => setView(k)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar views */}
      <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {view === 'month' && <MonthView date={date} events={events} onEventClick={setSelectedEvent} onDayClick={(d) => { setDate(new Date(d + 'T12:00:00')); setView('day'); }} />}
        {view === 'week' && <WeekView date={date} events={events} onEventClick={setSelectedEvent} />}
        {view === 'day' && <DayView date={date} events={events} onEventClick={setSelectedEvent} />}
      </div>

      {/* Event popup */}
      {selectedEvent && <EventPopup event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
