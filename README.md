# Falcon Remit

## Development

Install dependencies with `npm install`, then start the development server with `npm run dev`.

## Configuration

Configure the Supabase project using `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. For browser builds, also set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the corresponding public values.

Set `DATABASE_URL` when running Drizzle Kit commands. Scheduled tasks that use cron authentication require `CRON_SECRET`; optionally set `CRON_SECRET_PREVIOUS` during secret rotation.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm test` — run the test suite
