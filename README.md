# LearnPath AI – Personalized Learning Platform with an AI Tutor (MVP)

**LearnPath AI** is a full-stack learning companion with a Gemini-powered tutor, personalized rule-based roadmaps, topic quizzes, a study planner, and progress analytics. The tutor explains technical concepts using contextual follow-ups, formulas, and code when Gemini is available.

---

## Architecture Overview

```
D:\AI LEARNING PLATFORM\
├── backend\                      # Python FastAPI Backend
│   ├── app\
│   │   ├── routers\
│   │   │   ├── auth.py           # Registration, BCrypt login, JWT verification
│   │   │   ├── dashboard.py      # Real-time student statistics & recommendations
│   │   │   ├── paths.py          # Learning roadmap generation & topic completion
│   │   │   ├── tutor.py          # AI Tutor chat history & Gemini integration
│   │   │   ├── quizzes.py        # Question bank & scoring engine
│   │   │   ├── analytics.py      # Weak-topic identification & mastery index
│   │   │   └── tasks.py          # Study planner task CRUD
│   │   ├── services\
│   │   │   ├── ai_service.py     # Google Gemini API connector with fallback
│   │   │   ├── roadmap_service.py# Structured curriculum synthesis
│   │   │   └── quiz_service.py   # Curated topic quiz questions bank
│   │   ├── auth.py               # BCrypt password hashing & JWT helpers
│   │   ├── config.py             # App settings & Gemini key verification
│   │   ├── database.py           # SQLAlchemy SQLite engine & session maker
│   │   ├── models.py             # SQLite relational schema
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   └── main.py               # FastAPI entry point & CORS configuration
│   ├── learnpath.db              # SQLite Database (seeded automatically)
│   ├── run.py                    # Convenience server starter
│   ├── test_api.py               # Automated pipeline integration test
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment variables template
│
├── src\                          # React + TypeScript Frontend
│   ├── components\               # Navbar, Footer, Landing sections
│   ├── contexts\
│   │   └── AuthContext.tsx       # Auth state, login/register, token persistence
│   ├── services\
│   │   └── api.ts                # Axios instance with JWT bearer interceptor
│   ├── layouts\
│   │   ├── RootLayout.tsx        # Public layout wrapper
│   │   └── DashboardLayout.tsx   # Authenticated student portal shell with sidebar
│   ├── pages\
│   │   ├── LandingPage.tsx       # Public showcase & value proposition
│   │   ├── LoginPage.tsx         # BCrypt authentication form
│   │   ├── RegisterPage.tsx      # Student registration & path initialization
│   │   ├── DashboardPage.tsx     # Student metrics, active course, streaks
│   │   ├── MyLearningPage.tsx    # Roadmap generator, modules, & interactive quizzes
│   │   ├── AiTutorPage.tsx       # Socratic chat stream with formula/code rendering
│   │   ├── MyProgressPage.tsx    # Recharts analytics, strong/weak concept diagnostics
│   │   ├── StudyPlannerPage.tsx  # Dynamic study block scheduler
│   │   └── SettingsPage.tsx      # Profile, goals, and study preference customization
│   └── routes\
│       └── AppRoutes.tsx         # Client-side route declarations
│
├── tailwind.config.js            # Custom navy, blue, violet theme tokens
├── vite.config.ts                # Optimized manual chunk bundling
└── package.json                  # Frontend dependencies
```

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite 6, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy ORM, SQLite, Pydantic v2, PyJWT, BCrypt.
- **AI Integration**: Google Gemini API called by the backend; Tutor requests return an explicit unavailable error when the key is missing or both models fail.

---

## Implemented Modules & Features

### Module 1: Authentication & User Profiles
- **Student Registration**: Creates user record, hashes password with BCrypt, initializes starter learning path and study tasks in SQLite.
- **Login**: Verifies credentials, computes active streaks, and returns cryptographic JWT bearer token.
- **Token Persistence**: JWT is stored in browser `localStorage` and injected by the Axios request interceptor. Invalid or expired tokens clear the local session.
- **Profile Management**: Update name, learning target, and daily study goal directly via `/api/auth/me`.

### Module 2: Student Dashboard
- Statistics fetched from the student's database: completed lessons, submitted quiz accuracy, level, XP, and streak days.
- Active learning pathway card with dynamic progress percentage.
- Recommended next lesson based on curriculum status.
- Recent activity feed logging quiz submissions and topic completions.

### Module 3: Personalized Learning Paths
- **Custom Roadmap Generator**: Enter any subject (e.g., *Distributed Systems*, *Quantum Computing*, *Kubernetes*) and proficiency level (*Beginner*, *Intermediate*, *Advanced*).
- **Progressive Topics**: Sequential modules with time estimates, difficulty ratings, and summaries.
- **Topic Completion**: Complete the unlocked topic to recalculate course progress and unlock the next topic. Changes are saved to the backend.

### Module 4: Socratic AI Personal Tutor
- Persistent chat stream saved per student in SQLite.
- Uses primary model `gemini-3-flash-preview` and fallback `gemini-3.6-flash`; the API key is read only by the backend.
- Tries the fallback model after upstream errors and reports a clear unavailable error if neither model responds.
- Sends recent conversation turns as context for follow-up questions; chat history is saved per student.
- Markdown output is rendered through an allow-list sanitizer before it reaches the page.

### Module 5: Topic Quizzes & Assessments
- Built-in question bank for technical topics (*Backpropagation*, *Activation Functions*, *CAP Theorem*, *Raft*, *Dynamic Programming*).
- One question at a time, with answers retained while moving between questions.
- Submissions require one answer per quiz question; score, explanations, XP, and attempt history are stored by the backend.

### Module 6: Learning Analytics & Diagnostics
- Recharts **AreaChart** and **BarChart** show dated completed planner-task time and actual submitted quiz scores. Empty dates remain empty.
- **Strong Topics**: Identifies quiz topics with recorded scores >= 80%.
- **Diagnostic Weak Areas**: Detects concepts where accuracy < 75% and pairs them with specific remedial actions and a direct **"Remediate"** link to the AI Tutor.

---

## Quickstart Guide

### 1. Start the Backend API (FastAPI + SQLite)

Open a terminal in `D:\AI LEARNING PLATFORM`:

```powershell
# Navigate to backend directory
cd backend

# Put GEMINI_API_KEY and a unique JWT_SECRET in backend\.env.
# Keep the Gemini key on the backend; never place it in frontend files.

# Start the FastAPI server on port 8000
python run.py
```

The API will start at **`http://127.0.0.1:8000`**.  
Interactive Swagger documentation is available at **`http://127.0.0.1:8000/docs`**.

To run the isolated backend integration tests (they use a temporary test database):
```powershell
cd ..
python -m pytest
```

---

### 2. Start the Frontend (Vite + React)

In a second terminal in `D:\AI LEARNING PLATFORM`:

```powershell
# Start local development server
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

### 3. Create an Account

Register through the app. New accounts start with an uncompleted learning path and study planner tasks; no demo student is created automatically.

---

## Production Build Verification

```powershell
# Run full TypeScript typecheck and production bundle
npm run build

# Preview production build locally
npm run preview
```
