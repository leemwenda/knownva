# legacy/ — original KnowVa Next.js implementation (reference only)

Pre-migration Next.js 16 / Drizzle / PostgreSQL code. NOT built, NOT run,
NOT tested by the new monorepo. Exists only as source of truth during:

- Phase 2 frontend port (React 18 + Vite 5)
- API behaviour comparisons

Everything that ships lives in:
- apps/web/       React 18 + Vite 5 + React Router 6 + Tailwind
- apps/api/       Express + Prisma 5.22 + MySQL 8
- packages/shared Zod schemas + shared enums

Do not import from legacy/ in apps/ or packages/.

Known security note (R-01): legacy/drizzle.config.json contains the
historical PostgreSQL credentials in plain text. Do not deploy this
directory. It exists for reading only.
