# Architecture

The project is a pnpm monorepo with independently runnable frontend and backend apps.

## Backend conventions

- Routes define HTTP endpoints.
- Controllers translate HTTP requests into application operations.
- Services contain business rules.
- Repositories encapsulate database access when that abstraction adds value.
- Zod validates external inputs.
- Centralized middleware normalizes application errors.
- Pino provides structured logging.

## Frontend conventions

- Features should be organized by business domain.
- The shared Axios client owns common HTTP configuration.
- TanStack Query manages server state.
- React error boundaries should be added for important UI boundaries.

## Operational requirements

Production deployment still requires verified container builds, secrets management,
authentication and authorization, backups, monitoring, and deployment-specific health checks.
