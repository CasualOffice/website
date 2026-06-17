---
title: 'v0.1.0 — WOPI host, JWT auth, admin panel'
product: sheets
version: '0.1.0'
date: 2026-05-24
summary: 'The first version-bumped release. Real persistence via WOPI (memory · local · S3 · Postgres), JWT-secured access with role + permission + feature claims, a runtime admin panel for branding · storage · networking · room limits · auth providers · webhooks, OCI image labels + rolling-tag scheme, complex pivot cache passthrough (audit 54/54 pristine), and a full self-hosting + customization docs section on casualoffice.org.'
repoUrl: https://github.com/CasualOffice/sheets/releases/tag/v0.1.0
---

The first version-bumped release. v0.0.x was the "build a real editor
end-to-end" arc; **v0.1.0 is the first release that earns its
self-host story**.

v1.0.0 is **not** this release. v1.0.0 means semver-bound API
stability; the WOPI host contract + admin-panel config schema are
net-new surfaces that will iterate. v1.0.0 lands when those have
shipped through at least one minor (v0.2.0). v0.1.0 says "real
production-grade release with substantial new capability" without
committing to the v1 API freeze yet.

## What ships

### Real persistence — WOPI host integration

The new `host.Integration` interface plus four concrete backends
selected via `CASUAL_STORAGE`:

- **`memory`** (default) — in-process; preserves the v0.0.x
  "no DB" shape.
- **`local`** — filesystem under `CASUAL_LOCAL_PATH`; bind-mount
  `-v ./workbooks:/data`.
- **`s3`** — S3-compatible (AWS · MinIO · Cloudflare R2 · Backblaze B2).
- **`postgres`** — single `casual_workbooks` table with `bytea`
  payload; schema auto-created on first connect.

Three WOPI endpoints land on top:

- `GET /wopi/files/:id` — CheckFileInfo
- `GET /wopi/files/:id/contents` — GetFile
- `POST /wopi/files/:id/contents` — PutFile (with `X-WOPI-ItemVersion`
  honoured as If-Match → 409 on mismatch)

Backwards-compatible: when `CASUAL_STORAGE` is unset, the in-memory
default keeps every v0.0.x deployment working unchanged.

### JWT-secured access

When `CASUAL_JWT_SECRET` is set, every `/wopi/files/*` request must
carry a signed JWT. The claim model:

- **`sub`** — username, email, or stable user id (surfaces as WOPI
  `UserId`).
- **`file_id`** — the single file this token authorises (URL `:id`
  must match — tokens can't lateral-move to other files).
- **`role`** — `admin` · `editor` · `commenter` · `viewer`. Drives
  the default permission map.
- **`permissions`** — per-flag override: `read` · `write` ·
  `comment` · `download` · `share` · `admin`.
- **`features`** — feature toggles consumed by the client UI:
  `charts` · `pivots` · `conditionalFormatting` · `sharing` ·
  `exportFiles` · `collab` · `ai`.
- **`password_required`** — legacy `x-room-password` gate also
  applies on top.
- **`display_name`** — labels presence + cursor markers.
- **`aud`**, **`iss`**, **`exp`**, **`iat`** — standard JWT claims.

Plus:

- `POST /api/tokens` — admin-gated mint endpoint.
- `GET /api/me` — self-introspection (resolved role + permissions +
  features).
- CheckFileInfo response surfaces the resolved claims so the client
  UI doesn't have to decode the JWT itself.

### Admin panel

`/admin` (gated by `CASUAL_ADMIN_USERNAME` + `CASUAL_ADMIN_PASSWORD`
env). Seven sections, all backed by a single JSON config on disk
that's reloaded on every read:

- **Branding** — app name · accent colour · logo URL
- **Base path** — reverse-proxy sub-path mount with normalisation
- **Storage** — backend dropdown + per-backend creds + test-connection
- **Networking** — public origin · CORS allowlist · trust proxy ·
  HSTS max-age
- **Room limits** — max rooms · max file size · room TTL · max users
  per room
- **Auth providers** — JWT (live) + OIDC + SAML (stubs for v0.2)
- **Webhooks** — array of subscriptions with HMAC signing

Login mints a short-lived admin-role JWT for the session. Secrets in
the config are redacted on read (`***`); the panel preserves prior
values when the sentinel is sent back unchanged.

### Webhook dispatcher

HTTP POSTs to operator-configured URLs when server-side events fire.
HMAC-SHA256 signs the JSON body via `X-Casual-Signature: sha256=<hex>`.

Events: `room.created` · `room.dropped` · `file.uploaded` ·
`file.saved` · `file.deleted` · `user.joined` · `user.left` ·
`admin.login` · `admin.login_failed`.

Retry: single retry after 5 s on failure (v0.2 ships a proper queue
with exponential back-off + dead-letter).

### Complex pivot cache passthrough

xlsx files authored with pivot tables now round-trip with their
cache + table OOXML preserved — Excel re-recognises the file as
having pivots after a save through our pipeline. Same byte-passthrough
pattern as VBA, with the additional OOXML surgery for rel
renumbering + `<pivotCaches>` injection.

**Audit: 46 / 46 → 54 / 54 probes pristine.**

### Docker labeling + rolling tags

- OCI `org.opencontainers.image.*` labels baked into every image
  (title · description · url · source · documentation · vendor ·
  authors · licenses · version · revision · created).
- Rolling-tag scheme: `0.1.0` → `0.1` → `0` → `latest`. Pin
  `:0.1` for patch updates only.
- SBOM + provenance attestations in the OCI manifest.

### Full self-hosting + customization docs

Eleven new doc pages on casualoffice.org/docs/sheets/:

- Self-hosting: overview · reverse-proxy recipes (nginx/Caddy/Traefik) ·
  TLS · CORS · scaling · backups.
- Customization: overview · auth (JWT claim model + role matrix +
  token issuance walkthrough) · webhooks (event catalogue + signature
  verification in Node/Python/Go).
- ENV.md — canonical env-var reference.

### Mobile lane (back-ported in this release)

The viewer + light-editor surface that landed on `main` post-v0.0.6:

- Touch-pan driver synthesizes wheel events from `pointermove` so
  the canvas scrolls on mobile (Univer 0.24 has no native touch-pan).
- Compact chrome at ≤ 720 px / ≤ 480 px.
- Sticky bottom action bar for thumb-reachable formatting.
- Formula bar input pinned to 16 px font (iOS focus-zoom guard).

### Test coverage

Unit tests: 8 (pre-v0.1) → **60**. New suites:

- 9 host-integration contract tests (MemoryHost + LocalHost)
- 7 WOPI-route tests via `fastify.inject()`
- 21 auth tests (role permissions matrix · token issuance · route
  enforcement · CheckFileInfo response shape · back-compat)
- 15 admin tests (config store · routes · webhook dispatcher with
  HMAC signature verification)

E2E suite untouched at 357 + the home + mobile + audit specs.

## What's not in v0.1.0 (deferred to v0.2 / later)

- OIDC + SAML backend implementations (UI forms ship in v0.1; the
  schema persists so v0.2 ships enforcement without breaking on-disk
  configs).
- Multiple admin accounts. v0.1 uses single `CASUAL_ADMIN_USERNAME`
  + `CASUAL_ADMIN_PASSWORD`.
- Horizontal scale-out — works for stateless paths today; the
  WebSocket collab plane needs sticky-session + cross-replica
  awareness backplane which is documented as v0.2 lane in
  `docs/sheets/self-hosting-scaling/`.
- Self-service room invites with email. v0.1 stays anonymous-by-URL
  (or JWT-by-URL when auth is enabled).
- AI / LLM features. Univer's command bus is extensible; left as a
  v0.3+ slot.

## Try it

```bash
docker run -p 3000:3000 casualoffice/sheets:0.1
# → open http://localhost:3000
```

With persistence + admin panel:

```yaml
services:
  app:
    image: casualoffice/sheets:0.1
    ports: ['3000:3000']
    environment:
      REDIS_URL: redis://redis:6379
      CASUAL_STORAGE: local
      CASUAL_LOCAL_PATH: /data/workbooks
      CASUAL_ADMIN_USERNAME: admin
      CASUAL_ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      CASUAL_JWT_SECRET: ${JWT_SECRET}
    volumes:
      - data:/data
    depends_on:
      redis: { condition: service_healthy }
  redis:
    image: redis:7.4-alpine
    command: ['redis-server', '--appendonly', 'yes']
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      retries: 5
volumes:
  data:
```

Full docs: [casualoffice.org/docs/sheets/self-hosting/](https://casualoffice.org/docs/sheets/self-hosting/).
