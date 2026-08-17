import http from 'node:http';
import process from 'node:process';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { registerRoutes } from './api/routes.js';
import { DataStore } from './storage/data_store.js';
import { CalibrationManager } from './calibration/calibration_manager.js';
import { Simulator } from './simulation/simulator.js';
import { createPresenceEngine } from './processing/presence_engine.js';
import { createSpatialMapper } from './processing/spatial_mapper.js';
import { createFeatureExtractor } from './processing/feature_extractor.js';
import { BaselineTracker } from './processing/baseline_tracker.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const store = new DataStore(process.env.RADAR_DB_PATH || ':memory:');
await store.init();
const calibrationManager = new CalibrationManager(store);
const simulator = new Simulator();
const featureExtractor = createFeatureExtractor();
const presenceEngine = createPresenceEngine();
const spatialMapper = createSpatialMapper();
const baselineTracker = new BaselineTracker();

const state = {
  latestTelemetry: null,
  latestPresence: null,
  latestSpatial: null,
  connectionState: 'idle',
  relayMessages: [],
};

registerRoutes(app, {
  store,
  calibrationManager,
  simulator,
  featureExtractor,
  presenceEngine,
  spatialMapper,
  baselineTracker,
  state,
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(data) {
  const message = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  }
}

function processTelemetry(telemetry) {
  state.latestTelemetry = telemetry;
  store.insertTelemetry(telemetry);
  const features = featureExtractor.extract(telemetry.measurements || []);
  state.latestPresence = presenceEngine.update({ telemetry, features });
  state.latestSpatial = spatialMapper.generate({
    nodes: telemetry.nodes || [],
    measurements: telemetry.measurements || [],
    width: telemetry.config?.grid_width_m || 10,
    height: telemetry.config?.grid_height_m || 10,
    resolution: telemetry.config?.heatmap_resolution || 20,
  });
  broadcast({
    type: 'TELEMETRY',
    payload: {
      telemetry,
      features,
      presence: state.latestPresence,
      spatial: state.latestSpatial,
    },
  });
}

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'SYSTEM', payload: { connected: true } }));
  if (state.latestTelemetry) {
    socket.send(JSON.stringify({ type: 'SNAPSHOT', payload: state.latestTelemetry }));
  }
});

simulator.onTelemetry((telemetry) => processTelemetry(telemetry));

const firmwareUrl = process.env.RADAR_FIRMWARE_WS;
if (firmwareUrl) {
  const relay = new WebSocket(firmwareUrl);
  state.connectionState = 'connecting';
  relay.on('open', () => {
    state.connectionState = 'connected';
  });
  relay.on('message', (message) => {
    try {
      const parsed = JSON.parse(String(message));
      const payload = parsed.payload || parsed;
      state.relayMessages.push({ timestamp: Date.now(), type: parsed.type || 'RAW' });
      processTelemetry(payload);
    } catch (error) {
      state.connectionState = `parse_error:${error.message}`;
    }
  });
  relay.on('close', () => {
    state.connectionState = 'closed';
  });
  relay.on('error', (error) => {
    state.connectionState = `error:${error.message}`;
  });
}

const port = Number(process.env.PORT || 4780);
server.listen(port, () => {
  console.log(`RADAR server listening on ${port}`);
});
