# MERN Starter

A reusable, TypeScript-first MERN monorepo starter for building full-stack web applications. It includes a React frontend, an Express API, MongoDB integration, shared development tooling, automated tests, and Docker Compose configuration for local database development.

> **Project status:** The starter foundation has passed TypeScript checks, linting, tests, and production builds. This confirms that the current baseline compiles and its existing tests pass; it does not mean every production feature (such as complete authentication, authorization, or deployment automation) is implemented.

---

## Table of contents

- [What's included](#whats-included)
- [Technology stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment configuration](#environment-configuration)
- [Run the application](#run-the-application)
- [Commands reference](#commands-reference)
- [Testing](#testing)
- [Production builds](#production-builds)
- [Project structure](#project-structure)
- [Development workflow](#development-workflow)
- [MongoDB infrastructure](#mongodb-infrastructure)
- [Troubleshooting](#troubleshooting)
- [Before deploying](#before-deploying)

---

## What's included

### Frontend — `apps/web`

- React 19 and TypeScript
- Vite 7 for development and production builds
- React Router for client-side routing
- TanStack Query for server-state management and caching
- Axios for HTTP requests
- React Hook Form and Zod for forms and validation
- Vitest, jsdom, and React Testing Library
- ESLint and TypeScript checks

The frontend includes a starter application and a component test. Extend these with your own pages, layouts, components, and user flows.

### Backend — `apps/api`

- Node.js with Express 5 and TypeScript using ES modules
- MongoDB access through Mongoose
- Zod-based environment validation
- CORS and Helmet middleware
- Express rate-limiting dependency
- Pino-based structured logging
- Vitest and Supertest for API tests
- ESLint and TypeScript checks

The API is where routes, business logic, validation, database operations, and server-side integrations belong. Check the source code to confirm which routes and protections are currently implemented before relying on them.

### Shared tooling

- pnpm workspaces
- Root-level scripts for development, linting, typechecking, testing, formatting, and builds
- Prettier and ESLint
- Husky and lint-staged for Git hooks
- GitHub Actions workflow files under `.github/`

### Local infrastructure

- Docker Compose configuration at the repository root and in `infra/`
- MongoDB 8 for local development, with a persistent named volume and health check

**Redis is not defined in the current Compose configuration.** Add it explicitly if your application later requires Redis-backed queues, caching, or other functionality.

---

## Technology stack

| Area                     | Technologies                             |
| ------------------------ | ---------------------------------------- |
| Monorepo                 | pnpm workspaces                          |
| Frontend                 | React 19, TypeScript, Vite 7             |
| Routing and server state | React Router, TanStack Query             |
| HTTP client              | Axios                                    |
| Forms and validation     | React Hook Form, Zod                     |
| Backend                  | Node.js, Express 5, TypeScript           |
| Database                 | MongoDB 8, Mongoose                      |
| Middleware and logging   | CORS, Helmet, express-rate-limit, Pino   |
| Testing                  | Vitest, Supertest, React Testing Library |
| Code quality             | ESLint, Prettier                         |
| Git hooks                | Husky, lint-staged                       |
| Local infrastructure     | Docker Compose                           |

---

## Prerequisites

Install the following:

1. **Node.js:** `>=22 <25`, as specified in the root `package.json`.
2. **pnpm:** the project has been verified with pnpm `11.25.0`.
3. **Git:** for version control.
4. **Docker Desktop or Docker Engine with Compose:** for running MongoDB locally through Docker.

Check installed versions:

```bash
node --version
pnpm --version
git --version
docker --version
docker compose version
```

If Corepack is available with your Node.js installation, you can activate the verified pnpm version:

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
```

---

## Quick start

Run these commands from the repository root.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create local environment files

The API loads environment variables through `dotenv/config`, and the frontend uses Vite's environment-file conventions. When running package scripts, each app runs with its own package directory as the working directory. Create the local files in those app directories:

```bash
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

If either destination file already exists, do not overwrite it blindly. Review and update it manually instead.

The example files contain local development values. Adjust them for your machine as needed, and never commit real secrets.

### 3. Start MongoDB

From the repository root:

```bash
docker compose up -d
```

The root `docker-compose.yml` extends the MongoDB service defined in `infra/docker-compose.yml`. You can inspect its status with:

```bash
docker compose ps
docker compose logs -f mongodb
```

### 4. Start the frontend and API

```bash
pnpm dev
```

This starts `@mern/api` and `@mern/web` in parallel. With the example settings, the API listens on port `5000` and the Vite frontend normally uses port `5173`. Check the terminal output if a port is already occupied or Vite selects another port.

### 5. Verify the baseline

In a separate terminal, from the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

## Environment configuration

### API — `apps/api/.env`

The root `.env.example` is the template for `apps/api/.env`.

| Variable      | Example                                  | Purpose                                                                         |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| `NODE_ENV`    | `development`                            | Runtime mode: `development`, `test`, or `production`                            |
| `API_HOST`    | `0.0.0.0`                                | Host/interface the API binds to                                                 |
| `API_PORT`    | `5000`                                   | API listening port                                                              |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/mern_starter` | MongoDB connection string                                                       |
| `CORS_ORIGIN` | `http://localhost:5173`                  | Allowed frontend origin                                                         |
| `LOG_LEVEL`   | `debug`                                  | Pino log level: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, or `silent` |

The API validates these values with Zod during configuration loading. `MONGODB_URI` must be non-empty, `CORS_ORIGIN` must be a valid URL, and the port must be between `1` and `65535`. Invalid values can prevent the API from starting.

For a local MongoDB instance using the supplied Compose configuration, the example URI should work as long as port `27017` is available.

### Frontend — `apps/web/.env`

The frontend example file defines:

```dotenv
VITE_API_URL=http://localhost:5000/api/v1
```

`VITE_API_URL` is the base URL used by the frontend API client. Change it to match your API address in each environment.

**Important:** Variables prefixed with `VITE_` are exposed to browser-side code. Never put database credentials, private API keys, or other secrets in them.

### Environment-file rules

- Keep local `.env` files untracked.
- Commit example files with placeholder/local development values only.
- Use your hosting provider's secret manager for production credentials.
- Use separate database names and credentials for development, testing, and production.
- Review `.gitignore` before adding any new secret-bearing file.

---

## Run the application

### Run both apps

```bash
pnpm dev
```

### Run only the frontend

```bash
pnpm --filter @mern/web dev
```

### Run only the API

```bash
pnpm --filter @mern/api dev
```

The API requires valid environment configuration and a reachable MongoDB instance. The frontend can start without the API, but requests to API-dependent features will fail until the API is available.

### Run the compiled API

First build the project:

```bash
pnpm --filter @mern/api build
```

Then start the compiled API:

```bash
pnpm --filter @mern/api start
```

Ensure `apps/api/.env` exists and the database is reachable before starting it.

---

## Commands reference

Run root commands from the repository root.

| Command                       | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `pnpm install`                | Install all workspace dependencies                           |
| `pnpm dev`                    | Start API and frontend in parallel                           |
| `pnpm --filter @mern/web dev` | Start only the frontend                                      |
| `pnpm --filter @mern/api dev` | Start only the API                                           |
| `pnpm lint`                   | Lint workspace packages                                      |
| `pnpm typecheck`              | Run TypeScript checks                                        |
| `pnpm test`                   | Run API and frontend test suites                             |
| `pnpm test:coverage`          | Run coverage scripts where configured                        |
| `pnpm build`                  | Build workspace applications                                 |
| `pnpm start`                  | Start the compiled API                                       |
| `pnpm format`                 | Format repository files with Prettier                        |
| `pnpm format:check`           | Check formatting without rewriting files                     |
| `pnpm clean`                  | Remove generated output where package scripts define cleanup |

### Package-specific test commands

```bash
pnpm --filter @mern/api test
pnpm --filter @mern/api test:watch
pnpm --filter @mern/api test:coverage

pnpm --filter @mern/web test
pnpm --filter @mern/web test:watch
pnpm --filter @mern/web test:coverage
```

To inspect the current scripts and dependencies:

```bash
cat package.json
cat apps/api/package.json
cat apps/web/package.json
```

---

## Testing

The API and frontend each have their own Vitest configuration and test scripts.

### API tests

```bash
pnpm --filter @mern/api test
```

The API uses Vitest and Supertest. Tests can exercise application routes and middleware without requiring a manually started HTTP server, depending on how each test is written.

### Frontend tests

```bash
pnpm --filter @mern/web test
```

The frontend uses Vitest, jsdom, and React Testing Library to test UI behavior.

### Run all tests

```bash
pnpm test
```

Tests that interact with MongoDB or external services need those dependencies and environment variables configured. Prefer isolated, repeatable tests over tests that depend on personal or production data.

---

## Production builds

Build both applications:

```bash
pnpm build
```

The API compiles TypeScript to its configured output directory. The frontend runs TypeScript project checks and creates optimized assets through Vite.

Preview the built frontend locally:

```bash
pnpm --filter @mern/web preview
```

A successful build confirms that the code compiles and the frontend assets can be bundled. It does not replace integration testing, a security review, environment configuration, or deployment smoke tests.

Deploy the API and frontend according to your chosen hosting platform's requirements. Do not treat Vite's preview server as a production hosting solution.

---

## Project structure

```text
mern-starter/
├── apps/
│   ├── api/
│   │   ├── src/                  # Express API source and tests
│   │   ├── .env.example          # May be added if app-specific example is desired
│   │   └── package.json          # API scripts and dependencies
│   └── web/
│       ├── src/                  # React UI, tests, and test setup
│       ├── public/               # Static public assets, if present
│       ├── .env.example          # Frontend environment template
│       ├── index.html            # Vite HTML entry point
│       └── package.json          # Frontend scripts and dependencies
├── infra/
│   └── docker-compose.yml        # MongoDB service definition
├── .github/                      # GitHub Actions workflows
├── .husky/                       # Git hooks
├── docs/                          # Project documentation
├── .env.example                  # API environment template
├── docker-compose.yml            # Root Compose entry point
├── package.json                  # Root scripts and shared tooling
├── pnpm-workspace.yaml           # Workspace package definitions
├── pnpm-lock.yaml                # Locked dependency resolution
├── .nvmrc                        # Preferred Node.js version
├── .gitignore
└── README.md
```

This is a guide to the main project areas; the actual checked-out file tree is authoritative.

---

## Development workflow

A recommended workflow for each change:

1. Create a focused branch.
2. Implement the feature in the appropriate application.
3. Add or update tests.
4. Run the relevant checks.
5. Review the diff for unintended changes, generated files, and secrets.
6. Commit the change.
7. Open a pull request and review CI results.

Suggested pre-commit verification:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short
```

If `format:check` reports files that need formatting, run `pnpm format` and inspect the diff before committing.

---

## MongoDB infrastructure

The root `docker-compose.yml` is the convenient entry point. It extends the MongoDB service in `infra/docker-compose.yml`.

Start MongoDB:

```bash
docker compose up -d
```

Check status and health:

```bash
docker compose ps
docker compose logs -f mongodb
```

Stop the service:

```bash
docker compose down
```

MongoDB is exposed on port `27017` for local development and stores data in the named `mongodb_data` volume. **Do not run `docker compose down -v` unless you intend to delete the persistent local database volume.**

If port `27017` is already in use, stop the conflicting service or update the Compose port mapping and MongoDB URI consistently.

The supplied Compose configuration is for local development, not an internet-facing production database.

---

## Troubleshooting

### API fails during startup with an environment validation error

- Confirm `apps/api/.env` exists.
- Check that `MONGODB_URI` is non-empty.
- Ensure `CORS_ORIGIN` is a valid URL.
- Ensure `API_PORT` is between `1` and `65535`.
- Use an allowed `NODE_ENV` and `LOG_LEVEL` value.

### API cannot connect to MongoDB

- Run `docker compose ps`.
- Inspect logs with `docker compose logs -f mongodb`.
- Check the `MONGODB_URI` in `apps/api/.env`.
- Verify port `27017` is available.
- If the API runs inside a container, `127.0.0.1` refers to that container, not the MongoDB container. Use the appropriate Compose service hostname in the container environment.

### Frontend requests fail

- Confirm the API is running on the expected port.
- Check `VITE_API_URL` in `apps/web/.env`.
- Confirm the API route and URL prefix match the implemented routes.
- Check CORS settings and browser developer tools.
- Restart Vite after changing environment variables.

### Port already in use

Inspect the error to identify the port. Stop the process that owns it or change the relevant app/Compose configuration. Keep the API port, frontend API URL, and CORS origin consistent.

### Tests fail locally or in CI

- Run the failing app's test command separately.
- Confirm required environment variables are set.
- Start required local services if a test needs them.
- Inspect the failure before changing dependencies.
- Keep unit tests independent of external services where possible.

### TypeScript or build errors

Run checks separately to isolate the failing package:

```bash
pnpm --filter @mern/api typecheck
pnpm --filter @mern/web typecheck
pnpm --filter @mern/api build
pnpm --filter @mern/web build
```

---

## Before deploying

This repository is a starter foundation, not a guarantee that every production requirement is complete. Verify and implement the requirements relevant to your application:

- [ ] Authentication, session/token lifecycle, and authorization
- [ ] Password hashing and account recovery, if using passwords
- [ ] Rate limiting and abuse prevention on relevant endpoints
- [ ] Strict input validation and safe error responses
- [ ] CORS and security headers configured for the deployed environment
- [ ] Production secrets and environment validation
- [ ] Database indexes, backups, and data-change strategy
- [ ] Logging, monitoring, and alerting without exposing sensitive data
- [ ] Health/readiness checks and graceful shutdown
- [ ] Automated integration tests for critical workflows
- [ ] CI checks and a repeatable deployment process
- [ ] Dependency and container security review

Only mark an item complete after verifying it in the code and deployed environment.

---

## License

Add the license appropriate for your project before distributing or publishing this starter. Until a license is included, do not assume others have permission to reuse or redistribute the code.

## Authentication

The starter includes registration, login, access-token verification, refresh-token rotation, logout, and a basic authentication UI. See [`docs/authentication.md`](docs/authentication.md) for endpoints, cookie behavior, configuration, and remaining production work.

Before deploying, configure a unique `JWT_ACCESS_SECRET`, review cookie/CSRF settings for your hosting topology, and add integration tests against an isolated database.
