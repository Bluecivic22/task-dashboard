import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeatureExtractor } from '../../server/processing/feature_extractor.js';
import { createPresenceEngine } from '../../server/processing/presence_engine.js';
import { createSpatialMapper } from '../../server/processing/spatial_mapper.js';
import { BaselineTracker } from '../../server/processing/baseline_tracker.js';

test('feature extractor returns variance and correlation matrix', () => {
  const extractor = createFeatureExtractor();
  const result = extractor.extract([
    { bssid: 'a', rssi_smoothed: -60 },
    { bssid: 'a', rssi_smoothed: -58 },
    { bssid: 'b', rssi_smoothed: -61 },
    { bssid: 'b', rssi_smoothed: -59 },
  ]);
  assert.equal(result.summary.length, 2);
  assert.equal(result.correlationMatrix.length, 2);
});

test('presence engine yields movement when position changes', () => {
  const engine = createPresenceEngine();
  const payload = {
    telemetry: {
      nodes: [{ x: 0, y: 0, enabled: true }, { x: 10, y: 0, enabled: true }],
      measurements: [{ rssi_smoothed: -50 }, { rssi_smoothed: -55 }],
      presence_estimate: { activity_score: 8 },
    },
    features: { summary: [{ variance: 0.3 }], temporalActivity: 2 },
  };
  const first = engine.update(payload);
  const second = engine.update({
    ...payload,
    telemetry: { ...payload.telemetry, measurements: [{ rssi_smoothed: -40 }, { rssi_smoothed: -70 }] },
  });
  assert.match(first.state, /MOVING|LIKELY_PRESENCE/);
  assert.match(second.state, /MOVING|LIKELY_PRESENCE/);
});

test('spatial mapper generates grid cells', () => {
  const mapper = createSpatialMapper();
  const map = mapper.generate({
    nodes: [{ x: 0, y: 0, baseline_rssi: -60, confidence: 1 }],
    measurements: [{ rssi_smoothed: -50 }],
    width: 10,
    height: 10,
    resolution: 4,
  });
  assert.equal(map.cells.length, 16);
});

test('baseline tracker detects environmental change', () => {
  const tracker = new BaselineTracker(0.5, 3);
  tracker.update('n1', -60);
  tracker.update('n1', -60);
  assert.equal(tracker.classify('n1', -70), 'environmental-change');
});
