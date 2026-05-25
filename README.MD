# Attendance Control System

Sistema de control de asistencia con kiosko táctil, panel administrativo y gestión de turnos.

## Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router DOM v7
- React Hook Form + Zod
- Axios
- Lucide React (iconos)

### Backend
- Express + TypeScript
- Prisma ORM
- JWT Authentication
- Zod Validation
- Rate Limiting

### Database
- PostgreSQL 17 (Docker)

---

## Project Structure

```
.
├── apps
│   ├── backend
│   │   ├── prisma/          # Schema, migrations, seed
│   │   ├── src/
│   │   │   ├── config/      # App configuration
│   │   │   ├── errors/      # Error handler
│   │   │   ├── middlewares/  # Auth + validation
│   │   │   ├── modules/
│   │   │   │   ├── attendance/  # Register & history
│   │   │   │   ├── auth/        # Login
│   │   │   │   ├── schedules/   # Shift management
│   │   │   │   └── users/       # CRUD users
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   └── package.json
│   └── frontend
│       ├── src/
│       │   ├── components/  # Keypad, TableSkeleton
│       │   ├── context/     # AuthContext
│       │   ├── pages/       # Kiosk, Login, Admin
│       │   ├── services/    # Axios API client
│       │   ├── types/       # TypeScript interfaces
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── package.json
├── docker-compose.yml
├── package.json             # Root scripts
└── pnpm-workspace.yaml
```

---

## Requirements

- Node.js >= 20
- PNPM
- Docker & Docker Compose

```bash
npm install -g pnpm
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <YOUR_REPOSITORY_URL>
cd softwareControlAttendance
pnpm install
```

### 2. Start PostgreSQL

```bash
pnpm db:up
# or: docker compose up -d
```

### 3. Configure Backend Environment

Create `apps/backend/.env`:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres_secure_password_123@localhost:5432/attendance_db"
JWT_SECRET="super_secret_jwt_key"
NODE_ENV=development
```

### 4. Setup Database

```bash
cd apps/backend
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm prisma:seed
```

### 5. Run Backend

```bash
# Terminal 1
cd apps/backend
pnpm dev
# Runs on http://localhost:3000
```

### 6. Run Frontend

```bash
# Terminal 2
cd apps/frontend
pnpm dev
# Runs on http://localhost:5173
```

Or use root-level shortcuts:

```bash
pnpm dev:backend   # starts backend only
pnpm dev:frontend  # starts frontend only
pnpm dev           # starts both in parallel
```

---

## Default Credentials

After seeding, a **Super Admin** is created:

| Email                        | Password        |
|------------------------------|-----------------|
| superadmin@attendance.com    | superadmin123   |

---

## Features

### Kiosko (Front page)
- Real-time clock display
- Numeric keypad for DNI input
- Automatic CHECK_IN / CHECK_OUT detection (15s cooldown)
- Fullscreen toggle
- Visual success/error feedback

### Admin Panel (`/login` → `/admin`)
- **Historial Diario** — Search attendance records by name/DNI/date range
- **Directorio** — CRUD users (name, DNI, email, role, schedule, active status)
- **Turnos & Horarios** — CRUD work shifts with configurable tolerance & entry windows
- **Justification** — Mark absences as justified, force check-out times
- Role-based access control (SUPER_ADMIN, ADMIN, HR, EMPLOYEE)

### Roles & Permissions
| Role          | Can Manage             |
|---------------|------------------------|
| SUPER_ADMIN   | Everything             |
| ADMIN         | HR + EMPLOYEE          |
| HR            | EMPLOYEE               |
| EMPLOYEE      | None (read-only)       |

---

## API Endpoints

| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| GET    | `/api/health`               | No   | Health check             |
| POST   | `/api/auth/login`           | No   | Login                    |
| POST   | `/api/attendance/register`  | No   | Register by DNI          |
| GET    | `/api/attendance/history`   | Yes  | Attendance records       |
| PUT    | `/api/attendance/records/:id`| Yes  | Justify record           |
| GET    | `/api/users`                | Yes  | List users               |
| POST   | `/api/users`                | Yes  | Create user              |
| PUT    | `/api/users/:id`            | Yes  | Update user              |
| DELETE | `/api/users/:id`            | Yes  | Delete user              |
| GET    | `/api/schedules`            | Yes  | List schedules           |
| POST   | `/api/schedules`            | Yes  | Create schedule          |
| PUT    | `/api/schedules/:id`        | Yes  | Update schedule          |
| DELETE | `/api/schedules/:id`        | Yes  | Delete schedule          |

---

## Development

```bash
# Start database
docker compose up -d

# Generate Prisma client after schema changes
cd apps/backend && pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name <description>

# Seed database
pnpm prisma:seed

# Run both apps
pnpm dev
```

---

## Build for Production

```bash
# Backend
cd apps/backend && pnpm build

# Frontend
cd apps/frontend && pnpm build
```

---

## Docker Commands

```bash
pnpm db:up      # Start PostgreSQL
pnpm db:down    # Stop containers
docker compose down -v   # Stop and delete data (reset)
```

---

## Tech Notes

- Backend port: **3000** (configurable via `PORT` env)
- Attendance cooldown: **15 seconds** between registrations per user
- Entry window: configurable per schedule (before/after check-in time)
- Late detection: based on schedule tolerance minutes
- Frontend calls backend at `http://localhost:3000/api`

---

## Future Improvements

- QR attendance
- Facial recognition
- Fingerprint support
- Excel export
- Reports dashboard
- Shift management
- Geolocation
- PWA support
