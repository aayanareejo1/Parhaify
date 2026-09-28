const scanBtn    = document.getElementById('scanBtn');
const syncBtn    = document.getElementById('syncBtn');
const statusEl   = document.getElementById('status');
const statsEl    = document.getElementById('stats');
const courseCount = document.getElementById('courseCount');
const assignCount = document.getElementById('assignCount');
const lastScanEl  = document.getElementById('lastScan');
const bsUrlInput  = document.getElementById('bsUrl');
const autoSyncToggle = document.getElementById('autoSyncToggle');
const autoStatusEl   = document.getElementById('autoStatus');

const PARHAIFY_URLS = ['https://studyflow-coral.vercel.app', 'https://studyflow-aayan-areejos-projects.vercel.app', 'http://localhost:3000'];

// ── Load saved state ──────────────────────────────────────────────────────────
const DEFAULT_BS_URL = 'https://courses.torontomu.ca';

chrome.storage.local.get(
  ['brightspace_data', 'brightspace_url', 'auto_sync_enabled', 'last_auto_scan'],
  result => {
    bsUrlInput.value = result.brightspace_url || DEFAULT_BS_URL;
    if (result.brightspace_data) renderStats(result.brightspace_data);
    scanBtn.disabled = false;

    autoSyncToggle.checked = result.auto_sync_enabled !== false; // default on
    renderAutoStatus(result.last_auto_scan);
  }
);

// Keep scan button disabled until storage loads
scanBtn.disabled = true;

// Opening the popup counts as having seen whatever the badge was flagging
chrome.action.setBadgeText({ text: '' });

bsUrlInput.addEventListener('change', () => {
  chrome.storage.local.set({ brightspace_url: bsUrlInput.value.trim() });
});

autoSyncToggle.addEventListener('change', () => {
  chrome.storage.local.set({ auto_sync_enabled: autoSyncToggle.checked });
});

function renderAutoStatus(lastAutoScan) {
  autoStatusEl.textContent = lastAutoScan
    ? `Last background sync: ${new Date(lastAutoScan).toLocaleString()}`
    : 'Runs automatically whenever Brightspace is open in a tab, about every 4 hours.';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function setStatus(msg, type = '') {
  statusEl.textContent = msg;
  statusEl.className = 'status ' + type;
}

function setLoading(btn, loading, label) {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span>${label}`
    : label;
}

function renderStats(data) {
  courseCount.textContent = data.courses.length;
  assignCount.textContent = data.assignments.length;
  lastScanEl.textContent  = `Scanned ${new Date(data.scannedAt).toLocaleString()}`;
  statsEl.style.display   = 'flex';
  statsEl.style.flexDirection = 'column';
  syncBtn.disabled = false;
}

async function findTab(urlPatterns) {
  for (const url of urlPatterns) {
    const tabs = await chrome.tabs.query({ url: url + '/*' });
    if (tabs.length) return tabs[0];
  }
  return null;
}

function sendToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, res => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(res);
    });
  });
}

// ── Scan ─────────────────────────────────────────────────────────────────────
scanBtn.addEventListener('click', async () => {
  const rawUrl = bsUrlInput.value.trim();
  if (!rawUrl) { setStatus('Enter your Brightspace URL first.', 'error'); return; }
  const bsUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

  let bsOrigin;
  try { bsOrigin = new URL(bsUrl).origin; }
  catch { setStatus('Invalid Brightspace URL.', 'error'); return; }

  setStatus('');
  setLoading(scanBtn, true, 'Scanning…');

  try {
    // Find an open Brightspace tab matching the configured origin
    const bsTabs = await chrome.tabs.query({ url: bsOrigin + '/*' });

    if (!bsTabs.length) {
      await chrome.tabs.create({ url: bsUrl });
      setStatus('Brightspace is opening — log in if needed, then click Scan again.', 'info');
      setLoading(scanBtn, false, 'Scan Brightspace');
      return;
    }

    const tab = bsTabs[0];
    let response;

    try {
      response = await sendToTab(tab.id, { type: 'SCAN' });
    } catch {
      // Content script not yet injected (e.g. tab just loaded)
      setStatus('Could not reach the Brightspace tab. Reload it and try again.', 'error');
      setLoading(scanBtn, false, 'Scan Brightspace');
      return;
    }

    if (!response?.success) throw new Error(response?.error || 'Scan failed.');

    const data = {
      courses:     response.courses,
      assignments: response.assignments,
      scannedAt:   Date.now(),
    };

    chrome.storage.local.set({ brightspace_data: data });
    renderStats(data);

    let msg = `Found ${data.courses.length} course(s) and ${data.assignments.length} assignment(s).`;
    if (response.debugRaw) {
      msg += `\n\nAPI v${response.debugRaw.leVer} · Course: ${response.debugRaw.course.name}\nDropbox: ${response.debugRaw.dropbox}\nQuizzes: ${response.debugRaw.quizzes}`;
    }
    setStatus(msg, data.assignments.length > 0 ? 'success' : 'error');
  } catch (err) {
    setStatus(err.message || 'Scan failed. Make sure you are logged into Brightspace.', 'error');
  } finally {
    setLoading(scanBtn, false, 'Scan Brightspace');
  }
});

// ── Sync ─────────────────────────────────────────────────────────────────────
syncBtn.addEventListener('click', async () => {
  setLoading(syncBtn, true, 'Syncing…');
  setStatus('');

  try {
    const stored = await new Promise(resolve =>
      chrome.storage.local.get(['brightspace_data'], resolve)
    );
    if (!stored.brightspace_data) throw new Error('No scan data — please scan first.');

    // Store pending_sync BEFORE opening the tab so the content script finds it
    // even after a login redirect
    await new Promise(resolve =>
      chrome.storage.local.set({ pending_sync: stored.brightspace_data }, resolve)
    );

    // Find or open Parhaify
    const tab = await findTab(PARHAIFY_URLS);

    if (!tab) {
      await chrome.tabs.create({ url: PARHAIFY_URLS[0] });
      setStatus('Parhaify is opening — log in and the import will appear automatically.', 'info');
    } else {
      await chrome.tabs.update(tab.id, { active: true });
      // Try immediate delivery if app is already open
      try {
        await sendToTab(tab.id, { type: 'BRIGHTSPACE_SYNC', data: stored.brightspace_data });
      } catch { /* content script will pick it up from localStorage on next load */ }
      setStatus('Sync sent! Check Parhaify for the import prompt.', 'success');
    }
  } catch (err) {
    setStatus(err.message || 'Sync failed.', 'error');
  } finally {
    setLoading(syncBtn, false, 'Sync to Parhaify');
  }
});
