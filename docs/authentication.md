# Authentication and authorization

## Implemented API endpoints

All endpoints are mounted under `/api/v1/auth`.

| Method | Endpoint    | Purpose                                                 |
| ------ | ----------- | ------------------------------------------------------- |
| `POST` | `/register` | Create an account and start a session                   |
| `POST` | `/login`    | Verify credentials and start a session                  |
| `POST` | `/refresh`  | Rotate the refresh token and issue a new access token   |
| `POST` | `/logout`   | Revoke the refresh session and clear its cookie         |
| `GET`  | `/me`       | Return the current user; requires a bearer access token |

Registration accepts `name`, `email`, and `password`. New passwords must contain at least 12 characters. Email addresses are trimmed and normalized to lowercase.

## Token and cookie behavior

- Access tokens are JWTs with a 15-minute lifetime and are returned in the response body.
- The frontend keeps the access token in memory; it is not persisted in local storage.
- Refresh tokens are random opaque values stored as SHA-256 hashes in MongoDB.
- The refresh token is delivered through an `HttpOnly`, `SameSite=Lax` cookie scoped to `/api/v1/auth`.
- Refresh requests rotate the token. Reuse of the immediately previous token revokes the session.
- Sessions expire after seven days and have a MongoDB TTL index for cleanup.
- Logout revokes the refresh session. An already issued access token can remain valid until its 15-minute expiry.

The cookie defaults assume a same-site deployment. If the frontend and API are deployed on different sites, review cookie `SameSite`/`Secure` settings and implement an appropriate CSRF defense before changing them.

## Environment

Set `JWT_ACCESS_SECRET` in `apps/api/.env` to a unique random value. Generate one locally with:

```bash
openssl rand -base64 48
```

Do not use the local development fallback in production. Production startup rejects a missing secret and the documented placeholder. Keep secrets out of Git and logs.

## Authorization middleware

`requireAuth` verifies bearer access tokens and places the principal in `res.locals.authUser`. `requireRole("admin")` can be applied to routes that require a specific role. Do not trust a role or user ID supplied in a request body.

## Remaining production work

Before production use, add integration tests against an isolated MongoDB database, email verification and password reset if required, session management/revocation policy, deployment-specific CSRF and cookie review, monitoring, and a security review. Existing schema tests do not replace end-to-end authentication tests.
