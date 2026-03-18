import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/UI';
import { X, Mic, MicOff, Upload, Zap, ChevronRight, Check } from 'lucide-react';

const TYPES = ['Assignment', 'Quiz', 'Lab', 'Exam', 'Reading', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

// ── Natural language date parser ─────────────────────────────
function parseNaturalDate(text) {
  const now = new Date();
  const lower = text.toLowerCase();
  let date = null;
  let time = null;

  // Time parsing
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (timeMatch) {
    let h = parseInt(timeMatch[1]);
    const m = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const meridiem = timeMatch[3];
    if (meridiem === 'pm' && h !== 12) h += 12;
    if (meridiem === 'am' && h === 12) h = 0;
    time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  if (lower.includes('noon')) time = '12:00';
  if (lower.includes('midnight')) time = '23:59';
  if (lower.includes('tonight') || lower.includes('night')) time = time || '23:59';

  // Date parsing
  const fmt = (d) => d.toISOString().split('T')[0];
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  if (lower.includes('today')) date = fmt(now);
  else if (lower.includes('tomorrow')) date = fmt(addDays(now, 1));
  else {
    // "this/next weekday"
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    for (let i = 0; i < days.length; i++) {
      if (lower.includes(days[i])) {
        const cur = now.getDay();
        let diff = i - cur;
        if (lower.includes('next')) diff += 7;
        else if (diff <= 0) diff += 7;
        date = fmt(addDays(now, diff));
        break;
      }
    }
    // Explicit month day e.g. "March 22" or "march 22"
    if (!date) {
      const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
      for (let i = 0; i < months.length; i++) {
        const re = new RegExp(`${months[i]}\\s+(\\d{1,2})`);
        const m = lower.match(re);
        if (m) {
          const d = new Date(now.getFullYear(), i, parseInt(m[1]));
          date = fmt(d);
          break;
        }
      }
    }
  }

  return { date, time };
}

function parseCaptureText(text) {
  // Course code detection: 3 letters + 3 digits
  const courseMatch = text.match(/\b([A-Z]{2,4}\d{3,4})\b/i);
  const courseCode = courseMatch ? courseMatch[1].toUpperCase() : null;

  // Task type detection
  const typeWords = { quiz: 'Quiz', lab: 'Lab', exam: 'Exam', midterm: 'Exam', final: 'Exam', test: 'Exam', assignment: 'Assignment', homework: 'Assignment', hw: 'Assignment', reading: 'Reading', report: 'Assignment', project: 'Assignment', presentation: 'Assignment' };
  let taskType = 'Assignment';
  const lower = text.toLowerCase();
  for (const [kw, type] of Object.entries(typeWords)) {
    if (lower.includes(kw)) { taskType = type; break; }
  }

  const { date, time } = parseNaturalDate(text);

  // Title: strip course code and date phrases
  let title = text
    .replace(/\b[A-Z]{2,4}\d{3,4}\b/gi, '')
    .replace(/this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '')
    .replace(/next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '')
    .replace(/\b(today|tomorrow|tonight)\b/gi, '')
    .replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b/gi, '')
    .replace(/\d{1,2}(:\d{2})?\s*(am|pm)/gi, '')
    .replace(/\bat\b/gi, '')
    .replace(/\bdue\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!title) title = 'New Task';

  return { courseCode, taskType, title, date, time };
}

export default function QuickCapture({ open, onClose }) {
  const { courses, addAssignment } = useApp();
  const toast = useToast();
  const [step, setStep] = useState(1); // 1=input, 2=confirm
  const [inputTab, setInputTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const recogRef = useRef(null);
  const fileRef = useRef(null);

  // Confirm form state
  const [form, setForm] = useState({ courseId: '', type: 'Assignment', title: '', dueDate: '', dueTime: '23:59', priority: 'Medium', notes: '' });
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    if (!open) { setStep(1); setTextInput(''); setImageFile(null); setImagePreview(null); setListening(false); }
  }, [open]);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTextInput(t);
    };
    r.onend = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  };
  const stopListening = () => { recogRef.current?.stop(); setListening(false); };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    // Simulate extraction
    const mock = "CPS406 Assignment due this Friday at 11:59 PM";
    setTextInput(mock);
    toast('Image uploaded — review extracted text below.', 'success');
  };

  const handleParse = () => {
    const source = textInput.trim();
    if (!source) { toast('Please enter some text first.', 'error'); return; }
    const parsed = parseCaptureText(source);
    // Try to match course code to existing courses
    const matchedCourse = courses.find(c => c.code.toLowerCase() === parsed.courseCode?.toLowerCase());
    setForm({
      courseId: matchedCourse?.id || '',
      type: parsed.taskType,
      title: parsed.title,
      dueDate: parsed.date || '',
      dueTime: parsed.time || '23:59',
      priority: 'Medium',
      notes: '',
    });
    setStep(2);
  };

  const handleSave = () => {
    if (!form.title) { toast('Title is required.', 'error'); return; }
    addAssignment({ ...form, status: 'Not Started' });
    toast('Task added to assignments!', 'success');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="flex items-center gap-8">
            <Zap size={18} color="var(--indigo)" />
            <span className="modal-title">{step === 1 ? 'Quick Capture' : 'Confirm Task'}</span>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <>
              {/* Input tabs */}
              <div className="tab-bar" style={{ marginBottom: 0 }}>
                {[['text','Text'],['voice','Voice'],['image','Image']].map(([k,l]) => (
                  <button key={k} className={`tab ${inputTab === k ? 'active' : ''}`} onClick={() => setInputTab(k)}>{l}</button>
                ))}
              </div>

              {inputTab === 'text' && (
                <div className="form-group">
                  <textarea className="textarea" style={{ minHeight: 100 }} value={textInput} onChange={e => setTextInput(e.target.value)}
                    placeholder={'e.g. CPS420 assignment due this Friday at 3 PM\ne.g. MTH110 quiz tomorrow night\ne.g. Lab report for CPS305 due March 22'} autoFocus />
                </div>
              )}

              {inputTab === 'voice' && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  {!speechSupported ? (
                    <div style={{ color: 'var(--warning)', fontSize: 13, padding: '12px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                      Voice input is not supported in your browser. Please use text input instead.
                    </div>
                  ) : (
                    <>
                      <button onClick={listening ? stopListening : startListening}
                        style={{
                          width: 80, height: 80, borderRadius: '50%', border: 'none', cursor: 'pointer',
                          background: listening ? 'var(--danger)' : 'var(--indigo)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 16px', boxShadow: listening ? '0 0 0 12px rgba(244,63,94,0.15)' : '0 0 0 0 transparent',
                          transition: 'all 0.3s', animation: listening ? 'pulse 1.5s infinite' : 'none'
                        }}>
                        {listening ? <MicOff size={30} color="white" /> : <Mic size={30} color="white" />}
                      </button>
                      <p style={{ fontSize: 13, color: listening ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {listening ? 'Listening... click to stop' : 'Click the mic to start speaking'}
                      </p>
                      {textInput && (
                        <div style={{ marginTop: 16, background: 'var(--bg-elevated)', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--text-primary)', textAlign: 'left' }}>
                          "{textInput}"
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {inputTab === 'image' && (
                <div>
                  {!imagePreview ? (
                    <div onClick={() => fileRef.current?.click()}
                      style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) fileRef.current.files = e.dataTransfer.files; handleImage({ target: { files: e.dataTransfer.files } }); }}>
                      <Upload size={28} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Drop an image or click to upload</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Screenshot of syllabus, assignment, or deadline</p>
                    </div>
                  ) : (
                    <div>
                      <img src={imagePreview} alt="uploaded" style={{ width: '100%', borderRadius: 8, maxHeight: 160, objectFit: 'contain', background: 'var(--bg-elevated)', marginBottom: 12 }} />
                      <div style={{ fontSize: 12, color: 'var(--warning)', marginBottom: 8, padding: '6px 10px', background: 'rgba(245,158,11,0.1)', borderRadius: 6 }}>
                        ⚠ Auto-extraction is limited — please review and edit the fields on the next screen.
                      </div>
                      <div className="form-group">
                        <label className="label">Extracted text (edit if needed)</label>
                        <textarea className="textarea" value={textInput} onChange={e => setTextInput(e.target.value)} style={{ minHeight: 60 }} />
                      </div>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                </div>
              )}

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleParse}>
                Parse & Continue <ChevronRight size={15} />
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Review and edit before saving</div>
              <div className="form-group">
                <label className="label">Title*</label>
                <input className="input" value={form.title} onChange={e => setF('title', e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Course</label>
                  <select className="select" value={form.courseId} onChange={e => setF('courseId', e.target.value)}>
                    <option value="">No course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Task Type</label>
                  <select className="select" value={form.type} onChange={e => setF('type', e.target.value)}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Due Date</label>
                  <input className="input" type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label">Due Time</label>
                  <input className="input" type="time" value={form.dueTime} onChange={e => setF('dueTime', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Priority</label>
                <div className="flex gap-8">
                  {PRIORITIES.map(p => (
                    <button key={p} onClick={() => setF('priority', p)} style={{
                      flex: 1, padding: '7px 0', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'var(--font)', border: '1px solid var(--border)',
                      background: form.priority === p ? (p === 'High' ? 'rgba(244,63,94,0.2)' : p === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)') : 'var(--bg-elevated)',
                      color: form.priority === p ? (p === 'High' ? 'var(--danger)' : p === 'Medium' ? 'var(--warning)' : 'var(--indigo-hover)') : 'var(--text-secondary)',
                    }}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Notes (optional)</label>
                <textarea className="textarea" style={{ minHeight: 56 }} value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Any extra details..." />
              </div>
              <div className="flex gap-8">
                <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                <button className="btn btn-primary" onClick={handleSave} style={{ flex: 2, justifyContent: 'center' }}>
                  <Check size={15} /> Save to Assignments
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.15); } 50% { box-shadow: 0 0 0 16px rgba(244,63,94,0); } }`}</style>
    </div>
  );
}
