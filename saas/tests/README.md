# SaaS test boundaries

Vitest projects are disjoint: `unit` (Node), `legacy` (Dify compatibility using happy-dom), `browser` (existing browser specs), and `ui` (ported boilerplate browser tests). `pnpm migration:check` reconciles Vitest discovery against all source test files without executing the suite. `__tests__` directories are not excluded from discovery.

Playwright starts Next on port 3008 and talks to a Dify backend through `SAAS_E2E_API_URL` (default localhost:5001). It does not start PGlite, run counter migrations, create accounts, log in using personal credentials, or reset a backend database. Current E2E smoke scenarios are strictly read-only and anonymous. Use a dedicated backend and explicit fixtures before adding authenticated or mutating journeys.

Run from the repository root:

```sh
pnpm -C saas migration:check
pnpm -C saas test --project unit --maxWorkers=2 src/utils/Helpers.test.ts
pnpm -C saas test --project legacy --maxWorkers=2 src/features/home/__tests__/template-card.spec.tsx
pnpm -C saas test:e2e --project chromium --workers=2
```

Set `SAAS_E2E_CHANNEL=chrome` to use an installed Chrome for local checks. `SAAS_E2E_REUSE_SERVER=true` explicitly permits reuse of the test port; the default starts an isolated server. Production CI builds first and runs `start`. The API URL must be reachable from both the Next server and browser. No E2E result here proves authenticated workspace switching, model-backed execution, or data persistence.
