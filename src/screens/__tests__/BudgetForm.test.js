import React from 'react';
import axios from 'axios';
import { render, fireEvent } from '@testing-library/react-native';
import BudgetForm from '../BudgetForm';

jest.mock('axios');
const mockNavigate = jest.fn();
// Opened from the archive to edit, so every field is already filled in. The
// same object every render, like the real route (a new one each time would
// re-run the form's route.params effect forever).
const mockRoute = { params: { fromArchive: true, item: { id: 7, year: 2026, budget: 5000, costvax: 120 } } };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => mockRoute,
}));

const submit = async (utils) => {
  await fireEvent.press(utils.getByText('Submit'));
  await fireEvent.press(utils.getByText('Yes'));
};

describe('BudgetForm submitting', () => {
  beforeEach(() => {
    axios.post.mockReset();
    mockNavigate.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('when there is no connection, it says so and keeps the answers on screen', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    const utils = await render(<BudgetForm />);

    await submit(utils);

    expect(await utils.findByText(/Couldn't send\. Check your internet connection/)).toBeTruthy();
    expect(utils.getByDisplayValue('5000')).toBeTruthy();
    expect(utils.getByDisplayValue('120')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('after a failure, tapping OK and submitting again succeeds', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce({ data: { success: true } });
    const utils = await render(<BudgetForm />);

    await submit(utils);
    await fireEvent.press(await utils.findByText('OK'));
    await submit(utils);

    expect(await utils.findByText('Form updated successfully!')).toBeTruthy();
    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(axios.post.mock.calls[1][1]).toEqual({ year: '2026', budget: '5000', costvax: '120', id: 7 });
  });
});
