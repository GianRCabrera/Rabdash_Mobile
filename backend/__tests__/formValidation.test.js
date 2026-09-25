const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

describe('Form submission required-field validation', () => {
  let app;
  let pool;
  const email = 'form-validation@example.invalid';
  const password = 'SomePassword1!';

  beforeAll(async () => {
    ({ app, pool } = loadApp());
    const hash = await bcrypt.hash(password, 10);
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', [
      { email, password: hash, position: 'Private Veterinarian' },
    ]);
  });

  const loginAs = async () => {
    const agent = request.agent(app);
    await agent.post('/login').send({ email, password });
    return agent;
  };

  const vaccinationPayload = {
    date: '2026-01-01', district: 'D', barangay: 'B', purok: 'P', vaccinator: 'V', timeStart: '08:00',
    ownerName: 'Owner', address: 'Addr', sex: 'M', contactNo: '09171234567',
    petName: 'Rex', petAge: '2', species: 'Dog', petSex: 'M', color: 'Brown', cardNo: '1',
    vaccine: 'Vax', source: 'Src', dateVaccinated: '2026-01-01', timeFinish: '09:00',
  };

  test('submitting a form missing a required field is rejected with 400 naming the field', async () => {
    const agent = await loginAs();
    const { ownerName, ...incomplete } = vaccinationPayload;
    const res = await agent.post('/submitVaccinationForm').send(incomplete);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/ownerName/);
  });

  test('a complete vaccination form submission succeeds', async () => {
    const agent = await loginAs();
    const res = await agent.post('/submitVaccinationForm').send(vaccinationPayload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('a numeric 0 in a required field (e.g. pets/cat counts) is not treated as missing', async () => {
    const agent = await loginAs();
    const res = await agent.post('/submitNeuterForm').send({
      date: '2026-01-01', district: 'D', barangay: 'B', purok: 'P', proc: 'Neuter', client: 'C',
      address: 'Addr', contactNo: '09171234567', name: 'Rex', species: 'Dog', sex: 'M', breed: 'Mix',
      age: '2', pets: 0, cat: 0,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  const rabiesExposurePayload = {
    regNo: '1', regDate: '2026-01-01', name: 'Patient', address: 'Addr', age: '30', sex: 'F',
    expDate: '2026-01-01', place: 'Place', typeAnimal: 'Dog', typeBNB: 'B', site: 'Arm',
    category: '2', washing: 'Yes', brand: 'Brand', outcome: 'C', bitingStatus: 'Alive', remarks: 'None',
  };

  test('the Rabies Exposure form succeeds without the longitudinal dose fields (RIG/route/d0-d28)', async () => {
    const agent = await loginAs();
    const res = await agent.post('/submitRabiesExposureForm').send(rabiesExposurePayload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('the Rabies Exposure form still rejects a missing genuinely-required field', async () => {
    const agent = await loginAs();
    const { name, ...incomplete } = rabiesExposurePayload;
    const res = await agent.post('/submitRabiesExposureForm').send(incomplete);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name/);
  });
});
