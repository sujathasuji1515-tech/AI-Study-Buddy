# AI StudyBuddy

AI-powered learning assistant for students.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas + Mongoose
- Authentication: JWT + bcryptjs
- AI: Google Gemini
- API testing: Postman

## Requirements
- Node.js LTS
- MongoDB Atlas account
- VS Code
- Postman

## Setup

### 1. Backend
Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your MongoDB URI, JWT secret, and Gemini API key.

Start development server:

```bash
npm run dev
```

### 2. Frontend
Open another terminal in `frontend`:

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Starter API routes
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/material/upload`
- GET `/api/material`
- POST `/api/ai/summary/:id`
- POST `/api/ai/flashcards`
- POST `/api/ai/quiz`
- POST `/api/ai/study-plan`

The current starter accepts study material as text. PDF/DOCX text extraction can be added later.
