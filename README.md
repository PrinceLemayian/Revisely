# Revisely

Revisely is a hackathon-grade academic resource platform for smart campus services. It uses Next.js App Router and TypeScript because that keeps the UI, backend API routes, and server-rendered data flows in one coherent codebase. PostgreSQL plus Prisma gives the academic hierarchy real relational integrity, explicit indexes, and a clean path from keyword search to future vector search. The AI assistant is implemented behind provider and retrieval interfaces, so the MVP can run with the demo provider and switch to a real server-side OpenAI provider without rewriting the chat UI or database layer.

## Features

- Strict academic hierarchy: School → Department → Program → Unit → Resource Type → Academic Year/Semester → Resource.
- Admin resource upload with required unit, resource type, academic year, upload validation, and local storage behind StorageService.
- Student browsing, search, resource detail, download tracking, dashboard, bookmarks, and conversation history.
- Search service with structured filters, course-code normalization, sorting, pagination-ready responses, and a PostgreSQL full-text index in the migration.
- Retrieval-grounded AI assistant that retrieves database rows first, injects cards from those rows only, skips provider calls on empty retrieval, and logs retrieved resource IDs.
- Seed data for Database Systems, Operating Systems, Web Application Development, and Corporate Finance.

## Architecture

text
Next.js App Router pages
  -> API routes / server components
    -> services
      -> SearchService / StorageService / AIProvider
        -> repositories
          -> Prisma ORM
            -> PostgreSQL


Important folders:

text
src/app                 Pages and API routes
src/components          Reusable UI and feature components
src/services/ai         Provider abstraction, intent extraction, retrieval pipeline
src/services/search     SearchService interface and PostgreSQL implementation
src/services/storage    StorageService interface, local adapter, S3 extension point
src/repositories        Prisma access helpers
src/lib                 Auth, validation, formatting, shared presenters
prisma                  Schema, migration, seed data
tests                   Unit and key-flow tests


## Setup

1. Install dependencies:

   bash
   npm install
   

2. Copy environment variables:

   bash
   cp .env.example .env
   

3. Start PostgreSQL and update DATABASE_URL in .env.

4. Run migrations and seed the demo data:

   bash
   npm run db:migrate
   npm run db:seed
   

5. Start the app:

   bash
   npm run dev
   

Open http://localhost:3000.

Seeded accounts:

- Student: student@revisely.test / password123
- Admin: admin@revisely.test / password123

## Environment Variables

** 
- DATABASE_URL: PostgreSQL connection string. On serverless (Vercel) with Supabase, use the pooled URL (port 6543, ?pgbouncer=true&connection_limit=1).
- DIRECT_URL: direct (non-pooled) PostgreSQL connection used only by prisma migrate. On Supabase use the port 5432 URL. Locally, set it equal to DATABASE_URL.
- AUTH_SECRET: long random secret used to sign httpOnly session cookies.
- STORAGE_PROVIDER: local for MVP, supabase for Supabase Storage, or s3 for the S3 adapter extension point.
- LOCAL_UPLOAD_DIR: local file root for development uploads.
- SUPABASE_URL: Supabase project URL, used when STORAGE_PROVIDER=supabase.
- SUPABASE_SERVICE_ROLE_KEY: server-only Supabase key for storage access. Never expose via NEXT_PUBLIC_*.
- SUPABASE_STORAGE_BUCKET: storage bucket name (default resources).
- MAX_UPLOAD_BYTES: upload size limit.
- AI_PROVIDER: demo, openai, or groq.
- OPENAI_API_KEY: server-only key used when AI_PROVIDER=openai.
- OPENAI_MODEL: chat model name for the OpenAI provider.
- GROQ_API_KEY: server-only key used when AI_PROVIDER=groq.
- GROQ_MODEL: chat model name for the Groq provider.
- APP_BASE_URL: deployed application URL.

No secret is exposed through NEXT_PUBLIC_*.

## Search

The migration creates a generated search_vector column and GIN index over resources.title and resources.description. The TypeScript SearchService currently combines Prisma structured filters with case-insensitive text and course-code normalization so CSC220, csc 220, and csc-220 behave as expected. The service boundary is intentionally narrow so a later pgvector semantic implementation can replace the search backend without changing callers.

## AI Assistant

The assistant pipeline is:

text
question -> intent extraction -> SearchService -> top resources -> provider context -> answer + DB-built cards


Hallucination controls:

- Empty retrieval returns a deterministic not-found response.
- The model never generates links; the UI renders cards directly from retrieved rows.
- User and assistant messages persist with retrieved_resource_ids.
- Provider errors return a friendly message and still show retrieved cards when available.

Use AI_PROVIDER=demo for local demos without a network call. Use AI_PROVIDER=openai with OPENAI_API_KEY for live generation.

## Storage

Development uses LocalStorageService, writing files into LOCAL_UPLOAD_DIR and serving them through guarded API routes. Production should implement the included S3StorageService adapter using signed URLs while keeping the same StorageService interface. App code outside the storage layer should not import fs or an object-storage SDK directly.

## Testing

bash
npm run test
npm run typecheck
npm run test:ui


Current tests cover intent extraction, upload validation, and the assistant empty-retrieval path. Playwright includes a smoke test for the home/search/assistant entry points. Broader API-level tests can be added once a disposable test database is configured in CI.

## Deployment Notes

Recommended stack: Vercel (hosting) + Supabase (Postgres + Storage). No AWS account required.

- Use a managed PostgreSQL database and run prisma migrate deploy during deploy.
- On serverless, set DATABASE_URL to the pooled connection and DIRECT_URL to the direct connection so migrations bypass the pooler.
- Set AUTH_SECRET, DATABASE_URL, DIRECT_URL, storage credentials, and AI provider keys in the platform secret store.
- For persistent, multi-instance storage set STORAGE_PROVIDER=supabase with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and a created bucket. Local disk storage does not survive serverless deploys.
- Keep AI calls and the Supabase service-role key server-side only, and rate limit /api/chat and auth routes.
- Note: Vercel serverless request bodies are capped (~4.5 MB on the standard tier), which is below MAX_UPLOAD_BYTES; very large uploads may be rejected before reaching app code.