import React, { useState, useRef } from 'react';
import useMobile from '../hooks/useMobile';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/UI';
import { Sparkles, Copy, ExternalLink, BookMarked, Trash2, ChevronDown, ChevronUp, Upload, X, FileText, Loader } from 'lucide-react';
import { extractTextFromFile, getFileIcon, getFileTypeLabel } from '../utils/fileExtractor';

const OUTPUT_TYPES = [
  { id: 'mcq', label: 'Multiple Choice (MCQ)', icon: '🔘' },
  { id: 'short', label: 'Short Answer', icon: '✏️' },
  { id: 'long', label: 'Long Answer', icon: '📝' },
  { id: 'fill', label: 'Fill in the Blanks', icon: '🔲' },
  { id: 'explain', label: 'Concept Explanation', icon: '💡' },
];

const ACCEPTED = '.pdf,.png,.jpg,.jpeg,.webp,.docx,.pptx';

function buildPrompt(text, type, count, courseCode) {
  const context = courseCode ? `This is for my ${courseCode} course.\n\n` : '';
  const material = `Study Material:\n"""\n${text}\n"""`;
  const templates = {
    mcq: `${context}Generate ${count} multiple choice questions based on the following study material. For each question:\n- Write a clear, concise question\n- Provide exactly 4 options labeled A, B, C, D\n- Bold the correct answer\n- Add a one-sentence explanation for the correct answer\n\n${material}`,
    short: `${context}Generate ${count} short answer questions based on the following study material. For each question:\n- Write a focused question answerable in 2-4 sentences\n- Provide a model answer\n- Highlight the key concepts being tested\n\n${material}`,
    long: `${context}Generate ${count} long answer / essay questions based on the following study material. For each question:\n- Write a thought-provoking question requiring 2-3 paragraphs\n- Outline the key points a strong answer should cover\n- Note any important concepts or examples to mention\n\n${material}`,
    fill: `${context}Generate ${count} fill-in-the-blank questions based on the following study material. For each question:\n- Replace a key term or concept with a blank (_____)\n- Provide the answer below each question\n- Include a brief explanation of why that term is important\n\n${material}`,
    explain: `${context}Based on the following study material, identify the ${count} most important concepts and explain each one clearly. For each concept:\n- State the concept name as a heading\n- Explain it in plain language\n- Give one real-world example or analogy\n- Note how it connects to other concepts\n\n${material}`,
  };
  return templates[type] || templates.mcq;
}

function FileUploadZone({ onExtracted, onLoading }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'docx', 'pptx'];
    if (!allowed.includes(ext)) { toast(`Unsupported file type: .${ext}`, 'error'); return; }
    setFile(f);
    setStatus('extracting');
    onLoading(true);
    const messages = { pdf: 'Reading PDF pages...', docx: 'Extracting Word document text...', pptx: 'Parsing PowerPoint slides...', png: 'Running OCR on image...', jpg: 'Running OCR on image...', jpeg: 'Running OCR on image...', webp: 'Running OCR on image...' };
    setProgress(messages[ext] || 'Extracting text...');
    try {
      const text = await extractTextFromFile(f);
      if (!text || text.length < 20) {
        setStatus('error'); setProgress('');
        toast('Could not extract enough text. Try a different file or paste manually.', 'error');
        onLoading(false); return;
      }
      setStatus('done'); setProgress('');
      onExtracted(text, f.name);
      toast(`Extracted ${text.length.toLocaleString()} characters from ${f.name}!`, 'success');
    } catch (err) {
      setStatus('error'); setProgress('');
      toast('Extraction failed: ' + err.message, 'error');
    }
    onLoading(false);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); };
  const handleChange = (e) => { const f = e.target.files[0]; if (f) processFile(f); };
  const handleClear = () => { setFile(null); setStatus('idle'); setProgress(''); if (fileRef.current) fileRef.current.value = ''; };

  return (
    <div>
      {status === 'idle' || status === 'error' ? (
        <div onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          style={{ border: `2px dashed ${dragOver ? 'var(--indigo)' : 'var(--border)'}`, borderRadius: 10, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: dragOver ? 'var(--indigo-dim2)' : 'transparent' }}>
          <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>Drop a file or click to upload</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>PDF · PNG · JPG · DOCX · PPTX</p>
          {status === 'error' && <p style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>Extraction failed — try another file</p>}
        </div>
      ) : status === 'extracting' ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
          <Loader size={22} color="var(--indigo)" style={{ margin: '0 auto 10px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{progress}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{file?.name}</p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--success)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(34,197,94,0.05)' }}>
          <span style={{ fontSize: 22 }}>{getFileIcon(file?.name || '')}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{file?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--success)' }}>✓ {getFileTypeLabel(file?.name || '')} extracted — text loaded below</div>
          </div>
          <button className="btn-icon" onClick={handleClear}><X size={14} /></button>
        </div>
      )}
      <input ref={fileRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={handleChange} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function StudyAssistant() {
  const { courses, studyPrompts, addStudyPrompt, deleteStudyPrompt } = useApp();
  const toast = useToast();
  const [text, setText] = useState('');
  const [outputType, setOutputType] = useState('mcq');
  const [count, setCount] = useState(5);
  const [courseId, setCourseId] = useState('');
  const [generated, setGenerated] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [sourceFileName, setSourceFileName] = useState('');

  const isMobile = useMobile();
  const getCourse = (id) => courses.find(c => c.id === id);
  const selectedCourse = getCourse(courseId);

  const handleGenerate = () => {
    if (!text.trim()) { toast('Please paste study material or upload a file first.', 'error'); return; }
    setGenerated(buildPrompt(text.trim(), outputType, count, selectedCourse?.code));
    toast('Prompt generated!', 'success');
  };

  const handleCopy = (p = generated) => { navigator.clipboard.writeText(p); toast('Copied!', 'success'); };
  const handleOpenClaude = () => { navigator.clipboard.writeText(generated); window.open('https://claude.ai', '_blank'); toast('Prompt copied — paste it into Claude!', 'success'); };
  const handleOpenChatGPT = () => { navigator.clipboard.writeText(generated); window.open('https://chatgpt.com', '_blank'); toast('Prompt copied — paste it into ChatGPT!', 'success'); };
  const handleSave = () => {
    if (!generated) return;
    const type = OUTPUT_TYPES.find(t => t.id === outputType);
    addStudyPrompt({ prompt: generated, outputType, outputTypeLabel: type.label, courseId, courseName: selectedCourse?.code || 'Uncategorized', sourceFile: sourceFileName || null });
    toast('Saved to history!', 'success');
  };

  const filtered = studyPrompts.filter(p => !filterCourse || p.courseId === filterCourse);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Study Assistant</div>
          <div className="page-subtitle">Upload a file or paste notes — generate AI study prompts instantly</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="var(--indigo)" /> Input
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Upload size={12} /> Upload File (optional)</label>
              <FileUploadZone onExtracted={(t, n) => { setText(t); setSourceFileName(n); }} onLoading={setExtracting} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 14px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>or paste text manually</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={12} /> Study Material</span>
                {text && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{text.length.toLocaleString()} chars</span>}
              </label>
              <textarea className="textarea" style={{ minHeight: 140 }} value={text}
                onChange={e => { setText(e.target.value); setSourceFileName(''); }}
                placeholder="Paste your notes, lecture slides, or textbook excerpts here..."
                disabled={extracting} />
              {text && <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => { setText(''); setSourceFileName(''); }}><X size={12} /> Clear</button>}
            </div>

            <div className="grid-2" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="label">Course (optional)</label>
                <select className="select" value={courseId} onChange={e => setCourseId(e.target.value)}>
                  <option value="">No course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Number of questions</label>
                <input className="input" type="number" min={1} max={20} value={count} onChange={e => setCount(+e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="label">Output Type</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {OUTPUT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setOutputType(t.id)} style={{ padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s', background: outputType === t.id ? 'var(--indigo)' : 'var(--bg-elevated)', color: outputType === t.id ? 'white' : 'var(--text-secondary)', border: outputType === t.id ? 'none' : '1px solid var(--border)' }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleGenerate} disabled={extracting}>
              {extracting
                ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Extracting file...</>
                : <><Sparkles size={15} /> Generate Prompt</>}
            </button>
          </div>
        </div>

        <div style={{ width: isMobile ? '100%' : 380, flexShrink: 0 }}>
          <div className="card" style={{ borderColor: generated ? 'var(--indigo)' : 'var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookMarked size={16} color="var(--indigo)" /> Generated Prompt
            </div>
            {!generated ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Your generated prompt will appear here</div>
            ) : (
              <>
                <pre style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 300, overflow: 'auto', lineHeight: 1.7, marginBottom: 16, fontFamily: 'var(--mono)' }}>{generated}</pre>
                <div className="flex-col gap-8">
                  <div className="flex gap-8">
                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => handleCopy()}><Copy size={13} /> Copy Prompt</button>
                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={handleSave}><BookMarked size={13} /> Save</button>
                  </div>
                  <button className="btn btn-primary" style={{ justifyContent: 'center', background: '#7c3aed' }} onClick={handleOpenClaude}><ExternalLink size={13} /> Open in Claude</button>
                  <button className="btn btn-primary" style={{ justifyContent: 'center', background: '#059669' }} onClick={handleOpenChatGPT}><ExternalLink size={13} /> Open in ChatGPT</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Study History</div>
          <select className="select" style={{ width: 'auto', fontSize: 12 }} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No saved prompts yet.</p></div>
        ) : (
          <div className="flex-col gap-8">
            {filtered.map(p => {
              const isExpanded = expanded === p.id;
              return (
                <div key={p.id} className="card card-sm">
                  <div className="flex items-center gap-12">
                    <div style={{ flex: 1 }}>
                      <div className="flex gap-8 items-center" style={{ marginBottom: 4, flexWrap: 'wrap' }}>
                        <span className="badge badge-indigo">{p.courseName}</span>
                        <span className="badge badge-muted">{p.outputTypeLabel}</span>
                        {p.sourceFile && <span className="badge badge-muted">📎 {p.sourceFile}</span>}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(p.savedAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {isExpanded
                          ? <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.6 }}>{p.prompt}</pre>
                          : p.prompt.slice(0, 100) + '...'}
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <button className="btn-icon" onClick={() => setExpanded(isExpanded ? null : p.id)}>{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                      <button className="btn-icon" onClick={() => handleCopy(p.prompt)}><Copy size={14} /></button>
                      <button className="btn-icon" onClick={() => deleteStudyPrompt(p.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
