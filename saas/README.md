# Dify SaaS frontend

This Next.js app runs the Dify console and published WebApps from `src/`.
Shared UI, contracts, icons, and the OpenAPI loader come from workspace packages.

From the repository root (Node.js matching the root `engines`, pnpm 12.18.0):

```sh
pnpm install --frozen-lockfile
cp saas/.env.example saas/.env.local
pnpm dev
```

Open http://localhost:3000. `pnpm dev` starts `saas/`; `pnpm dev:web` starts the legacy `web/` frontend and its development proxy.

Configure `CONSOLE_API_URL`, `NEXT_PUBLIC_API_PREFIX`, `NEXT_PUBLIC_PUBLIC_API_PREFIX`, and `NEXT_PUBLIC_SOCKET_URL` in `saas/.env.local` for your Dify backend. Defaults target localhost:5001. The frontend needs a running backend for account bootstrap, sign-in, and application data. It does not start the backend or the boilerplate PGLite database.

```sh
pnpm -C saas check:types
NODE_OPTIONS=--max-old-space-size=4096 nice -n 10 pnpm -C saas build
pnpm -C saas start
```

Development and build scripts prepare the OpenAPI loader automatically. `web/` is retained during the migration; deployment assets still target the legacy frontend.

To run the local backend using the repository's published API image (not the Python source checkout), start Docker and prepare its local configuration once:

```sh
cp api/.env.example api/.env
cp docker/envs/middleware.env.example docker/middleware.env
```

Set a generated `SECRET_KEY` in `api/.env`, then run `pnpm dev:api` from the repository root. The development overlay starts the API at http://localhost:5001, its Celery worker, and middleware. If port 6379 is already occupied, set `EXPOSE_REDIS_PORT=6380` in `docker/middleware.env`; containers still connect to Redis at port 6379. API storage uses a Docker volume. API database migrations run automatically during startup.
