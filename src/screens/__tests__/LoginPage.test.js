import React from 'react';
import { Text } from 'react-native';
import axios from 'axios';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import LoginPage from '../LoginPage';

jest.mock('axios');
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Shows who AuthContext thinks is logged in, so tests can check the LOGIN dispatch.
const CurrentUser = () => {
  const { state } = useAuth();
  return <Text testID="current-user">{state.user.email ? `${state.user.email}|${state.user.position}` : 'none'}</Text>;
};

const renderLogin = () =>
  render(
    <AuthProvider>
      <LoginPage />
      <CurrentUser />
    </AuthProvider>
  );

const fillAndSubmit = async (utils, email, password) => {
  await fireEvent.changeText(utils.getByPlaceholderText('Email'), email);
  await fireEvent.changeText(utils.getByPlaceholderText('Password'), password);
  await fireEvent.press(utils.getByText('Login'));
};

describe('LoginPage', () => {
  beforeEach(() => {
    axios.post.mockReset();
    mockNavigate.mockReset();
  });

  test('empty fields show a prompt and never call the server', async () => {
    const utils = await renderLogin();

    await fireEvent.press(utils.getByText('Login'));

    expect(await utils.findByText('Please fill in all required fields')).toBeTruthy();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('a malformed email is rejected locally without calling the server', async () => {
    const utils = await renderLogin();

    await fillAndSubmit(utils, 'not-an-email', 'secret');

    expect(await utils.findByText('Invalid email or password')).toBeTruthy();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test.each([
    ['CVO', 'VetMenu'],
    ['RabDash', 'VetMenu'],
    ['Private Veterinarian', 'MainMenu'],
  ])('a %s login records the user and opens %s', async (position, screen) => {
    axios.post.mockResolvedValue({ data: { success: true, position } });
    const utils = await renderLogin();

    await fillAndSubmit(utils, 'staff@example.com', 'secret');

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(screen, undefined, { pop: true }));
    expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/login$/), { email: 'staff@example.com', password: 'secret' });
    expect(utils.getByTestId('current-user').props.children).toBe(`staff@example.com|${position}`);
  });

  // These used to be rejected on the phone before reaching the server, even
  // though Register accepted them — so such accounts could never log in.
  test.each(['name+rabdash@gmail.com', 'staff@cityvet.agency'])('%s reaches the server instead of being rejected locally', async (email) => {
    axios.post.mockResolvedValue({ data: { success: true, position: 'Private Veterinarian' } });
    const utils = await renderLogin();

    await fillAndSubmit(utils, email, 'secret');

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/login$/), { email, password: 'secret' }));
  });

  test('surrounding spaces are trimmed before the email is sent and remembered', async () => {
    axios.post.mockResolvedValue({ data: { success: true, position: 'CVO' } });
    const utils = await renderLogin();

    await fillAndSubmit(utils, ' staff@example.com  ', 'secret');

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/login$/), { email: 'staff@example.com', password: 'secret' }));
    expect(utils.getByTestId('current-user').props.children).toBe('staff@example.com|CVO');
  });

  test('wrong credentials show "Invalid email or password" and log nobody in', async () => {
    axios.post.mockResolvedValue({ data: { success: false, message: 'Invalid email or password' } });
    const utils = await renderLogin();

    await fillAndSubmit(utils, 'staff@example.com', 'wrong');

    expect(await utils.findByText('Invalid email or password')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(utils.getByTestId('current-user').props.children).toBe('none');
  });

  test('a network failure shows an error message instead of crashing', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    const utils = await renderLogin();

    await fillAndSubmit(utils, 'staff@example.com', 'secret');

    expect(await utils.findByText('An error occurred during login. Please try again.')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
