import React from 'react';
import axios from 'axios';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import Neuter_Form_archive from '../Neuter_Form_archive';

jest.mock('axios');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const positionResponse = (position) => ({ data: { email: 'user@example.invalid', position } });
const pageResponse = (rows, total) => ({ data: { data: rows, page: 1, limit: 20, total } });

const sampleRow = (id, overrides = {}) => ({
  id,
  dbOrigin: 'mobile',
  date: '2026-01-01T00:00:00.000Z',
  district: 'D', barangay: 'B', purok: 'P', proc: 'Neuter', client: `Client ${id}`,
  address: 'Addr', contactNo: '09171234567', name: `Pet ${id}`, species: 'Dog', sex: 'M',
  breed: 'Mix', age: '2', pets: 1, cat: 0,
  ...overrides,
});

describe('Neuter_Form_archive — reviewer (RabDash) pagination and search', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    axios.get.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('loads page 1 from the CVO endpoint with no search term', async () => {
    axios.get
      .mockResolvedValueOnce(positionResponse('RabDash'))
      .mockResolvedValueOnce(pageResponse([sampleRow(1)], 1));

    const { findByText } = render(<Neuter_Form_archive />);
    await findByText('Client 1');

    const [, call] = axios.get.mock.calls;
    expect(call[0]).toMatch(/getNeuterFormsCVO$/);
    expect(call[1].params).toEqual({ page: 1, limit: 20, search: '' });
  });

  test('tapping Next fetches page 2 from the server', async () => {
    axios.get
      .mockResolvedValueOnce(positionResponse('RabDash'))
      .mockResolvedValueOnce(pageResponse([sampleRow(1)], 40))
      .mockResolvedValueOnce(pageResponse([sampleRow(21)], 40));

    const { findByText, getByText } = render(<Neuter_Form_archive />);
    await findByText('Client 1');

    fireEvent.press(getByText('Next'));
    await findByText('Client 21');

    const lastCall = axios.get.mock.calls[axios.get.mock.calls.length - 1];
    expect(lastCall[1].params).toEqual({ page: 2, limit: 20, search: '' });
  });

  test('typing a search term is debounced, resets to page 1, and is sent to the server', async () => {
    axios.get
      .mockResolvedValueOnce(positionResponse('RabDash'))
      .mockResolvedValueOnce(pageResponse([sampleRow(1)], 1))
      .mockResolvedValueOnce(pageResponse([sampleRow(2, { client: 'Rex Owner' })], 1));

    const { findByText, getByPlaceholderText } = render(<Neuter_Form_archive />);
    await findByText('Client 1');

    fireEvent.changeText(getByPlaceholderText('Search by owner, pet name, or date...'), 'Rex');
    expect(axios.get).toHaveBeenCalledTimes(2);

    act(() => {
      jest.advanceTimersByTime(400);
    });

    await findByText('Rex Owner');

    const lastCall = axios.get.mock.calls[axios.get.mock.calls.length - 1];
    expect(lastCall[0]).toMatch(/getNeuterFormsCVO$/);
    expect(lastCall[1].params).toEqual({ page: 1, limit: 20, search: 'Rex' });
  });
});

describe('Neuter_Form_archive — non-reviewer (own records) stays client-side', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  test('fetches the own-records endpoint once and filters locally — no extra request on search', async () => {
    axios.get
      .mockResolvedValueOnce(positionResponse('Private Veterinarian'))
      .mockResolvedValueOnce({ data: [sampleRow(1, { client: 'Alice' }), sampleRow(2, { client: 'Bob' })] });

    const { findByText, getByPlaceholderText, queryByText } = render(<Neuter_Form_archive />);
    await findByText('Alice');
    expect(axios.get).toHaveBeenCalledTimes(2);

    fireEvent.changeText(getByPlaceholderText('Search by owner, pet name, or date...'), 'Alice');

    await waitFor(() => expect(queryByText('Bob')).toBeNull());
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
