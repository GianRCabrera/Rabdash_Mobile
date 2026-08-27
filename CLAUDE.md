# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

RabDash Mobile is a React Native (Expo SDK 50) app for a city's rabies-control / animal-control field program (assets reference CVO — City Veterinary Office — and PCHRD/PGC). Field staff and veterinarians submit forms (vaccination, neutering, rabies samples, budget, weather, schedule, IEC, animal control, rabies exposure); a CVO role reviews submissions. It's a two-part repo:

- **Frontend** — root directory: Expo/React Native app.
- **Backend** — `backend/`: standalone Express + MySQL API, run independently of the frontend. **This folder is a mirror, not the deploy source**: the hosted backend at `rabdash-mobile-backend.onrender.com` is connected to a separate private repo, `GianRCabrera/Rabdash-Mobile-Backend`, not this repo. Changes to `backend/app.js` here have zero effect on production until manually copied/pushed to that other repo too — there's no CI or sync automation between them.

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
```

There are no lint, typecheck, or test scripts configured in either `package.json` (no test runner is wired up despite `jest`/`react-test-renderer` being present as devDependencies).

The frontend's `EXPO_PUBLIC_URL` (root `.env`) already points at the hosted backend (`https://rabdash-mobile-backend.onrender.com`), so the local Expo app works against production data without running `backend/` locally. Only run the backend locally when changing backend code — point `.env` at `http://<your-LAN-IP>:3000` (see the commented-out alternatives already in `.env`) since a physical device/simulator on Expo Go can't reach `localhost`.

## Architecture

**Frontend is a flat file tree, not `src/`-organized.** Every screen is a top-level `.js`/`.tsx` file at repo root (e.g. `LoginPage.js`, `Neuter_Form.js`, `VetMenu.js`). Styling lives in `styles/*.js` as StyleSheet objects imported by screens (grouped by kind: `forms.js`, `login.js`, `mainmenu.js`, `Archive.js`, etc.), not colocated with components.

**Navigation and route list are centralized in `App.tsx`** using `@react-navigation/stack`. `RootStackParamList` there is the single source of truth for every screen name — when adding a screen, register it both in the type and in the `<Stack.Screen>` list.

**Auth state is a plain React Context reducer (`AuthContext.js`)**, not persisted storage — `state.user` (`email`, `position`) resets on app reload. `position` is how role-gating (regular field user vs. vet vs. CVO) is done in the UI.

**Repeating form/archive/version pattern**: most form domains (Neuter, Rabies Field Vacc, Rabies Sample Information, Rabies Exposure) have up to three related screens — a base form, an `*Archive`/`_archive` read-only history view, and in several cases a `2`-suffixed variant (`Neuter_Form2.js`, `Rabies_Field_Vacc_Form2.js`, `Rabies_Sample_Information_Form2.js`, `Rabies_Exposure_Form2.js`). Check which variant is actually wired into current navigation in `App.tsx` before assuming a file is the active one — some may be superseded but not deleted.

**`index.js` at repo root is dead code.** Expo's actual entry point (per `package.json` `main`) is `node_modules/expo/AppEntry.js`, which imports `App.tsx` directly via `registerRootComponent`. `index.js`'s `AppRegistry.registerComponent` (a bare-React-Native pattern) is never invoked.

**Backend is a single-file monolith**: nearly all routes (auth, OTP, and one `submit*`/`edit*`/`get*` triplet per form type) are defined inline in `backend/app.js` (~2,000 lines), not split into route modules — the `backend/routes/` folder exists but is effectively unused (`routes/users/` is empty; `routes/axiosService.js` is a small unused axios-instance helper). When adding an endpoint, the existing convention is to append another `app.get`/`app.post` handler directly in `app.js` near its form-type siblings.

**Two separate MySQL pools** are created in `backend/app.js`: `pool` (the mobile app's own DB, env `DB_*`) and `webPool` (a companion website's DB, env `WEB_DB_*`) — some `get*FormsCVO` endpoints read from the web DB for CVO-side review views. Both call `handleDisconnect()` at startup, which retries the initial connection and re-wires a reconnect handler on `'error'`.

**Session secret is regenerated on every backend boot** (`crypto.randomBytes(64)` in `app.js`, not read from `JWT_SECRET`) — existing sessions/cookies do not survive a backend restart even though a persistent `JWT_SECRET` is also defined in `backend/.env` (unclear if/where it's actually used vs. the ad hoc session secret).

**Password hashing is inconsistent between bcrypt and argon2** — both libraries are imported and used in `backend/app.js`; check which one a given route (`/register`, `/login`, `/reset-password`, etc.) uses before assuming a single hashing scheme.

**Downloadable report templates**: `backend/assets/templates/*.xlsx` are served as static files via dedicated `app.get('/<Name>_Report_form.xlsx', ...)` routes and consumed by `DownloadableForms.js`/`DownloadableFormsPrivVet.js` on the frontend (via `expo-document-picker`/`expo-file-system`/`expo-sharing`).

## Known issues to be aware of

- **`.env` and `backend/.env` were committed to git for a long time** on a public GitHub repo (JWT secret, DB credentials, SMTP credentials). They're now `.gitignore`d and untracked, and the SMTP credentials that used to be hardcoded directly in `app.js` were moved to `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` env vars. As of Aug 2026 the leaked values have been rotated on both local files and Render, so the git-history-exposed ones are dead — but don't reintroduce hardcoded secrets in `app.js`; use `.env.example`/`backend/.env.example` as the template for what variables exist.
- **Hostinger's Remote MySQL access control is per-database and host-restricted.** After any DB/server migration, connections (local dev and Render both) fail with `ER_ACCESS_DENIED_ERROR` — even with correct credentials — until the connecting host is added under hPanel → Databases → Remote MySQL. Render's free tier has no fixed outbound IP, so `%` (Any Host) is the only practical setting there.
- **Deploying the actual backend requires pushing to `GianRCabrera/Rabdash-Mobile-Backend`**, a separate repo from this one (see Project overview above). That repo also has `node_modules/` committed to git (not just `.gitignore`d-but-untracked — genuinely tracked), so running `npm install`/`npm audit fix` there produces a huge unrelated diff; only stage `package-lock.json` and `app.js`-level changes, not the `node_modules/` noise.
- If Render deploys start failing with "we don't have access to your repo" (e.g. after the repo transfers to a new GitHub owner, as happened once already), fixing it requires two separate steps: re-authorizing the Render GitHub App for the new owner at `github.com/apps/render/installations/new`, **and** re-selecting the repo via the "Edit" button next to Source on the Render service's Settings → Build page — the GitHub App permission and Render's own cached repo link are independent and both need refreshing.
- Some rows in the `users` table have a plaintext string in the `password` column instead of a bcrypt/argon2 hash (likely inserted directly via SQL rather than through `/register`). `verifyPassword()` in `app.js` only recognizes `$2a$`/`$2b$`/`$2y$` (bcrypt) and `$argon2i$`/`$argon2id$` prefixes — anything else throws `"Unknown hash format"`, surfaced to the client as a generic `"An error occurred during login"` rather than "invalid password."
- `npx expo start` reports several installed package versions are behind what Expo SDK 50 expects (`expo`, `expo-file-system`, `expo-media-library`, `expo-secure-store`, `react-native-svg`); `npx expo install --fix` will align them but hasn't been run/verified in this repo.
