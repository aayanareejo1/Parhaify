import React, { useState } from 'react';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/UI';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Assignments from './pages/Assignments';
import Notes from './pages/Notes';
import DailyPlanner from './pages/DailyPlanner';
import StudyAssistant from './pages/StudyAssistant';
import Wellness from './pages/Wellness';
import Clubs from './pages/Clubs';
import QuickCapture from './components/QuickCapture';
import {
  LayoutDashboard, BookOpen, ClipboardList, FileText, Heart, Users,
  Calendar, Sparkles, Bell, Zap
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'courses', label: 'Courses', icon: <BookOpen size={16} /> },
  { id: 'assignments', label: 'Assignments', icon: <ClipboardList size={16} /> },
  { id: 'planner', label: 'Daily Planner', icon: <Calendar size={16} /> },
  { id: 'notes', label: 'Notes', icon: <FileText size={16} /> },
  { id: 'assistant', label: 'Study Assistant', icon: <Sparkles size={16} /> },
  { id: 'wellness', label: 'Wellness', icon: <Heart size={16} /> },
  { id: 'clubs', label: 'Clubs', icon: <Users size={16} /> },
];

const PAGES = { dashboard: Dashboard, courses: Courses, assignments: Assignments, planner: DailyPlanner, notes: Notes, assistant: StudyAssistant, wellness: Wellness, clubs: Clubs };

function AppInner() {
  const { user, notifications, markNotificationRead } = useApp();
  const [page, setPage] = useState('dashboard');
  const [showCapture, setShowCapture] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const Page = PAGES[page];
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="logo">
          <div className="logo-icon">S</div>
          <span className="logo-text">StudyFlow</span>
        </div>

        <div className="nav-section">
          <div className="nav-label">Menu</div>
          {NAV.map(item => (
            <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
              {item.icon}
              {item.label}
            </button>
          ))}
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
        {/* Topbar */}
        <div className="topbar">
          <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
            {NAV.find(n => n.id === page)?.label}
          </div>

          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button className="btn-icon notif-btn" onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={18} />
              {unread > 0 && <span className="notif-badge">{unread}</span>}
            </button>
            {showNotifs && (
              <div style={{
                position: 'absolute', right: 0, top: 40, width: 280, background: 'var(--bg-elevated)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden'
              }}>
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

        {/* Page content */}
        <div className="page-content" onClick={() => showNotifs && setShowNotifs(false)}>
          <Page />
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowCapture(true)} title="Quick Capture">
        <Zap size={22} />
      </button>

      {/* Quick Capture modal */}
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
