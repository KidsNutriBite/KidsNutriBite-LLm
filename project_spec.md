# Project Specification Document: KidsNutriBite

## 1. Cover Page

**Project Title:** KidsNutriBite – AI-Driven Pediatric Nutrition & Growth Platform  
**Client Name / Organization:** Pediatric Care Clinics & Family Wellness Network  
**Submitted By:**  
- Project Lead (System Architect)
- Frontend Lead (UI/UX Engineer)
- Backend Lead (Security & API Engineer)
- AI Developer (LLM & RAG Specialist)
- QA Analyst (Data Integrity)

**Institution / Course Name:** Advanced Web Development & AI Integration  
**Date of Submission:** May 1, 2026

---

## 2. Abstract / Executive Summary

**Background:**
Childhood nutrition is a complex balance often managed through guesswork. Parents lack a centralized tool to monitor both macro and micronutrient intake, while pediatricians rely on subjective data during short consultations.

**Proposed Solution:**
KidsNutriBite is a comprehensive ecosystem (Next.js, Node.js, Express, MongoDB, and FastAPI) that digitizes pediatric health tracking. It transforms raw meal data into clinical insights using ICMR-aligned rules and AI analysis, providing a seamless bridge between daily home care and professional medical oversight.

**Main Functionality:**
1.  **Parental Command Center:** Multi-child management, meal logging, and growth tracking (BMI/Waist).
2.  **Daily Lifestyle Monitoring:** Real-time sleep and activity tracking with status indicators.
3.  **Smart Parent Guide:** Rule-based health tips and clinical nutrition gap analysis.
4.  **Consolidated Family Planning:** AI-generated meal strategies and downloadable PDF reports for multiple children.
5.  **Gamified Kids Dashboard:** XP-based rewards and "Food Buddy" AI for interactive nutrition education.

---

## 3. Introduction

### 3.1 Background
Accurate tracking of childhood growth metrics and dietary intake is essential for preventing long-term health issues like stunting or childhood obesity.

### 3.2 Problem Statement
Existing health apps are often too generic or lack medical grounding. Parents struggle with "hidden" deficiencies, while children find health tracking boring.

### 3.3 Objectives
- Provide a secure, medical-grade tracking platform using Indian ICMR guidelines.
- Automate nutritional analysis and family meal planning.
- Engage children through gamification and rewards.
- Enable high-fidelity data sharing with pediatricians via prescriptions and analytics.

---

## 4. System Overview

**Architecture:**
A hybrid microservice architecture. Next.js handles the user interface; Node.js/Express manages core business logic and MongoDB persistence; a Python/FastAPI service powers deep AI analysis and RAG (Retrieval-Augmented Generation).

**Users:**
- **Parents:** Data entry, analytics review, and family meal management.
- **Kids:** Interactive dashboard, health quests, and XP earning.
- **Doctors:** Patient oversight, risk flagging, and digital prescriptions.

**Major Modules:**
- Profile & Physical Metrics (Multi-child support)
- Meal & Nutritional Logging
- Sleep & Physical Activity Tracking
- Smart Parent Guide (AI/Rule Engine)
- Personalized Resources & PDF Reporting
- Growth Timeline (BMI/Height/Weight)

---

## 5. Functional Requirements

**FR1: Multi-Child Profile Management**
- Track: Name, Age, Height, Weight, Waist Circumference, Location, and Health Conditions.
- Features: 90-day update reminders, educational tooltips for metrics.

**FR2: Nutrition & Lifestyle Tracking**
- Track: Daily meals (Macros), Sleep (Start/End times), Activity (Type/Duration).
- Status: Auto-calculated sleep status (Poor/Healthy) and activity status (Active/Inactive).

**FR3: Smart Parenting Guide**
- Logic: Proactive tips based on daily totals (e.g., "Protein low today", "High Carbs detected").
- Deep Analysis: Clinical gap assessment using Gemini-powered AI.

**FR4: Family Meal Strategy & Reporting**
- Features: Aggregated meal recommendations for families with multiple children.
- Output: Professional PDF downloads of weekly nutrition plans (jsPDF).

**FR5: Gamified Kids Interface**
- Features: XP/Leveling system, Superfood quests, and "Food Buddy" AI chat.

---

## 6. System Architecture / Design

- **Frontend:** Next.js 14 (App Router), Tailwind CSS (Aesthetics), Recharts (Visualization), Framer Motion (Animations).
- **Backend:** Node.js/Express, Mongoose (MongoDB), JWT Authentication.
- **AI Layer:** FastAPI, Gemini API, RAG Pipeline with ICMR/NIN Knowledge Base.
- **Reporting:** jsPDF and jspdf-autotable for client-side document generation.

---

## 7. Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **Next.js 14** | Primary Web Framework (Server-side rendering & optimized routing). |
| **Node.js / Express** | Robust backend API service. |
| **MongoDB / Mongoose** | Flexible NoSQL storage for complex health logs. |
| **FastAPI / Python** | High-performance AI service layer. |
| **Recharts** | Interactive health and nutrition trend visualization. |
| **jsPDF** | Client-side professional medical report generation. |
| **Framer Motion** | Premium, smooth UI transitions and micro-animations. |

---

## 8. Changes & Future Improvements

**Recently Implemented:**
- Integrated Indian State/City mapping in profile creation.
- Added strict physical metric validation.
- Implemented Sleep/Activity tracking with status logic.
- Created "Today's Parenting Guide" rule-based tips.
- Added Family-aggregated meal recommendations with PDF export.

**Future Scope:**
- **Wearable Sync:** Integration with Fitbit/Apple Watch for automated activity logging.
- **Community Forum:** Secure parent-to-parent advice boards.
- **Grocery Integration:** Auto-generating shopping lists from meal plans.
- **Multilingual Support:** Localizing content for regional Indian languages.

---

## 9. Testing Strategy

- **Unit Testing:** Validating BMI and Sleep duration calculations.
- **Integration Testing:** Ensuring data sync between Parent logs and Kids XP rewards.
- **Security Testing:** Verifying RBAC (Role-Based Access Control) across Parent and Doctor portals.
- **Compatibility Testing:** Ensuring responsive charts across Mobile/Desktop views.

---

## 10. Conclusion

KidsNutriBite successfully transitions pediatric health from reactive to proactive. By combining the precision of medical guidelines (ICMR) with the power of modern AI and gamification, the platform empowers families to take ownership of their children's nutritional future.
