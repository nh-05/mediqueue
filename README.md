# MediQueue — Smart Hospital Queue Management System

A full-stack, responsive hospital queue management web application built with **HTML/CSS/JavaScript** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 📁 Project Structure

```
mediqueue/
├── frontend/                   # Static HTML/CSS/JS frontend
│   ├── index.html              # Main entry point (all pages)
│   ├── css/
│   │   └── style.css           # Complete stylesheet (white/blue theme)
│   └── js/
│       ├── data.js             # Central data store + sample data
│       ├── utils.js            # Shared utility functions
│       ├── components.js       # Reusable UI components
│       ├── app.js              # App bootstrap + real-time simulation
│       └── pages/
│           ├── home.js         # Home page
│           ├── patient.js      # Patient dashboard
│           ├── doctor.js       # Doctor console
│           ├── admin.js        # Admin dashboard
│           └── display.js      # Queue display screen
│
└── backend/                    # Node.js REST API
    ├── server.js               # Express server entry point
    ├── .env.example            # Environment variable template
    ├── package.json
    ├── middleware/
    │   └── auth.js             # JWT auth + role guard middleware
    ├── models/
    │   └── index.js            # Mongoose schemas (User, Doctor, Dept, Appointment, Queue)
    ├── routes/
    │   ├── auth.js             # POST /register, POST /login, GET /me
    │   ├── patients.js         # Patient CRUD
    │   ├── doctors.js          # Doctor management + status toggle
    │   ├── departments.js      # Department CRUD
    │   ├── appointments.js     # Appointment listing + cancellation
    │   ├── queue.js            # Token generation, call-next, AI wait-time
    │   └── analytics.js        # Summary, hourly flow, department load
    └── config/
        └── seed.js             # Database seeder with sample data
```

---

## 🚀 Quick Start — Frontend Only (No Setup Required)

The frontend is a fully self-contained static app with dummy data built in.

1. Open `frontend/index.html` directly in any modern browser.
2. That's it — all 5 pages work with no server needed.

---

## 🔧 Full Stack Setup

### Prerequisites
- **Node.js** v18 or higher — https://nodejs.org
- **MongoDB** v6+ running locally — https://www.mongodb.com/try/download/community  
  Or use a free cloud instance: https://www.mongodb.com/atlas

### Step 1 — Clone / Extract the project
```bash
# If you downloaded the zip, extract it, then:
cd mediqueue
```

### Step 2 — Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create your .env file from the template
cp .env.example .env

# Edit .env — set your MongoDB URI if not using localhost
# MONGODB_URI=mongodb://localhost:27017/mediqueue
```

### Step 3 — Seed the Database
```bash
npm run seed
```
This creates sample departments, doctors, and patients. Demo credentials will be printed.

### Step 4 — Start the Backend
```bash
# Production start
npm start

# Development (auto-restarts on changes)
npm run dev
```
API will be running at `http://localhost:5000`

### Step 5 — Serve the Frontend
Open `frontend/index.html` directly in your browser, **or** serve it with any static file server:

```bash
# Option A — Python (no install needed)
cd frontend
python3 -m http.server 3000
# Then open http://localhost:3000

# Option B — Node http-server
npx http-server frontend -p 3000
# Then open http://localhost:3000

# Option C — VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

---

## 🔑 Demo Credentials

| Role    | Email                     | Password   |
|---------|---------------------------|------------|
| Admin   | admin@mediqueue.com       | admin123   |
| Doctor  | priya@mediqueue.com       | doctor123  |
| Patient | arjun@example.com         | patient123 |

---

## 🌐 REST API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint           | Description          | Auth |
|--------|--------------------|----------------------|------|
| POST   | /auth/register     | Register new patient | ❌   |
| POST   | /auth/login        | Login (all roles)    | ❌   |
| GET    | /auth/me           | Get current user     | ✅   |

### Queue (Core)
| Method | Endpoint                        | Description                          | Auth       |
|--------|---------------------------------|--------------------------------------|------------|
| GET    | /queue/all                      | Snapshot of all department queues    | ❌         |
| GET    | /queue/department/:deptId       | Live queue for a department          | ❌         |
| POST   | /queue/token                    | Generate token + book appointment    | ✅ Patient |
| PATCH  | /queue/call-next/:doctorId      | Doctor calls next patient            | ✅ Doctor  |
| PATCH  | /queue/complete/:appointmentId  | Mark consultation complete           | ✅ Doctor  |

### Appointments
| Method | Endpoint              | Description                    | Auth    |
|--------|-----------------------|--------------------------------|---------|
| GET    | /appointments         | List (filtered by role)        | ✅      |
| GET    | /appointments/:id     | Get single appointment         | ✅      |
| DELETE | /appointments/:id     | Cancel appointment             | ✅      |

### Departments
| Method | Endpoint              | Description        | Auth       |
|--------|-----------------------|--------------------|------------|
| GET    | /departments          | List all           | ❌         |
| POST   | /departments          | Create             | ✅ Admin   |
| PATCH  | /departments/:id      | Update             | ✅ Admin   |
| DELETE | /departments/:id      | Deactivate         | ✅ Admin   |

### Doctors
| Method | Endpoint                  | Description           | Auth       |
|--------|---------------------------|-----------------------|------------|
| GET    | /doctors                  | List all              | ❌         |
| GET    | /doctors/:id              | Get single            | ❌         |
| POST   | /doctors                  | Create                | ✅ Admin   |
| PATCH  | /doctors/:id/status       | Toggle status         | ✅         |

### Analytics (Admin)
| Method | Endpoint                        | Description               | Auth       |
|--------|---------------------------------|---------------------------|------------|
| GET    | /analytics/summary              | Daily KPI summary         | ✅ Admin   |
| GET    | /analytics/hourly               | Hourly patient flow       | ✅ Admin   |
| GET    | /analytics/department-load      | Per-dept load stats       | ✅ Admin   |

---

## ✨ Features

### Patient
- Digital queue token with QR code placeholder
- Real-time queue progress and estimated wait time
- Appointment booking with department/doctor selection
- Visit history and notification centre
- Priority-based queue entry (Emergency / Elderly / VIP / Standard)

### Doctor
- Live patient queue with priority indicators
- One-click "Complete & Call Next"
- Patient details (age, gender, reason, history)
- Daily activity timeline

### Admin / Reception
- All-department queue monitoring grid
- Walk-in patient registration with dynamic token assignment
- Doctor management (status toggle, add/edit)
- Analytics: hourly flow, department load, wait-time trend, peak hours

### Smart / AI Features
- **Priority scoring algorithm**: Emergency (1000) > VIP (500) > Elderly (300+age bonus) > Standard (100) + waiting-time bonus
- **AI wait-time estimate**: `queue_depth × avg_consult_time × priority_multiplier`
- Real-time queue simulation (5-second polling)
- Queue display screen for hospital waiting TVs with voice announcement simulation

---

## 🛠 Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript |
| Backend   | Node.js, Express.js            |
| Database  | MongoDB (Mongoose ODM)         |
| Auth      | JWT (jsonwebtoken + bcryptjs)  |
| Validation| express-validator              |

---

## 📝 Notes

- **No framework required** — the frontend uses zero dependencies; works in any modern browser.
- To connect frontend API calls to the backend, update the `BASE_URL` constant in `js/app.js` to `http://localhost:5000/api`.
- For production, add HTTPS, rate limiting (`express-rate-limit`), and a process manager (`pm2`).
- MongoDB Atlas free tier works out-of-the-box; just update `MONGODB_URI` in `.env`.
#   m e d i q u e u e  
 