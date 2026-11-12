import React from 'react';
import axios from 'axios';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MainMenu from '../MainMenu';

jest.mock('axios');
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({ navigate: mockNavigate }),
    // Run the focus effect once on mount, like a screen coming into view.
    useFocusEffect: (effect) => React.useEffect(effect, [effect]),
  };
});
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ state: { user: { email: 'vet@example.invalid', position: 'Private Veterinarian' } }, dispatch: jest.fn() }),
}));

const respond = ({ summary, summaryError } = {}) => {
  axios.get.mockImplementation(async (url) => {
    if (url.endsWith('/userProfile')) return { data: { name: 'Ana', last_name: 'Cruz' } };
    if (url.endsWith('/mySummary')) {
      if (summaryError) throw new Error('Network Error');
      return { data: summary };
    }
    throw new Error(`unexpected ${url}`);
  });
};

describe('MainMenu activity', () => {
  beforeEach(() => {
    axios.get.mockReset();
    mockNavigate.mockReset();
  });

  test('shows this month and total, and recent submissions with catalog titles', async () => {
    respond({
      summary: {
        thisMonth: 2,
        total: 22,
        recent: [
          { form: 'neuter', id: 7, label: 'Juan Cruz', createdAt: new Date().toISOString() },
          { form: 'vaccination', id: 3, label: '', createdAt: '2026-09-24T01:00:00.000Z' },
        ],
      },
    });
    const utils = await render(<MainMenu />);

    expect(await utils.findByText('22')).toBeTruthy();
    expect(utils.getByText('2')).toBeTruthy();
    expect(utils.getByText('Neuter · Juan Cruz')).toBeTruthy();
    expect(utils.getByText('Today')).toBeTruthy();
    expect(utils.getByText('Rabies Field Vaccination')).toBeTruthy();
    expect(utils.getByText(/Good (morning|afternoon|evening), Ana/)).toBeTruthy();

    await fireEvent.press(utils.getByText('Neuter · Juan Cruz'));
    expect(mockNavigate).toHaveBeenCalledWith('Neuter_Form_archive', undefined, { pop: true });
  });

  test('a user with no submissions is pointed to Input Forms', async () => {
    respond({ summary: { thisMonth: 0, total: 0, recent: [] } });
    const utils = await render(<MainMenu />);

    await fireEvent.press(await utils.findByText('No submissions yet'));
    expect(mockNavigate).toHaveBeenCalledWith('InputForms', undefined, { pop: true });
  });

  test("if the activity can't load, a retry line shows and retrying loads it", async () => {
    respond({ summaryError: true });
    const utils = await render(<MainMenu />);

    await utils.findByText(/Couldn't load your activity/);
    respond({ summary: { thisMonth: 1, total: 5, recent: [] } });
    await fireEvent.press(utils.getByText(/Couldn't load your activity/));

    expect(await utils.findByText('5')).toBeTruthy();
  });
});
