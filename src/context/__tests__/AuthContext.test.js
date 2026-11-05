import React from 'react';
import { Text } from 'react-native';
import { render, act, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth, logoutFromOutsideReact, STORED_USER_KEY } from '../AuthContext';

// In-memory stand-in for the device keychain/keystore.
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    __store: store,
    getItemAsync: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
    setItemAsync: jest.fn(async (key, value) => { store.set(key, value); }),
    deleteItemAsync: jest.fn(async (key) => { store.delete(key); }),
  };
});
jest.mock('axios');

const savedUser = () => {
  const raw = SecureStore.__store.get(STORED_USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

beforeEach(() => {
  SecureStore.__store.clear();
  jest.clearAllMocks();
});

// Exposes state + dispatch on a ref so tests can drive/read them outside JSX.
const Probe = ({ probeRef }) => {
  const { state, dispatch } = useAuth();
  probeRef.current = { state, dispatch };
  return <Text>{state.user.email || 'logged-out'}</Text>;
};

describe('AuthContext', () => {
  test('LOGIN sets state.user, LOGOUT clears it back to empty', async () => {
    const probeRef = { current: null };
    const { getByText } = await render(
      <AuthProvider>
        <Probe probeRef={probeRef} />
      </AuthProvider>
    );

    expect(getByText('logged-out')).toBeTruthy();

    await act(() => {
      probeRef.current.dispatch({ type: 'LOGIN', payload: { user: { email: 'vet@example.invalid', position: 'Private Veterinarian' } } });
    });
    expect(getByText('vet@example.invalid')).toBeTruthy();

    await act(() => {
      probeRef.current.dispatch({ type: 'LOGOUT' });
    });
    expect(getByText('logged-out')).toBeTruthy();
  });

  // This is what the global axios 401 interceptor (src/api/axiosSessionInterceptor.js)
  // calls from outside the React tree when the server invalidates a session —
  // it has no hook access, only this module-level escape hatch. withAuthGuard
  // reacts to state.user clearing to bounce the user back to Login; this test
  // covers the AuthContext half of that chain, not the navigation reset itself.
  test('logoutFromOutsideReact clears state.user without a dispatch call available', async () => {
    const probeRef = { current: null };
    const { getByText } = await render(
      <AuthProvider>
        <Probe probeRef={probeRef} />
      </AuthProvider>
    );

    await act(() => {
      probeRef.current.dispatch({ type: 'LOGIN', payload: { user: { email: 'vet@example.invalid', position: 'Private Veterinarian' } } });
    });
    expect(getByText('vet@example.invalid')).toBeTruthy();

    await act(() => {
      logoutFromOutsideReact();
    });
    expect(getByText('logged-out')).toBeTruthy();
  });

  test('LOGIN saves the user to the device and LOGOUT removes it', async () => {
    const probeRef = { current: null };
    await render(
      <AuthProvider>
        <Probe probeRef={probeRef} />
      </AuthProvider>
    );
    await waitFor(() => expect(probeRef.current.state.isRestoring).toBe(false));

    await act(() => {
      probeRef.current.dispatch({ type: 'LOGIN', payload: { user: { email: 'vet@example.invalid', position: 'CVO' } } });
    });
    await waitFor(() => expect(savedUser()).toEqual({ email: 'vet@example.invalid', position: 'CVO' }));

    await act(() => {
      probeRef.current.dispatch({ type: 'LOGOUT' });
    });
    await waitFor(() => expect(savedUser()).toBeNull());
  });

  test('a saved user is restored on startup and the session is checked with the server', async () => {
    SecureStore.__store.set(STORED_USER_KEY, JSON.stringify({ email: 'vet@example.invalid', position: 'Private Veterinarian' }));
    axios.get.mockResolvedValue({ data: { position: 'Private Veterinarian' } });

    const probeRef = { current: null };
    const { findByText } = await render(
      <AuthProvider>
        <Probe probeRef={probeRef} />
      </AuthProvider>
    );

    expect(await findByText('vet@example.invalid')).toBeTruthy();
    expect(probeRef.current.state.isRestoring).toBe(false);
    expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/Position$/), { withCredentials: true });
  });

  // The global interceptor turns a 401 into logoutFromOutsideReact(); here we
  // simulate that chain, since the real interceptor isn't registered in tests.
  test('a restored user whose server session has expired ends up logged out', async () => {
    SecureStore.__store.set(STORED_USER_KEY, JSON.stringify({ email: 'vet@example.invalid', position: 'CVO' }));
    axios.get.mockImplementation(async () => {
      logoutFromOutsideReact();
      throw Object.assign(new Error('Unauthorized'), { response: { status: 401 } });
    });

    const { findByText } = await render(
      <AuthProvider>
        <Probe probeRef={{ current: null }} />
      </AuthProvider>
    );

    expect(await findByText('logged-out')).toBeTruthy();
    await waitFor(() => expect(savedUser()).toBeNull());
  });

  test('a network error while checking keeps the restored user (backend cold start / offline)', async () => {
    SecureStore.__store.set(STORED_USER_KEY, JSON.stringify({ email: 'vet@example.invalid', position: 'CVO' }));
    axios.get.mockRejectedValue(new Error('Network Error'));

    const { findByText } = await render(
      <AuthProvider>
        <Probe probeRef={{ current: null }} />
      </AuthProvider>
    );

    expect(await findByText('vet@example.invalid')).toBeTruthy();
    expect(savedUser()).toEqual({ email: 'vet@example.invalid', position: 'CVO' });
  });
});
