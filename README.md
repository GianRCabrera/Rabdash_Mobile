# RabDash Mobile

Mobile application for RabDash DC — a rabies-control / animal-control field program. Field staff and veterinarians submit forms (vaccination, neutering, rabies samples, budget, schedule, IEC, animal control, rabies exposure) from the field; a CVO (City Veterinary Office) role reviews submissions.

Originally built as a thesis project.

## Stack

- **Frontend**: Expo (React Native, SDK 58), TypeScript entry point + JS screens, React Navigation 7.
- **Backend**: Node.js / Express, deployed separately on Render, backed by two MySQL databases (the mobile app's own DB and a companion website's DB).

The frontend and backend are two independent apps in one repo (no monorepo tooling) — each has its own `package.json` and is installed/run separately.

## Prerequisites

- Node.js `^22.13` or `>=24` (Expo SDK 58 requires it) and npm 10+
- The [Expo Go](https://expo.dev/client) app on your phone (easiest way to run the app), or an Android/iOS emulator
- Network access to the remote MySQL databases if you plan to run the backend locally (see `backend/.env`)

## Setup

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

## Running the app

By default, the frontend is already configured to talk to the **hosted** backend (`EXPO_PUBLIC_URL` in the root `.env` points at `https://rabdash-mobile-backend.onrender.com`). This means you can run just the frontend and it will work against live data — you don't need to run `backend/` locally unless you're changing backend code.

### Frontend only (most common case)

```bash
npx expo start
```

This starts the Metro bundler and prints a QR code. Scan it with the Expo Go app on your phone (same Wi-Fi network as your computer), or press `a` / `i` in the terminal to launch an Android/iOS emulator, or `w` for the web build.

### Using an Android emulator instead of a physical device

The store builds of Expo Go only run the latest Expo SDK. If your phone's Expo Go is newer than this project's SDK 58, it won't open the app. An Android emulator is the most reliable local option if you don't have a matching phone handy.

1. Install Android Studio (or just the command-line SDK tools) and create an AVD. Any recent system image works, including Android 16.
2. Make sure `ANDROID_HOME` and the emulator/platform-tools are on your `PATH`, e.g. in `~/.zshrc`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
   ```
3. Boot the AVD (`emulator -avd <name>`), then run `npx expo start --android` — Expo installs a matching Expo Go build on the emulator automatically.
4. If Expo Go shows a stale `java.net.ConnectException` to an old IP after rebooting the emulator (it can cache the last-used dev server address), force it to reconnect: `adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081"` (relies on the `adb reverse tcp:8081 tcp:8081` Expo sets up automatically, so it works regardless of your current LAN IP).

### Running the backend locally

```bash
cd backend
npm start
```

This runs `nodemon app.js`, listening on port 3000 (or `PORT` from the environment) and connecting to the databases configured in `backend/.env`.

To point the frontend at your local backend instead of the hosted one, edit the root `.env` and swap the active `EXPO_PUBLIC_URL` line to your machine's LAN IP (a physical device on Expo Go can't reach `localhost`) — a couple of examples are already present, commented out, in `.env`:

```
EXPO_PUBLIC_URL=http://<your-LAN-IP>:3000
```

Then restart `npx expo start` so the new env value is picked up.

## Deploying backend changes

**The hosted backend at `rabdash-mobile-backend.onrender.com` deploys from this repository's `backend/` folder** (Render → Rabdash-Mobile-Backend → Settings: Source `GianRCabrera/Rabdash_Mobile`, root directory `backend/`, build command `npm ci`; confirmed 2026-10-28). The separate `GianRCabrera/Rabdash-Mobile-Backend` repository is an older copy that Render no longer builds from — changes pushed only there do not go live. Run `npm test` in `backend/` before pushing, since a push here is what Render deploys.

If Render deploys start failing with "we don't have access to your repo" after a GitHub repo transfer/rename (as happened when this repo moved to a new owner), the fix has two parts: (1) re-grant the Render GitHub App access at `https://github.com/apps/render/installations/new` under the account that now owns the repo, **and** (2) on the Render service's Settings → Build page, re-select the repo via the Source "Edit" button (Render also caches its own stale link separately from the GitHub App permissions).

## Project structure

```
.
├── App.tsx                # Navigation tree + screen registry (single source of truth for routes)
├── src/
│   ├── screens/           # One file per screen (forms, archives, menus, auth screens)
│   ├── components/        # Shared UI: AppButton, AppModal, FormScreen, ArchiveScreen, ...
│   ├── context/           # AuthContext (login saved with expo-secure-store) + withAuthGuard
│   ├── api/               # Global axios 401 handler (session expiry → back to Login)
│   ├── theme/             # Colors, spacing, typography tokens
│   ├── utils/             # Small shared helpers (e.g. email validation)
│   └── constants/
├── assets/                # Images/icons used by the app
└── backend/
    ├── app.js             # Express/session/CORS setup and route mounting
    ├── routes/            # auth.js, forms.js, reportTemplates.js
    ├── lib/               # Shared helpers: form handler factories, OTP, mailer, passwords
    ├── migrations/        # Numbered .sql schema changes, applied with `npm run migrate`
    └── assets/templates/  # Downloadable .xlsx report templates served by the backend
```

See [CLAUDE.md](./CLAUDE.md) for a deeper architecture walkthrough (navigation conventions, the form/archive/versioned-screen pattern, how the two MySQL pools are used, etc.) — useful context for anyone (human or AI) picking this codebase back up.

## Known issues

- **`.env` and `backend/.env` were committed to this repository** (public on GitHub) for a long time and contained database credentials, a JWT secret, and SMTP credentials. They've since been untracked (`.gitignore`d, `git rm --cached`) and hardcoded secrets moved out of `backend/app.js` into env vars — see `.env.example` / `backend/.env.example` for the variables each file needs. As of Aug 2026 the exposed credentials (DB passwords, `JWT_SECRET`, SMTP password) have been rotated on both the local files and Render's dashboard, so the old values leaked in git history are no longer valid — but the history itself hasn't been rewritten, so avoid assuming anything ever committed to this repo is still secret.
- **Hostinger's MySQL databases only accept connections from allow-listed hosts** (hPanel → Databases → your database → Remote MySQL). If you rotate to a new Hostinger server/database, you must add allowed hosts there or every connection attempt (local dev *and* the Render-hosted backend) fails with `ER_ACCESS_DENIED_ERROR` even with correct credentials. Render's free tier doesn't have a fixed outbound IP, so `%` (Any Host) is the practical setting rather than a specific IP.
- After any dependency change, check versions still match the Expo SDK with `npx expo install --check` and `npx expo-doctor`.
- No lint or typecheck scripts are wired up. Tests are: `npm test` at the repo root (app) and in `backend/` (API, no real database needed). Both run on GitHub Actions for every push and pull request.
- `verifyPassword()` only recognizes bcrypt and argon2 hashes. A `users` row with anything else (e.g. a plaintext password inserted by hand) fails as a normal invalid login. As of Nov 2026 every account in the mobile database uses bcrypt.
