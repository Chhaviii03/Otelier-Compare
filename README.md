# OTELIER-WEB

A hotel comparison web application built with React. Users can search hotels by city and country, compare options using charts, and see a data-driven “Suggested” hotel. The app uses **Supabase** for authentication and **Amadeus** for hotel data, with a focus on comparison, recommendations, and clear UX.

---

## Live Demo

**https://otelier-compare.vercel.app**

---

## Features

- **User authentication** — Login and signup via Supabase (email/password). Protected dashboard; session persists across reloads.
- **Search hotels by city and country** — Location search (Nominatim) with optional check-in/out and guests. Results from Amadeus API.
- **Graceful fallback when hotel data is unavailable** — Capital-city fallback for unsupported cities; clear messaging when showing results from a different city.
- **Hotel comparison** — Compare hotels by price, rating, distance, and other parameters. Select up to 5 hotels via checkboxes; selection persisted in `localStorage`.
- **Visual comparison** — Compare drawer with bar charts for price, rating, and distance from airport (Recharts).
- **“Suggested” hotel** — One hotel is marked as recommended using a client-side weighted scoring algorithm (same for all users).
- **Role-based UI**
  - **Normal users** see a simplified interface: hotel cards, compare, charts, and Suggested badge.
  - **Admin users** see the same plus advanced filters (min rating, max price, max distance), sorting (best overall, lowest price, highest rating), and optional score labels on cards.
  - **Admin/User role indicator** is shown in the navbar when logged in (read-only badge).

---

## Recommendation Logic

Hotels are scored on the client using normalized parameters:

- **Price** (lower is better)
- **Rating** (higher is better)
- **Distance** (e.g. from airport; lower is better)
- **Review count** (higher is better as a trust signal)

Values are normalized to 0–1 and combined with fixed weights. The hotel with the **highest score** is marked as **Suggested**. The algorithm is the same for all users; roles only affect which UI controls (filters, sorting, debug info) are visible.

---

## Role-Based UI

- Roles are **resolved on the frontend** only. There is no backend role enforcement, no database role tables, and no Supabase RLS for roles.
- A **specific email address** is treated as admin; all other authenticated users are “user.” Admin users see additional UI (filters, sorting, optional score labels).
- The navbar shows a **User** or **Admin** badge when logged in; it updates automatically on login/logout.
- This approach keeps the implementation simple and is suitable for a frontend-focused assignment where the goal is conditional UI, not permission enforcement.

---

## How to Run Locally

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd <project-folder>
   npm install
   ```

2. **Environment variables**

   Create a `.env` file in the project root (see `.env.example`). You need:

   - **`VITE_SUPABASE_URL`** — Your Supabase project URL.
   - **`VITE_SUPABASE_ANON_KEY`** — Your Supabase anonymous (public) key.

   Both values are in the [Supabase Dashboard](https://supabase.com) → Project Settings → API.

   Optional (for hotel search):

   - **`VITE_AMADEUS_KEY`** / **`VITE_AMADEUS_SECRET`** — From [Amadeus for Developers](https://developers.amadeus.com).

3. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`. Sign up or log in to access the dashboard.

---

## Tech Stack

- **React** (with hooks)
- **Supabase** (Auth)
- **Amadeus API** (hotel search and offers)
- **Vite**
- **Vercel** (hosting)

Additional: Tailwind CSS, React Router, Recharts, Axios. Context API for auth and compare state.

---

## Deployment

The app is deployed on **Vercel**. Automatic deployments are triggered from the main branch. Configure the same environment variables in the Vercel project (Supabase and, if needed, Amadeus). Build command: `npm run build`; output: `dist`. SPA routing is handled via `vercel.json` rewrites.

---

## Project Structure (summary)

- `src/context/` — AuthContext (user, session, role), CompareContext (selected hotels).
- `src/api/amadeus.js` — Amadeus OAuth, hotel list/offers, capital fallback.
- `src/hooks/` — useHotels (search, filters, pagination), useInfiniteScroll.
- `src/components/` — Navbar (with role badge), Filters, AdminFilters, HotelCard, CompareDrawer, Charts.
- `src/pages/` — Login, Signup, Dashboard.
- `src/utils/hotelScoring.js` — Client-side scoring and “Suggested” selection.

---

## Optional: Docker

A Dockerfile is provided for local containerized runs. It does not change Vercel deployment. From the project root, with a `.env` file present:

```bash
docker build -t otelier-web .
docker run -p 5173:5173 --env-file .env otelier-web
```
