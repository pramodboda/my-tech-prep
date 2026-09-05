# TechPrep — Full Stack (React + TS, Node + TS, PostgreSQL, no ORM)

Editable like Notion, readable like an ebook. Every question has a **deep
answer** (full explanation) and a **short answer** (interview recall).
Toggle per question, export either mode as a printable PDF.

This version has a real backend: multi-device sync, login, and a Postgres
database, talked to directly with plain SQL — no Prisma, no ORM layer.

## Stack

- **client/** — React + TypeScript + Vite, Tailwind CSS v4, Tiptap editor
- **server/** — Node + TypeScript + Express, raw SQL via the `pg` driver, JWT auth
- **PostgreSQL** — you already have this on Neon

This has been tested end-to-end against a real Postgres instance: register,
login, create technology → topic → question, edit, fetch the nested tree,
delete, and cross-user data isolation all verified working before delivery.

## 1. Point the server at your Neon database

In the Neon console: your project → **Connection Details** → copy the
connection string. It looks like:

```
postgresql://user:password@ep-example-12345.us-east-2.aws.neon.tech/dbname?sslmode=require
```

## 2. Create the tables

No migration tool needed — `server/schema.sql` is the entire schema. Two ways to run it:

**Option A — Neon's SQL Editor (easiest):** open your project in the Neon
console → SQL Editor → paste the contents of `server/schema.sql` → Run.

**Option B — psql from your machine:**
```bash
psql "your-neon-connection-string" -f server/schema.sql
```

This creates `users`, `technologies`, `topics`, `questions`, with foreign
keys, cascading deletes, and indexes already set up.

## 3. Backend setup

```bash
cd server
cp .env.example .env
# edit .env — paste your Neon DATABASE_URL, set a real JWT_SECRET
npm install
npm run dev                           # runs on http://localhost:4000
```

`npm run dev` uses `ts-node-dev` for hot-reload. For production: `npm run build && npm start`.

If you ever point this at a local Postgres instead of Neon, set `PGSSL=false`
in `.env` — Neon requires SSL, most local setups don't have it configured.

## 4. Frontend setup

```bash
cd client
cp .env.example .env   # VITE_API_URL should point at your server
npm install
npm run dev             # runs on http://localhost:5173
```

Open `http://localhost:5173`, register an account (email + password, min 8
chars), and start adding technologies/topics/questions. Every edit autosaves
to Postgres via the API (debounced ~500ms after you stop typing).

## How auth works

Simple JWT auth: register/login returns a token stored in localStorage, sent
as `Authorization: Bearer <token>` on every request. Every query is scoped
to the logged-in user's `id` via SQL joins (e.g. deleting a question checks
`question -> topic -> technology -> user_id = you` in one statement), so
one person's data never crosses into another's — verified with a live test
during development.

## Data model

```
users
 └─ technologies (user_id FK)
     └─ topics (technology_id FK)
         └─ questions (topic_id FK)
             - question (text)
             - deep_answer (rich HTML from Tiptap)
             - short_answer (rich HTML from Tiptap)
```

See `server/schema.sql` for the exact SQL — table definitions, indexes,
cascading deletes, and the `updated_at` trigger.

## Why no ORM

Prisma needs to download a query-engine binary at `generate` time, which
adds a setup step and a moving part. With `pg` you write parameterized SQL
directly (`pool.query("select * from x where id = $1", [id])`), which is
one less thing to install and one less thing to go wrong — at this schema
size (4 tables) the SQL is simple enough that an ORM isn't buying you much.
If the project grows a lot more tables, revisiting an ORM or a query builder
like Kysely is reasonable.

## Deploying for free

**Database**: already on Neon, stays free at this scale.

**Backend (Express API)**: Render.com free tier, or Railway free tier (has
usage limits but fine for personal use), or Fly.io free allowance.
- Set the same env vars as your local `.env` (`DATABASE_URL`, `PGSSL=true`, `JWT_SECRET`, `CLIENT_ORIGIN` = your deployed frontend URL)
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Run `server/schema.sql` against your Neon database once (via Neon's SQL editor) before first deploy — it's not run automatically.

**Frontend**: Cloudflare Pages or Netlify, free, no card required.
- Build command: `npm run build`, output directory: `dist`
- Set `VITE_API_URL` to your deployed backend URL (e.g. `https://your-api.onrender.com/api`)

Push this whole project to a GitHub repo first (client and server can be two
services pointing at the same repo with different root directories, or two
separate repos — either works).

## API reference

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register` | — | `{ email, password }` |
| POST | `/api/auth/login` | — | `{ email, password }` |
| GET | `/api/technologies` | ✓ | — (returns full nested tree) |
| POST | `/api/technologies` | ✓ | `{ name }` |
| DELETE | `/api/technologies/:id` | ✓ | — |
| POST | `/api/topics` | ✓ | `{ technologyId, name }` |
| DELETE | `/api/topics/:id` | ✓ | — |
| POST | `/api/questions` | ✓ | `{ topicId, question }` |
| PATCH | `/api/questions/:id` | ✓ | `{ question?, deepAnswer?, shortAnswer? }` |
| DELETE | `/api/questions/:id` | ✓ | — |

## What to build next

- Drag-to-reorder (the `position` columns are already there, ready to use)
- Full-text search (Postgres `tsvector` on `question` + a search endpoint)
- Tags table + join table for filtering ("asked at X", "asked in 2026")
- Refresh tokens instead of a single 30-day JWT, if you want tighter session control
