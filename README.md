# Student Progress, Consistency & Streak Tracker

**Build2Break Hackathon Submission**

A resilient, strictly validated EdTech system designed to track student progress and enforce consistency without compromise.

## 🚀 Key Features
- **Strict Streak Logic**: No grace periods. Miss a day, reset to zero.
- **Confidence Engine**: Analyzes data patterns (volatility, volume, spikes) to rate analytics reliability (Low/Medium/High).
- **Glassmorphism UI**: Premium dark-mode dashboard built with React + Vite.
- **Deterministic Analytics**: Progress = Effort (Time) + Outcome (Score).

## 🛠 Tech Stack
- **Backend**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **Frontend**: React 18 (Vite) + Recharts
- **Orchestration**: Docker Compose

## 📦 Run Locally (Judges)

1. **Prerequisites**: Docker Desktop installed.
2. **Start System**:
   ```bash
   docker-compose up --build
   ```
3. **Access**:
   - **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🧪 Testing the System (Break Phase)
- **Simulate Learning**: Use the "Simulate Learning Event" button on the Dashboard.
- **View Confidence**: Observe how confidence changes if you spam events or send high volatility scores.
- **Strict Streak**: Stop sending events for >24h (or simulate past dates via API) and watch the streak reset.

## 📁 Architecture
- `/backend`: Core logic (`logic.py`), Pydantic models, and API.
- `/frontend`: React application using `api.js` for communication.
- `docker-compose.yml`: Binds everything together.

## ⚠️ Known Assumptions
- Learning events are the *only* source of truth.
- Time spent < 1 minute is invalid (Strict minimum effort).
- Data must be consistent to achieve High confidence.
