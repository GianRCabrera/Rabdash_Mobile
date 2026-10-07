const request = require('supertest');
const { loadApp } = require('./helpers');

// First slice of the app.js-to-route-modules split (routes/reportTemplates.js)
// — stateless file-serving routes with no DB/session dependency, extracted
// first specifically because they're the lowest-risk way to prove out the
// extraction pattern (express.Router(), path resolution from a subdirectory)
// before touching anything stateful.
describe('Downloadable report template routes', () => {
  let app;

  beforeAll(() => {
    ({ app } = loadApp());
  });

  const templates = [
    'Vaccination_Report_form.xlsx',
    'Neuter_Report_form.xlsx',
    'Rabies_Sample_Report_form.xlsx',
    'IEC_Report_form.xlsx',
    'Daily_Report_form.xlsx',
    'Schedule_Report_form.xlsx',
    'Budget_Report_form.xlsx',
    'Rabies_Exposure_Report_form.xlsx',
  ];

  test.each(templates)('GET /%s serves the real .xlsx file', async (filename) => {
    const res = await request(app).get(`/${filename}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/spreadsheetml|octet-stream/);
  });

  test('a nonexistent template filename gets a 404, not an app crash', async () => {
    const res = await request(app).get('/Nonexistent_Report_form.xlsx');
    expect(res.status).toBe(404);
  });
});
