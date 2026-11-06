import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

process.env.DB_HOST = '127.0.0.1';
process.env.DB_USER = 'test';
process.env.DB_NAME = 'test';

const calls = [];
const db = {
  async execute(sql, params = []) {
    calls.push({ sql, params });
    if (sql.includes('COUNT(*)')) {
      return [[{ total: 1 }], []];
    }
    if (sql.startsWith('INSERT INTO `countries`')) {
      return [{ insertId: 7, affectedRows: 1 }, []];
    }
    if (sql.includes('FROM `countries` WHERE id = ?')) {
      return [[{ id: params[0], name: 'México' }], []];
    }
    return [[{ id: 7, name: 'México' }], []];
  },
};

const { createApp } = await import('../src/app.js');
const server = createApp(db).listen(0);
let baseUrl;

before(async () => {
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test('versioned health endpoint responds without querying the database', async () => {
  const beforeCalls = calls.length;
  const response = await fetch(`${baseUrl}/api/v1/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', version: 'v1' });
  assert.equal(calls.length, beforeCalls);
});

test('legacy API prefix remains available', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('versioned list endpoint returns data and pagination metadata', async () => {
  const response = await fetch(`${baseUrl}/api/v1/countries?limit=10&offset=0`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    data: [{ id: 7, name: 'México' }],
    pagination: { limit: 10, offset: 0, total: 1 },
  });
});

test('invalid resource payloads are rejected before reaching the database', async () => {
  const beforeCalls = calls.length;
  const response = await fetch(`${baseUrl}/api/v1/countries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '' }),
  });
  assert.equal(response.status, 400);
  assert.equal(calls.length, beforeCalls);
});

test('resource creation uses parameterized SQL and returns the created record', async () => {
  const response = await fetch(`${baseUrl}/api/v1/countries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'México' }),
  });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { data: { id: 7, name: 'México' } });
  assert.ok(calls.some(({ sql, params }) => sql.startsWith('INSERT INTO `countries`') && params[0] === 'México'));
});

test('Swagger documentation is exposed', async () => {
  const response = await fetch(`${baseUrl}/api-docs/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /swagger-ui/);
});
