# Database Setup

DocApp uses Prisma ORM with Prisma Postgres as the preferred MVP database.

This phase configures the database connection only. The Prisma schema and data models are added in later Phase 6 and Phase 7 tasks.

## Preferred Setup: Prisma Console

Use Prisma Console and Prisma Postgres for the project database.

1. Open Prisma Console.
2. Create or select the DocApp workspace/project.
3. Create a Prisma Postgres database for the MVP.
4. Open the database connection settings.
5. Copy the direct PostgreSQL connection string from Prisma Console. Prisma documentation describes this as a `postgres://...` connection string for Prisma Postgres.
6. Copy `.env.example` to `.env` if needed.
7. Set `DATABASE_URL` in `.env`:

   ```env
   DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"
   ```

8. Keep `.env` out of Git.

## Prisma Dashboard And Studio

Use Prisma Console/Dashboard as the primary place to manage the Prisma Postgres database, usage, billing, connection details, and data browser.

After Prisma schema setup exists, Prisma Studio may also be used locally:

```bash
npx prisma studio
```

## Project Commands

The project already includes Prisma scripts:

```bash
npm run prisma:generate
npm run prisma:push
```

Run them only after Prisma schema setup exists. The next task adds the Prisma setup files.

## Optional Local PostgreSQL Fallback

Local PostgreSQL can be used only as a fallback for development if Prisma Postgres is unavailable.

Example local URL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/docapp_mvp"
```

## Connection Rules

- Prisma Postgres is the preferred database provider for MVP.
- `DATABASE_URL` must be a PostgreSQL connection string using `postgres://` or `postgresql://`.
- Database credentials are server-side secrets and must never be exposed to client components.
- Prisma Client must be imported only from server-side code or scripts. Never import Prisma Client into browser/client components.
- Local `.env` values must never be committed.
