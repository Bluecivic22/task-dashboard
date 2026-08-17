export class DataStore {
  constructor(filename = ':memory:') {
    this.filename = filename;
    this.db = null;
    this.memory = {
      measurements: [],
      presenceEvents: [],
      calibrationData: [],
      layouts: [],
      config: [],
      systemEvents: [],
      heatmaps: [],
    };
  }

  async init() {
    try {
      const { default: Database } = await import('better-sqlite3');
      this.db = new Database(this.filename);
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS measurements (timestamp INTEGER, node TEXT, payload TEXT);
        CREATE TABLE IF NOT EXISTS presence_events (timestamp INTEGER, payload TEXT);
        CREATE TABLE IF NOT EXISTS calibration_data (timestamp INTEGER, payload TEXT);
        CREATE TABLE IF NOT EXISTS layouts (timestamp INTEGER, payload TEXT);
        CREATE TABLE IF NOT EXISTS config (timestamp INTEGER, payload TEXT);
        CREATE TABLE IF NOT EXISTS system_events (timestamp INTEGER, payload TEXT);
      `);
    } catch {
      this.db = null;
    }
  }

  async insertTelemetry(telemetry) {
    const timestamp = telemetry.timestamp || Date.now();
    for (const measurement of telemetry.measurements || []) {
      if (this.db) {
        this.db.prepare('INSERT INTO measurements (timestamp, node, payload) VALUES (?, ?, ?)').run(timestamp, measurement.bssid || measurement.nodeId || 'unknown', JSON.stringify(measurement));
      } else {
        this.memory.measurements.push({ timestamp, node: measurement.bssid || measurement.nodeId || 'unknown', payload: measurement });
      }
    }
    this.memory.heatmaps.push({ timestamp, payload: telemetry.spatial_model_summary || null });
  }

  async getHistory({ start, end, node } = {}) {
    const startMs = start ? Number(start) : 0;
    const endMs = end ? Number(end) : Number.MAX_SAFE_INTEGER;
    return this.memory.measurements.filter((entry) => entry.timestamp >= startMs && entry.timestamp <= endMs && (!node || entry.node === node));
  }

  async getHeatmapHistory() {
    return this.memory.heatmaps;
  }

  async getEvents() {
    return this.memory.systemEvents;
  }

  async storeCalibration(data) {
    this.memory.calibrationData.push({ timestamp: Date.now(), payload: data });
    return { ok: true };
  }
}
