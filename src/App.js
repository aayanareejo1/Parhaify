import React, { useState } from 'react';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/UI';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Assignments from './pages/Assignments';
import Clubs from './pages/Clubs';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import DailyPlanner from './pages/DailyPlanner';
import StudyAssistant from './pages/StudyAssistant';
import Wellness from './pages/Wellness';
import Spaces from './pages/Spaces';
import QuickCapture from './components/QuickCapture';
import {
  LayoutDashboard, BookOpen, ClipboardList, Users,
  ListTodo, FileText, Calendar, Sparkles, Heart,
  Bell, Zap, Layout
} from 'lucide-react';

const NAV = [
  { section: 'Main' },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { section: 'Academic' },
  { id: 'courses', label: 'Courses', icon: <BookOpen size={16} /> },
  { id: 'assignments', label: 'Assignments', icon: <ClipboardList size={16} /> },
  { section: 'Activities' },
  { id: 'clubs', label: 'Clubs', icon: <Users size={16} /> },
  { id: 'tasks', label: 'Tasks', icon: <ListTodo size={16} /> },
  { section: 'Workspace' },
  { id: 'spaces', label: 'Spaces', icon: <Layout size={16} /> },
  { id: 'planner', label: 'Daily Planner', icon: <Calendar size={16} /> },
  { id: 'notes', label: 'Notes', icon: <FileText size={16} /> },
  { section: 'Tools' },
  { id: 'assistant', label: 'Study Assistant', icon: <Sparkles size={16} /> },
  { id: 'wellness', label: 'Wellness', icon: <Heart size={16} /> },
];

const PAGES = {
  dashboard: Dashboard, courses: Courses, assignments: Assignments,
  clubs: Clubs, tasks: Tasks, spaces: Spaces,
  planner: DailyPlanner, notes: Notes,
  assistant: StudyAssistant, wellness: Wellness,
};

function AppInner() {
  const { user, notifications, markNotificationRead } = useApp();
  const [page, setPage] = useState('dashboard');
  const [showCapture, setShowCapture] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const Page = PAGES[page];
  const unread = notifications.filter(n => !n.read).length;
  const currentLabel = NAV.find(n => n.id === page)?.label || '';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="logo">
          <div className="logo-icon">S</div>
          <span className="logo-text">StudyFlow</span>
        </div>

        <div className="nav-section" style={{ flex: 1 }}>
          {NAV.map((item, i) => {
            if (item.section) return (
              <div key={i} className="nav-label" style={{ marginTop: i > 0 ? 12 : 4 }}>{item.section}</div>
            );
            return (
              <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
                {item.icon}{item.label}
              </button>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{user.avatar}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="main-area">
        <div className="topbar">
          <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{currentLabel}</div>
          <div style={{ position: 'relative' }}>
            <button className="btn-icon notif-btn" onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={18} />
              {unread > 0 && <span className="notif-badge">{unread}</span>}
            </button>
            {showNotifs && (
              <div style={{ position: 'absolute', right: 0, top: 40, width: 300, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: 13 }}>Notifications</div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px 14px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>All caught up!</div>
                ) : notifications.map(n => (
                  <div key={n.id} onClick={() => { markNotificationRead(n.id); setShowNotifs(false); }}
                    style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', background: n.read ? 'transparent' : 'var(--indigo-dim2)', fontSize: 12, color: n.read ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {!n.read && <span style={{ color: 'var(--indigo)', marginRight: 6 }}>●</span>}
                    {n.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="page-content" onClick={() => showNotifs && setShowNotifs(false)}>
          <Page />
        </div>
      </div>

      <button className="fab" onClick={() => setShowCapture(true)} title="Quick Capture"><Zap size={22} /></button>
      <QuickCapture open={showCapture} onClose={() => setShowCapture(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AppProvider>
  );
}
