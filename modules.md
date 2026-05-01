# KidsNutriBite Project Modules Documentation

## 1. Authentication & User Management [COMPLETED]
*   **Tech Stack:** JWT (JSON Web Tokens), bcryptjs, Express Middleware.
*   **Features:**
    *   Secure Parent & Doctor Signup/Login.
    *   Role-based access control (RBAC) for Parent, Doctor, and Admin roles.
    *   Session management with secure HTTP-only cookies/token storage.

## 2. Child Profile Management [COMPLETED]
*   **Purpose:** To build a health baseline for each child in the family.
*   **Tracked Inputs:**
    *   **Identity:** Name, Gender (Male, Female, Other), Avatar Selection.
    *   **Physical Metrics:** Age (Years), Height (cm), Weight (kg), Waist Circumference (cm).
    *   **Location:** State (Dropdown), City (Mapped to State).
    *   **Health Baseline:** Pre-existing conditions (Anemia, Obesity, Picky Eater, etc.), Other specific conditions (text input).
*   **Key Features:**
    *   Multi-step profile creation wizard with progress indicators.
    *   Strict validation (No negative metrics, age limit check).
    *   Educational tooltips (e.g., "Learn more about Waist Circumference").

## 3. Meal & Nutrition Logging [COMPLETED]
*   **Purpose:** Tracking daily dietary intake to identify nutritional gaps.
*   **Tracked Inputs:**
    *   **Meal Type:** Breakfast, Lunch, Snacks, Dinner.
    *   **Food Items:** Name, Quantity, Calories, Protein, Carbs, Fats.
    *   **Metadata:** Notes, Photos (Optional).
*   **Key Features:**
    *   Quick-add meal interface.
    *   Nutritional breakdown per meal and daily totals.
    *   Streak tracking for consistent logging.

## 4. Daily Activity & Sleep Tracking [COMPLETED]
*   **Purpose:** Monitoring lifestyle factors that affect growth and health.
*   **Tracked Inputs:**
    *   **Sleep:** Sleep Time, Wake-up Time (Calculates total hours).
    *   **Activity:** Activity Type (Sports, Playing, Walking), Duration (Minutes).
*   **Key Features:**
    *   Daily status indicators (Poor Sleep, Healthy, Active, Inactive).
    *   Automatic sleep hour calculation across day boundaries.

## 5. Smart Parent Guide & AI Insights [COMPLETED]
*   **Purpose:** Proactive health advice based on tracked data.
*   **Logic:** Rule-based engine (ICMR guidelines) + AI Analysis (Gemini/FastAPI).
*   **Features:**
    *   **Real-time Tips:** "Protein low? Give eggs." | "Inactive? Encourage play."
    *   **Clinical Nutrition Analysis:** Deep dive into micronutrient gaps and target recommendations.
    *   **Status Badges:** Visual feedback on "Healthy" vs "Update Required".

## 6. Resources & Recommendations Engine [COMPLETED]
*   **Purpose:** Providing curated Indian dietary content and family strategies.
*   **Features:**
    *   **Consolidated Family Meal Strategy:** Aggregates needs of multiple children into one cooking plan.
    *   **Weekly Nutrition Plans:** PDF reports with day-by-day meal suggestions.
    *   **Resource Library:** Curated Indian recipes (Iron-rich, protein-packed) and parenting guides.
    *   **Tech Stack:** jsPDF, jspdf-autotable.

## 7. Child Growth Timeline [COMPLETED]
*   **Purpose:** Longitudinal tracking of height, weight, and BMI.
*   **Tracked Inputs:** Height, Weight, Date of Measurement.
*   **Key Features:**
    *   **BMI Calculator:** Automatic calculation based on latest metrics.
    *   **Interactive Charts:** Recharts-powered visualization of growth trends.
    *   **90-Day Reminders:** Notifications to update stats for accurate tracking.

## 8. Doctor-Parent Module [COMPLETED]
*   **Purpose:** Bridging the gap between tracking and medical consultation.
*   **Features:**
    *   **Prescription Management:** Doctors can upload digital prescriptions.
    *   **Appointment Scheduling:** Booking slots for pediatric consultations.
    *   **Medical Access Control:** Parents can grant/revoke data access to specific doctors.

## 9. Gamified Kids Mode [PARTIALLY COMPLETED]
*   **Purpose:** Encouraging children to eat healthy through engagement.
*   **Features:**
    *   **XP & Leveling:** Points earned for eating "Superfoods" (Spinach, Milk, etc.).
    *   **Quest System:** Daily health challenges.
    *   **Avatar Evolution:** Unlocking rewards based on nutrition streaks.

## 2. Child Profile Management
*   **Purpose:** To build a health baseline for each child in the family.
*   **Tracked Inputs:**
    *   **Identity:** Name, Gender (Male, Female, Other), Avatar Selection.
    *   **Physical Metrics:** Age (Years), Height (cm), Weight (kg), Waist Circumference (cm).
    *   **Location:** State (Dropdown), City (Mapped to State).
    *   **Health Baseline:** Pre-existing conditions (Anemia, Obesity, Picky Eater, etc.), Other specific conditions (text input).
*   **Key Features:**
    *   Multi-step profile creation wizard with progress indicators.
    *   Strict validation (No negative metrics, age limit check).
    *   Educational tooltips (e.g., "Learn more about Waist Circumference").

## 3. Meal & Nutrition Logging
*   **Purpose:** Tracking daily dietary intake to identify nutritional gaps.
*   **Tracked Inputs:**
    *   **Meal Type:** Breakfast, Lunch, Snacks, Dinner.
    *   **Food Items:** Name, Quantity, Calories, Protein, Carbs, Fats.
    *   **Metadata:** Notes, Photos (Optional).
*   **Key Features:**
    *   Quick-add meal interface.
    *   Nutritional breakdown per meal and daily totals.
    *   Streak tracking for consistent logging.

## 4. Daily Activity & Sleep Tracking
*   **Purpose:** Monitoring lifestyle factors that affect growth and health.
*   **Tracked Inputs:**
    *   **Sleep:** Sleep Time, Wake-up Time (Calculates total hours).
    *   **Activity:** Activity Type (Sports, Playing, Walking), Duration (Minutes).
*   **Key Features:**
    *   Daily status indicators (Poor Sleep, Healthy, Active, Inactive).
    *   Automatic sleep hour calculation across day boundaries.

## 5. Smart Parent Guide & AI Insights
*   **Purpose:** Proactive health advice based on tracked data.
*   **Logic:** Rule-based engine (ICMR guidelines) + AI Analysis (Gemini/FastAPI).
*   **Features:**
    *   **Real-time Tips:** "Protein low? Give eggs." | "Inactive? Encourage play."
    *   **Clinical Nutrition Analysis:** Deep dive into micronutrient gaps and target recommendations.
    *   **Status Badges:** Visual feedback on "Healthy" vs "Update Required".

## 6. Resources & Recommendations Engine
*   **Purpose:** Providing curated Indian dietary content and family strategies.
*   **Features:**
    *   **Consolidated Family Meal Strategy:** Aggregates needs of multiple children into one cooking plan.
    *   **Weekly Nutrition Plans:** PDF reports with day-by-day meal suggestions.
    *   **Resource Library:** Curated Indian recipes (Iron-rich, protein-packed) and parenting guides.
    *   **Tech Stack:** jsPDF, jspdf-autotable.

## 7. Child Growth Timeline
*   **Purpose:** Longitudinal tracking of height, weight, and BMI.
*   **Tracked Inputs:** Height, Weight, Date of Measurement.
*   **Key Features:**
    *   **BMI Calculator:** Automatic calculation based on latest metrics.
    *   **Interactive Charts:** Recharts-powered visualization of growth trends.
    *   **90-Day Reminders:** Notifications to update stats for accurate tracking.

## 8. Doctor-Parent Module
*   **Purpose:** Bridging the gap between tracking and medical consultation.
*   **Features:**
    *   **Prescription Management:** Doctors can upload digital prescriptions.
    *   **Appointment Scheduling:** Booking slots for pediatric consultations.
    *   **Medical Access Control:** Parents can grant/revoke data access to specific doctors.

## 9. Gamified Kids Mode
*   **Purpose:** Encouraging children to eat healthy through engagement.
*   **Features:**
    *   **XP & Leveling:** Points earned for eating "Superfoods" (Spinach, Milk, etc.).
    *   **Quest System:** Daily health challenges.
    *   **Avatar Evolution:** Unlocking rewards based on nutrition streaks.

---

## Technical Stack Summary
*   **Frontend:** Next.js 14, Tailwind CSS, Framer Motion, Axios, jsPDF.
*   **Backend:** Node.js, Express, Mongoose (MongoDB).
*   **AI Layer:** FastAPI (Python), Gemini API (for deep analysis).
*   **Visualizations:** Recharts.
*   **State Management:** React Hooks (useState, useEffect, useMemo).

---

## Pending Modules & Roadmap
1.  **Interactive Kids Dashboard (Full UI/UX)**:
    *   Developing the full interactive superhero-themed UI for children.
    *   Implementing "Avatar Evolution" animations.
    *   Interactive daily quests and health stories.
2.  **Live Push Notification System**:
    *   Real-time reminders for meal logging and medication.
    *   Growth update alerts (90-day cycle).
3.  **Advanced Health Analytics (Predictive)**:
    *   AI-driven predictions for growth stunting or obesity risks based on longitudinal data.
4.  **Multilingual Support**:
    *   Adding support for Hindi, Telugu, Tamil, and other regional languages for better accessibility.
5.  **Wearable Integration**:
    *   Connecting to Fitbit/Apple Watch for automated activity and sleep syncing.
