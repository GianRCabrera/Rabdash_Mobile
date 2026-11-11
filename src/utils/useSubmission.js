import { useCallback, useRef, useState } from 'react';
import axios from 'axios';

// Long enough for Render's free plan to wake the backend from sleep
// (30-60s), short enough that a dead connection doesn't spin forever.
export const SUBMIT_TIMEOUT_MS = 90 * 1000;

const KEEP_ANSWERS = 'Your answers are still here.';

// Turns a failed submit into a message for the person filling in the form.
export const describeSubmitError = (error) => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;
  if (!error?.response) {
    return `Couldn't send. Check your internet connection and try again.\n\n${KEEP_ANSWERS}`;
  }
  if (status === 401) {
    return 'Your login has expired. Please log in again.';
  }
  if (status === 403) {
    return "You don't have permission to change this record.";
  }
  if (status >= 400 && status < 500 && serverMessage) {
    return `${serverMessage}\n\n${KEEP_ANSWERS}`;
  }
  return `Something went wrong on the server. Please try again in a moment.\n\n${KEEP_ANSWERS}`;
};

// Sends a form submission and tracks its state, so screens can show a
// spinner, ignore repeat taps while a send is in flight, and tell the person
// when sending failed (it used to fail silently). `send` resolves to the
// response on success, or null on failure (the error message is then in
// `submitError`).
export const useSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const inFlight = useRef(false);

  const send = useCallback(async (url, data) => {
    if (inFlight.current) return null;
    inFlight.current = true;
    setIsSubmitting(true);
    try {
      const response = await axios.post(url, data, { timeout: SUBMIT_TIMEOUT_MS });
      if (response?.data?.success === false) {
        throw Object.assign(new Error('Rejected'), { response: { status: 400, data: response.data } });
      }
      return response;
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(describeSubmitError(error));
      return null;
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  }, []);

  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  return { isSubmitting, submitError, clearSubmitError, send };
};
