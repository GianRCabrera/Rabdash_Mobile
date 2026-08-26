# RabDash Mobile

Mobile application for RabDash DC — a rabies-control / animal-control field program. Field staff and veterinarians submit forms (vaccination, neutering, rabies samples, budget, weather, schedule, IEC, animal control, rabies exposure) from the field; a CVO (City Veterinary Office) role reviews submissions.

Originally built as a thesis project.

## Stack

- **Frontend**: Expo (React Native, SDK 50), TypeScript entry point + JS screens, React Navigation.
- **Backend**: Node.js / Express, deployed separately on Render, backed by two MySQL databases (the mobile app's own DB and a companion website's DB).

The frontend and backend are two independent apps in one repo (no monorepo tooling) — each has its own `package.json` and is installed/run separately.

## Prerequisites

- Node.js 20.x and npm 10.x
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

## Project structure

```
.
├── App.tsx                # Navigation tree + screen registry (single source of truth for routes)
├── AuthContext.js         # Global auth state (React Context, not persisted across reloads)
├── *.js                   # Screens, flat at repo root (no src/ directory)
├── styles/                # StyleSheet objects, grouped by kind and imported by screens
├── assets/                # Images/icons used by the app
└── backend/
    ├── app.js             # Express app — nearly all routes are defined inline here
    ├── routes/            # Present but largely unused (see CLAUDE.md)
    └── assets/templates/  # Downloadable .xlsx report templates served by the backend
```

See [CLAUDE.md](./CLAUDE.md) for a deeper architecture walkthrough (navigation conventions, the form/archive/versioned-screen pattern, how the two MySQL pools are used, etc.) — useful context for anyone (human or AI) picking this codebase back up.

## Known issues

- **`.env` and `backend/.env` were committed to this repository** (public on GitHub) for a long time and contain database credentials, a JWT secret, and SMTP credentials. They've since been untracked (`.gitignore`d, `git rm --cached`) and hardcoded secrets moved out of `backend/app.js` into env vars — see `.env.example` / `backend/.env.example` for the variables each file needs. The **old values are still compromised** since they remain visible in this repo's git history; rotate them (new DB passwords, new `JWT_SECRET`, new SMTP password) and update Render's dashboard env vars, not just the local files, before treating this as resolved.
- `npx expo start` reports a few installed packages are slightly behind the versions Expo SDK 50 expects (`expo`, `expo-file-system`, `expo-media-library`, `expo-secure-store`, `react-native-svg`). Run `npx expo install --fix` to align them if you hit compatibility issues.
- No lint, typecheck, or automated test scripts are currently wired up in either `package.json`.
