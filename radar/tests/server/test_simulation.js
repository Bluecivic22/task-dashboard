import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulator } from '../../server/simulation/simulator.js';

test('simulator generates plausible telemetry', () => {
  const simulator = new Simulator();
  const telemetry = simulator.generateTelemetry();
  assert.equal(Array.isArray(telemetry.measurements), true);
  assert.equal(telemetry.measurements.length, 3);
  assert.equal(typeof telemetry.presence_estimate.estimated_x, 'number');
});

test('simulator config updates noise and failure', async () => {
  const simulator = new Simulator();
  await simulator.configure({ noiseLevel: 2, sensorFailure: true });
  const telemetry = simulator.generateTelemetry();
  assert.equal(telemetry.presence_estimate.confidence < 0.9, true);
});
