// Signal to the React app that the extension is installed
localStorage.setItem('__parhaify_ext', '1');

// ── Inject pending sync data into the page ───────────────────────────────────
function tryInject() {
  chrome.storage.local.get(['pending_sync'], result => {
    if (!result.pending_sync) return;
    localStorage.setItem('brightspace_pending_sync', JSON.stringify(result.pending_sync));
    window.dispatchEvent(new CustomEvent('brightspace-sync', { detail: result.pending_sync }));
  });
}

if (document.readyState === 'complete') {
  tryInject();
} else {
  window.addEventListener('load', tryInject);
}

// ── Listen for sync request from the React app ───────────────────────────────
window.addEventListener('parhaify-request-sync', () => {
  chrome.runtime.sendMessage({ type: 'TRIGGER_SCAN' }, response => {
    if (response?.error) {
      window.dispatchEvent(new CustomEvent('parhaify-sync-error', { detail: response.error }));
    }
  });
});

// ── Receive sync data from popup or background ────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'BRIGHTSPACE_SYNC') return;
  localStorage.setItem('brightspace_pending_sync', JSON.stringify(msg.data));
  window.dispatchEvent(new CustomEvent('brightspace-sync', { detail: msg.data }));
  sendResponse({ ok: true });
});

// ── Clear storage once React finishes importing or dismisses ─────────────────
window.addEventListener('brightspace-sync-done', () => {
  chrome.storage.local.remove(['pending_sync']);
  localStorage.removeItem('brightspace_pending_sync');
});
