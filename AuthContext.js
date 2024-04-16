// AuthContext.js

import React, { createContext, useReducer, useContext } from 'react';

const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

const initialState = {
  user: {
    email: '',
    position: '',
  },
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
        user: {
          email: '',
          position: '',
        },
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

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

export { AuthProvider, useAuth };
