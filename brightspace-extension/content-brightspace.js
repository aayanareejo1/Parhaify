// Runs on Brightspace pages. Listens for SCAN message from the popup,
// hits the Brightspace Valence API (using existing session cookies),
// and returns structured course + assignment data.

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'SCAN') return;

  (async () => {
    try {
      const base = window.location.origin;

      // 1. Discover API versions — try several fallbacks
      let lpVer = '1.28';
      let leVer = '1.28';
      try {
        const versRes = await fetch(`${base}/d2l/api/lp/versions/`);
        if (versRes.ok) {
          const raw = await versRes.json();
          const list = Array.isArray(raw) ? raw : (raw.ProductVersions || raw.Versions || []);
          const lp = list.find(v => v.ProductCode === 'lp');
          const le = list.find(v => v.ProductCode === 'le');
          if (lp?.LatestVersion) lpVer = lp.LatestVersion;
          if (le?.LatestVersion) leVer = le.LatestVersion;
        }
      } catch { /* use defaults */ }

      // 2. Get enrolled courses
      const enrollRes = await fetch(
        `${base}/d2l/api/lp/${lpVer}/enrollments/myenrollments/?orgUnitTypeId=3&pageSize=100`
      );
      if (!enrollRes.ok) throw new Error('Failed to fetch enrollments — are you logged in?');
      const enrollData = await enrollRes.json();

      const courses = (enrollData.Items || []).map(item => ({
        id:   item.OrgUnit.Id,
        name: item.OrgUnit.Name,
        code: item.OrgUnit.Code || '',
      }));

      // 3. Fetch assignments from multiple endpoints per course
      const pad = n => String(n).padStart(2, '0');

      const parseDate = isoStr => {
        if (!isoStr) return null;
        const dt = new Date(isoStr);
        return {
          dueDate: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
          dueTime: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
        };
      };

      const fetchJson = async url => {
        try {
          const r = await fetch(url);
          if (!r.ok) return null;
          return r.json();
        } catch { return null; }
      };

      const assignmentsByCourse = await Promise.all(
        courses.map(async course => {
          const results = [];

          // — Dropbox / Assignment submissions —
          const dropbox = await fetchJson(
            `${base}/d2l/api/le/${leVer}/${course.id}/dropbox/folders/`
          );
          if (dropbox) {
            const items = Array.isArray(dropbox) ? dropbox : (dropbox.Objects || []);
            items.forEach(obj => {
              const parsed = parseDate(obj.DueDate || obj.EndDate);
              if (!parsed) return;
              results.push({ title: obj.Name, ...parsed, courseId: course.id, type: 'Assignment' });
            });
          }

          // — Quizzes —
          const quizzes = await fetchJson(
            `${base}/d2l/api/le/${leVer}/${course.id}/quizzes/`
          );
          if (quizzes) {
            const items = Array.isArray(quizzes) ? quizzes : (quizzes.Objects || []);
            items.forEach(obj => {
              const parsed = parseDate(obj.DueDate || obj.EndDate);
              if (!parsed) return;
              results.push({ title: obj.Name, ...parsed, courseId: course.id, type: 'Quiz' });
            });
          }

          // — Checklist items (some schools use these for assignments) —
          const checklist = await fetchJson(
            `${base}/d2l/api/le/${leVer}/${course.id}/checklists/`
          );
          if (checklist) {
            const lists = Array.isArray(checklist) ? checklist : (checklist.Objects || []);
            lists.forEach(obj => {
              const parsed = parseDate(obj.DueDate);
              if (!parsed) return;
              results.push({ title: obj.Name, ...parsed, courseId: course.id, type: 'Assignment' });
            });
          }

          return results;
        })
      );

      // Collect raw debug info from the first course to diagnose empty results
      let debugRaw = null;
      if (courses.length > 0) {
        const c = courses[0];
        const dropboxRaw = await fetchJson(`${base}/d2l/api/le/${leVer}/${c.id}/dropbox/folders/`);
        const quizzesRaw = await fetchJson(`${base}/d2l/api/le/${leVer}/${c.id}/quizzes/`);
        debugRaw = {
          course: c,
          lpVer,
          leVer,
          dropbox: JSON.stringify(dropboxRaw).slice(0, 400),
          quizzes: JSON.stringify(quizzesRaw).slice(0, 400),
        };
      }

      sendResponse({
        success:     true,
        courses,
        assignments: assignmentsByCourse.flat(),
        debugRaw,
      });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  })();

  return true;
});
