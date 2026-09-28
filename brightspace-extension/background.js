// Service worker.
//
// Two ways a scan happens:
// 1. Manual — TRIGGER_SCAN from the Parhaify app's "Sync Brightspace" button,
//    or the popup's "Scan Brightspace" button (unchanged behavior).
// 2. Automatic — a periodic alarm, and a check whenever a Brightspace tab
//    finishes loading. Both only run if a Brightspace tab happens to be
//    open (no tab is force-opened for auto sync, that would be intrusive),
//    and both are throttled so they do not scan more than once every
//    MIN_GAP_MINUTES.
//
// A scan only ever writes to chrome.storage.local and, if a Parhaify tab is
// open, pushes the raw data to it for review. Nothing is written to Supabase
// from here — the Parhaify app always shows the import review modal first,
// so nothing lands in your account without you clicking Import there.

const AUTO_SYNC_ALARM = 'brightspace-auto-sync';
const AUTO_SYNC_INTERVAL_MINUTES = 240; // every 4 hours while a Brightspace tab is open
const MIN_GAP_MINUTES = 20; // do not auto-rescan more often than this

const PARHAIFY_MATCHES = [
  'https://studyflow-coral.vercel.app/*',
  'https://studyflow-aayan-areejos-projects.vercel.app/*',
  'http://localhost:3000/*',
];

function getStored(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}
function setStored(obj) {
  return new Promise(resolve => chrome.storage.local.set(obj, resolve));
}

function brightspaceOrigin(stored) {
  const bsUrl = stored.brightspace_url || 'https://courses.torontomu.ca';
  try { return new URL(bsUrl).origin; } catch { return 'https://courses.torontomu.ca'; }
}

function runScanOnTab(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type: 'SCAN' }, res => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(res);
    });
  });
}

function countNewItems(prevData, nextData) {
  if (!prevData) return nextData.assignments.length;
  const seen = new Set(prevData.assignments.map(a => `${a.title.toLowerCase()}|${a.dueDate}`));
  return nextData.assignments.filter(a => !seen.has(`${a.title.toLowerCase()}|${a.dueDate}`)).length;
}

async function pushToOpenParhaifyTabs(data) {
  const tabs = await chrome.tabs.query({ url: PARHAIFY_MATCHES });
  await Promise.all(tabs.map(tab => new Promise(resolve => {
    chrome.tabs.sendMessage(tab.id, { type: 'BRIGHTSPACE_SYNC', data }, () => resolve());
  })));
}

// ── Automatic scan ───────────────────────────────────────────────────────
async function autoScan() {
  const stored = await getStored(['brightspace_url', 'brightspace_data', 'last_auto_scan', 'auto_sync_enabled']);
  if (stored.auto_sync_enabled === false) return; // user turned it off in the popup

  const now = Date.now();
  if (stored.last_auto_scan && now - stored.last_auto_scan < MIN_GAP_MINUTES * 60 * 1000) return;

  const bsOrigin = brightspaceOrigin(stored);
  const tabs = await chrome.tabs.query({ url: bsOrigin + '/*' });
  if (!tabs.length) return; // nothing open to scan from right now, try again next cycle

  let response;
  try {
    response = await runScanOnTab(tabs[0].id);
  } catch {
    return; // content script not attached yet on that tab, skip silently
  }
  if (!response?.success) return;

  const data = { courses: response.courses, assignments: response.assignments, scannedAt: now };
  const newCount = countNewItems(stored.brightspace_data, data);

  await setStored({ brightspace_data: data, pending_sync: data, last_auto_scan: now });

  if (newCount > 0) {
    chrome.action.setBadgeText({ text: String(newCount) });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
  }

  await pushToOpenParhaifyTabs(data);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(AUTO_SYNC_ALARM, { periodInMinutes: AUTO_SYNC_INTERVAL_MINUTES, delayInMinutes: 2 });
});
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(AUTO_SYNC_ALARM, { periodInMinutes: AUTO_SYNC_INTERVAL_MINUTES, delayInMinutes: 2 });
});
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === AUTO_SYNC_ALARM) autoScan();
});

// Re-scan shortly after Brightspace finishes loading (still throttled above),
// so opening D2L to check something also quietly refreshes Parhaify.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;
  const stored = await getStored(['brightspace_url']);
  if (tab.url.startsWith(brightspaceOrigin(stored))) {
    setTimeout(autoScan, 3000);
  }
  // Clear the badge once Parhaify itself is opened, since that's where the
  // review modal for any pending import lives.
  if (PARHAIFY_MATCHES.some(p => tab.url.startsWith(p.replace('/*', '')))) {
    chrome.action.setBadgeText({ text: '' });
  }
});

// ── Manual trigger from the Parhaify app's "Sync Brightspace" button ──────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== 'TRIGGER_SCAN') return;

  (async () => {
    try {
      const stored = await getStored(['brightspace_url']);
      const bsOrigin = brightspaceOrigin(stored);

      const bsTabs = await chrome.tabs.query({ url: bsOrigin + '/*' });
      if (!bsTabs.length) {
        await chrome.tabs.create({ url: bsOrigin });
        sendResponse({ error: 'Brightspace is opening — wait for it to load, then try again.' });
        return;
      }

      const response = await runScanOnTab(bsTabs[0].id);
      if (!response?.success) throw new Error(response?.error || 'Scan failed.');

      const data = { courses: response.courses, assignments: response.assignments, scannedAt: Date.now() };
      await setStored({ brightspace_data: data, pending_sync: data, last_auto_scan: Date.now() });
      chrome.action.setBadgeText({ text: '' });

      if (sender.tab?.id) chrome.tabs.sendMessage(sender.tab.id, { type: 'BRIGHTSPACE_SYNC', data });

      sendResponse({ success: true });
    } catch (err) {
      sendResponse({ error: err.message });
    }
  })();

  return true; // keep the message channel open for the async response
});
