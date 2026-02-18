# NutriKid – Doctor-Guided Pediatric Nutrition Platform 🦁🥦

## Mission
Build a production-quality, full-stack MERN application for pediatric nutrition tracking with doctor oversight, parent controls, and a gamified Kids Mode..

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express.js, MongoDB
- **AI Engine**: Python, FastAPI, FAISS (Vector DB), SentenceTransformers, HuggingFace Inference Client
- **Auth**: JWT, bcrypt, RBAC
- **Validation**: Zod
- **Gamification**: Custom XP/Leveling Engine

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ../nutrikid-backend && pip install -r requirements.txt
   ```

2. **Environment Variables**
   Create `.env` in `backend/`, `frontend/`, and `nutrikid-backend/` (see `.env.example`).

3. **Run Application**
   ```bash
   # Root directory - Runs Frontend, Backend, and AI Service concurrently
   npm run dev
   ```

## Platform Features & Capabilities

### 🧑‍🧑‍🧒 Parent Dashboard (Command Center)
- **Child Management**: Add, edit, and manage multiple child profiles with specific health data.
- **Nutrition Tracking**: Comprehensive dashboard to view daily/weekly nutrition stats.
- **Doctor Access Control**: Secure "Handshake Protocol" to approve/deny doctor access requests.
- **Pediatrician Directory**: Search and connect with verified specialists.
- **Appointment Booking**: Integrated scheduling system for hospital visits.
- **Resource Library**: Curated educational content on pediatric health.
- **AI NutriGuide**: Smart chat assistant for parents providing detailed, medically-grounded advice with references.

### 👨‍⚕️ Doctor Dashboard (Specialist View)
- **Patient Management**: Overview of assigned patients and their status.
- **Patient Details**: Deep-dive access to patient nutrition logs and growth history (with parent approval).
- **Access Requests**: Request access to new patient profiles via secure code/link.
- **Prescription & Reports**: Digital prescription tools and report visualization.

### 🦁 Kids Mode (Gamified Experience)
- **Interactive Dashboard**: Bright, fun, and simplified interface for children.
- **Gamification Engine**:
  - **XP & Levels**: Earn XP for healthy eating habits.
  - **Badges**: Unlock achievements for consistency and milestones.
- **Food Buddy AI**: A safe, superhero-themed AI companion that explains food benefits in simple, fun language (e.g., "Carrots give you X-ray vision!").

### 🧠 AI & LLM Engine (RAG-Powered)
- **Retrieval-Augmented Generation (RAG)**: Uses FAISS vector database to ground answers in verified pediatric textbooks (ICMR/NIN standards).
- **Dual Encoders**: Supports both efficient (MiniLM-L6-v2) and high-fidelity (BGE-Large) embedding models.
- **Context-Aware**: Tailors responses based on child's age, weight, and specific medical conditions.
- **Safety First**: Strict guardrails against medical diagnosis; prioritizes "Ask a grown-up" for sensitive queries.

### 📏 Growth Intelligence System (New 🚀)
- **Clinical Grade Tracking**: Tracks Height, Weight, and automatically calculates BMI (Body Mass Index).
- **Smart Percentiles**: Dynamically benchmarks child's growth against age-based standard percentiles (WHO/CDC style logic).
- **Real-Time Risk Analysis**:
  - **Auto-Flagging**: Instantly identifies "Underweight" or "Obese" entries.
  - **Doctor Loop**: If a high-risk record is logged by a parent, the system **automatically alerts the linked pediatrician** for review.
- **Visual Timeline**: Interactive graphs (Recharts) plotting growth trends over years, not just static tables.
- **Data Integrity**: Distinct verification badges for Parent-reported vs. Doctor-verified data.

### 🚨 Smart Medical Escalation AI Engine (New 🚀)
A robust, safety-first AI layer designed to detect and escalate medical risks during chatbot interactions.

- **Hybrid Risk Detection**:
  - **Layer 1 (Deterministic)**: Keyword scanner for immediate red flags (e.g., "vomiting 3 days", "difficulty breathing").
  - **Layer 2 (LLM Cognition)**: Mistral-7B analyzes conversation context to classify risk as **Low**, **Moderate**, or **High**.
- **Safety & Compliance**:
  - **Data Minimization**: Only medically relevant risk signals are stored; full raw logs are discarded.
  - **Audit Trails**: Every high-risk event is time-stamped and tracable.
  - **Doctor Loop**: High-risk scenarios automatically create an `EscalationEvent` and trigger alerts on the Doctor Dashboard.
- **Doctor Dashboard Integration**:
  - **Real-Time Alerts**: Dedicated "High Risk Alerts" panel.
  - **Triage Workflow**: View risk analysis, detected keywords, and mark events as resolved.

## Development Status: ✅ COMPLETE

All planned phases have been verified and deployed locally.

### ✅ Phase 1: Project Setup & Authentication
- Monorepo initialization & Auth System (JWT/RBAC)
- Unified Login/Register flows for all roles

### ✅ Phase 2: Parent Features
- Complete Dashboard & Child Profile Management
- Meal Logging & History Lists

### ✅ Phase 3: Doctor & Clinical
- Doctor Dashboard & Patient List Integration
- Secure Access Handshake Protocol

### ✅ Phase 4: Analytics & Search
- Visual Analytics (Charts/Graphs)
- Searchable Resource Library & Directory

### ✅ Phase 5: Kids & AI
- Gamified Interface (XP/Badges)
- **Food Buddy** & **NutriGuide** implementation in Python/FastAPI

## Documentation
See `docs/` folder for Architecture, API Contracts, and Roles.
Refer to `master_verification_guide.md` for full end-to-end testing steps.
