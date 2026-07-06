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
- movie/TV catalog management
- reviews and watchlist
- external content discovery with import into the local catalog

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
- src/components/: reusable components
- src/pages/: application pages
- src/utils/: UI and business helpers

## Implementation Notes

- the API layer centralizes JWT token handling and error mapping
- protected routes use role-based guards
- hover popups display trailers and metadata with robust fallbacks
- the UI handles unexpected payloads without runtime crashes

## Test

The frontend suite includes regression tests for critical flows (for example, external search import).

Run:

```powershell
npm test
```
