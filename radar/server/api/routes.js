export function registerRoutes(app, deps) {
  const { store, calibrationManager, simulator, state } = deps;

  app.get('/api/status', async (_req, res) => {
    res.json({
      connectionState: state.connectionState,
      hasTelemetry: Boolean(state.latestTelemetry),
      latestPresence: state.latestPresence,
      latestSpatial: state.latestSpatial,
    });
  });

  app.get('/api/history', async (req, res) => {
    const { start, end, node } = req.query;
    res.json({ history: await store.getHistory({ start, end, node }) });
  });

  app.get('/api/heatmap/history', async (_req, res) => {
    res.json({ heatmaps: await store.getHeatmapHistory() });
  });

  app.get('/api/events', async (_req, res) => {
    res.json({ events: await store.getEvents() });
  });

  app.get('/api/presence', async (_req, res) => {
    res.json({ presence: state.latestPresence });
  });

  app.get('/api/spatial', async (_req, res) => {
    res.json({ spatial: state.latestSpatial });
  });

  app.get('/api/calibration', async (_req, res) => {
    res.json(await calibrationManager.getStatus());
  });

  app.post('/api/calibration/start', async (req, res) => {
    res.status(202).json(await calibrationManager.start(req.body || {}));
  });

  app.post('/api/calibration/stop', async (_req, res) => {
    res.json(await calibrationManager.stop());
  });

  app.post('/api/calibration/baseline', async (req, res) => {
    res.json(await calibrationManager.recordBaseline(req.body || {}));
  });

  app.post('/api/simulation/start', async (req, res) => {
    const payload = await simulator.start(req.body || {});
    res.status(202).json(payload);
  });

  app.post('/api/simulation/stop', async (_req, res) => {
    res.json(await simulator.stop());
  });

  app.post('/api/simulation/config', async (req, res) => {
    res.json(await simulator.configure(req.body || {}));
  });
}
