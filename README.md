# Media Hub Spring

A Spring Boot backend for a media catalog platform with:
- JWT authentication and role-based authorization
- Movies, TV shows, genres, reviews, users, roles, and watchlists
- External movie integration (TMDB + OMDB)
- REST APIs and GraphQL queries

## What The App Does

The app provides:
- Auth flows: register, login, JWT token issuance
- Admin/user role management
- CRUD APIs for media entities
- Search and discovery APIs (by title, genre, year, rating, type)
- External movie lookup and import from TMDB
- GraphQL queries for discovery, trending, and stats

Main controllers are in `src/main/java/com/mediahub/mediahubspring/controller`.

## Tech Stack

- Java 17
- Spring Boot 3.4.1
- Spring Web, Spring Data JPA, Spring Security, Spring GraphQL
- PostgreSQL (runtime)
- H2 (tests)
- Maven

## Prerequisites

- JDK 17+
- Maven
- PostgreSQL

## Environment Variables

The app reads configuration from environment variables via `src/main/resources/application.properties`.

Required:
- `MEDIAHUB_DB_URL` (example: `jdbc:postgresql://localhost:5432/media-hub`)
- `MEDIAHUB_DB_USERNAME`
- `MEDIAHUB_DB_PASSWORD`
- `JWT_PASSWORD` (JWT signing secret)
- `TMDB_API_KEY`
- `OMDB_API_KEY`

Recommended for initial admin bootstrap:
- `MEDIAHUB_ADMIN_EMAIL`
- `MEDIAHUB_ADMIN_PASSWORD`

Notes:
- `app.admin-bootstrap.enabled=true` is enabled by default.
- If bootstrap is enabled but admin email/password are missing, admin creation is skipped with a warning.

## External APIs (TMDB + OMDB)

This project uses two external providers:
- `TMDB` (The Movie Database): movie search, popular/trending data, and movie details.
- `OMDB` (Open Movie Database): extra rating metadata (for example IMDb rating and Metascore).

These integrations are used by endpoints under `/external/**` and by GraphQL `trending`.

To test these features, you must create your own API keys and set them as environment variables before starting the app.

## Database Setup (PostgreSQL)

Create the database (example):

```sql
CREATE DATABASE "media-hub";
```

Then set:
- `MEDIAHUB_DB_URL=jdbc:postgresql://localhost:5432/media-hub`
- `MEDIAHUB_DB_USERNAME=<your-user>`
- `MEDIAHUB_DB_PASSWORD=<your-password>`


## Initial Admin User

Admin bootstrap component:
- `src/main/java/com/mediahub/mediahubspring/security/AdminBootstrap.java`

Behavior:
- Ensures roles `ADMIN`, `USER`, `EDITOR` exist
- If an ADMIN user already exists, it does nothing
- If no ADMIN exists and env vars are provided, it creates an admin user

Required variables for admin creation:
- `MEDIAHUB_ADMIN_EMAIL`
- `MEDIAHUB_ADMIN_PASSWORD`


Health endpoints:
- `GET /api/ping`
- `GET /api/health`

## How To Try It (Postman)

Import collection:
- `postman/media-hub-spring.postman_collection.json`

Suggested flow:
1. Health -> Ping / Health
2. Auth -> Register
3. Auth -> Login (stores `jwtToken` collection variable)
4. Users / Roles / Movies / TV Shows / Reviews / Watchlist
5. External Media -> Save External Movie

The collection includes variables such as:
- `baseUrl` (default `http://localhost:8080`)
- `jwtToken`, `userId`, `roleId`, `genreId`, `movieId`, `tvShowId`, `mediaId`, `reviewId`, `watchlistId`, `tmdbId`

Role assignment request included:
- `PUT /users/{id}/roles`
- Body example:

```json
{
  "roleIds": [1]
}
```

## REST Endpoint Reference

### Health
- `GET /api/ping`
- `GET /api/health`

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Users (admin area)
- `POST /users/add`
- `GET /users/all`
- `GET /users/{id}`
- `PUT /users/{id}`
- `PUT /users/{id}/roles`
- `DELETE /users/{id}`

### Roles (admin area)
- `POST /roles`
- `GET /roles/all`
- `GET /roles/{id}`
- `PUT /roles/{id}`
- `DELETE /roles/{id}`

### Genres
- `POST /genres`
- `GET /genres`
- `GET /genres/{id}`
- `PUT /genres/{id}`
- `DELETE /genres/{id}`

### Movies
- `POST /movies`
- `GET /movies/all`
- `GET /movies/{id}`
- `PUT /movies/{id}`
- `DELETE /movies/{id}`

### TV Shows
- `POST /tvshows`
- `GET /tvshows/all`
- `GET /tvshows/{id}`
- `PUT /tvshows/{id}`
- `DELETE /tvshows/{id}`

### Reviews
- `POST /reviews`
- `GET /reviews/all`
- `GET /reviews/{id}`
- `PUT /reviews/{id}`
- `DELETE /reviews/{id}`

### Watchlist
- `POST /watchlist`
- `GET /watchlist/all`
- `GET /watchlist/{id}`
- `GET /watchlist/user/{userId}`
- `GET /watchlist/media/{mediaItemId}`
- `GET /watchlist/exists?userId={userId}&mediaItemId={mediaItemId}`
- `DELETE /watchlist/{id}`

### Media Search / Discovery
- `GET /media/search?title={title}`
- `GET /media/by-genre/{genreId}`
- `GET /media/by-year/{year}`
- `GET /media/top-reviewed?limit={n}`
- `GET /media/advanced-search?title={title}&genreId={genreId}&year={year}`
- `GET /media/by-type/{type}`
- `GET /media/best-rated-above?minRating={value}`
- `GET /media/discover?title={title}&genreId={genreId}&year={year}&type={type}&minRating={value}&sortBy={field}&sortDir={asc|desc}`
- `GET /media/stats/by-genre`
- `GET /media/{id}/average-rating`

### External Media
- `GET /external/movie/{tmdbId}`
- `GET /external/search?query={query}`
- `GET /external/trending`
- `POST /external/movie/{tmdbId}/save`

## Security Model 

- Public: auth endpoints, read-only media endpoints, health, graphql
- USER: create/update reviews, watchlist write actions
- EDITOR: everything USER can do, plus content creation/update (movies/tv/genres) and external save
- ADMIN: everything EDITOR can do, plus users/roles management and delete operations on protected resources

Configured in:
- `src/main/java/com/mediahub/mediahubspring/security/SecurityConfig.java`

### Endpoint Authorization Matrix

| Endpoint pattern | Methods | Access |
| --- | --- | --- |
| `/api/ping`, `/api/health` | GET | Public |
| `/auth/**` | ALL | Public |
| `/graphql` | ALL | Public |
| `/media/**` | GET | Public |
| `/movies/**` | GET | Public |
| `/tvshows/**` | GET | Public |
| `/genres/**` | GET | Public |
| `/reviews/**` | GET | Public |
| `/watchlist/**` | GET | Public |
| `/external/**` | GET | Public |
| `/reviews` | POST | USER, EDITOR, ADMIN |
| `/reviews/**` | PUT | USER, EDITOR, ADMIN |
| `/watchlist` | POST | USER, EDITOR, ADMIN |
| `/watchlist/**` | DELETE | USER, EDITOR, ADMIN |
| `/movies` | POST | EDITOR or ADMIN |
| `/movies/**` | PUT | EDITOR or ADMIN |
| `/tvshows` | POST | EDITOR or ADMIN |
| `/tvshows/**` | PUT | EDITOR or ADMIN |
| `/genres` | POST | EDITOR or ADMIN |
| `/genres/**` | PUT | EDITOR or ADMIN |
| `/external/movie/**` | POST | EDITOR or ADMIN |
| `/movies/**` | DELETE | ADMIN |
| `/tvshows/**` | DELETE | ADMIN |
| `/reviews/**` | DELETE | ADMIN |
| `/users/**` | ALL | ADMIN |
| `/roles/**` | ALL | ADMIN |
| any other endpoint | ALL | Authenticated |

## GraphQL

Endpoint:
- `POST /graphql`

Schema:
- `src/main/resources/graphql/schema.graphqls`

Includes queries:
- `discoverMedia`
- `topReviewed`
- `trending`
- `statsByGenre`

## Tests

Run all tests:

```powershell
.\mvnw.cmd test
```

Current test setup uses H2 in-memory DB (`src/test/resources/application.properties`) and disables admin bootstrap during tests.

### Test Suite Coverage

Current test classes:
- `src/test/java/com/mediahub/mediahubspring/controller/AuthControllerApiTest.java`
- `src/test/java/com/mediahub/mediahubspring/controller/AuthFlowIntegrationTest.java`
- `src/test/java/com/mediahub/mediahubspring/controller/ExternalMediaControllerApiTest.java`
- `src/test/java/com/mediahub/mediahubspring/controller/MediaSearchControllerApiTest.java`
- `src/test/java/com/mediahub/mediahubspring/controller/ReviewControllerTest.java`
- `src/test/java/com/mediahub/mediahubspring/graphql/MediaGraphqlControllerTest.java`
- `src/test/java/com/mediahub/mediahubspring/security/JwtServiceTest.java`
- `src/test/java/com/mediahub/mediahubspring/service/MediaItemServiceImplTest.java`
- `src/test/java/com/mediahub/mediahubspring/service/UserServiceImplTest.java`
- `src/test/java/com/mediahub/mediahubspring/MediaHubSpringApplicationTests.java`

### What Is Tested

- Request validation and API contracts for auth endpoints.
- End-to-end auth behavior (register then login).
- External media controller mappings.
- Media search endpoints and parameters.
- Review controller mapping behavior.
- GraphQL query wiring (`discoverMedia`, `topReviewed`, `trending`, `statsByGenre`).
- JWT service token generation/validation behavior.
- User service password handling and email normalization behavior.
- Media item service business rules.
- Spring context startup sanity.


## Troubleshooting

- `401 Bad credentials` on login:
  - Verify correct email/password and registration success
  - Confirm JWT secret is set
- Admin not created:
  - Check `MEDIAHUB_ADMIN_EMAIL`, `MEDIAHUB_ADMIN_PASSWORD`, and bootstrap enabled flag
