import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth, STORED_USER_KEY } from '../AuthContext';
import withAuthGuard from '../AuthGuard';

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

const Screen = () => <Text>protected content</Text>;

// App.tsx only mounts the navigator once the saved login has been restored;
// mirror that, or the guard would see the not-yet-restored empty user.
const AfterRestore = ({ children }) => {
  const { state } = useAuth();
  return state.isRestoring ? null : children;
};

const renderGuarded = async ({ user, allowedPositions }) => {
  SecureStore.__store.clear();
  if (user) {
    SecureStore.__store.set(STORED_USER_KEY, JSON.stringify(user));
    axios.get.mockResolvedValue({ data: { position: user.position } });
  }
  const navigation = { reset: jest.fn() };
  const Guarded = withAuthGuard(Screen, allowedPositions);
  const utils = await render(
    <AuthProvider>
      <AfterRestore>
        <Guarded navigation={navigation} />
      </AfterRestore>
    </AuthProvider>
  );
  return { ...utils, navigation };
};

const toLogin = { index: 0, routes: [{ name: 'Login' }] };

describe('withAuthGuard', () => {
  test('a logged-out user is sent to Login and never sees the screen', async () => {
    const { queryByText, navigation } = await renderGuarded({});

    await waitFor(() => expect(navigation.reset).toHaveBeenCalledWith(toLogin));
    expect(queryByText('protected content')).toBeNull();
  });

  test('a logged-in user sees a screen with no role restriction', async () => {
    const { findByText, navigation } = await renderGuarded({
      user: { email: 'vet@example.com', position: 'Private Veterinarian' },
    });

    expect(await findByText('protected content')).toBeTruthy();
    expect(navigation.reset).not.toHaveBeenCalled();
  });

  test('a Private Veterinarian cannot open a CVO/RabDash-only screen (e.g. VetMenu)', async () => {
    const { queryByText, navigation } = await renderGuarded({
      user: { email: 'vet@example.com', position: 'Private Veterinarian' },
      allowedPositions: ['CVO', 'RabDash'],
    });

    await waitFor(() => expect(navigation.reset).toHaveBeenCalledWith(toLogin));
    expect(queryByText('protected content')).toBeNull();
  });

  test.each(['CVO', 'RabDash'])('a %s user can open a CVO/RabDash-only screen', async (position) => {
    const { findByText, navigation } = await renderGuarded({
      user: { email: 'staff@example.com', position },
      allowedPositions: ['CVO', 'RabDash'],
    });

    expect(await findByText('protected content')).toBeTruthy();
    expect(navigation.reset).not.toHaveBeenCalled();
  });
});
