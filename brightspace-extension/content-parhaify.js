// Reads pending sync data from chrome.storage and writes it to localStorage
// so the React app can pick it up on mount. Runs on every page load.
// Does NOT remove from chrome.storage so data survives login redirects.

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

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'BRIGHTSPACE_SYNC') return;
  localStorage.setItem('brightspace_pending_sync', JSON.stringify(msg.data));
  window.dispatchEvent(new CustomEvent('brightspace-sync', { detail: msg.data }));
  sendResponse({ ok: true });
});

// Clear chrome.storage once the React app finishes importing
window.addEventListener('brightspace-sync-done', () => {
  chrome.storage.local.remove(['pending_sync']);
  localStorage.removeItem('brightspace_pending_sync');
});
