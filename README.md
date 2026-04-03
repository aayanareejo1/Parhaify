# Parhaify

*Parhai* means "study" in Urdu. Built because I had 6 courses and 4 clubs and every tool I tried only tracked one of them. Parhaify tracks all of it — and your mental health alongside it, because burnout is real.

Live: [studyflow-coral.vercel.app](https://studyflow-coral.vercel.app)

---

## What it does

A student productivity platform that replaces the four or five apps most students juggle:

- **Courses & assignments** — track everything by course, priority, and due date
- **Calendar** — month and day views, integrated with your assignments and clubs
- **Clubs** — meeting notes, club tasks, separate from your academic work
- **Spaces** — custom project workspaces with sections and tasks
- **Study Assistant** — upload a PDF, Word doc, or photo of your notes; it extracts the text and generates AI study prompts
- **Wellness tracking** — mood and stress logs over time, not just today

**Brightspace sync** — a companion browser extension imports your courses and assignments directly from TMU's LMS so you don't have to enter them manually.

Installable as a PWA on iOS and Android.

---

## Tech stack

| | |
|---|---|
| Frontend | React 18 |
| Backend | Supabase (PostgreSQL + Row Level Security) |
| Auth | Google OAuth 2.0 |
| Deployment | Vercel |
| Document parsing | pdfjs-dist, mammoth (Word), Tesseract.js (OCR) |

Every one of the 13 database tables has RLS policies enforced — users can only ever read and write their own data, even if they hit the API directly.

---

## How to run locally

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema applied

```bash
git clone https://github.com/aayanareejo1/Parhaify.git
cd Parhaify
npm install
```

Create a `.env` file:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

Apply the database schema by pasting `schema.sql` into the Supabase SQL editor and running it.

```bash
npm start
```

---

## Structure

```
src/
  pages/           # 12 pages (Dashboard, Courses, Assignments, Calendar,
                   #           Tasks, DailyPlanner, Clubs, Spaces, Notes,
                   #           StudyAssistant, Wellness, Login)
  components/
    QuickCapture.js  # Voice + photo input widget with OCR
    UI.js            # Shared UI primitives
  hooks/
    useBrightspaceSync.js  # Brightspace LMS course import
  supabaseClient.js

schema.sql                  # All 13 tables with RLS policies
brightspace-extension/      # Browser extension for LMS sync
```
