# CI/CD

## Pipeline Overview

CI/CD is implemented in [ci-cd.yml](../.github/workflows/ci-cd.yml).

Trigger events:

- push on main
- pull_request on main
- manual workflow_dispatch

Pipeline stages:

1. backend-check
2. frontend-check
3. build-images (non-PR only)
4. deploy (main branch only, non-PR)

## Stage Details

### 1. backend-check

- Setup Java 17 (Temurin)
- Run Maven tests in backend

### 2. frontend-check

- Setup Node 20
- Install dependencies via npm ci
- Run Vitest suite
- Run production build

### 3. build-images

- Login to GHCR
- Build and push backend image:
  - ghcr.io/<owner>/media-collector-backend:latest
  - ghcr.io/<owner>/media-collector-backend:<sha>
- Build and push frontend image:
  - ghcr.io/<owner>/media-collector-frontend:latest
  - ghcr.io/<owner>/media-collector-frontend:<sha>

### 4. deploy

- Validate deploy secrets
- Ensure remote deploy directory
- Upload deploy bundle (compose + redeploy script)
- Create .env.deploy on target
- Login to GHCR on server
- Execute redeploy script

## Required Secrets and Variables

Deployment access:

- DEPLOY_HOST
- DEPLOY_PORT
- DEPLOY_USER
- DEPLOY_SSH_KEY
- DEPLOY_PATH

Registry pull on server:

- GHCR_USERNAME
- GHCR_READ_TOKEN

Runtime deploy variables:

- BACKEND_PORT
- FRONTEND_PORT
- MEDIAHUB_NETWORK

Runtime app secrets remain in server-side .env.prod (not overwritten by CI).

## Quality Gates

The deploy stage depends on successful:

- backend-check
- frontend-check
- build-images

This blocks deployment when tests/build fail.
