# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

RabDash Mobile is a React Native (Expo SDK 50) app for a city's rabies-control / animal-control field program (assets reference CVO — City Veterinary Office — and PCHRD/PGC). Field staff and veterinarians submit forms (vaccination, neutering, rabies samples, budget, weather, schedule, IEC, animal control, rabies exposure); a CVO role reviews submissions. It's a two-part repo:

- **Frontend** — root directory: Expo/React Native app.
- **Backend** — `backend/`: standalone Express + MySQL API, run independently of the frontend. **As of Sep 2026, this is the deploy source**: Render's `Rabdash-Mobile-Backend` service builds and deploys directly from this repo (Root Directory `backend`, Build Command `npm ci`, Start Command `node app.js`), auto-deploying on every push to `main` that touches `backend/**`. Changes to `backend/app.js` here go live automatically — no manual copy step. (Before Sep 2026, deploys came from a separate hand-copied repo, `GianRCabrera/Rabdash-Mobile-Backend` on GitHub — that repo is no longer the deploy source and any references to it elsewhere are historical.)

There is no monorepo tooling (no workspaces) — the two `package.json` files are installed and run separately.

## Commands

```bash
# Frontend (run from repo root)
npm install
npx expo start          # or: npm start
npx expo start --android
npx expo start --ios
npx expo start --web

# Backend (run from backend/)
cd backend && npm install
npm start                # nodemon app.js, listens on PORT env var or 3000
npm run migrate          # apply pending backend/migrations/*.sql — see Architecture below
```

There are no lint or typecheck scripts configured in either `package.json`. Both halves have a test suite now: `npm test` at the repo root for the frontend (Jest + jest-expo + React Native Testing Library, ~17 tests) and `cd backend && npm test` for the backend (~37 tests, ~1-3s, no real database involved — see the Architecture section below for how). Both run automatically via GitHub Actions on push/PR (`.github/workflows/frontend-tests.yml`, `backend-tests.yml`).

The frontend's `EXPO_PUBLIC_URL` (root `.env`) already points at the hosted backend (`https://rabdash-mobile-backend.onrender.com`), so the local Expo app works against production data without running `backend/` locally. Only run the backend locally when changing backend code — point `.env` at `http://<your-LAN-IP>:3000` (see the commented-out alternatives already in `.env`) since a physical device/simulator on Expo Go can't reach `localhost`.

## Architecture

**Frontend is a flat file tree, not `src/`-organized.** Every screen is a top-level `.js`/`.tsx` file at repo root (e.g. `LoginPage.js`, `Neuter_Form.js`, `VetMenu.js`). Styling lives in `styles/*.js` as StyleSheet objects imported by screens (grouped by kind: `forms.js`, `login.js`, `mainmenu.js`, `Archive.js`, etc.), not colocated with components.

**Navigation and route list are centralized in `App.tsx`** using `@react-navigation/stack`. `RootStackParamList` there is the single source of truth for every screen name — when adding a screen, register it both in the type and in the `<Stack.Screen>` list.

**Auth state is a plain React Context reducer (`AuthContext.js`)**, not persisted storage — `state.user` (`email`, `position`) resets on app reload. `position` is how role-gating (regular field user vs. vet vs. CVO) is done in the UI.

**Role/position model is provisional (Sep 2026), expect it to change.** Three `position` values exist: `Private Veterinarian`, `CVO`, `RabDash`. Public self-registration (`RegisterPage.js` → `/registerotp` → `/register`) offers a choice between `Private Veterinarian` and `CVO` (`SELF_REGISTERABLE_POSITIONS` in both `RegisterPage.js` and `backend/app.js` — keep these two lists in sync, the frontend one is just the picker, the backend one is the actual authority and validates independently). `RabDash` is **not** self-registerable; it's still provisioned some other way outside this app. For data access, only `RabDash` is currently a full reviewer (sees/edits/deletes every user's submissions via `REVIEWER_POSITIONS = ['RabDash']` and the `requireReviewer` middleware in `backend/app.js`) — `CVO` is intentionally scoped identically to `Private Veterinarian` (own submissions only) until a proper elevated-CVO tier is designed, mirroring how the companion website currently handles this same distinction. `CVO` still gets the same frontend navigation/menu experience as `RabDash` (e.g. both land on `VetMenu`) — only the *data-fetching* endpoint choice (`get*Forms` vs `get*FormsCVO`) differs between them now. Don't be misled by any leftover `requireCVO`/`CVO_POSITIONS` naming in comments or old commit messages — those were renamed to `requireReviewer`/`REVIEWER_POSITIONS` specifically because "requires CVO" would now be a lie.

**Repeating form/archive/version pattern**: most form domains (Neuter, Rabies Field Vacc, Rabies Sample Information, Rabies Exposure) have up to three related screens — a base form, an `*Archive`/`_archive` read-only history view, and in several cases a `2`-suffixed variant (`Neuter_Form2.js`, `Rabies_Field_Vacc_Form2.js`, `Rabies_Sample_Information_Form2.js`, `Rabies_Exposure_Form2.js`). Check which variant is actually wired into current navigation in `App.tsx` before assuming a file is the active one — some may be superseded but not deleted.

**`index.js` at repo root is dead code.** Expo's actual entry point (per `package.json` `main`) is `node_modules/expo/AppEntry.js`, which imports `App.tsx` directly via `registerRootComponent`. `index.js`'s `AppRegistry.registerComponent` (a bare-React-Native pattern) is never invoked.

**Backend has been split out of `app.js` (Oct 2026); `app.js` itself is now ~140 lines** (down from ~1278), holding just Express/session/CORS setup, `/Position`, and the `app.use(require('./routes/...'))` mounts. Shared infrastructure every route depends on: `backend/db.js` (pool/webPool/queryDatabase), `backend/constants.js` (REVIEWER_POSITIONS/SELF_REGISTERABLE_POSITIONS), `backend/middleware.js` (requireAuth/requireReviewer/authLimiter/loginAccountLimiter), `backend/lib/` (`passwords.js`, `mailer.js`, `otp.js`, `formHelpers.js` — the create*Handler factories, authorizeFormMutation, etc.). Routes live in `backend/routes/*.js`: `reportTemplates.js` (the downloadable `.xlsx` routes), `auth.js` (register/login/logout/userProfile/OTP/password-reset, plus `registerUser`/`logInUser`/`findUserPool` — route-specific business logic that moved with its routes rather than into the generic infrastructure above), and `forms.js` (all 9 form types' `submit*`/`edit*`/`get*`/`delete*` routes). `routes/users/` (empty) and `routes/axiosService.js` (a small unused axios-instance helper) predate this effort and aren't part of it. When adding a new endpoint, put it in the relevant `routes/*.js` file now, not back in `app.js`.

**Two separate MySQL pools** are created in `backend/app.js`: `pool` (the mobile app's own DB, env `DB_*`) and `webPool` (a companion website's DB, env `WEB_DB_*`) — some `get*FormsCVO` endpoints read from the web DB for CVO-side review views. Both call `handleDisconnect()` at startup, which retries the initial connection and re-wires a reconnect handler on `'error'`.

**Schema changes to the mobile app's own database go through `backend/migrations/`** (Oct 2026 — before this, every change was a one-off manual SQL statement run by hand via phpMyAdmin, with nothing capturing what had been applied where). Numbered `.sql` files, applied in order by `cd backend && npm run migrate` (`backend/scripts/migrate.js`), which tracks what's already run in a `schema_migrations` table it creates on first use. Write migrations idempotently (`CREATE TABLE IF NOT EXISTS`, etc.) — MySQL DDL isn't transactional, so there's no automatic rollback if one fails partway through. This only targets the mobile app's own database (`DB_*`); the companion website's database (`WEB_DB_*`) is a separate Laravel app with its own migration system already and shouldn't be touched by this tooling.

**Session secret reads from `SESSION_SECRET`** (`backend/app.js`), falling back to a per-boot `crypto.randomBytes(64)` value (which invalidates all sessions on restart) only if that env var is unset. The `JWT_SECRET` env var that used to sit alongside it was dead — never referenced anywhere in `app.js` — and has been removed from `backend/.env.example`.

**Password hashing is inconsistent between bcrypt and argon2** — both libraries are imported and used in `backend/app.js`; check which one a given route (`/register`, `/login`, `/reset-password`, etc.) uses before assuming a single hashing scheme.

**Downloadable report templates**: `backend/assets/templates/*.xlsx` are served as static files via dedicated `app.get('/<Name>_Report_form.xlsx', ...)` routes and consumed by `DownloadableForms.js`/`DownloadableFormsPrivVet.js` on the frontend (via `expo-document-picker`/`expo-file-system`/`expo-sharing`).

**Backend tests (`backend/__tests__/`, run with `cd backend && npm test`)** use `supertest` against the real `app.js` with `mysql2` and `express-mysql-session` replaced by manual Jest mocks (`backend/__mocks__/`) — no real database involved, tests run in ~1s. This only works because `app.js` exports `app` via `module.exports = app` and guards its `startServer(PORT)` call behind `if (require.main === module)`, so requiring it from a test doesn't also bind a real port. `__tests__/helpers.js` provides `loadApp()` (mocks + fresh `require('../app')` after `jest.resetModules()`) and `mockQueryResult(pool, sqlFragment, rows)` (routes a fake pool's query results by matching a substring of the SQL, since there's no real SQL engine to run against — `rows` can be a function of the query's parameter values for per-call variation, e.g. returning a different user row per login email). Call `loadApp()` once per file (`beforeAll`, not `beforeEach`) — re-requiring `app.js` repeatedly in one file leaks enough timers (rate limiter, etc.) to eventually hang a later test; `npm test` also runs with `--forceExit` as a safety net for the same underlying reason. Coverage so far (8 files, 37 tests): login edge cases, the IDOR ownership/reviewer-override fix, per-user list-scoping (including that CVO is deliberately *not* treated as a reviewer), OTP purpose-isolation and attempt-limiting, required-field validation on submit/edit endpoints, both pagination factories (CVO-only and role-branching), and the account-aware rate limiter — not the whole API (still ~40+ endpoints with no direct test coverage, mostly relying on shared factories already covered indirectly).

## Known issues to be aware of

- **`.env` and `backend/.env` were committed to git for a long time** on a public GitHub repo (JWT secret, DB credentials, SMTP credentials). They're now `.gitignore`d and untracked, and the SMTP credentials that used to be hardcoded directly in `app.js` were moved to `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` env vars. As of Aug 2026 the leaked values have been rotated on both local files and Render, so the git-history-exposed ones are dead — but don't reintroduce hardcoded secrets in `app.js`; use `.env.example`/`backend/.env.example` as the template for what variables exist.
- **Hostinger's Remote MySQL access control is per-database and host-restricted in principle**, but as of Oct 2026 all three databases (`u832731723_rabdash_mobile`, `u832731723_diwa`, `u832731723_diwa_legacy`) are set to `%` (Any Host) — confirmed not the blocker on local dev access. If `ER_ACCESS_DENIED_ERROR` shows up again (local dev or Render), check credentials in `.env` first (`(using password: NO)` in the error means the env var is empty/misnamed, not a host-access problem) before assuming host restriction — that's what actually cost time in Oct 2026. Render's free tier has no fixed outbound IP anyway, so `%` is the only practical setting there regardless.
- **RESOLVED (Sep 2026): deploying used to require pushing to a separate hand-copied repo**, `GianRCabrera/Rabdash-Mobile-Backend` on GitHub (which also had `node_modules/` genuinely tracked, not just untracked-but-gitignored, making `npm install`/`npm audit fix` there produce huge unrelated diffs). Render's `Rabdash-Mobile-Backend` service was migrated to build directly from this repo's `backend/` folder instead — see Project overview above. The old repo is no longer the deploy source; don't resurrect the manual-copy workflow.
- If Render deploys start failing with "we don't have access to your repo" (e.g. after the repo transfers to a new GitHub owner, as happened once already), fixing it requires two separate steps: re-authorizing the Render GitHub App for the new owner at `github.com/apps/render/installations/new`, **and** re-selecting the repo via the "Edit" button next to Source on the Render service's Settings → Build page — the GitHub App permission and Render's own cached repo link are independent and both need refreshing.
- `verifyPassword()` in `app.js` only recognizes `$2a$`/`$2b$`/`$2y$` (bcrypt) and `$argon2i$`/`$argon2id$` (argon2) hash prefixes; a `users` row with anything else (e.g. a plaintext string inserted directly via SQL rather than through `/register`) now fails closed as a normal invalid-login rather than throwing. Checked directly: all 45 rows in the mobile DB's `users` table (Sep 2026) and all 72 rows in the web DB's `users` table (Oct 2026) have a recognized bcrypt hash — none argon2, none unrecognized.
- Frontend dependency versions were checked against what Expo SDK 50 expects (`npx expo install --check`, Sep 2026) and are current — no drift found.
