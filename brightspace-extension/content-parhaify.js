// Writes pending sync data to localStorage so the React app can read it
// on mount — survives login redirects and React hydration delays.

function tryInject() {
  chrome.storage.local.get(['pending_sync'], result => {
    if (!result.pending_sync) return;
    localStorage.setItem('brightspace_pending_sync', JSON.stringify(result.pending_sync));
    chrome.storage.local.remove(['pending_sync']);
    // Also dispatch for the case where the app is already mounted
    window.dispatchEvent(new CustomEvent('brightspace-sync', { detail: result.pending_sync }));
  });
}

if (document.readyState === 'complete') {
  tryInject();
} else {
  window.addEventListener('load', tryInject);
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'BRIGHTSPACE_SYNC') return;
  chrome.storage.local.set({ pending_sync: msg.data }, tryInject);
  sendResponse({ ok: true });
});
