import React from 'react';
import { Text } from 'react-native';
import { render, act } from '@testing-library/react-native';
import { AuthProvider, useAuth, logoutFromOutsideReact } from '../AuthContext';

// Exposes state + dispatch on a ref so tests can drive/read them outside JSX.
const Probe = ({ probeRef }) => {
  const { state, dispatch } = useAuth();
  probeRef.current = { state, dispatch };
  return <Text>{state.user.email || 'logged-out'}</Text>;
};

describe('AuthContext', () => {
  test('LOGIN sets state.user, LOGOUT clears it back to empty', () => {
    const probeRef = { current: null };
    const { getByText } = render(
      <AuthProvider>
        <Probe probeRef={probeRef} />
      </AuthProvider>
    );

    expect(getByText('logged-out')).toBeTruthy();

    act(() => {
      probeRef.current.dispatch({ type: 'LOGIN', payload: { user: { email: 'vet@example.invalid', position: 'Private Veterinarian' } } });
    });
    expect(getByText('vet@example.invalid')).toBeTruthy();

    act(() => {
      probeRef.current.dispatch({ type: 'LOGOUT' });
    });
    expect(getByText('logged-out')).toBeTruthy();
  });

  // This is what the global axios 401 interceptor (src/api/axiosSessionInterceptor.js)
  // calls from outside the React tree when the server invalidates a session —
  // it has no hook access, only this module-level escape hatch. withAuthGuard
  // reacts to state.user clearing to bounce the user back to Login; this test
  // covers the AuthContext half of that chain, not the navigation reset itself.
  test('logoutFromOutsideReact clears state.user without a dispatch call available', () => {
    const probeRef = { current: null };
    const { getByText } = render(
      <AuthProvider>
        <Probe probeRef={probeRef} />
      </AuthProvider>
    );

    act(() => {
      probeRef.current.dispatch({ type: 'LOGIN', payload: { user: { email: 'vet@example.invalid', position: 'Private Veterinarian' } } });
    });
    expect(getByText('vet@example.invalid')).toBeTruthy();

    act(() => {
      logoutFromOutsideReact();
    });
    expect(getByText('logged-out')).toBeTruthy();
  });
});
