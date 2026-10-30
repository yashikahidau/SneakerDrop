# SneakerDrop

SneakerDrop is a dark, editorial sneaker showcase and release waitlist built around collectible footwear. It pairs a cinematic product gallery with practical release discovery and a protected inventory dashboard.

## Design philosophy

The interface treats each release like an editorial object: obsidian surfaces, fine rules, muted gold accents, oversized typography, asymmetric image compositions, and restrained motion create hierarchy without competing with the product. Responsive layouts adapt from narrow mobile screens to wide desktop displays. Motion and interaction details support navigation and product discovery while respecting reduced-motion preferences and touch input.

## Features

- Supabase-backed sneaker catalogue presented in an asymmetric bento gallery.
- Product quick-view modal with release details and a direct waitlist action.
- Waitlist signup with normalized email validation and database-enforced duplicate prevention per sneaker.
- Password-protected admin dashboard for creating, editing, and removing releases and reviewing submissions.
- HMAC-signed, HTTP-only admin session cookies.
- Custom cursor on fine-pointer devices and an optional Web Audio toggle for synthesized hover and selection cues.
- Animated hero, editorial field notes, marquee, responsive navigation, and glass-style dialogs.

## Technology

| Area | Technology |
| --- | --- |
| Framework | Next.js App Router (Next.js 16) |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS 4 |
| Motion | Framer Motion |
| Icons | Lucide React |
| Data | Supabase PostgreSQL and Row-Level Security (RLS) |
| Audio | Native Web Audio API (no audio files required) |
| Deployment | Vercel-compatible Next.js deployment |

## Data model and access policies

The bootstrap and upgrade script is [`database-schema.sql`](./database-schema.sql). Run it in the Supabase SQL Editor before using the application.

### `public.sneakers`

| Column | Type | Constraints / purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key; generated with `gen_random_uuid()` |
| `name` | `text` | Required release name |
| `tagline` | `text` | Required editorial tagline |
| `category` | `text` | Required category; existing rows receive the `Footwear` migration default |
| `price` | `numeric(10,2)` | Required; non-negative check |
| `image_url` | `text` | Required product image URL |
| `description` | `text` | Required product description |
| `material_notes` | `text` | Optional material details |
| `construction_notes` | `text` | Optional construction details |
| `availability_status` | `text` | Required; `available`, `coming_soon`, `sold_out`, or `archived` (defaults to `coming_soon`) |
| `created_at` | `timestamptz` | Required UTC creation timestamp |

### `public.waitlist`

| Column | Type | Constraints / purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key; generated with `gen_random_uuid()` |
| `sneaker_id` | `uuid` | Required foreign key to `sneakers.id`; cascades on sneaker deletion |
| `email` | `text` | Required; normalized to lowercase by the waitlist action |
| `created_at` | `timestamptz` | Required UTC submission timestamp |

The unique constraint on `(sneaker_id, email)` prevents duplicate signups for the same release at the database level. The application maps PostgreSQL unique-violation responses to a clear duplicate-signup message. Indexes support release lookup and newest-first catalogue/submission queries. The schema adds `sneakers` to Supabase Realtime when that publication is available, so public catalogues receive inserts, edits, archives, and removals live. Archived products remain available to administrators and are excluded from the public catalogue.

RLS is enabled on both tables. The schema grants public and authenticated users read access to sneaker rows and insert access to waitlist rows. It does not create public waitlist read, update, or delete policies. Administrative data operations use the server-only service-role client after signed-session authorization; the service-role key bypasses RLS and must never be exposed to the browser.

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project with the schema installed

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the repository root using the variables below.

3. Run [`database-schema.sql`](./database-schema.sql) in the Supabase SQL Editor and add sneaker records through the admin dashboard.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). The admin dashboard is at [http://localhost:3000/admin](http://localhost:3000/admin).

Production build and server commands:

```bash
npm run build
npm start
```

Lint the project with:

```bash
npm run lint
```

## Environment variables

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
ADMIN_PASSWORD=use-a-long-unique-password
ADMIN_SESSION_SECRET=use-a-random-secret-at-least-32-characters-long
```

Generate a strong session secret with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The two `NEXT_PUBLIC_` values are used by the browser-facing Supabase client. Keep `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` server-only. Do not commit `.env.local` or publish privileged credentials. Configure the same variables as encrypted environment variables in the deployment platform.

## Admin security

The admin route and server actions verify an HMAC-signed session stored in an HTTP-only, same-site cookie. Sessions expire after eight hours; cookies are marked secure in production. Admin actions use the service-role Supabase client only after validating the session. The shared-password approach is intended for a small single-admin deployment and does not provide multi-user roles, MFA, or an identity-provider workflow.

## Deployment

Deploy the repository to Vercel (or another platform that supports the required Next.js runtime), configure all five environment variables, and ensure the Supabase schema and RLS policies are installed.

**Live deployment:** [Add the Vercel deployment URL]

## Project structure

```text
actions/               Server actions for catalogue, waitlist, and admin auth
app/                   App Router pages, layout, and global styles
  admin/                Protected administration route
components/            Catalogue, editorial, navigation, modal, and admin UI
lib/                   Supabase clients and signed admin session helpers
types/                 Shared TypeScript models
database-schema.sql    PostgreSQL tables, indexes, constraints, and RLS policies
```

## Current scope

- The footer newsletter form is a front-end interaction and is not connected to an email delivery or marketing platform.
- Product images are rendered from their configured URLs and are not automatically optimized by Next.js.
- Waitlist email addresses are personal data. A public launch should define consent language, retention, export, and deletion procedures.

## License

No license is currently defined. Add an appropriate license before redistributing or using the project commercially.
