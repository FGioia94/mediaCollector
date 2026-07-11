# Media Collector

Media Collector is a production-style full-stack platform for media discovery and catalog management.

**[WATCH THE DEMO VIDEO](https://drive.google.com/file/d/1ZvHXdFYRnqdYeVnheJv1w6elw9pP120E/view?usp=sharing)**

**URL:** https://mediahub.francescogioia.it/

Core capabilities:

- JWT authentication and role-based authorization
- Movies/TV catalog management with reviews and watchlist
- External integrations (TMDB, OMDB) for search/trending/import
- REST + GraphQL API surface
- Automated testing and CI/CD with containerized deployment

## Documentation Index

Main technical documentation:

- [Architecture](docs/architecture.md)
- [API and Security](docs/api-security.md)
- [Testing Suite](docs/testing.md)
- [CI/CD Pipeline](docs/ci-cd.md)
- [Deployment Guide](docs/deployment.md)

Component-specific docs:

- [Backend Reference](backend/README.md)
- [Frontend Reference](frontend/README.md)
- [Postman Collection](backend/postman/media-hub-spring.postman_collection.json)

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router |
| Backend | Java 17, Spring Boot, Spring Security, Spring Data JPA, Spring GraphQL |
| Data | PostgreSQL (runtime), H2 (tests) |
| Testing | JUnit, Vitest, Testing Library |
| DevOps | Docker, Docker Compose, GitHub Actions, GHCR |

## Repository Layout

- [backend](backend): Spring Boot API, security, business logic, tests
- [frontend](frontend): React SPA, API client, route guards, tests
- [deploy](deploy): production compose and redeploy scripts
- [.github/workflows](.github/workflows): CI/CD workflows
- [docs](docs): architecture, testing, CI/CD, deployment, API/security docs

## Quick Start (Local)

Prerequisites:

- Java 17+
- PostgreSQL

Required backend environment variables:

- MEDIAHUB_DB_URL
- MEDIAHUB_DB_USERNAME
- MEDIAHUB_DB_PASSWORD
- JWT_PASSWORD
- TMDB_API_KEY
- OMDB_API_KEY

Recommended bootstrap variables:

- MEDIAHUB_ADMIN_EMAIL
- MEDIAHUB_ADMIN_PASSWORD

Start backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Start frontend:

```powershell
cd frontend
npm install
npm run dev
```


## Common Commands

Backend:

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd -DskipTests compile
```

Frontend:

```powershell
cd frontend
npm test
npm run build
npm run lint
```

## Production Summary

Deployment model:

- Docker images built in CI and pushed to GHCR
- Remote rollout via SSH + Docker Compose
- Health checks and preflight validations in redeploy script

Primary deployment files:

- [ci-cd.yml](.github/workflows/ci-cd.yml)
- [docker-compose.prod.yml](deploy/docker-compose.prod.yml)
- [redeploy.sh](deploy/redeploy.sh)
- [.env.prod.example](deploy/.env.prod.example)

## Status

Active development with production-oriented architecture, automated tests, and CI/CD deployment pipeline.

## Recent Updates

- frontend mobile usability improvements across navbar, filters, toolbar, and pagination
- frontend route-level lazy loading to reduce initial payload and improve load time
- frontend form and admin UI refactor for cleaner responsive behavior
- backend auth endpoint basic rate limiting configuration (register, login, forgot, reset)
