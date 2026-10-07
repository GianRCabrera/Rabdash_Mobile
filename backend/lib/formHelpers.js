const { pool, webPool, queryDatabase } = require('../db');
const { REVIEWER_POSITIONS } = require('../constants');

// Guards edit/delete on a form record: only the submitter (matched by username) or a
// reviewer may modify it. `table` is always a hardcoded literal from the call site,
// never user input, so it's safe to interpolate into the query.
//
// `dbOrigin` ('mobile' | 'web' | undefined) is which database the caller believes this
// row came from — see the get*FormsCVO/isReviewer list endpoints, which tag every row
// they return with dbOrigin since they merge results from `pool` and `webPool`. Mobile
// and web rows are independent auto-increment sequences, so the same numeric `id` can
// legitimately exist in both databases at once. Every mutation below only ever touches
// `pool` by `id`, so without this check, a reviewer editing/deleting a web-sourced row
// would silently mutate an unrelated mobile row that happens to share its id, instead of
// failing or doing nothing. Rejecting dbOrigin==='web' outright (rather than attempting
// the mutation against `webPool`) is deliberate: we haven't verified the web DB's schema
// matches column-for-column, and it has its own independent admin/edit workflow via the
// companion website.
// Sends the response and returns false when the caller should stop; true means proceed.
const authorizeFormMutation = async (req, res, table, id, dbOrigin) => {
  if (dbOrigin === 'web') {
    res.status(403).json({ message: 'This record was submitted through the website and cannot be edited or deleted from the mobile app.' });
    return false;
  }
  const { user } = req.session;
  const rows = await queryDatabase(pool, `SELECT username FROM ${table} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    res.status(404).json({ message: 'Record not found' });
    return false;
  }
  if (rows[0].username !== user.email && !REVIEWER_POSITIONS.includes(user.position)) {
    res.status(403).json({ message: 'Forbidden: you do not have permission to modify this record' });
    return false;
  }
  return true;
};

// Tags every row from a merged mobile+web list query with which database it came from,
// so the frontend can hide edit/delete for web-sourced rows and pass dbOrigin back on
// mutation requests — see authorizeFormMutation above for why this matters.
const tagOrigin = (mobileRows, webRows) => [
  ...mobileRows.map((row) => ({ ...row, dbOrigin: 'mobile' })),
  ...webRows.map((row) => ({ ...row, dbOrigin: 'web' })),
];

// Rejects with 400 if any of `fields` is missing/blank in req.body; returns
// true otherwise. None of the form-submission endpoints validated required
// fields before this — a missing field silently became NULL (or a raw 500
// if the column is NOT NULL) instead of a clear 400. Required-field lists
// below were taken from each form screen's own client-side "fill in all
// fields" check, not guessed — some fields (e.g. the Rabies Exposure form's
// vaccine-dose dates) are deliberately optional there and are excluded here
// too, since they're filled in over weeks, not all at once.
const requireFields = (req, res, fields) => {
  const missing = fields.filter((field) => {
    const value = req.body[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });
  if (missing.length > 0) {
    res.status(400).json({ success: false, message: `Missing required field(s): ${missing.join(', ')}` });
    return false;
  }
  return true;
};

const nowMysql = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// Builds a submit (INSERT) handler for the pattern shared by every form
// type: derive username from the session, validate required fields, insert
// with created_at/updated_at timestamps, return { success, message, id }.
// Route must have requireAuth applied. `fields` is the table's complete set
// of user-editable columns, used to build the INSERT; `requiredFields`
// (defaults to all of `fields`) is the subset requireFields checks — pass a
// smaller list for forms with genuinely optional fields (see the Rabies
// Exposure form's longitudinal dose-date fields).
const createSubmitHandler = (table, label, fields, requiredFields = fields) => async (req, res) => {
  const username = req.session.user.email;

  if (!requireFields(req, res, requiredFields)) return;

  const createdAt = nowMysql();
  const updatedAt = createdAt;

  const columns = ['username', ...fields, 'created_at', 'updated_at'];
  const values = [username, ...fields.map((field) => req.body[field]), createdAt, updatedAt];
  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;

  try {
    const result = await queryDatabase(pool, query, values);
    console.log(`${label} form data inserted successfully. New ID:`, result.insertId);
    res.json({ success: true, message: `${label} form data submitted successfully`, id: result.insertId });
  } catch (error) {
    console.error(`Error during ${label} form submission:`, error);
    res.status(500).json({ success: false, message: `An error occurred during ${label} form submission` });
  }
};

// Builds an edit (UPDATE) handler for the pattern shared by every form
// type: authorize via authorizeFormMutation (ownership + dbOrigin check),
// validate required fields, overwrite every field plus updated_at. Route
// must have requireAuth applied. Authorization runs before validation so an
// unauthorized/malformed request always gets 403/404, never a 400 that
// would tell an attacker their payload shape without confirming access
// first. `requiredFields` defaults to all of `fields` — see
// createSubmitHandler for why a form might pass a smaller subset.
const createEditHandler = (table, label, fields, requiredFields = fields) => async (req, res) => {
  const { id, dbOrigin } = req.body;
  const updatedAt = nowMysql();
  const setClause = fields.map((field) => `${field}=?`).join(', ');
  const values = [...fields.map((field) => req.body[field]), updatedAt, id];
  const query = `UPDATE ${table} SET ${setClause}, updated_at=? WHERE id=?`;

  try {
    if (!(await authorizeFormMutation(req, res, table, id, dbOrigin))) return;
    if (!requireFields(req, res, requiredFields)) return;
    await queryDatabase(pool, query, values);
    console.log(`${label} form data updated successfully for ID:`, id);
    res.json({ success: true, message: `${label} Form updated successfully`, id });
  } catch (error) {
    console.error(`Error during ${label} form update:`, error);
    res.status(500).json({ success: false, message: `An error occurred during ${label} form update` });
  }
};

// Builds a paginated, searchable list handler for the CVO/reviewer-merged
// endpoints whose underlying tables can be huge — the web side of
// vaccination_form alone has 400k+ rows (years of the companion website's
// own usage), which is what originally OOM-crashed the unbounded version
// of this query and then got a flat LIMIT 500 stopgap. Neither an unbounded
// query nor a bigger flat cap scales here; this replaces both with real
// LIMIT/OFFSET paging plus a server-side search (a WHERE clause), since no
// client could reasonably hold hundreds of thousands of rows to filter
// locally — client-side search over an already-loaded page would also
// silently miss every record not on that page, which reads as "no results"
// for a record that actually exists.
//
// `searchFields` is a deliberately narrow column subset (not every field
// the form has) — both for query performance (no indexes on most columns
// here) and because it's what a reviewer actually searches by: an owner's
// or patient's name, a pet's name, a reference/card number.
//
// Mobile and web are each paginated independently with the same
// limit/offset, then merged and re-sorted — not a true globally-ranked
// top-K across both sources. Deliberate: the mobile side's row counts for
// these tables are tiny (dozens) next to the web side's (hundreds of
// thousands), so early pages naturally include both sources' recent rows
// together, and once the much smaller mobile source is exhausted, deeper
// pages are effectively just paging through the web side's history —
// which is correct behavior, not a bug.
const createPaginatedCvoListHandler = (table, searchFields) => async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();

  const whereClause = search ? `WHERE ${searchFields.map((field) => `${field} LIKE ?`).join(' OR ')}` : '';
  const searchParams = search ? searchFields.map(() => `%${search}%`) : [];

  const listQuery = `SELECT * FROM ${table} ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  const countQuery = `SELECT COUNT(*) AS total FROM ${table} ${whereClause}`;

  try {
    const [mobileResults, webResults, mobileCount, webCount] = await Promise.all([
      queryDatabase(pool, listQuery, [...searchParams, limit, offset]),
      queryDatabase(webPool, listQuery, [...searchParams, limit, offset]),
      queryDatabase(pool, countQuery, searchParams),
      queryDatabase(webPool, countQuery, searchParams),
    ]);

    const data = tagOrigin(mobileResults, webResults).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const total = mobileCount[0].total + webCount[0].total;

    res.json({ data, page, limit, total });
  } catch (error) {
    console.error(`Error retrieving ${table} (paginated):`, error);
    res.status(500).json({ success: false, message: 'An error occurred while retrieving records' });
  }
};

// Builds a paginated, searchable list handler for the single-endpoint
// pattern shared by Animal Control, IEC, Schedule, Budget, and Rabies
// Exposure: one route (requireAuth, not requireReviewer) that branches at
// runtime — reviewers see everything, everyone else sees only their own
// (username-scoped) rows, still merged across both databases. Their actual
// row counts are in the hundreds today (nowhere near vaccination_form's
// 400k+), so this isn't fixing an active emergency the way that one was —
// it's applying the same real pagination/search for consistency and so a
// flat cap doesn't quietly become the next stopgap if usage grows.
const createScopedPaginatedListHandler = (table, searchFields) => async (req, res) => {
  const { user } = req.session;
  const isReviewer = REVIEWER_POSITIONS.includes(user.position);

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();

  const conditions = [];
  const scopeParams = [];
  if (!isReviewer) {
    conditions.push('username = ?');
    scopeParams.push(user.email);
  }
  const searchParams = search ? searchFields.map(() => `%${search}%`) : [];
  if (search) {
    conditions.push(`(${searchFields.map((field) => `${field} LIKE ?`).join(' OR ')})`);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const queryParams = [...scopeParams, ...searchParams];

  const listQuery = `SELECT * FROM ${table} ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  const countQuery = `SELECT COUNT(*) AS total FROM ${table} ${whereClause}`;

  try {
    const [mobileResults, webResults, mobileCount, webCount] = await Promise.all([
      queryDatabase(pool, listQuery, [...queryParams, limit, offset]),
      queryDatabase(webPool, listQuery, [...queryParams, limit, offset]),
      queryDatabase(pool, countQuery, queryParams),
      queryDatabase(webPool, countQuery, queryParams),
    ]);

    const data = tagOrigin(mobileResults, webResults).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const total = mobileCount[0].total + webCount[0].total;

    res.json({ data, page, limit, total });
  } catch (error) {
    console.error(`Error retrieving ${table} (scoped, paginated):`, error);
    res.status(500).json({ success: false, message: 'An error occurred while retrieving records' });
  }
};

module.exports = {
  authorizeFormMutation,
  tagOrigin,
  requireFields,
  nowMysql,
  createSubmitHandler,
  createEditHandler,
  createPaginatedCvoListHandler,
  createScopedPaginatedListHandler,
};
