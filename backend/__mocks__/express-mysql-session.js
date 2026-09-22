// Manual Jest mock for express-mysql-session. Real usage is
// `const MySQLStore = require('express-mysql-session')(session); new MySQLStore(opts)`.
// Backs sessions with a plain in-memory Map instead of real SQL, so tests don't need
// to simulate the package's internal schema/queries — just express-session's Store
// contract (get/set/destroy), which is all app.js actually relies on.
module.exports = function expressMySQLSessionMock(session) {
  return class MockMySQLStore extends session.Store {
    constructor() {
      super();
      this.data = new Map();
    }

    onReady() {
      return Promise.resolve();
    }

    get(sid, callback) {
      callback(null, this.data.get(sid) || null);
    }

    set(sid, sessionData, callback) {
      this.data.set(sid, sessionData);
      callback(null);
    }

    destroy(sid, callback) {
      this.data.delete(sid);
      callback(null);
    }

    close() {
      return Promise.resolve();
    }
  };
};
