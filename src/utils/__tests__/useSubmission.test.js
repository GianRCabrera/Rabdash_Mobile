import axios from 'axios';
import { renderHook, act } from '@testing-library/react-native';
import { useSubmission, describeSubmitError, SUBMIT_TIMEOUT_MS } from '../useSubmission';

jest.mock('axios');

describe('describeSubmitError', () => {
  test.each([
    ['no response (offline, timed out)', new Error('Network Error'), /internet connection/],
    ['a 400 with a server message', { response: { status: 400, data: { message: 'Missing required field(s): year' } } }, /^Missing required field\(s\): year/],
    ['a 500', { response: { status: 500, data: {} } }, /went wrong on the server/],
  ])('%s keeps the "answers are still here" reassurance', (_label, error, pattern) => {
    const message = describeSubmitError(error);
    expect(message).toMatch(pattern);
    expect(message).toContain('Your answers are still here.');
  });

  test('a 401 asks the person to log in again', () => {
    expect(describeSubmitError({ response: { status: 401 } })).toMatch(/log in again/);
  });

  test('a 403 explains the missing permission', () => {
    expect(describeSubmitError({ response: { status: 403, data: { message: 'Forbidden: ...' } } })).toMatch(/permission/);
  });
});

describe('useSubmission', () => {
  beforeEach(() => {
    axios.post.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('a second send while the first is still in flight is ignored (no duplicate submission)', async () => {
    let finish;
    axios.post.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const { result } = await renderHook(() => useSubmission());

    let first;
    await act(async () => {
      first = result.current.send('/submitBudgetForm', { year: '2026' });
    });
    expect(result.current.isSubmitting).toBe(true);
    await act(async () => {
      expect(await result.current.send('/submitBudgetForm', { year: '2026' })).toBeNull();
    });
    await act(async () => {
      finish({ data: { success: true } });
      await first;
    });

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith('/submitBudgetForm', { year: '2026' }, { timeout: SUBMIT_TIMEOUT_MS });
    expect(result.current.isSubmitting).toBe(false);
  });

  test('a response with success: false is treated as a failure, not silently ignored', async () => {
    axios.post.mockResolvedValue({ data: { success: false, message: 'Missing required field(s): year' } });
    const { result } = await renderHook(() => useSubmission());

    let response;
    await act(async () => {
      response = await result.current.send('/submitBudgetForm', {});
    });

    expect(response).toBeNull();
    expect(result.current.submitError).toMatch(/^Missing required field\(s\): year/);
  });
});
