# whereBasket

A basketball court finder for the Helsinki area. Discover nearby courts, see who's playing, and coordinate pickup games.

Built with React, TypeScript, Leaflet maps, and Supabase.

## Features

- **Find courts** — Browse courts on an interactive OpenStreetMap or in a list view, filtered by condition and indoor/outdoor
- **See who's playing** — Real-time player enrollment system shows who's at a court right now, who's coming later today, and who's scheduled for future days
- **Sign up to play** — Indicate when you'll arrive, how long you'll play, and whether you're open to pickup games or solo hooping
- **Add new courts** — Submit courts with photos, location (picked on a map), and condition rating
- **Player profiles** — Public player directory with favourites and following
- **Weather awareness** — Live weather from Open-Meteo with context-aware messages (rain warnings, cold alerts, etc.)
- **Distance sorting** — Courts sorted by distance from your location using geolocation
- **Dark mode** and **Finnish/English** language support

## Tech Stack

| Layer       | Technology                           |
|-------------|--------------------------------------|
| Framework   | React 19 + TypeScript                |
| Build       | Vite                                 |
| Styling     | Tailwind CSS 4                       |
| Routing     | React Router 7                       |
| Maps        | React Leaflet (OpenStreetMap)        |
| Backend     | Supabase (database, auth, storage)   |
| Data        | TanStack React Query                 |
| Weather     | Open-Meteo API (free, no key needed) |
| Geocoding   | OpenStreetMap Nominatim              |
| Testing     | Vitest + Testing Library             |

## Getting Started

```bash
cd frontend-where-to-hoop
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Environment variables required (create a `.env` file in `frontend-where-to-hoop/`):

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your-supabase-anon-key>
```

## Scripts

All commands are run from `frontend-where-to-hoop/`:

```bash
npm run dev            # Start dev server
npm run build          # TypeScript compile + production build
npm run lint           # ESLint
npm run test           # Run tests with Vitest
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
npm run typecheck      # Type-check without emitting
```

## Project Structure

```
frontend-where-to-hoop/src/
├── pages/          # Route components (Home, Hoops, Hoop, AddHoop, Admin, ...)
├── components/     # UI components
│   └── reusable/   # Shared components (cards, toggles, carousel, etc.)
├── contexts/       # React Context providers (auth, location, theme, language, map view, toast)
├── hooks/          # Custom hooks (useWeather, useEnrollmentsRealtime, useFavorites, ...)
├── services/       # Supabase API calls (requests.ts)
├── types/          # TypeScript interfaces
├── locales/        # i18n translations (en, fi)
├── utils/          # Helpers and constants
└── test/           # Tests (mirrors src/ structure)
```

## Routes

| Path                | Page                                  |
|---------------------|---------------------------------------|
| `/`                 | Home — carousel of nearest courts     |
| `/hoops`            | Map and list view of all courts       |
| `/hoops/:id`        | Court details with player enrollments |
| `/addhoop`          | Submit a new court                    |
| `/about`            | About the project                     |
| `/faq`              | FAQ and condition guidelines          |
| `/privacy`          | Privacy policy                        |
| `/contact`          | Contact                               |
| `/signup`           | Sign up                               |
| `/signin`           | Sign in                               |
| `/myprofile`        | Authenticated user's profile          |
| `/players`          | Player directory                      |
| `/search-players`   | Search players                        |
| `/players/:nickname`| Public player profile                 |
| `/admin`            | Admin panel (admin only)              |
| `/admin/edit/:id`   | Edit hoop (admin only)                |
