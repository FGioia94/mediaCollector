# Frontend - Media Collector

Frontend SPA for the Media Collector project.

Stack:

- React + TypeScript
- Vite
- React Router
- Vitest + Testing Library

## Goal

Provide a fast and clear interface for:

- user authentication
- movie and TV catalog management
- reviews and watchlist
- external content discovery with import into the local catalog

## Recent Frontend Updates

- improved mobile responsiveness for navbar, filters, list toolbar, and pagination
- form layout refactor for movie and TV show editors with shared responsive grid styles
- admin and genre management UI polish for better small-screen usability
- route-level lazy loading with Suspense fallback for smaller initial bundle
- small shared utility extraction for numeric form input parsing

## Local Setup

Prerequisites:

- Node.js 20+
- npm

Install and run the development server:

```powershell
npm install
npm run dev
```

Local URL: http://localhost:5173

## API Configuration

Supported environment variable:

- VITE_MEDIA_HUB_BACKEND

Behavior:

- if set, the client uses that base URL
- if not set, the client uses /api (recommended with reverse proxy setup)

.env example:

```env
VITE_MEDIA_HUB_BACKEND=http://localhost:8080
```

## Useful Scripts

```powershell
# Development
npm run dev

# Test
npm test

# Production build
npm run build

# Lint
npm run lint
```

## Main Structure

- src/api/: typed API client layer
- src/auth/: authentication and role state
- src/components/: reusable and shared UI components
- src/pages/: route-level pages (lazy loaded)
- src/utils/: UI and business helpers

## Architecture Notes

- the API layer centralizes JWT token handling and error mapping
- protected routes use role-based guards
- route components are lazy loaded in App.tsx to reduce initial JavaScript payload
- list and filtering pages share common controls through ListControls
- hover popups display trailers and metadata with robust fallbacks
- UI flows handle unexpected payload shapes without runtime crashes

## Mobile and UX Notes

- filters collapse to a single-column layout on narrow viewports
- pagination numbers stay usable on small screens via horizontal scroll
- navbar switches to compact grid layout with touch-friendly tap targets
- form pages use a responsive two-column grid that becomes one column on mobile

## Test

The frontend suite includes regression tests for critical flows (for example, external search import).

Run:

```powershell
npm test
```
