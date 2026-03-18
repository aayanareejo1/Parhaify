import React, { useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/UI';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Assignments from './pages/Assignments';
import Clubs from './pages/Clubs';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Calendar from './pages/Calendar';
import StudyAssistant from './pages/StudyAssistant';
import Wellness from './pages/Wellness';
import Spaces from './pages/Spaces';
import QuickCapture from './components/QuickCapture';
import {
  LayoutDashboard, BookOpen, ClipboardList, Users,
  ListTodo, FileText, CalendarDays, Sparkles, Heart,
  Bell, Zap, Layout, LogOut, MoreHorizontal, X
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
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={16} /> },
  { id: 'notes', label: 'Notes', icon: <FileText size={16} /> },
  { section: 'Tools' },
  { id: 'assistant', label: 'Study Assistant', icon: <Sparkles size={16} /> },
  { id: 'wellness', label: 'Wellness', icon: <Heart size={16} /> },
];

const PAGES = {
  dashboard: Dashboard, courses: Courses, assignments: Assignments,
  clubs: Clubs, tasks: Tasks, spaces: Spaces,
  calendar: Calendar, notes: Notes,
  assistant: StudyAssistant, wellness: Wellness,
};

function AppInner() {
  const { user, notifications, markNotificationRead, dataLoaded } = useApp();
  const { signOut } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [showCapture, setShowCapture] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const BOTTOM_NAV = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: 'assignments', label: 'Work', icon: <ClipboardList size={20} /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={20} /> },
    { id: 'notes', label: 'Notes', icon: <FileText size={20} /> },
    { id: 'more', label: 'More', icon: <MoreHorizontal size={20} /> },
  ];

  const MORE_PAGES = [
    { id: 'courses', label: 'Courses', icon: <BookOpen size={18} /> },
    { id: 'clubs', label: 'Clubs', icon: <Users size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <ListTodo size={18} /> },
    { id: 'spaces', label: 'Spaces', icon: <Layout size={18} /> },
    { id: 'assistant', label: 'Assistant', icon: <Sparkles size={18} /> },
    { id: 'wellness', label: 'Wellness', icon: <Heart size={18} /> },
  ];

  const Page = PAGES[page];
  const unread = notifications.filter(n => !n.read).length;
  const currentLabel = NAV.find(n => n.id === page)?.label || '';

  if (!dataLoaded) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg-base)',
        color: 'var(--text-muted)', fontSize: 13,
      }}>
        Loading your workspace...
      </div>
    );
  }

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="logo">
          <div className="logo-icon">S</div>
          <span className="logo-text">StudyFlow</span>
        </div>
        <div className="nav-section" style={{ flex: 1 }}>
          {NAV.map((item, i) => {
            if (item.section) return <div key={i} className="nav-label" style={{ marginTop: i > 0 ? 12 : 4 }}>{item.section}</div>;
            return (
              <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
                {item.icon}{item.label}
              </button>
            );
          })}
        </div>
        <div className="sidebar-footer">
          <div className="user-chip" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user.avatar
              ? <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
              : <div className="avatar">{user.initials}</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

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
                {notifications.length === 0
                  ? <div style={{ padding: '20px 14px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>All caught up!</div>
                  : notifications.map(n => (
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

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {BOTTOM_NAV.map(item => (
          <button
            key={item.id}
            className={`mobile-nav-item ${(item.id === 'more' ? showMore : page === item.id) ? 'active' : ''}`}
            onClick={() => {
              if (item.id === 'more') { setShowMore(true); }
              else { setPage(item.id); setShowMore(false); }
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* More sheet */}
      {showMore && (
        <>
          <div className="more-sheet-overlay" onClick={() => setShowMore(false)} />
          <div className="more-sheet">
            <div className="more-sheet-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>More</span>
              <button onClick={() => setShowMore(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <div className="more-sheet-grid">
              {MORE_PAGES.map(item => (
                <button
                  key={item.id}
                  className={`more-sheet-item ${page === item.id ? 'active' : ''}`}
                  onClick={() => { setPage(item.id); setShowMore(false); }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AppRoot() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg-base)',
        color: 'var(--text-muted)', fontSize: 13,
      }}>
        Loading...
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <AppProvider userId={session.user.id} userProfile={session.user}>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
}
