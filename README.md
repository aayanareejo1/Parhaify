<h1 align="center">Parhaify</h1>

<p align="center">
  <strong>All-in-one student productivity platform for academics, clubs, and wellness</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel" />
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square" />
</p>

Parhaify consolidates everything a student tracks — courses, assignments, clubs, notes, and mental health — into one workspace. *Parhai* means study in Urdu.

Built because I had 6 courses and 4 clubs and no single tool tracked all of it. Everything was split across five different apps and I was still missing things. I also wanted something that tracked my mental health over time, not just my to-do list.

**Live:** [studyflow-coral.vercel.app](https://studyflow-aayan-areejos-projects.vercel.app/)

## Features

- **Courses & assignments** — Track everything by course with priorities, due dates, and status. Linked to a shared calendar across all your commitments.
- **Clubs** — Separate space for meeting notes, club tasks, and member management. Doesn't bleed into your academic view.
- **Spaces** — Custom project workspaces with sections and hierarchical tasks for anything that doesn't fit a course or club.
- **Study Assistant** — Upload a PDF, Word doc, or photo of your notes. It extracts the text using OCR and generates AI study prompts from the content.
- **Wellness tracking** — Log mood and stress over time with visual trends. Built for the long term, not just today.
- **Daily planner** — A focused day view across all your commitments in one place.
- **Brightspace sync** — A companion browser extension imports your courses and assignments directly from TMU's LMS. No manual entry.
- **PWA** — Installable on iOS and Android directly from the browser.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Backend | Supabase (PostgreSQL + Row Level Security) |
| Auth | Google OAuth 2.0 |
| Deployment | Vercel |
| Document parsing | pdfjs-dist, mammoth (Word), Tesseract.js (OCR) |

Every one of the 13 database tables enforces Row Level Security — users can only access their own data, even against direct API calls.

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/aayanareejo1/Parhaify.git
cd Parhaify
npm install
```

### 2. Configure environment

Create a `.env` file:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Apply the database schema

Paste `schema.sql` into the Supabase SQL editor and run it. This creates all 13 tables with RLS policies.

### 4. Run

```bash
npm start
```

## Project structure

```
src/
  pages/          # Dashboard, Courses, Assignments, Calendar, Tasks,
                  # DailyPlanner, Clubs, Spaces, Notes, StudyAssistant,
                  # Wellness, Login
  components/     # QuickCapture (voice + photo input), shared UI
  hooks/          # useBrightspaceSync, useMobile
  context/        # App state
  utils/
  supabaseClient.js

schema.sql                 # All 13 tables with RLS policies
brightspace-extension/     # Browser extension for LMS sync
```

## License

MIT
