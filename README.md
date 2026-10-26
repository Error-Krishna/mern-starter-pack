# MERN Starter

A reusable, TypeScript-first MERN monorepo starter for building full-stack web applications. It includes a React frontend, an Express API, MongoDB integration, authentication and authorization foundations, shared development tooling, automated tests, and Docker Compose configuration for local database development.

> **Project status:** The starter's configured formatting, lint, TypeScript, test, and production-build checks have passed. The authentication implementation provides registration, login, JWT access tokens, refresh-token rotation, logout, authenticated-user lookup, and role-checking middleware. Passing these checks does not by itself establish production readiness; review the security notes and complete the integration testing described below before deploying.

---

## Table of contents

- [What's included](#whats-included)
- [Technology stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment configuration](#environment-configuration)
- [Run the application](#run-the-application)
- [Authentication](#authentication)
- [Commands reference](#commands-reference)
- [Testing](#testing)
- [Production builds](#production-builds)
- [Project structure](#project-structure)
- [Using this starter for new projects](#using-this-starter-for-new-projects)
- [Development workflow](#development-workflow)
- [MongoDB infrastructure](#mongodb-infrastructure)
- [Troubleshooting](#troubleshooting)
- [Before deploying](#before-deploying)
- [License](#license)

---

## What's included

### Frontend — `apps/web`

- React 19 and TypeScript
- Vite 7 for development and production builds
- React Router for client-side routing
- TanStack Query for server-state management and caching
- Axios for HTTP requests
- React Hook Form and Zod for forms and validation
- Authentication context, in-memory access-token storage, and a reusable protected-route component
- Vitest, jsdom, and React Testing Library
- ESLint and TypeScript checks

The frontend contains a basic authentication demonstration. Extend it with your own pages, layouts, components, and product-specific user flows.

### Backend — `apps/api`

- Node.js with Express 5 and TypeScript using ES modules
- MongoDB access through Mongoose
- Zod-based environment and request validation
- Registration, login, refresh, logout, and current-user endpoints
- bcrypt password hashing
- Short-lived JWT access tokens and refresh-token rotation using an HTTP-only cookie
- Authentication middleware and a role-checking helper
- CORS, Helmet, rate limiting, and Pino structured logging
- Vitest and Supertest for API tests
- ESLint and TypeScript checks

Review [`docs/authentication.md`](docs/authentication.md) for endpoint behavior and security considerations. The authentication tests currently include schema and UI coverage; add database-backed integration tests for the complete lifecycle before relying on it in production.

### Shared tooling

- pnpm workspaces
- Root-level scripts for development, linting, typechecking, testing, formatting, and builds
- Prettier and ESLint
- Husky and lint-staged for Git hooks
- GitHub Actions workflow files under `.github/`

### Local infrastructure

- Docker Compose configuration at the repository root and in `infra/`
- MongoDB 8 for local development, with a persistent named volume and health check

**Redis is not defined in the current Compose configuration.** Add it explicitly if an application later requires Redis-backed queues, caching, or other functionality.

---

## Technology stack

| Area                     | Technologies                                     |
| ------------------------ | ------------------------------------------------ |
| Monorepo                 | pnpm workspaces                                  |
| Frontend                 | React 19, TypeScript, Vite 7                     |
| Routing and server state | React Router, TanStack Query                     |
| HTTP client              | Axios                                            |
| Forms and validation     | React Hook Form, Zod                             |
| Backend                  | Node.js, Express 5, TypeScript                   |
| Database                 | MongoDB 8, Mongoose                              |
| Authentication           | bcrypt, JWT access tokens, refresh-token cookies |
| Middleware and logging   | CORS, Helmet, express-rate-limit, Pino           |
| Testing                  | Vitest, Supertest, React Testing Library         |
| Code quality             | ESLint, Prettier                                 |
| Git hooks                | Husky, lint-staged                               |
| Local infrastructure     | Docker Compose                                   |

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

The API loads environment variables through `dotenv/config`, and the frontend uses Vite's environment-file conventions. Each app's scripts run from its own package directory. Create local files in those app directories:

```bash
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

If either destination already exists, do not overwrite it blindly; review and update it manually.

Generate a unique local JWT secret:

```bash
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
sed -i '' "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=${JWT_SECRET}|" apps/api/.env
unset JWT_SECRET
```

The `sed -i ''` syntax above is for macOS. On Linux, use an appropriate Linux `sed` command or edit the file directly. Keep the generated secret private.

The frontend example URL defaults to `http://localhost:5000/api/v1`. If you change the API port, update `VITE_API_URL` in `apps/web/.env` and keep the API's `CORS_ORIGIN` consistent with the frontend origin.

### 3. Start MongoDB

From the repository root:

```bash
docker compose up -d
```

Check status and logs:

```bash
docker compose ps
docker compose logs -f mongodb
```

### 4. Start the frontend and API

```bash
pnpm dev
```

This starts `@mern/api` and `@mern/web` in parallel. With the example settings, the API listens on port `5000` and Vite normally uses port `5173`. Check terminal output if a port is already occupied or Vite chooses another port.

### 5. Verify the setup

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Check that the API responds:

```bash
curl -i http://localhost:5000/
```

The API requires a reachable MongoDB instance. If you changed the API port, use that port in the request.

---

## Environment configuration

### API — `apps/api/.env`

The root `.env.example` is the template for `apps/api/.env`.

| Variable            | Example                                  | Purpose                                                                            |
| ------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| `NODE_ENV`          | `development`                            | Runtime mode: `development`, `test`, or `production`                               |
| `API_HOST`          | `0.0.0.0`                                | Host/interface the API binds to                                                    |
| `API_PORT`          | `5000`                                   | API listening port                                                                 |
| `MONGODB_URI`       | `mongodb://127.0.0.1:27017/mern_starter` | MongoDB connection string                                                          |
| `CORS_ORIGIN`       | `http://localhost:5173`                  | Allowed frontend origin                                                            |
| `LOG_LEVEL`         | `debug`                                  | Pino log level: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, or `silent`    |
| `JWT_ACCESS_SECRET` | Generate a unique secret                 | Secret used to sign access tokens; never use the example placeholder in production |

The API validates configuration with Zod. Invalid values can prevent the API from starting. For local MongoDB using the supplied Compose configuration, the example URI should work if port `27017` is available.

### Frontend — `apps/web/.env`

```dotenv
VITE_API_URL=http://localhost:5000/api/v1
```

`VITE_API_URL` is the base URL used by the frontend API client. Change it to match the API address in each environment.

**Important:** Variables prefixed with `VITE_` are exposed to browser-side code. Never put database credentials, private API keys, or other secrets in them.

### Environment-file rules

- Keep local `.env` files untracked.
- Commit example files with placeholders or local development values only.
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

### Run the compiled API

```bash
pnpm --filter @mern/api build
pnpm --filter @mern/api start
```

Ensure `apps/api/.env` exists and MongoDB is reachable before starting the API.

---

## Authentication

The starter includes these API endpoints:

| Method | Endpoint                | Purpose                                             |
| ------ | ----------------------- | --------------------------------------------------- |
| `POST` | `/api/v1/auth/register` | Register an account                                 |
| `POST` | `/api/v1/auth/login`    | Authenticate with credentials                       |
| `POST` | `/api/v1/auth/refresh`  | Rotate a refresh token and issue a new access token |
| `POST` | `/api/v1/auth/logout`   | Revoke the refresh session                          |
| `GET`  | `/api/v1/auth/me`       | Return the authenticated user's profile             |

The frontend includes a simple sign-in/register UI, session restoration, logout, an in-memory access-token store, and a reusable `ProtectedRoute` component.

Security and integration notes:

- Passwords are hashed; they should never be stored in plaintext.
- Access tokens are short-lived and kept in frontend memory, not local storage.
- Refresh tokens are delivered in an HTTP-only cookie and stored server-side as hashes.
- Configure a strong, unique `JWT_ACCESS_SECRET` for each environment.
- Verify cookie settings, HTTPS, cross-origin behavior, and CSRF protections against your actual deployment topology.
- Test duplicate registration, invalid credentials, token expiry, refresh-token reuse, logout revocation, and concurrent refresh requests.
- Add database-backed integration tests using an isolated test database before production deployment.

See [`docs/authentication.md`](docs/authentication.md) for additional implementation details and limitations.

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

Package-specific tests:

```bash
pnpm --filter @mern/api test
pnpm --filter @mern/api test:watch
pnpm --filter @mern/api test:coverage

pnpm --filter @mern/web test
pnpm --filter @mern/web test:watch
pnpm --filter @mern/web test:coverage
```

Inspect current scripts and dependencies:

```bash
cat package.json
cat apps/api/package.json
cat apps/web/package.json
```

---

## Testing

### API tests

```bash
pnpm --filter @mern/api test
```

The API uses Vitest and Supertest. Tests can exercise routes and middleware without a manually started HTTP server, depending on how each test is written.

### Frontend tests

```bash
pnpm --filter @mern/web test
```

The frontend uses Vitest, jsdom, and React Testing Library.

### All tests

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

A successful build confirms that the code compiles and frontend assets can be bundled. It does not replace integration testing, a security review, environment configuration, or deployment smoke tests. Vite's preview server is not a production hosting solution.

Deploy the API and frontend according to your chosen hosting platform's requirements.

---

## Project structure

```text
mern-starter/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── common/middleware/ # Authentication/authorization middleware
│   │   │   ├── config/            # Validated environment configuration
│   │   │   └── modules/
│   │   │       ├── auth/          # Auth routes, schemas, refresh sessions
│   │   │       └── users/         # User model
│   │   ├── package.json
│   │   └── .env                  # Local only; do not commit
│   └── web/
│       ├── src/
│       │   ├── auth/              # Auth context, protected route, token memory
│       │   ├── lib/api/           # Axios API client
│       │   └── App.tsx
│       ├── package.json
│       └── .env                  # Local only; do not commit
├── docs/
│   └── authentication.md
├── infra/
│   └── docker-compose.yml
├── .github/                      # GitHub Actions workflows
├── .husky/                       # Git hooks
├── .env.example                  # API environment template
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .nvmrc
├── .gitignore
└── README.md
```

This is a guide to the main project areas; the actual checked-out file tree is authoritative.

---

## Using this starter for new projects

The recommended long-term approach is to keep one canonical `mern-starter` repository and create a separate repository for every application. That keeps authentication, tooling, and infrastructure reusable without coupling individual products together.

### Option A — Recommended: GitHub template repository

#### 1. Push the starter to GitHub

Create an empty GitHub repository named `mern-starter`. If your local repository already has a README, `.gitignore`, and commits, do not initialize the remote with duplicate files.

From your existing starter directory:

```bash
git remote -v
```

If no `origin` remote exists, add yours and push:

```bash
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace the placeholder with your actual repository URL. If `origin` already exists, verify it before pushing.

#### 2. Enable template mode

On GitHub, open the repository and go to **Settings → General → Template repository**, then enable the template repository option.

GitHub guide: [Creating a template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

#### 3. Create a project from the template

For each new project:

1. Open the `mern-starter` repository on GitHub.
2. Select **Use this template → Create a new repository**.
3. Enter a new repository name, such as `finance-tracker`.
4. Choose the desired visibility and create the repository.
5. Clone the newly created repository:

```bash
git clone YOUR_NEW_REPOSITORY_URL finance-tracker
cd finance-tracker
pnpm install
```

A GitHub-generated repository has its own Git history, separate from the template repository.

#### 4. Configure the new project

Create local environment files:

```bash
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Generate a unique JWT secret using the macOS command in [Quick start](#quick-start), then configure the database name, API port, frontend API URL, and CORS origin for the new project.

Start MongoDB and the app:

```bash
docker compose up -d
pnpm dev
```

Run the validation checks before starting product development:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Option B — Make a local copy

Use this when you want to create a project without GitHub. Run the commands from a terminal on your development machine.

Replace `finance-tracker` with your desired project name:

```bash
STARTER="$HOME/Development/Personal Projects/mern-starter"
DEST="$HOME/Development/Personal Projects/finance-tracker"

mkdir -p "$DEST"

rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='**/node_modules' \
  --exclude='dist' \
  --exclude='**/dist' \
  --exclude='.next' \
  --exclude='**/.next' \
  --exclude='apps/api/.env' \
  --exclude='apps/web/.env' \
  "$STARTER/" "$DEST/"

cd "$DEST"
git init
git branch -M main
pnpm install
```

This copies the tracked project content while excluding Git history, installed dependencies, build output, and local app environment files. Review the copied files before committing.

Then create fresh environment files and a unique JWT secret as described in [Quick start](#quick-start). Make the first commit only after checking the new project's configuration and tests.

### Customize each project

**Keep the starter generic; put product-specific business logic in the new project.**

Usually reuse:

- Authentication, authorization, and session infrastructure
- Environment validation and database connection setup
- API conventions, error handling, request IDs, and logging
- Frontend API client and authentication context
- Testing, linting, formatting, and build configuration
- Docker-based local database setup

Usually customize:

- Project name, branding, and README
- Database name and environment variables
- Frontend pages, layouts, navigation, and UX
- Domain-specific models, routes, validation, and business logic
- Integrations, background jobs, and deployment configuration

For example, a finance application might add `transactions`, `budgets`, and `reports` modules. An analytics application might add `datasets`, `dashboards`, and `exports`. These are examples of future project-specific modules, not existing starter modules.

### Keep the starter maintained

When you improve reusable infrastructure:

1. Make the change in the canonical starter repository.
2. Add or update tests.
3. Run formatting, lint, type, test, and build checks.
4. Review the diff for secrets and unrelated changes.
5. Commit and push the verified change.
6. Use the updated template for future projects.

Existing projects created from a template do **not** automatically receive future updates. Port improvements into existing projects deliberately and review conflicts rather than overwriting an application with a fresh starter copy.

---

## Development workflow

A recommended workflow for each change:

1. Create a focused branch.
2. Implement the feature in the appropriate app or module.
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

If port `27017` is already in use, stop the conflicting service or update the Compose port mapping and MongoDB URI consistently. The supplied Compose configuration is for local development, not an internet-facing production database.

---

## Troubleshooting

### API fails during startup with an environment validation error

- Confirm `apps/api/.env` exists.
- Check that `MONGODB_URI` is non-empty.
- Ensure `CORS_ORIGIN` is a valid URL.
- Ensure `API_PORT` is between `1` and `65535`.
- Ensure `JWT_ACCESS_SECRET` is set to a unique, non-placeholder value.
- Use an allowed `NODE_ENV` and `LOG_LEVEL` value.

### API cannot connect to MongoDB

- Run `docker compose ps`.
- Inspect logs with `docker compose logs -f mongodb`.
- Check `MONGODB_URI` in `apps/api/.env`.
- Verify port `27017` is available.
- If the API runs inside a container, `127.0.0.1` refers to that container, not the MongoDB container. Use the appropriate Compose service hostname in the container environment.

### Frontend requests fail

- Confirm the API is running on the expected port.
- Check `VITE_API_URL` in `apps/web/.env`.
- Confirm API route prefixes match the implemented routes.
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

- [ ] Authentication, token/session lifecycle, and authorization
- [ ] Database-backed integration tests for registration, login, refresh, logout, and token reuse
- [ ] Password reset and account recovery, if required
- [ ] Rate limiting and abuse prevention on relevant endpoints
- [ ] Strict input validation and safe error responses
- [ ] CORS, HTTPS, cookie settings, and CSRF protections appropriate for the deployed topology
- [ ] Production secrets and environment validation
- [ ] Database indexes, backups, and data-change strategy
- [ ] Logging, monitoring, and alerting without exposing sensitive data
- [ ] Health/readiness checks and graceful shutdown
- [ ] CI checks and a repeatable deployment process
- [ ] Dependency and container security review
- [ ] Deployment smoke tests for critical user flows

Only mark an item complete after verifying it in code and in the deployed environment.

---

## License

Add the license appropriate for your project before distributing or publishing this starter. Until a license is included, do not assume others have permission to reuse or redistribute the code.
