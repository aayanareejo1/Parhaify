// fileExtractor.js
// Handles text extraction from PDF, images (OCR), DOCX, and PPTX files

// ── PDF extraction using pdfjs-dist ──────────────────────────
async function extractFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const texts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    if (pageText.trim()) texts.push(`[Page ${i}]\n${pageText.trim()}`);
  }

  return texts.join('\n\n');
}

// ── Image OCR using Tesseract.js ──────────────────────────────
async function extractFromImage(file) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, {
    logger: () => {}, // silence logs
  });
  const url = URL.createObjectURL(file);
  const { data: { text } } = await worker.recognize(url);
  await worker.terminate();
  URL.revokeObjectURL(url);
  return text.trim();
}

// ── DOCX extraction using mammoth ────────────────────────────
async function extractFromDOCX(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

// ── PPTX extraction (zip-based XML parsing) ──────────────────
async function extractFromPPTX(file) {
  // PPTX is a zip file containing XML slide data
  // We use JSZip-style manual parsing via the browser's decompress API
  // Fallback: read as binary and extract visible text strings
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const slideFiles = Object.keys(zip.files)
      .filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)/)[1]);
        const nb = parseInt(b.match(/slide(\d+)/)[1]);
        return na - nb;
      });

    const texts = [];
    for (const slideName of slideFiles) {
      const xml = await zip.files[slideName].async('string');
      // Extract text from <a:t> tags
      const matches = [...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)];
      const slideText = matches.map(m => m[1]).filter(Boolean).join(' ');
      const slideNum = slideName.match(/slide(\d+)/)[1];
      if (slideText.trim()) texts.push(`[Slide ${slideNum}]\n${slideText.trim()}`);
    }
    return texts.join('\n\n') || 'No text found in slides.';
  } catch {
    return 'Could not extract text from this PPTX file. Try copy-pasting the text manually.';
  }
}

// ── Main dispatcher ───────────────────────────────────────────
export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  const ext = name.split('.').pop();

  if (ext === 'pdf') return await extractFromPDF(file);
  if (['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext)) return await extractFromImage(file);
  if (ext === 'docx') return await extractFromDOCX(file);
  if (ext === 'pptx') return await extractFromPPTX(file);

  throw new Error(`Unsupported file type: .${ext}`);
}

export function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return '🖼️';
  if (ext === 'docx') return '📝';
  if (ext === 'pptx') return '📊';
  return '📎';
}

export function getFileTypeLabel(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'Image (OCR)';
  if (ext === 'docx') return 'Word Document';
  if (ext === 'pptx') return 'PowerPoint';
  return 'File';
}
