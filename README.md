<h1 align="center">Parhaify</h1>

<p align="center">
  <strong>An all-in-one student productivity app for managing academics, tasks, clubs, and wellness</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel" />
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa" />
</p>

<p align="center">
  <a href="https://studyflow-aayan-areejos-projects.vercel.app"><strong>Live App</strong></a>
</p>

Parhaify is a full-stack student productivity platform that brings courses, assignments, notes, tasks, clubs, and wellness into a single workspace. It runs in the browser and can be installed as an app on iOS and Android.

## Features

**Academic**
- Course and assignment tracking with priorities, statuses, and due dates
- Calendar with month and day views aggregating all deadlines and time blocks
- Notes editor with auto-save, linked to courses or clubs

**Productivity**
- Personal tasks grouped by category
- Custom Spaces with sections for any project or goal
- Club and extracurricular management with meeting notes

**Tools**
- Study Assistant that extracts text from PDF, DOCX, and images to generate AI study prompts
- Wellness tracker with stress scoring, workload charts, and mood reflections
- Quick Capture button with natural language parsing, voice input, and image upload

**Mobile**
- Fully responsive layout with a bottom navigation bar on mobile
- Installable to the home screen on iOS and Android via PWA

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Backend / Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Google OAuth 2.0 via Supabase Auth |
| Deployment | Vercel (auto-deploys on every push) |
| App delivery | Progressive Web App (PWA) |

## How it works

Every user gets a fully isolated data environment through Supabase Row Level Security policies. The frontend communicates directly with Supabase using the JavaScript client SDK. All 13 database tables and their RLS policies are defined in `schema.sql`.

## Getting started

```bash
git clone https://github.com/aayanareejo1/Parhaify.git
cd Parhaify
npm install
```

Create a `.env` file in the project root:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Run the Supabase SQL editor and execute `schema.sql` to create all tables with RLS policies applied.

Then start the app:

```bash
npm start
```

## License

MIT
