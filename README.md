# Parhaify

A full-stack student productivity web app built with **React** and **Supabase**. Parhaify helps students manage courses, assignments, clubs, tasks, notes, and wellness all in one place. It is live, fully deployed, and installable as a mobile app on iOS and Android.

**Live App:** [studyflow-aayan-areejos-projects.vercel.app](https://studyflow-aayan-areejos-projects.vercel.app)

## Tech Stack

- **React 18**
- **Supabase** (PostgreSQL, Row Level Security, Auth)
- **Google OAuth 2.0**
- **Vercel** (CI/CD on every push)
- **Progressive Web App (PWA)**

## Features

**Academic**
- Course and assignment tracking with priorities, statuses, and due dates
- Calendar with month and day views aggregating all deadlines and time blocks
- Notes editor with **auto-save**, linked to courses or clubs

**Productivity**
- Personal tasks grouped by category
- Custom Spaces with sections for any project or goal
- Club and extracurricular management with meeting notes

**Tools**
- Study Assistant that extracts text from **PDF**, **DOCX**, and images to generate AI study prompts
- Wellness tracker with stress scoring, workload charts, and mood reflections
- Quick Capture floating button with **natural language parsing**, voice input, and image upload

**Mobile**
- Fully **responsive** at 375px and up
- Bottom navigation bar on mobile
- Installable to home screen on iOS and Android
- Draggable Quick Capture button

## Architecture

Every user gets a fully isolated data environment using **Supabase Row Level Security** policies. The frontend communicates directly with Supabase using the **JavaScript client SDK**. **Authentication** is handled via **Google OAuth** and **Supabase Auth**, with session state managed in **React Context**. All 13 database tables are defined in `schema.sql`.

## Getting Started

```bash
git clone https://github.com/aayanareejo1/studyflow.git
cd studyflow
npm install
```

Create a `.env` file:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Run the app:

```bash
npm start
```

## Database Setup

Run `schema.sql` in the Supabase SQL editor to create all tables with **RLS policies** applied.
