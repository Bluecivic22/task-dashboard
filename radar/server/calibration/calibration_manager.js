export class CalibrationManager {
  constructor(store) {
    this.store = store;
    this.active = false;
    this.startedAt = null;
    this.baselines = [];
  }

  async getStatus() {
    return {
      active: this.active,
      startedAt: this.startedAt,
      baselineSamples: this.baselines.length,
    };
  }

  async start(config = {}) {
    this.active = true;
    this.startedAt = Date.now();
    this.baselines = [];
    return { active: true, config };
  }

  async stop() {
    this.active = false;
    await this.store.storeCalibration({ baselines: this.baselines, stoppedAt: Date.now() });
    return { active: false, baselines: this.baselines.length };
  }

  async recordBaseline(payload) {
    this.baselines.push({ timestamp: Date.now(), payload });
    return {
      saved: true,
      count: this.baselines.length,
      average: this.baselines.reduce((sum, sample) => sum + (sample.payload.value || 0), 0) / this.baselines.length,
    };
  }
}
