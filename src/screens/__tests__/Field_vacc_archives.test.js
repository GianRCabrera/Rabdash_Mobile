import React from 'react';
import axios from 'axios';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import Field_vacc_archives from '../Field_vacc_archives';

jest.mock('axios');
// The logged-in user, as AuthContext would hold it; tests can change it.
let mockAuthUser = { email: 'user@example.invalid', position: 'RabDash' };
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ state: { user: mockAuthUser } }),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const positionResponse = (position) => ({ data: { email: 'user@example.invalid', position } });
const pageResponse = (rows, total) => ({ data: { data: rows, page: 1, limit: 20, total } });

const sampleRow = (id, overrides = {}) => ({
  id,
  dbOrigin: 'mobile',
  date: '2026-01-01T00:00:00.000Z',
  district: 'D', barangay: 'B', purok: 'P', vaccinator: 'V', timeStart: '08:00',
  ownerName: `Owner ${id}`, address: 'Addr', sex: 'M', contactNo: '09171234567',
  petName: `Pet ${id}`, petAge: '2', species: 'Dog', petSex: 'M', color: 'Brown', cardNo: String(id),
  vaccine: 'Vax', source: 'Src', dateVaccinated: '2026-01-01T00:00:00.000Z', timeFinish: '09:00',
  ...overrides,
});

describe('Field_vacc_archives — reviewer (RabDash) pagination and search', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    axios.get.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('loads page 1 from the CVO endpoint with no search term, and renders the returned rows', async () => {
    axios.get
      .mockResolvedValueOnce(positionResponse('RabDash'))
      .mockResolvedValueOnce(pageResponse([sampleRow(1)], 1));

    const { findByText } = await render(<Field_vacc_archives />);

    await findByText('Owner 1');

    const [, call] = axios.get.mock.calls;
    expect(call[0]).toMatch(/getVaccinationFormsCVO$/);
    expect(call[1].params).toEqual({ page: 1, limit: 20, search: '' });
  });

  test('tapping Next fetches page 2 from the server, not a client-side slice', async () => {
    axios.get
      .mockResolvedValueOnce(positionResponse('RabDash'))
      .mockResolvedValueOnce(pageResponse([sampleRow(1)], 40)) // a full page -> hasNext true
      .mockResolvedValueOnce(pageResponse([sampleRow(21)], 40));

    const { findByText, getByText } = await render(<Field_vacc_archives />);
    await findByText('Owner 1');

    await fireEvent.press(getByText('Next'));
    await findByText('Owner 21');

    const lastCall = axios.get.mock.calls[axios.get.mock.calls.length - 1];
    expect(lastCall[1].params).toEqual({ page: 2, limit: 20, search: '' });
  });

  test('typing a search term is debounced, resets to page 1, and is sent to the server', async () => {
    axios.get
      .mockResolvedValueOnce(positionResponse('RabDash'))
      .mockResolvedValueOnce(pageResponse([sampleRow(1)], 1))
      .mockResolvedValueOnce(pageResponse([sampleRow(2, { ownerName: 'Rex Owner' })], 1));

    const { findByText, getByPlaceholderText } = await render(<Field_vacc_archives />);
    await findByText('Owner 1');

    await fireEvent.changeText(getByPlaceholderText('Search by owner, pet name, or date...'), 'Rex');

    // Not fired yet — still within the debounce window.
    expect(axios.get).toHaveBeenCalledTimes(2);

    await act(() => {
      jest.advanceTimersByTime(400);
    });

    await findByText('Rex Owner');

    const lastCall = axios.get.mock.calls[axios.get.mock.calls.length - 1];
    expect(lastCall[0]).toMatch(/getVaccinationFormsCVO$/);
    expect(lastCall[1].params).toEqual({ page: 1, limit: 20, search: 'Rex' });
  });
});

describe('Field_vacc_archives — non-reviewer (own records) stays client-side', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  test('fetches the own-records endpoint once and filters locally — no extra request on search', async () => {
    axios.get
      .mockResolvedValueOnce(positionResponse('Private Veterinarian'))
      .mockResolvedValueOnce({ data: [sampleRow(1, { ownerName: 'Alice' }), sampleRow(2, { ownerName: 'Bob' })] });

    const { findByText, getByPlaceholderText, queryByText } = await render(<Field_vacc_archives />);
    await findByText('Alice');
    expect(axios.get).toHaveBeenCalledTimes(2); // /Position + /getVaccinationForms, nothing more

    await fireEvent.changeText(getByPlaceholderText('Search by owner, pet name, or date...'), 'Alice');

    await waitFor(() => expect(queryByText('Bob')).toBeNull());
    expect(axios.get).toHaveBeenCalledTimes(2); // still no additional network calls
  });
});

describe('Field_vacc_archives — CVO Admin (sees all, edits only own)', () => {
  beforeEach(() => {
    axios.get.mockReset();
    mockAuthUser = { email: 'admin@example.invalid', position: 'CVO Admin' };
  });

  afterEach(() => {
    mockAuthUser = { email: 'user@example.invalid', position: 'RabDash' };
  });

  test('loads the all-users list, and shows Edit/Delete only on their own records', async () => {
    axios.get
      .mockResolvedValueOnce(positionResponse('CVO Admin'))
      .mockResolvedValueOnce(pageResponse([
        sampleRow(1, { username: 'vet@example.invalid' }),
        sampleRow(2, { username: 'Admin@example.invalid' }),
      ], 2));

    const { findByText, getByText, queryByText, getAllByText } = await render(<Field_vacc_archives />);
    await findByText('Owner 1');
    expect(axios.get.mock.calls[1][0]).toMatch(/getVaccinationFormsCVO$/);

    await fireEvent.press(getByText('Owner 1'));
    expect(getByText('View only — submitted by another user.')).toBeTruthy();
    expect(queryByText('Delete')).toBeNull();

    await fireEvent.press(getByText('Owner 2'));
    expect(getAllByText('Delete')).toHaveLength(1);
  });
});
