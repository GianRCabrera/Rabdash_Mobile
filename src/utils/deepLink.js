// Reads the email out of a password-reset link
// (e.g. rabdashmobile://reset-password?email=a%40b.com). Returns null for
// any other link. Replaces the query-string package, whose
// decode-uri-component dependency had a denial-of-service advisory: this
// decodes each value once with the built-in decodeURIComponent, and a
// malformed value is ignored instead of throwing.
const decode = (value) => {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return null;
  }
};

export const getResetPasswordEmail = (url) => {
  if (typeof url !== 'string') return null;
  const [path, query = ''] = url.split('#')[0].split('?');
  if (!path.endsWith('reset-password')) return null;

  for (const pair of query.split('&')) {
    const [key, ...rest] = pair.split('=');
    if (decode(key) === 'email') {
      const email = decode(rest.join('='));
      return email || null;
    }
  }
  return null;
};
