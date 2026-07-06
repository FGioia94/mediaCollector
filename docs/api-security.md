# API and Security

## API Surfaces

The backend exposes:

- REST endpoints under auth/media/domain controllers
- GraphQL endpoint at /graphql

Detailed endpoint list and examples:

- [backend README](../backend/README.md)
- [Postman collection](../backend/postman/media-hub-spring.postman_collection.json)

## REST Domain Areas

Main REST groups:

- Auth
- Users and roles
- Movies, TV shows, genres
- Reviews
- Watchlist
- Media search/discovery
- External provider integration
- Health endpoints

## AuthN/AuthZ

Authentication:

- JWT Bearer tokens
- Stateless request auth via security filters

Authorization:

- Public routes for auth entry points, health, read-only discovery surfaces
- USER permissions for review/watchlist write flows
- EDITOR permissions for media content mutations
- ADMIN permissions for user/role management and protected delete operations

Configuration source:

- [SecurityConfig.java](../backend/src/main/java/com/mediahub/mediahubspring/security/SecurityConfig.java)

## GraphQL

Endpoint:

- POST /graphql

Schema file:

- [schema.graphqls](../backend/src/main/resources/graphql/schema.graphqls)

Current query coverage includes media discovery, top reviewed, trending and stats.
