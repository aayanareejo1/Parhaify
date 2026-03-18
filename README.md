# StudyFlow

A full-stack student productivity app built with React and Supabase. Manage your courses, assignments, clubs, tasks, notes, and wellness — all in one place.

## Features

- **Dashboard** — unified view of all upcoming deadlines and tasks
- **Courses & Assignments** — track academic work with priorities, due dates, and statuses
- **Clubs** — manage extracurriculars, meetings, and club tasks
- **Tasks** — standalone personal tasks grouped by category
- **Spaces** — custom workspaces with sections (e.g. Job Applications, Projects)
- **Calendar** — month/day views aggregating all deadlines, time blocks, and meetings
- **Notes** — rich note editor with auto-save, linked to courses or clubs
- **Study Assistant** — upload files or paste notes to generate AI study prompts (MCQ, essays, flashcards)
- **Wellness** — stress tracker, workload chart, mood reflections, study logs
- **Quick Capture** — draggable floating button to add tasks via text, voice, or image

## Tech Stack

- **Frontend** — React 18, Lucide icons, CSS custom properties
- **Backend** — Supabase (PostgreSQL + Auth)
- **Auth** — Google OAuth via Supabase
- **Hosting** — Vercel
- **PWA** — installable on iOS and Android

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/aayanareejo1/studyflow.git
cd studyflow
npm install
```

### 2. Set up Supabase

- Create a project at [supabase.com](https://supabase.com)
- Run `schema.sql` in the Supabase SQL editor to create all tables
- Enable Google Auth under Authentication → Providers

### 3. Configure environment variables

Create a `.env` file in the root:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm start
```

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic redeploy.

Add the same environment variables in Vercel under **Settings → Environment Variables**.

## Database

All tables use Row Level Security (RLS) — each user can only access their own data. See `schema.sql` for the full schema.
