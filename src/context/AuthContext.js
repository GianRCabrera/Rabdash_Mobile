// AuthContext.js

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

// Key under which the logged-in user ({ email, position }) is kept on the
// device, so a reload or an app restart doesn't log the user out. The real
// credential is the backend's session cookie (7-day rolling expiry, see
// backend/app.js); this only remembers who that cookie belongs to.
const STORED_USER_KEY = 'authUser';

const emptyUser = {
  email: '',
  position: '',
};

const initialState = {
  user: emptyUser,
  // true until the stored user (if any) has been read back on startup —
  // App.tsx waits on this before choosing the first screen.
  isRestoring: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: emptyUser,
      };
    case 'RESTORED':
      return {
        ...state,
        user: action.payload.user || state.user,
        isRestoring: false,
      };
    default:
      return state;
  }
};

const readStoredUser = async () => {
  try {
    const raw = await SecureStore.getItemAsync(STORED_USER_KEY);
    const user = raw ? JSON.parse(raw) : null;
    return user && user.email && user.position ? user : null;
  } catch (error) {
    console.warn('Could not read the saved login:', error);
    return null;
  }
};

const writeStoredUser = async (user) => {
  try {
    if (user.email) {
      await SecureStore.setItemAsync(STORED_USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(STORED_USER_KEY);
    }
  } catch (error) {
    console.warn('Could not save the login:', error);
  }
};

// Lets code outside the React tree (the axios session-expiry interceptor)
// clear auth state without needing a hook — safe since AuthProvider mounts
// once at the app root, before any screen can make an API call.
let externalDispatch = null;

const logoutFromOutsideReact = () => {
  if (externalDispatch) {
    externalDispatch({ type: 'LOGOUT' });
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  externalDispatch = dispatch;

  // Restore the saved user, then check the server still has a session for
  // it. A 401 from /Position is handled by the global axios interceptor
  // (logs out → withAuthGuard sends the user to Login). Network errors keep
  // the restored user: the backend may be cold-starting or the device
  // offline, and any real request will still 401 if the session is gone.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await readStoredUser();
      if (cancelled) return;
      dispatch({ type: 'RESTORED', payload: { user } });
      if (!user) return;
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_URL}/Position`, { withCredentials: true });
        const position = response.data?.position;
        if (!cancelled && position && position !== user.position) {
          dispatch({ type: 'LOGIN', payload: { user: { ...user, position } } });
        }
      } catch (error) {
        // 401 is already handled by the interceptor; anything else is ignored (see above).
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mirror every login/logout (including logoutFromOutsideReact) to storage,
  // but not before the restore above has run — otherwise the initial empty
  // user would wipe the saved one.
  useEffect(() => {
    if (!state.isRestoring) {
      writeStoredUser(state.user);
    }
  }, [state.user, state.isRestoring]);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};

const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};

const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);
  if (!context) {
    throw new Error('useAuthDispatch must be used within an AuthProvider');
  }
  return context;
};

// Combine useAuthState and useAuthDispatch into a single useAuth function
const useAuth = () => {
  return {
    state: useAuthState(),
    dispatch: useAuthDispatch(),
  };
};

export { AuthProvider, useAuth, logoutFromOutsideReact, STORED_USER_KEY };
