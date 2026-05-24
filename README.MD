# Attendance Control System

Sistema de control de asistencia desarrollado con:

* React + TypeScript
* Express + TypeScript
* PostgreSQL
* Prisma ORM
* Docker
* PNPM Workspace Monorepo

---

# Stack

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS

## Backend

* Express
* Prisma ORM
* JWT Authentication
* Zod Validation

## Database

* PostgreSQL 17

---

# Project Structure

```bash
.
├── apps
│   ├── backend
│   └── frontend
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
```

---

# Requirements

Install:

* Node.js >= 20
* PNPM
* Docker
* Docker Compose

---

# Install PNPM

```bash
npm install -g pnpm
```

---

# Clone Project

```bash
git clone <YOUR_REPOSITORY_URL>

cd softwareControlAttendance
```

---

# Install Dependencies

From project root:

```bash
pnpm install
```

---

# Docker PostgreSQL Setup

## Start PostgreSQL Container

From project root:

```bash
docker compose up -d
```

## Verify Container

```bash
docker ps
```

Expected container:

```bash
attendance_postgres
```

---

# Backend Environment Variables

Create file:

```bash
apps/backend/.env
```

Add:

```env
PORT=4000

DATABASE_URL="postgresql://postgres:postgres_secure_password_123@localhost:5432/attendance_db"

JWT_SECRET="super_secret_jwt_key"

NODE_ENV=development
```

---

# Prisma Setup

Go to backend:

```bash
cd apps/backend
```

## Generate Prisma Client

```bash
pnpm prisma generate
```

## Run Database Migrations

```bash
pnpm prisma migrate dev --name init
```

## Seed Database

```bash
pnpm prisma:seed
```

---

# Run Backend

From:

```bash
apps/backend
```

Run:

```bash
pnpm dev
```

Backend runs on:

```bash
http://localhost:4000
```

---

# Run Frontend

Open another terminal.

Go to frontend:

```bash
cd apps/frontend
```

Run:

```bash
pnpm dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Recommended Backend Script

Install tsx:

```bash
cd apps/backend

pnpm add -D tsx
```

Update backend `package.json`:

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "prisma db seed"
}
```

---

# Docker Compose

```yml
services:
  postgres:
    image: postgres:17-alpine
    container_name: attendance_postgres
    restart: unless-stopped

    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_secure_password_123
      POSTGRES_DB: attendance_db

    ports:
      - "5432:5432"

    volumes:
      - postgres_data:/var/lib/postgresql/data

    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

# Development Workflow

## Terminal 1

Run PostgreSQL:

```bash
docker compose up -d
```

---

## Terminal 2

Run backend:

```bash
cd apps/backend

pnpm prisma generate

pnpm prisma migrate dev --name init

pnpm prisma:seed

pnpm dev
```

---

## Terminal 3

Run frontend:

```bash
cd apps/frontend

pnpm dev
```

---

# Build Production

## Backend

```bash
cd apps/backend

pnpm build
```

## Frontend

```bash
cd apps/frontend

pnpm build
```

---

# Stop Containers

```bash
docker compose down
```

---

# Reset Database

WARNING: deletes all data.

```bash
docker compose down -v
```

Then:

```bash
docker compose up -d
```

---

# Recommended Git Ignore

Create `.gitignore` in project root:

```gitignore
node_modules
dist
.env
.prisma
```

---

# Features

* Attendance registration by DNI
* Numeric keypad UI
* JWT authentication
* Admin dashboard
* User activation/deactivation
* PostgreSQL database
* Prisma ORM
* Dockerized database
* Responsive kiosk UI

---

# Future Improvements

* QR attendance
* Facial recognition
* Fingerprint support
* Excel export
* Reports dashboard
* Shift management
* Geolocation
* PWA support

---

# Recommended Deploy

## Frontend

* Vercel

## Backend

* Railway
* Render

## Database

* Railway PostgreSQL
* VPS Docker PostgreSQL

---
