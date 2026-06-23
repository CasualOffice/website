---
title: 'v0.3.3 — personal mode on root-owned bind mounts'
product: sheets
version: '0.3.3'
date: 2026-06-20
summary: 'Patch release. Personal mode crashed with SqliteError: unable to open database file (SQLITE_CANTOPEN) when /data was a bind mount to a root-owned host directory. The image chowned /data at build time, but a bind mount keeps its host ownership at runtime, so the node user could not create users.db. The container now starts as root, an entrypoint chowns the data dir to node, then drops to node via su-exec before launching the server — named volumes, fresh bind mounts, and --user overrides all still work, and the server still runs unprivileged.'
repoUrl: https://github.com/CasualOffice/sheets/releases/tag/v0.3.3
---

The companion fix to [v0.3.1](/changelog/sheets-v031/) — that one
handled **named volumes**; this one handles **bind mounts**.

## Fixed — `SQLITE_CANTOPEN` on root-owned bind mounts (#57)

`v0.3.1` chowned `/data` to `node` at image build time. But a bind
mount (`-v /srv/casual:/data`) keeps its **host** ownership at
runtime, so if the host directory is root-owned the `node` user still
can't create `users.db` — personal mode crashes on boot again.

The container now:

1. starts as **root**,
2. an entrypoint **chowns** the data dir (`CASUAL_LOCAL_PATH`, default
   `/data`) to `node`,
3. drops to `node` via **`su-exec`** before launching the server.

Named volumes, fresh bind mounts, and explicit `--user` overrides all
still work; the server still runs unprivileged. With this landed,
**v0.3.x self-hosts cleanly across every storage shape.**
