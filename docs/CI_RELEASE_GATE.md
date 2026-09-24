# Frontend CI and Release Gate

## Branch policy

- Work from short-lived feature or fix branches based on current `main`.
- `main` is the only Vercel Production branch.
- All non-`main` Vercel Git deployments are disabled in `vercel.json`.
- Merge to `main` only through a pull request after both repositories'
  aggregate gates are green.

## Environment policy

| Context | Branch/source | Backend | Supabase |
|---|---|---|---|
| Production | Vercel `main` | Production Render service | Production project |
| Local development | Short-lived local branch | Local backend | Development project |
| GitHub Actions | Any checked branch | CI fixtures and pinned backend evidence | CI placeholders |

For local development, copy `.env.development.example` to
`.env.development.local` and fill it with the development Supabase URL and
publishable/anon key. This file is ignored by Git. Do not copy Production
credentials into a development environment file.

Vercel Production variables must target Production only. Preview deployments
are disabled; use local development for workflows that read or mutate
development business data.

## Required repository secret

Add a fine-grained GitHub token as:

`SCS_BACKEND_READ_TOKEN`

Minimum access:

- repository: `scs-ph/scs-be`;
- contents: read;
- checks/statuses: read.

The workflow fails closed when this secret is absent or cannot read the pinned
private backend commit.

## Backend pin

`backend-version.json` records:

- backend repository;
- backend ref that must still resolve to the pinned commit;
- exact tested backend commit SHA;
- deterministic OpenAPI SHA-256.

`frontend-backend-contract` fails if the configured ref has advanced beyond the
pinned SHA. Frontend production promotion therefore proves that the exact
backend commit tested by the frontend is also the current backend deployment
target, not merely an older commit that passed previously.

## Required checks

- `frontend-quality`
- `frontend-browser-smoke`
- `frontend-backend-contract`
- `frontend-release-gate`

Vercel Deployment Checks require `frontend-release-gate` before assigning the
production alias. A stale backend pin or failed `backend-release-gate` causes
`frontend-backend-contract` to fail and therefore blocks frontend production
promotion.

Configure Render to require the backend repository's `backend-release-gate`
using **After CI Checks Pass**.

## Production build enforcement

`next.config.js` no longer bypasses TypeScript or ESLint failures. This is
intentional: local, GitHub Actions, and Vercel production builds now fail on
the same type or lint errors. The feature branch resolves the errors that
were present when enforcement was enabled, and `frontend-quality` proves
typecheck, lint, tests, and the production build together.

## User-visible compatibility note

The type-safety fix changes CDR and Customer Return PDFs to read the current
`customer.address` field. Those PDFs previously used the removed
`building_address` property and therefore rendered a blank address line.

## Updating the backend pin

1. Merge and verify the backend change on backend `main`.
2. Record the exact backend `main` commit SHA.
3. Generate the deterministic OpenAPI SHA-256 from that commit.
4. Update `backend-version.json` on the frontend feature branch.
5. Run all frontend checks.
6. Review before the frontend `main` merge.

For a frontend-only change, no new backend commit is required. Leave the pin
unchanged when it still equals backend `main`; refresh it when backend `main`
has advanced independently.
