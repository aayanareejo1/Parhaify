# StudyFlow 📚

A full-featured student planner built with React. Dark mode, no backend required.

## Features
- **Dashboard** — Today / This Week / Upcoming / Overdue tabs + stats
- **Courses** — Color-coded course management (CRUD)
- **Assignments** — Priority, status, filters
- **Daily Planner** — Visual time blocks
- **Notes** — Split-panel editor with auto-save
- **Study Assistant** — Generate AI prompts (MCQ, short answer, etc.) → open in Claude or ChatGPT
- **Quick Capture** (⚡ FAB) — Add tasks via text, voice, or image with natural language parsing
- **Notifications** — Bell icon with upcoming deadline alerts

## Setup (2 steps)

### Prerequisites
- [Node.js](https://nodejs.org) — download and install (LTS version)

### Run the app

```bash
# 1. Install dependencies (only needed once)
npm install

# 2. Start the app
npm start
```

The app will open automatically at **http://localhost:3000**

## How to use Quick Capture ⚡
Click the lightning bolt button (bottom-right corner) from any page.

Try typing:
- `CPS406 assignment due this Friday at 11:59 PM`
- `MTH110 quiz tomorrow night`
- `Lab report for CPS305 due March 22 at 3 PM`

It will parse the course, task type, date, and time automatically.

## How to use Study Assistant 🤖
1. Go to **Study Assistant** in the sidebar
2. Paste your notes or lecture material
3. Pick an output type (MCQ, Short Answer, etc.)
4. Click **Generate Prompt**
5. Click **Open in Claude** or **Open in ChatGPT** — the prompt is auto-copied to your clipboard
6. Paste it into the AI chat!

## Adding Google OAuth later
This frontend uses local state. When you're ready to add a backend:
- Build a Node.js/Express server with Passport.js Google OAuth
- Replace the `user` state in `AppContext.js` with real session data
- Add API calls to persist courses/assignments/notes to a database
