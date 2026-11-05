// One email check shared by Register, Login, and Forgot Password. They used
// to disagree: Register accepted any something@something.tld, while Login
// and Forgot Password only allowed letters/digits/._- before the @ and a
// 2-4 letter ending — so an account registered as name+tag@gmail.com, or at
// a domain like cityvet.agency, could never log in or reset its password.
// Deliberately loose; the server and the OTP email are the real check.
export const normalizeEmail = (email) => (email || '').trim();

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
