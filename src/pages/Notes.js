import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/UI';
import { Plus, Trash2, FileText, Users } from 'lucide-react';

export default function Notes() {
  const { notes, courses, clubs, meetingNotes, addNote, updateNote, deleteNote, updateMeetingNote } = useApp();
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState('note'); // 'note' | 'meeting'
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all | notes | meetings
  const saveTimer = useRef(null);

  const allNotes = [
    ...notes.map(n => ({ ...n, _type: 'note' })),
    ...meetingNotes.map(n => ({ ...n, _type: 'meeting' })),
  ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const filtered = allNotes.filter(n => filterTab === 'all' || (filterTab === 'notes' && n._type === 'note') || (filterTab === 'meetings' && n._type === 'meeting'));

  useEffect(() => {
    if (selected) {
      const n = allNotes.find(n => n.id === selected);
      if (n) { setContent(n.content); setTitle(n.title); setSelectedType(n._type); }
    }
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (selectedType === 'note') updateNote(selected, { content, title });
      else updateMeetingNote(selected, { content, title });
    }, 800);
  }, [content, title]);

  const getCourse = (id) => courses.find(c => c.id === id);
  const getClub = (id) => clubs.find(c => c.id === id);

  const handleNew = () => {
    addNote({ title: 'Untitled Note', courseId: '', content: '' });
    toast('New note created!', 'success');
  };

  const handleDelete = (id, type) => {
    if (type === 'meeting') { toast("Meeting notes can be deleted from the Clubs tab.", 'error'); return; }
    deleteNote(id);
    if (selected === id) { setSelected(null); setContent(''); setTitle(''); }
    toast('Note deleted.');
  };

  const active = selected ? allNotes.find(n => n.id === selected) : null;

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 120px)' }}>
      {/* Sidebar */}
      <div style={{ width: 250, flexShrink: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-between" style={{ padding: '14px 14px 10px' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Notes</span>
          <button className="btn-icon" onClick={handleNew}><Plus size={16} /></button>
        </div>

        {/* Filter tabs */}
        <div style={{ padding: '0 8px 8px' }}>
          <div className="tab-bar">
            {[['all', 'All'], ['notes', 'Notes'], ['meetings', 'Meetings']].map(([k, l]) => (
              <button key={k} className={`tab ${filterTab === k ? 'active' : ''}`} onClick={() => setFilterTab(k)} style={{ fontSize: 11 }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 6px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>No notes yet</div>
          ) : filtered.map(n => {
            const course = getCourse(n.courseId);
            const club = getClub(n.clubId);
            const isMeeting = n._type === 'meeting';
            return (
              <div key={n.id} onClick={() => setSelected(n.id)}
                style={{ padding: '10px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: selected === n.id ? 'var(--indigo-dim)' : 'transparent', borderLeft: selected === n.id ? '2px solid var(--indigo)' : '2px solid transparent' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6" style={{ flex: 1, minWidth: 0 }}>
                    {isMeeting ? <Users size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} /> : <FileText size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
                    <span style={{ fontWeight: 500, fontSize: 12, color: selected === n.id ? 'var(--indigo-hover)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                  </div>
                  {!isMeeting && (
                    <button className="btn-icon" style={{ padding: 2, flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); handleDelete(n.id, n._type); }}>
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-6" style={{ marginTop: 3 }}>
                  {course && <span style={{ fontSize: 10, color: course.color }}>{course.code}</span>}
                  {club && <span style={{ fontSize: 10, color: club.color }}>{club.shortName}</span>}
                  {isMeeting && <span style={{ fontSize: 10, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '0 5px', borderRadius: 99 }}>Meeting</span>}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(n.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!active ? (
          <div className="empty-state" style={{ margin: 'auto' }}>
            <FileText size={36} style={{ margin: '0 auto 12px' }} />
            <p>Select a note to edit, or create a new one</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleNew}><Plus size={15} /> New Note</button>
          </div>
        ) : (
          <>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 17, fontWeight: 700, padding: '4px 0', borderBottom: '1px solid transparent' }}
                onFocus={e => e.target.style.borderBottomColor = 'var(--indigo)'}
                onBlur={e => e.target.style.borderBottomColor = 'transparent'} />
              {selectedType === 'note' && (
                <select className="select" style={{ width: 'auto', fontSize: 12 }}
                  value={active.courseId || ''}
                  onChange={e => updateNote(active.id, { courseId: e.target.value })}>
                  <option value="">No course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                </select>
              )}
              {selectedType === 'meeting' && (
                <span style={{ fontSize: 11, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: 99 }}>
                  <Users size={10} style={{ display: 'inline', marginRight: 4 }} />Meeting Note
                </span>
              )}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Auto-saving...</span>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '20px', resize: 'none', fontFamily: 'var(--mono)', fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', lineHeight: 1.8 }}
              placeholder={selectedType === 'meeting' ? 'Add meeting notes here...' : 'Start writing your notes...'} />
          </>
        )}
      </div>
    </div>
  );
}
