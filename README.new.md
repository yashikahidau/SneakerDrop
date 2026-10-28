# SneakerDrop

SneakerDrop is a dark editorial sneaker showcase and waitlist platform built for scarcity, clarity, and collectible culture. The interface combines matte obsidian surfaces, fine borders, muted gold accents, cinematic motion, and responsive presentation.

## Key Features

- Dynamic Supabase-powered sneaker catalogue
- Editorial hero, cinematic loader, custom cursor, and motion reveals
- Waitlist signup with real-time validation and duplicate prevention
- Glassmorphic waitlist modal with loading, error, and success states
- Password-protected admin dashboard with HTTP-only signed sessions
- Full sneaker create, update, and delete workflows
- Waitlist submissions mapped to their corresponding sneakers
- Responsive layouts, keyboard dismissal, and reduced-motion support

## Technology Stack

| Area | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Motion | Framer Motion |
| Icons | Lucide React |
| Database | Supabase PostgreSQL |
| Admin auth | Environment-backed password and signed HTTP-only cookie |
| Deployment | Vercel-compatible Node.js runtime |

## Database Schema

Run `database-schema.sql` in the Supabase SQL Editor before starting the application.

```sql
create extension if not exists pgcrypto;

create table if not exists public.sneakers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null,
  price numeric(10, 2) not null check (price >= 0),
  image_url text not null,
  description text not null,
  availability_status text not null default 'coming_soon'
    check (availability_status in ('available', 'coming_soon', 'sold_out')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  sneaker_id uuid not null references public.sneakers(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint waitlist_sneaker_email_unique unique (sneaker_id, email)
);
```

The `(sneaker_id, email)` uniqueness constraint prevents duplicate signups at the database level. The application also performs a friendly duplicate lookup before insertion.

## Environment Configuration

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
ADMIN_PASSWORD=use-a-long-random-password
ADMIN_SESSION_SECRET=use-a-long-random-secret-at-least-32-characters
```

Generate independent secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Keep the service-role key and both admin variables server-only. Never expose them with a `NEXT_PUBLIC_` prefix.

## Local Setup

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Visit `http://localhost:3000/admin` after configuring the environment variables and sign in with `ADMIN_PASSWORD`.

Production validation:

```bash
npm run build
npm start
```

## Database and Admin Security

Public visitors may read the sneaker catalogue and submit waitlist entries according to the configured Supabase Row-Level Security policies. Admin read and write operations are protected by both the HTTP-only signed session and server-action authorization checks.

The dashboard uses `SUPABASE_SERVICE_ROLE_KEY` only on the server. This key bypasses Row-Level Security and must remain outside browser bundles and source control.

Admin sessions are valid for eight hours. They use strict same-site cookies, secure cookies in production, HTTP-only storage, and HMAC signatures.

## Architectural Decisions and Trade-offs

- Server actions keep Supabase domain operations and mutation validation close to the UI while avoiding additional API route boilerplate.
- Signed-cookie authentication avoids an external identity provider for this single-administrator challenge, trading advanced account management for a small deployment footprint.
- Supabase PostgreSQL enforces uniqueness independently of application logic.
- The client catalogue uses server-action loading states and animated skeletons; server-rendered static data or Suspense streaming would improve first-load SEO but increase server coupling.
- Standard image rendering supports arbitrary Supabase image URLs without Next.js domain configuration, at the cost of automatic image optimization.
- The single shared admin password is suitable for this challenge, not enterprise multi-user access, MFA, audit logging, or token revocation.

## Deployment

Deploy to a Next.js-compatible platform such as Vercel and configure all environment variables as encrypted production secrets. Live deployment: **[Add deployment URL]**

## Known Limitations

- Admin access uses a shared password rather than individual accounts and role-based access control.
- The newsletter interface is currently not connected to an external email provider.
- Remote product images are not passed through Next.js image optimization.
- The catalogue loads after client hydration; server rendering or Suspense streaming could improve first contentful paint and search indexing.
- Waitlist emails are personal data and require consent, retention, export, and deletion policies for a public launch.

## Project Structure

```text
app/
  admin/page.tsx       Protected administration route
  page.tsx             Editorial landing page and catalogue
  globals.css          Theme and global presentation effects
actions/               Catalogue, waitlist, and authentication actions
components/            Frontend and admin components
lib/                   Supabase and admin session utilities
types/                 Shared TypeScript contracts
database-schema.sql    PostgreSQL bootstrap script
```

## License

This project is prepared for the SneakerDrop internship challenge. Add an appropriate license before commercial or public distribution.
