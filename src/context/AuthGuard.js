import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';

// Wraps a screen so it requires a logged-in user (and, optionally, one of
// `allowedPositions`) before rendering. Unauthorized access resets the
// navigation stack back to Login instead of just going back.
const withAuthGuard = (Component, allowedPositions) => {
  const Guarded = (props) => {
    const { state } = useAuth();
    const isLoggedIn = !!state.user?.email;
    const isAuthorized = isLoggedIn && (!allowedPositions || allowedPositions.includes(state.user.position));

    useEffect(() => {
      if (!isAuthorized) {
        props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthorized]);

    if (!isAuthorized) {
      return null;
    }

    return <Component {...props} />;
  };

  return Guarded;
};

export default withAuthGuard;
