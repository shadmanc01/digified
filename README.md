# digified

A responsive photography-first social network for digital-camera users.

## Implemented in this MVP scaffold

- Unsplash-inspired responsive home/explore experience
- Public browsing without authentication
- Photography masonry grid and mobile-first navigation
- Photo detail pages with camera, lens, technical settings, category, location and optional recipe
- Camera directory and camera-specific public photo pages
- Lens pages
- Photography categories
- Search across photo text, camera, lens, category, location, users and recipe names
- Profiles with computed most-used camera and gear page
- Following feed demo
- Upload flow UI including camera/lens/EXIF/recipe/visibility fields
- Likes/saves/reposts/share interaction demo in client state
- Messages, notifications, saved collections and settings screens
- PostgreSQL/Prisma relational schema for users, posts, image metadata, gear, recipes, follows, social interactions, messages and notifications

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Authentication setup

Create a Supabase project, then copy its project URL and publishable/anonymous key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

In Supabase Authentication → URL Configuration, set the Site URL to your app URL and add these redirect URLs:

```text
http://localhost:3000/auth/callback
https://YOUR_PRODUCTION_DOMAIN/auth/callback
```

Signup now creates a real Supabase Auth user. When email confirmation is disabled, the user receives a session and is redirected to `/following`. When confirmation is enabled, the user is told to confirm their email; the callback exchanges the confirmation code for a session and redirects to `/following`.

## Production wiring still required

The UI and data architecture are implemented, while authentication, durable database actions, object storage, EXIF extraction and moderation services are represented by the production-ready schema/UI boundaries and should be connected to real providers (for example Supabase/Auth.js + PostgreSQL + S3/R2) before deployment.

## Suggested next implementation pass

1. Instantiate Prisma and replace `lib/data.ts` seed reads with server queries.
3. Add signed uploads to S3/R2 and Sharp image variants.
4. Parse EXIF before processing/metadata stripping and normalize camera/lens aliases.
5. Add authenticated server actions/API routes for social interactions.
6. Add PostgreSQL trigram/full-text search.
7. Add moderation/reporting endpoints and rate limiting.
