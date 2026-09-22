module.exports = {
  // Jest's default testMatch treats every .js file under __tests__/ as a test
  // file, which would also try to run helpers.js (a shared setup module with
  // no tests of its own). Restrict to files actually named *.test.js.
  testMatch: ['**/__tests__/**/*.test.js'],
};
