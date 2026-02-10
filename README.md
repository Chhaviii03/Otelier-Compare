# HotelCompare

A hospitality-focused React frontend with Supabase auth, Amadeus hotel search, filters, pagination, and hotel comparison charts. Built for a take-home assignment (React 18, Vite, Tailwind, Context API, Recharts).

## Features

- **Authentication**: Sign up, login, logout via Supabase (email/password). Session/JWT used for protected routes.
- **Hotel search**: Amadeus API integration (OAuth2 + hotel list/offers). Filters: city, check-in/out dates, guests.
- **UI**: Dashboard with filter bar, hotel cards (name, price, rating, distance), infinite scroll.
- **Comparison**: Select up to 5 hotels via checkbox; selection persisted in `localStorage`. Compare drawer with Recharts (price bar chart, rating bar chart). Comparison only enabled when ≥2 hotels selected.
- **State**: AuthContext (auth state), CompareContext (selected hotels). No Redux.
- **Role-based UI**: Admin users (via `user_metadata.role === 'admin'`) see extra filters: price range, rating threshold, hotel chain (client-side gated).
- **Docker**: Optional local setup via Dockerfile; Vercel deployment unchanged.
- **Dark mode**: Toggle in the Navbar; supports system preference with manual override and persistence in `localStorage`.

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd hotel-compare
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env` and fill in:

   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`: From [Supabase](https://supabase.com) → Project Settings → API.
   - `VITE_AMADEUS_KEY` / `VITE_AMADEUS_SECRET`: From [Amadeus for Developers](https://developers.amadeus.com) (Self-Service APIs, create an app).

3. **Run locally**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`. Sign up or log in to reach the dashboard.

## Auth flow

- **Sign up**: `supabase.auth.signUp({ email, password })`. Supabase may require email confirmation depending on project settings.
- **Login**: `supabase.auth.signInWithPassword({ email, password })`. Session (including JWT) is stored by Supabase client; `AuthContext` exposes `user`, `session`, and `token` (for protected API calls if needed).
- **Protected route**: Dashboard route is wrapped in `ProtectedRoute`; if not authenticated, user is redirected to `/login`.
- **Logout**: `supabase.auth.signOut()`; no hardcoded tokens.

## API usage (Amadeus)

- **OAuth**: Client credentials grant to `https://test.api.amadeus.com/v1/security/oauth2/token`. Token is cached until near expiry.
- **Hotel data**: 
  - Hotel list by city: `GET /v1/reference-data/locations/hotels/by-city?cityCode=...` to get hotels in a city.
  - When check-in/out and hotel IDs are available, we optionally call `GET /v2/shopping/hotel-offers` for sample prices; results are merged into the list. If that call fails or isn’t configured, fallback demo price/rating are applied so the UI still works.
- **Pagination**: Results are paginated in memory (page size 10); infinite scroll fetches the next page when the user scrolls near the bottom and appends to the list.
- All Amadeus logic lives in `src/api/amadeus.js`; Axios is used for requests. Failures are caught and surfaced as error state on the dashboard.

## Assumptions

- Supabase project has Email auth enabled; email confirmation is optional (can be turned off in Supabase for faster testing).
- Amadeus test/sandbox keys are used; production would use live keys and possibly different base URL.
- Compare list is stored only in `localStorage` (no backend). Clearing site data clears the compare list.

## Infinite Scroll Implementation

- The “Load more” button has been replaced with **infinite scroll** using the **Intersection Observer API**.
- A reusable hook `useInfiniteScroll` (`src/hooks/useInfiniteScroll.js`) observes a sentinel element at the bottom of the list. When it becomes visible, the hook calls `loadMore` from `useHotels`, which fetches the next page and appends results.
- **Why Intersection Observer over scroll events**: Better performance (no scroll throttling), built-in visibility detection, and automatic cleanup when the element is visible. Duplicate requests are prevented by checking `loading` and `hasMore` before calling `loadMore`. The observer is disconnected on unmount.
- Filters are preserved while scrolling; only the “next page” is requested with the same filter state.

## Role-Based UI

- **Roles** are read from Supabase **user metadata**: `user.user_metadata.role`. Default is `user`; set to `admin` in the Supabase dashboard (Authentication → Users → edit user → User Metadata: `{ "role": "admin" }`) or via an admin-only update flow.
- **AuthContext** exposes `role` and `isAdmin`. The **RequireRole** component (`src/components/RequireRole.jsx`) renders its children only when the current user has one of the allowed roles.
- **Admin-only UI**: When `role === 'admin'`, the dashboard shows an **Admin filters** panel (price range, min rating, hotel chain). These filters are applied **client-side** to the already-fetched hotel list; no backend changes are required. The panel is visually distinct (Tailwind amber styling).
- **Why client-side gated**: The assignment specifies no backend for roles; the UI simply hides admin controls from non-admins. For production, sensitive actions would be enforced server-side.

## Docker (Optional Local Setup)

- Docker is **optional** and does not affect Vercel deployment. Use it for a consistent local dev environment.
- **Build and run** (from project root, with a `.env` file present):

  ```bash
  docker build -t hotel-compare .
  docker run -p 5173:5173 --env-file .env hotel-compare
  ```

- **No secrets in the image**: The Dockerfile does not copy or hardcode `.env`. Pass env vars at run time with `--env-file .env`.
- **Why optional**: The app runs with `npm run dev` or deploys to Vercel without Docker; Docker is for those who prefer containerized local development.

## Dark Mode

Supports system preference with manual override and persistence. A theme toggle in the Navbar (top-right) switches between light and dark. The choice is stored in `localStorage` under `hotel-compare-theme`. On first visit, the app uses the stored value if present, otherwise the system `prefers-color-scheme` setting. Tailwind’s class-based dark mode is used (`.dark` on `<html>`); no inline styles. The toggle is keyboard-focusable and has `aria-label="Toggle dark mode"`.

## Deployment (Vercel)

1. Push the repo to GitHub (or connect another Git provider).
2. In Vercel, import the project and set the same env vars (`VITE_SUPABASE_*`, `VITE_AMADEUS_*`).
3. Build command: `npm run build`; output directory: `dist`. SPA routing is handled by `vercel.json` rewrites.
4. Deploy. The app works as an SPA with client-side routing; no server-side secrets (all keys are Vite env and exposed to the client as per requirement).

## Project structure

```
src/
├── api/amadeus.js       # Amadeus OAuth + hotel list/offers
├── auth/supabase.js     # Supabase client
├── context/
│   ├── AuthContext.jsx
│   └── CompareContext.jsx
├── hooks/
│   ├── useHotels.js     # Search, filters, load more
│   └── useInfiniteScroll.js
├── components/
│   ├── Navbar.jsx
│   ├── HotelCard.jsx
│   ├── Filters.jsx
│   ├── AdminFilters.jsx # Admin-only filters (price, rating, chain)
│   ├── RequireRole.jsx  # Role-gated wrapper
│   ├── CompareDrawer.jsx
│   ├── Charts.jsx       # Recharts price & rating
│   └── Loader.jsx
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Dashboard.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Tech stack

- React 18 (hooks), Vite, Tailwind CSS
- Supabase Auth (email/password)
- Axios, Recharts
- Context API, localStorage for compare list
