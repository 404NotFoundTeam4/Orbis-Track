<p align="center">
  <a href="#">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/banner-dark.svg">
      <img src=".github/assets/Team4.svg" width="720" alt="Orbis-Track" />
    </picture>
  </a>
</p>

<h1 align="center">Orbis-Track</h1>

<p align="center">
  A modern Node.js stack for building reliable web apps — Express API + Vite frontend + PostgreSQL (pgvector) + Redis + SonarQube.
</p>

<p align="center">
  <!-- CI: แทนที่ org/repo และไฟล์ workflow ตามจริง -->
  <a href="https://github.com/404NotFoundTeam4/Orbis-Track/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/404NotFoundTeam4/Orbis-Track/ci.yml?branch=develop&label=build" alt="build status" />
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-22.x-339933?logo=node.js&logoColor=white" alt="Node 22" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license: MIT" />
  </a>
  <a href="https://www.prisma.io/">
    <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white" alt="Prisma 6" />
  </a>
  <a href="https://expressjs.com/">
    <img src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white" alt="Express 5" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  </a>
  <a href="https://www.postgresql.org/">
    <img src="https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql&logoColor=white" alt="PostgreSQL 17" />
  </a>
  <a href="https://github.com/pgvector/pgvector">
    <img src="https://img.shields.io/badge/pgvector-enabled-1296DB" alt="pgvector enabled" />
  </a>
  <a href="https://redis.io/">
    <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis 7" />
  </a>
  <a href="https://www.sonarsource.com/products/sonarqube/">
    <img src="https://img.shields.io/badge/SonarQube-LTS-4E9BCD?logo=sonarqube&logoColor=white" alt="SonarQube LTS" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  </a>
  <a href="https://github.com/YOUR_ORG/YOUR_REPO/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-23C552.svg" alt="PRs welcome" />
  </a>
</p>


## Tech stack
- **Backend:** Node 22, Express 5, Prisma 6  
- **DB:** PostgreSQL 17 + `pgvector` (มี **shadow DB** สำหรับ Prisma)  
- **Queue/Cache:** Redis 7  
- **Frontend:** Vite (+ Tailwind)  
- **Code Quality:** SonarQube LTS

## พอร์ตโดยสรุป
| Service    | URL/Port (host)       | ในคอนเทนเนอร์ |
| ---------- | --------------------- | ------------ |
| App (Vite) | http://localhost:4043 | 5173         |
| API Server | http://localhost:4044 | 4044         |
| Postgres   | localhost:4045        | 5432         |
| SonarQube  | http://localhost:9000 | 9000         |
| Sonar DB   | localhost:4050        | 5432         |
| Redis      | localhost:6379        | 6379         |

> Frontend proxy: คำขอที่ขึ้นต้นด้วย `/api` จะถูกส่งไป `server:4044` และ **rewrite เป็น `/api/v1`** อัตโนมัติ

---

## การเตรียมเครื่อง (Prerequisites)
- Docker & Docker Compose v2
- Docker Desktop
- Node.js 22.x + npm 10.x (ใช้แค่สร้าง `package-lock.json` ที่ root และทำงานกับ workspaces ได้สะดวก)

---

## Development

### 1) ติดตั้ง dependency (เพื่อให้มี lockfile และ workspace พร้อม)
```bash
npm i
```

### 2) ติดตั้ง dependency (เพื่อให้มี lockfile และ workspace พร้อม)
```bash
สร้าง .env ใน root directory
```

### 3) ติดตั้ง dependency (เพื่อให้มี lockfile และ workspace พร้อม)
```bash
สร้าง .env ใน folder server
```

### 4) รันด้วย Docker (ไฟล์ dev compose)
```bash
docker compose -f docker-dev-compose.yml up --build
```
เสร็จแล้ว:
- App: http://localhost:4043  
- API: http://localhost:4044/api/v1  
- Database Port: 4045
- SonarQube: http://localhost:9000  (ครั้งแรก login `admin` / `admin` แล้วระบบจะบังคับให้เปลี่ยนรหัสผ่าน)

### 5) หยุดระบบ
```bash
docker compose -f docker-dev-compose.yml down
```

---

## Production

### 1) ติดตั้ง dependency (สร้าง lockfile/workspaces ให้พร้อม)
```bash
npm i
```

### 2) รันด้วย Docker (ไฟล์ compose ปกติ)
```bash
docker compose up --build
```

เสร็จแล้ว:
- App: http://localhost:4040
- API: http://localhost:4041/api/v1  
- - Database Port: 4042
- SonarQube: http://localhost:9000  (ครั้งแรก login `admin` / `admin` แล้วระบบจะบังคับให้เปลี่ยนรหัสผ่าน)

### 3) หยุดระบบ
```bash
docker compose down
```

---

## คำสั่งที่มีประโยชน์
```bash

# ดู log แบบ real-time
docker compose -f docker-dev-compose.yml logs -f server
docker compose -f docker-dev-compose.yml logs -f app
docker compose -f docker-dev-compose.yml logs -f db
docker compose -f docker-dev-compose.yml logs -f redis
docker compose -f docker-dev-compose.yml logs -f sonarqube sonar-db

# รีสตาร์ทเฉพาะ service
docker compose -f docker-dev-compose.yml restart server
docker compose -f docker-dev-compose.yml restart app

# หยุดเฉพาะ service
docker compose -f docker-dev-compose.yml stop app
docker compose -f docker-dev-compose.yml stop server

# ลบคอนเทนเนอร์ของ service (ไม่แตะ volumes)
docker compose -f docker-dev-compose.yml rm -f app
docker compose -f docker-dev-compose.yml rm -f server

# บิลด์ใหม่เฉพาะ service แล้วสตาร์ท
docker compose -f docker-dev-compose.yml build server && docker compose -f docker-dev-compose.yml up -d server
docker compose -f docker-dev-compose.yml build app && docker compose -f docker-dev-compose.yml up -d app

# เข้า shell ในคอนเทนเนอร์ (ไว้ดีบัก)
docker compose -f docker-dev-compose.yml exec server sh
docker compose -f docker-dev-compose.yml exec app sh
docker compose -f docker-dev-compose.yml exec db sh

# เข้า psql ไปที่ DB หลัก
docker compose -f docker-dev-compose.yml exec db psql -U 404 -d orbis_track

# เช็คการเชื่อมต่อ DB ด้านในคอนเทนเนอร์
docker compose -f docker-dev-compose.yml exec db pg_isready -U 404 -d orbis_track

# Prisma Studio (รันในคอนเทนเนอร์ server)
docker compose -f docker-dev-compose.yml exec server npx prisma studio -p 5555
# แล้วเปิด http://localhost:5555

# Prisma migrate/generate (รันในคอนเทนเนอร์ server)
docker compose -f docker-dev-compose.yml exec server npx prisma migrate dev
docker compose -f docker-dev-compose.yml exec server npx prisma generate
```

---

## โครงสร้างคร่าว ๆ
```
.
├─ app/               # Vite + Tailwind
├─ server/            # Express API + Prisma
│  ├─ src/
│  ├─ docker-entrypoint.sh
│  └─ infrastructure/database/prisma/ (schema + migrations)
├─ docker-dev-compose.yml
├─ docker-compose.yml
├─ package.json       # workspaces root
└─ .env               # ดูตัวอย่างด้านบน
```
