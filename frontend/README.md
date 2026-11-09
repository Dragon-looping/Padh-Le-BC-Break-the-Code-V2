# PADH LE BC (Break the Code) — Frontend

> **Tagline:** Learn the algorithm. Understand the result. Choose with confidence.

Production-grade React frontend application for PADH LE BC, directly integrated with the FastAPI backend and scikit-learn machine learning engine.

---

## 1. Quickstart

### Prerequisites
- Node.js 18+ (tested with v24.18.1 / Bun 1.4.0)
- Running FastAPI backend service (default: `http://127.0.0.1:8000`)

### Installation & Run
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (via bun or npm)
bun install # or: npm install

# Start development server
npm run dev
```

The application will be available at [http://127.0.0.1:5173](http://127.0.0.1:5173).

---

## 2. Key Architecture & Features

- **Authoritative API Integration:** Direct integration with `backend/app/routes/` via `src/services/`. Every metric, profile statistic, ranking, and confusion matrix traces directly to real scikit-learn execution.
- **Honesty Rules Enforced:**
  - `BACKEND RESULT` (solid cyan badge) for verified backend responses.
  - `ILLUSTRATIVE SIMULATION` (orange hatched badge) for client-side mathematical demonstrations.
  - `PLANNED` (dashed graphite badge) for upcoming syllabus items.
- **WebGL Particle Vortex Hero:** Custom Three.js vertex shader with additive blending, pointer swirl disturbance, adaptive particle budgeting (desktop: 60k, tablet: 30k, mobile: 14k), and reduced-motion poster fallback.
- **Kinetic Wordmark:** Real DOM text with 900ms code-glyph scramble resolution, blinking block caret, and hover/focus expansion.
- **Model Lab Cockpit:** 4-step workflow (Upload, Profile, Target/Task Confirmation, Train & Compare) with synchronous training execution, hyperparameter grid search tuning, and before/after metric deltas.
- **Editorial Learning Hub:** Complete structured curriculum for Units 1–5, LaTeX mathematical equations via KaTeX, scikit-learn code blocks with clipboard copy, and interactive knowledge check quizzes.

---

## 3. Testing & Verification

```bash
# Type check and build bundle
npm run build

# Run unit test suite
npm run test
```
