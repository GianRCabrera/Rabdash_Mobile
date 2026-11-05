import axios from 'axios';
import { logoutFromOutsideReact } from '../../context/AuthContext';
import '../axiosSessionInterceptor';

jest.mock('../../context/AuthContext', () => ({ logoutFromOutsideReact: jest.fn() }));

// The interceptor is registered on the shared default axios instance as a
// side effect of importing it; pull its handlers back out to call directly
// rather than making real network requests.
const { fulfilled, rejected } = axios.interceptors.response.handlers.filter(Boolean).at(-1);

describe('global axios session-expiry interceptor', () => {
  beforeEach(() => {
    logoutFromOutsideReact.mockClear();
  });

  test('a 401 response logs the user out, and the error still reaches the caller', async () => {
    const error = Object.assign(new Error('Unauthorized'), { response: { status: 401 } });

    await expect(rejected(error)).rejects.toBe(error);
    expect(logoutFromOutsideReact).toHaveBeenCalledTimes(1);
  });

  test.each([403, 404, 500])('a %s response does not log the user out', async (status) => {
    const error = Object.assign(new Error('Failed'), { response: { status } });

    await expect(rejected(error)).rejects.toBe(error);
    expect(logoutFromOutsideReact).not.toHaveBeenCalled();
  });

  test('a network error with no response (offline, backend asleep) does not log the user out', async () => {
    const error = new Error('Network Error');

    await expect(rejected(error)).rejects.toBe(error);
    expect(logoutFromOutsideReact).not.toHaveBeenCalled();
  });

  test('successful responses pass through untouched', () => {
    const response = { status: 200, data: { ok: true } };
    expect(fulfilled(response)).toBe(response);
  });
});
