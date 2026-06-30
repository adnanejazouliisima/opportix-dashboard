# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Vite + React 19 (TS) frontend, Express 5 + Socket.io backend, MongoDB persistence, JWT auth. Hosted on Render (auto-deploys on push to `main`). UI is in French — keep French strings when adding labels/toasts.

Two companies: **URBAN NEO** (blue, key `u`) and **GREEN** (green, key `g`). Four poles for users: `activite`, `parc`, `commercial`, `all`.

## Commands

```
npm run dev         # frontend (Vite, proxies /api → :3000)
npm start           # backend only (node server/server.cjs)
npm run dev:full    # both concurrently
npm run build       # tsc + vite build (used by Render)
npx tsc --noEmit    # type-check without emitting (do this after any TS edit)
```

No test suite, no linter. Verify changes with `npx tsc --noEmit` and a manual click-through in `npm run dev`.

The backend needs `MONGODB_URI` (defaults to `mongodb://localhost:27017/opportix` in dev) and in prod `JWT_SECRET` is mandatory (server refuses to start without it). `ALLOWED_ORIGINS` is a comma-separated CORS whitelist (Render's own `RENDER_EXTERNAL_URL` is auto-whitelisted). Rate limits: login `10/15min`, all other `/api/*` `120/min`.

On first boot to an empty DB, [server/server.cjs](server/server.cjs) seeds `users` from [server/users.json](server/users.json) (default password `opportix2025` re-hashed) and the fleet doc from [server/data.json](server/data.json). The `runMigrations()` step promotes the `yannis` account to admin.

## Architecture

Single-page fleet management dashboard ("Opportix") for tracking vehicles, drivers, departures/returns, garage entries, vacations, and follow-ups across two companies (URBAN NEO, GREEN).

**Everything lives in three files** — resist the urge to split them:
- [src/App.tsx](src/App.tsx) — ~1200 lines, all tabs, all CRUD logic, header, notif bell. Style is intentionally terse/compact (single-letter vars, inline styles, multi-statement lines). Match it.
- [src/components.tsx](src/components.tsx) — small reusables: `CrudP` (generic add/edit/delete table used by most tabs), `DiffBlock` (diffusion-page tiles), `AddBox`, `Pill`, `SocBadge`, `StBadge`, `Sel`, `Toast`.
- [server/server.cjs](server/server.cjs) — every API route in one file.

Styling is overwhelmingly **inline** (`style={{...}}`) plus a `<style>` block inside the Dashboard component for hover states and media queries. [src/style.css](src/style.css) is largely legacy — only the CSS variables and font import are still relevant; the `.sidebar` / `.dashboard-layout` classes are dead.

### Data model

The whole app state is one MongoDB doc at `{_key:'fleet'}` in the `data` collection. It's a flat object whose keys are arrays (and one number):

```
u, g            URBAN NEO and GREEN fleet vehicles
ga              garage entries
dep, ret        departs / retours
di              vehicles disponibles
va              vacances chauffeurs
pr              prospects
dpv, rpv        departs/retours à prévoir
suivis          vehicle follow-ups (date, type SUIVI|IMPACTAGE, prix)
vp              number — vehicules perso count for current week (single editable KPI)
```

Frontend mirrors these as `useState` arrays/number with identical names (`urban` for `u`, etc.). Snapshot views (`isHistorical=true`) read from `snapshotData` instead — every render computes `dUrban`, `dDeps`, ... wrappers that pick live vs snapshot. Always use the `dX` aliases inside JSX, not raw state.

### Tabs

`TABS` array in [App.tsx](src/App.tsx) drives the nav:

- **diffusion** — landing page: KPI tiles (TOTAL, URBAN, GREEN, CHAUFFEURS ACTIFS, VP) + six DiffBlock mini-tables.
- **vehicules** — overview of both fleets side-by-side (read-only).
- **flotte** — single-fleet CRUD (Urban or Green sub-tab), with inline edit + Statut toggle ACTIF/IMMO.
- **departs / retours** — CRUD of mission departures/returns. Adding a depart auto-creates the vehicle in fleet if missing, removes it from dispo/garage, and cancels the driver's vacation. If the car was already assigned to a different real driver, it also auto-creates an editable retour for that previous driver (in `ret`, dated like the depart, note "Retour auto …").
- **dispo** — vehicles available pool.
- **garage** — vehicles in workshop; exit-from-garage button puts the vehicle back in dispo.
- **historique** — per-driver history aggregated from current + archived deps/rets (via `/api/history`).
- **vacances** — driver vacations, sorted by closest end date. Adding one releases the driver's car (IMMO/VACANCES + dispo) — immediately if `deb` is today/past, otherwise deferred: `loadDataFromAPI` applies the transition once the start date arrives, using an `applied` flag on the entry so it never replays (dates are `DD/MM`, see `vacStarted()`).
- **suivis** — vehicle check log, split Urban/Green (`suiviTab`) and shown one row per fleet vehicle (chauffeur, immat, tél, km, dernière/prochaine check). A row expands (`suiviOpenIm`) to a rolling 6-month grid (3 past + current + 2 ahead); each check shows its attributed `ch` (the driver who had the car then), editable/clearable inline via `chkEditCh` (uses `edit('suivis',...)`). Inline add-check form (date, chauffeur defaulting to the car's current driver, type SUIVI|IMPACTAGE, km, tél, prix, commentaire). Next check = last check + 1 month; overdue (past today) shown red. Admin-only **Importer Excel** button (`importSuivisExcel`) reads an `.xlsx` (sheets `Suivi`+`Départ`, both treated as checks; a depart counts as a suivi) via a lazy `import('xlsx')`, auto-detects the impactage amount from the Obs column (`…€`), falls back the société to the fleet when blank, and dedups on immat+date+chauffeur. Still drives the header bell (>30 days since last suivi).
- **utilisateurs** — visible only for `admin` / `editeur`; admin manages roles.

### API surface

All routes under `/api/*`. Highlights: `POST /login`, `GET/PUT /data`, `POST/GET /archive` (soft delete — every `del()` POSTs the deleted item here before removing it), `GET /history` (driver aggregator), `GET /export/csv?section=...` (per-section export, optional `?week=` from snapshot), `POST/GET /snapshots` and `/snapshots/:week`, admin-only `GET /audit`, `GET /export/csv/monthly` (weekly KPIs across all snapshots). Every mutating route writes to the `audit` collection.

### Multi-user safety — load-bearing invariants

This is a real-time multi-tenant app. Three fixes in [App.tsx](src/App.tsx) keep concurrent edits from clobbering each other; if you touch save/load logic, preserve them:

1. **Partial saves** — `sv(o)` sends ONLY the keys present in `o`. The server does `$set` partiel. If you send a key whose local state is stale, you overwrite another user's change. Every callsite already passes the changed keys explicitly (`sv({u:nu, dep:n})`); don't reintroduce the "send everything" pattern.
2. **No fleet-vehicle resurrection** — `loadDataFromAPI` syncs `mo`/`le` from departs into existing fleet entries but must NOT re-create deleted vehicles. The previous bug: deleting a vehicle in the Vehicules tab while a stale `dep` still pointed to its plate caused another user's polling reload to recreate it 15s later.
3. **`saveGenRef` polling guard** — a GET that started before a save and resolves after it would otherwise apply old data over fresh local state. `loadDataFromAPI` captures `saveGenRef.current` at fetch start and discards the response if it changed during the fetch.

### Real-time + polling

WebSocket (`io` + `data-changed` event) broadcasts after every PUT. Fallback polling every 15s. `savingRef.current` blocks reloads while a save is in flight on the same client. WebSocket auth via JWT in an `auth` socket event.

### Auth and roles

JWT (`Authorization: Bearer <token>`), three roles: `admin`, `editeur`, `lecteur`. `canEdit` middleware blocks lecteurs from PUTs; `adminOnly` for user management, audit log, archive read, monthly CSV export. Frontend hides write buttons when `displayUser.role==='lecteur'` (also forced when viewing a past week — see `isHistorical`).

Non-admin saves are rejected by "wipe protection" if any array shrinks by >50% — see `protectedKeys` in [server/server.cjs](server/server.cjs).

### Weekly snapshots

`takeSnapshot()` runs after every save and on a Monday 02:00 cron. Each snapshot copies the whole fleet doc keyed by ISO week (`2026-W23`). The Semaine selector bar at the top of every tab switches `viewWeek` — when set, the UI reads from `snapshotData` and is forced read-only.

### Suivis (follow-ups)

Each `suivis` entry: `{id, im, soc, ch, mo, date, type:"SUIVI"|"IMPACTAGE", co, prix, tel?, km?}` (`tel`/`km` are per-check, added in the reworked tab). The header bell shows vehicles whose most recent suivi is >30 days old (or absent). `lastSuiviDate(im, v.vs)` scans `suivis` for the highest date, falling back to legacy `v.vs` on the vehicle itself. Dates are normalized via `normalizeDate()` which accepts `YYYY-MM-DD`, `DD/MM/YYYY`, `DD/MM/YY`, `DD/MM` (current year). Anything that hits this code path must go through `normalizeDate` before being stored or compared.

### Adding a new "section"

The pattern for adding a collection-style tab:
1. Add a state and load it in `loadDataFromAPI`.
2. Add the key to `validKeys` in both `sv()` (frontend) and the `arrayKeys` array in [server/server.cjs](server/server.cjs).
3. Add `{type:[state,setState,'serverKey']}` to the `m` maps in `add()`, `edit()`, `del()`.
4. Add a tab in `TABS` and render with `<CrudP type="..." ... />`.
5. If the section cross-affects other arrays (like `add('deps')` updating fleet + dispo + vacances), add a branch in `add()` and pass all changed arrays in one `sv()` call.

## Notes from the codebase

- `[src/assets/logo.jpeg](src/assets/logo.jpeg)` is the header logo (imported as `logoUrl`).
- `workspace/` and `docs/` are unrelated side artifacts — ignore them.
- `dist/` is the Vite build output; the server serves it statically in prod.
- `patch_app.cjs`, `DOC_SITE.html` are old one-off artifacts; not part of the runtime.
- `.claude/settings.local.json` is gitignored — local-only permission overrides.
