---
title: 'v0.3.2 — Docker refresh, Univer 0.25, CasualOffice rebrand'
product: sheets
version: '0.3.2'
date: 2026-06-20
summary: 'Docker app refresh — rebuilds and republishes the image so docker pull casualoffice/sheets:latest works again, and folds in the editor + branding work since 0.3.1. The Univer fork is upgraded 0.24 → 0.25 under the hood. The project is renamed to the CasualOffice org: Docker image casualoffice/sheets, npm scope @casualoffice/*, in-app URLs, and the sheet.casualoffice.org subdomain. Adds an Excel active-cell crosshair highlight and a zen full-screen cell editor.'
repoUrl: https://github.com/CasualOffice/sheets/releases/tag/v0.3.2
---

A maintenance + branding release.

## Added

- **Excel active-cell crosshair highlight** and a **zen (full-screen)
  cell editor**, wired from Univer OSS via context-menu triggers.

## Changed

- **Univer fork upgraded 0.24 → 0.25** under the hood.
- **Renamed to the CasualOffice org** — Docker image
  `casualoffice/sheets`, npm scope `@casualoffice/*`, in-app URLs, and
  the `sheet.casualoffice.org` subdomain.

## Fixed

- Republished the Docker image so the `latest` / `0.3` / `0` tags pull
  cleanly (#57).
- Generous CI timeouts on the co-edit compaction e2e to stop flaky
  failures.

## Try it

```bash
docker pull casualoffice/sheets:0.3
docker run -p 3000:3000 casualoffice/sheets:0.3
```
