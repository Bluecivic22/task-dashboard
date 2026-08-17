import test from 'node:test';
import assert from 'node:assert/strict';
import { registerRoutes } from '../../server/api/routes.js';

function createMockApp() {
  const routes = [];
  return {
    routes,
    get(path, handler) { routes.push({ method: 'GET', path, handler }); },
    post(path, handler) { routes.push({ method: 'POST', path, handler }); },
  };
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

test('registerRoutes exposes simulation start endpoint', async () => {
  const app = createMockApp();
  registerRoutes(app, {
    store: { getHistory: async () => [], getHeatmapHistory: async () => [], getEvents: async () => [] },
    calibrationManager: { getStatus: async () => ({ active: false }), start: async () => ({}), stop: async () => ({}), recordBaseline: async () => ({}) },
    simulator: { start: async () => ({ running: true }), stop: async () => ({ running: false }), configure: async () => ({}) },
    state: { connectionState: 'idle', latestPresence: null, latestSpatial: null, latestTelemetry: null },
  });
  const route = app.routes.find((entry) => entry.path === '/api/simulation/start');
  const res = createResponse();
  await route.handler({ body: { people: 1 } }, res);
  assert.equal(res.statusCode, 202);
  assert.equal(res.body.running, true);
});

test('history route forwards query to store', async () => {
  const app = createMockApp();
  let querySeen = null;
  registerRoutes(app, {
    store: {
      getHistory: async (query) => { querySeen = query; return [{ timestamp: 1 }]; },
      getHeatmapHistory: async () => [],
      getEvents: async () => [],
    },
    calibrationManager: { getStatus: async () => ({}), start: async () => ({}), stop: async () => ({}), recordBaseline: async () => ({}) },
    simulator: { start: async () => ({}), stop: async () => ({}), configure: async () => ({}) },
    state: { connectionState: 'idle', latestPresence: null, latestSpatial: null, latestTelemetry: null },
  });
  const route = app.routes.find((entry) => entry.path === '/api/history');
  const res = createResponse();
  await route.handler({ query: { start: '10', end: '20', node: 'n1' } }, res);
  assert.deepEqual(querySeen, { start: '10', end: '20', node: 'n1' });
  assert.equal(res.body.history.length, 1);
});
