# Meera Jyotish – Frontend

React app for the Meera Astrology site: kundali generation and saved reports, panchang and
almanac pages, match making, user accounts, and an admin panel for editing site content.

The API it talks to lives in [meera-jyotish-backend](https://github.com/vijayant-pandey/meera-jyotish-backend).

**Live site:** https://meera-jyotish.vercel.app

## Tech stack

- **React 19** with **TypeScript**
- **Vite** for the dev server and build
- **Vitest** and Testing Library for tests
- No router library: routes are parsed in [src/routes.ts](src/routes.ts)

## Getting started

You need Node.js 20+ and the backend running on http://localhost:8000 (see the backend README).

```powershell
npm install
npm run dev
```

The app opens at http://localhost:5173. In development Vite forwards `/api`, `/media` and
`/health` to the backend, so no extra configuration is needed.

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build into `dist/` |
| `npm test` | Run the test suite once |
| `npx vite preview` | Serve the production build locally (same proxy as dev) |

### Configuration

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Optional. Base URL for API calls. Leave it unset to use same-origin `/api` (the normal setup, locally and on Vercel). |

Anything prefixed `VITE_` is built into the public bundle, so never put a secret in it.

## Pages

| Path | Page |
|---|---|
| `/` | Home |
| `/login`, `/signup` | User accounts |
| `/generate` | Enter birth details and generate a kundali |
| `/reports/:reportId` | Report overview |
| `/reports/:reportId/charts/:chartKey` | Divisional chart (`d1`, `d9`, `d10`, ...) |
| `/reports/:reportId/dasha` | Dasha periods |
| `/sections/:slug` | Panchang, almanac, horoscope and other sections |
| `/admin` | Admin panel for site content and images |

## Project layout

```
src/
  App.tsx          Top-level app and page switching
  routes.ts        URL parsing and building
  api.ts           API client for the public endpoints
  adminApi.ts      API client for the admin panel
  components/      Pages and shared UI (charts, forms, almanac tables, ...)
  admin/           Admin panel: content editor and image fields
  siteContent*.ts  Default site content and the store that loads CMS overrides
  styles.css       Global styles
vercel.json        Vercel build settings and backend rewrites
```

## Deployment

The frontend is hosted on **Vercel**, configured by [vercel.json](vercel.json).

- Vercel deploys automatically on every push to the `production` branch. Other branches get
  preview deployments.
- `/api/*`, `/media/*` and `/health` are rewritten to the Render backend at
  https://meera-jyotish-backend.onrender.com. The browser therefore sees a single domain, and
  session cookies just work.
- Every other path is served `index.html`, so links straight to pages like `/reports/...` load correctly.

## Branches

| Branch | Purpose |
|---|---|
| `production` | What is live on Vercel. Only updated through pull requests. |
| `development` | Integration branch; feature work is merged here first. |
| `task/MA-XXXX-...` | One branch per task, merged into `development` by pull request. |
