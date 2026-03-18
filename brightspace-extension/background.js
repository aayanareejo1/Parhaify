// Service worker — handles TRIGGER_SCAN messages from the Parhaify app
// so users can sync without opening the extension popup.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== 'TRIGGER_SCAN') return;

  (async () => {
    try {
      const stored = await new Promise(resolve =>
        chrome.storage.local.get(['brightspace_url'], resolve)
      );
      const bsUrl    = stored.brightspace_url || 'https://courses.torontomu.ca';
      const bsOrigin = new URL(bsUrl).origin;

      const bsTabs = await chrome.tabs.query({ url: bsOrigin + '/*' });
      if (!bsTabs.length) {
        await chrome.tabs.create({ url: bsUrl });
        sendResponse({ error: 'Brightspace is opening — wait for it to load, then try again.' });
        return;
      }

      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(bsTabs[0].id, { type: 'SCAN' }, res => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(res);
        });
      });

      if (!response?.success) throw new Error(response?.error || 'Scan failed.');

      const data = {
        courses:     response.courses,
        assignments: response.assignments,
        scannedAt:   Date.now(),
      };

      await new Promise(resolve =>
        chrome.storage.local.set({ brightspace_data: data, pending_sync: data }, resolve)
      );

      // Send directly back to the Parhaify tab that triggered the scan
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, { type: 'BRIGHTSPACE_SYNC', data });
      }

      sendResponse({ success: true });
    } catch (err) {
      sendResponse({ error: err.message });
    }
  })();

  return true; // Keep channel open for async response
});
