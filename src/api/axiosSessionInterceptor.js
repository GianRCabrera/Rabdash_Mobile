import axios from 'axios';
import { logoutFromOutsideReact } from '../context/AuthContext';

// Registered once at app startup (imported for its side effect in App.tsx).
// Every screen makes its own bare axios.get/post calls rather than sharing one
// configured instance, so this attaches to the default axios instance those
// calls all share — the only way to catch a session-expiry 401 in one place
// instead of adding error handling to 30+ individual screens.
//
// The backend only ever returns 401 for "no/expired session" (requireAuth,
// requireReviewer, and a few inline session checks) — /login itself always
// responds 200 with a success:false body on bad credentials, never 401 — so
// treating every 401 here as a session expiry is safe and unambiguous.
// Clearing AuthContext is enough to bounce the user to Login: every
// authenticated screen is already wrapped in withAuthGuard, which resets
// navigation back to Login as soon as state.user is cleared.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logoutFromOutsideReact();
    }
    return Promise.reject(error);
  }
);
