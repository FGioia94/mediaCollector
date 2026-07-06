# Deployment

## Production Runtime Model

Deployment uses Docker Compose on a remote server.

Reference files:

- [docker-compose.prod.yml](../deploy/docker-compose.prod.yml)
- [redeploy.sh](../deploy/redeploy.sh)
- [bootstrap-server.sh](../deploy/bootstrap-server.sh)
- [.env.prod.example](../deploy/.env.prod.example)
- [host Nginx example](../deploy/nginx/mediahub.conf.example)

Services:

- mediahub-backend (Spring Boot)
- mediahub-frontend (Nginx serving SPA)

Network:

- External Docker network (default: mediahub-net)

## Environment Files

- .env.deploy: generated/updated by CI deploy job
- .env.prod: persistent runtime secrets and app config on server

Design note:

- .env.prod must stay on server and is not replaced during deploy
- redeploy.sh validates .env.prod before restart

## Redeploy Flow

redeploy.sh performs:

1. Validate required env files
2. Parse and validate DB runtime URL/credentials
3. Ensure target DB exists (preflight)
4. Pull latest images
5. Remove stale conflicting containers if present
6. Start stack with docker compose up -d --remove-orphans
7. Wait for backend /api/health success
8. Print diagnostics and logs on failure

## Reverse Proxy Notes

Recommended production routing:

- / -> frontend container
- /api/ and /graphql -> backend container

For SPA reliability:

- frontend Nginx should use try_files fallback to /index.html
- API paths should not conflict with client routes

## First-Time Server Bootstrap

Use bootstrap script on a clean Ubuntu host:

```bash
sudo bash deploy/bootstrap-server.sh /opt/media-collector mediahub-net
```

This installs Docker, Compose plugin, creates deploy path and network.

## Operational Checks

After deploy, verify:

- Public frontend reachable
- Backend health endpoint reachable (/api/health)
- Logs free from startup errors
- Database connectivity successful
