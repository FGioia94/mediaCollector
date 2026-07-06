# Testing Suite

## Strategy

The project uses a layered test strategy:

- Backend: API, service, security, GraphQL, integration checks
- Frontend: UI regression tests for critical user flows
- CI: automated quality gates before image build and deploy

## Backend Tests

Frameworks and setup:

- JUnit 5 + Spring Boot Test
- H2 in-memory database for test profile
- Maven Surefire for execution/reporting

Main backend test classes include:

- AuthControllerApiTest
- AuthFlowIntegrationTest
- ExternalMediaControllerApiTest
- MediaSearchControllerApiTest
- ReviewControllerTest
- MediaGraphqlControllerTest
- JwtServiceTest
- JwtAuthenticationFilterTest
- MediaItemServiceImplTest
- UserServiceImplTest
- MediaHubSpringApplicationTests

Run backend tests:

```powershell
cd backend
.\mvnw.cmd test
```

## Frontend Tests

Frameworks and setup:

- Vitest
- Testing Library
- jsdom environment

Current focus:

- Regression coverage on key pages and interaction flows
- Guards against UI regressions on external search/import behavior

Run frontend tests:

```powershell
cd frontend
npm ci
npm test
```

## Build Verification

Production build checks:

```powershell
cd frontend
npm run build
```

```powershell
cd backend
.\mvnw.cmd -DskipTests compile
```

## What CI Validates

On main and pull requests, pipeline executes:

- Backend test suite
- Frontend test suite
- Frontend production build

Only after successful checks, image build and deployment continue on main.
