# r/selfhosted

## Title

```
Casual Office — open-source Sheets + Editor that self-host in one Docker container each
```

## Body

```
I've been building two self-hostable web apps:

- **Casual Sheets** — Excel-flavored web spreadsheet, .xlsx round-
  trip, real-time co-edit. v0.0.6.
- **Casual Editor** — Word-flavored web .docx editor, real-time
  co-edit over a stateless Go gateway. Public preview.

Both ship as single-container Docker images. The web app, the
WebSocket gateway, and the static file server all share one port —
no reverse proxy needed for a basic deployment.

**Sheets**:
```

```bash
docker run -p 3000:3000 schnsrw/casual-sheets:latest
```

```
- Multi-arch (amd64 + arm64)
- Optional Redis for room persistence (7-day TTL), set
  CASUAL_REDIS_URL=... to enable. Without Redis, rooms live in
  memory only and drop when everyone disconnects.
- 357 Playwright e2e tests on every push, including a prod-bundle
  Docker suite (single port 3000)

**Editor**:
```

```bash
docker run -p 8080:8080 schnsrw/casual-editor:latest
```

```
- Same shape: web + Go gateway + static SPA in one container.
- Inline host for v0 share-link flow; WOPI / JWT-API integrations
  slot in behind a single Go interface for v1+.

**Why this might matter for self-hosting**:

- Apache-2.0 throughout (editor fork is MIT — eigenpal/docx-editor).
  Trademark + redistribute freely.
- No DB requirement. State lives in memory while a session is
  active; gone when everyone disconnects. Redis is optional and only
  for cross-restart room continuity, not for auth or document
  storage.
- Anonymous rooms identified by URL. Optional password-protected
  rooms with SHA-256 client gate + server-side enforcement (the
  view-only role is checked in the Hocuspocus onAuthenticate hook,
  not just on the client).
- Both projects work over reverse proxies — there's a CO-EDITING.md
  doc covering nginx + caddy + traefik configs for the WebSocket
  upgrade.

Links:
- https://schnsrw.live/         — Casual Office umbrella
- https://sheet.schnsrw.live/   — live Sheets demo
- https://doc.schnsrw.live/     — live Editor demo
- https://github.com/schnsrw/sheets  — Sheets repo
- https://github.com/schnsrw/docx    — Editor repo

Happy to answer questions about the docker-compose shape, reverse-
proxy configs, or the operational gotchas.
```

## Notes

- r/selfhosted has a low tolerance for marketing voice. Lead with the
  `docker run` line; lead with what it requires (or doesn't).
- Pin the Docker pull command in the first comment too — old Reddit
  swallows fenced code in posts sometimes.
- Don't crosspost the same hour to r/opensource — wait at least 48 hours.
