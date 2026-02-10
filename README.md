# NutriKid – Doctor-Guided Pediatric Nutrition Platform 🦁🥦

## Mission
Build a production-quality, full-stack MERN application for pediatric nutrition tracking with doctor oversight, parent controls, and a gamified Kids Mode.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express.js, MongoDB
- **Auth**: JWT, bcrypt, RBAC
- **Validation**: Zod
- **Gamification**: Custom XP/Leveling Engine

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Variables**
   Create `.env` in `backend/` and `.env` in `frontend/` (see `.env.example`).

3. **Run Application**
   ```bash
   # Root directory - Runs both Frontend and Backend concurrently
   npm run dev
   ```

## Development Status: ✅ COMPLETE

All planned phases have been verified and deployed locally.

### ✅ Phase 1: Project Setup & Authentication
- Monorepo initialization
- Express + MongoDB setup
- User model & Auth APIs
- Frontend Auth Pages & Context
- Role-based Access Control

### ✅ Phase 2: Parent Dashboard
- Profile & MealLog Models
- Parent Dashboard Layout
- Profile Management (Add Child/Edit)
- Meal Logging & History Lists

### ✅ Phase 3: Doctor Dashboard & Access
- DoctorAccess Model (Handshake Protocol)
- Doctor Dashboard & Patient List
- Access Requests (Doctor -> Parent)
- Explicit Parent Approval Flow

### ✅ Phase 4: Reports & Analytics
- Visual Analytics (Meal Frequency Charts)
- Prescription System (Doctors write, Parents read)
- Data Aggregation Pipelines

### ✅ Phase 5: Gamified Kids Mode
- **Kids Dashboard**: Parent-controlled, read-only interface.
- **Gamification**: XP, Levels, and Badges derived from meal logs.
- **Food Buddy**: Safe, keyword-based AI chat companion.

## Documentation
See `docs/` folder for Architecture, API Contracts, and Roles.
Refer to `master_verification_guide.md` for full end-to-end testing steps.
