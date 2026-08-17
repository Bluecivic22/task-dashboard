export class Simulator {
  constructor() {
    this.running = false;
    this.intervalMs = 1000;
    this.config = {
      width: 10,
      height: 10,
      people: 1,
      noiseLevel: 0.5,
      sensorFailure: false,
      position: { x: 5, y: 5 },
      speed: 0.2,
      direction: 45,
    };
    this.listeners = new Set();
    this.timer = null;
    this.nodes = [
      { id: 'n1', name: 'North', x: 1, y: 1, baseline_rssi: -60, confidence: 0.9, enabled: true },
      { id: 'n2', name: 'East', x: 9, y: 1, baseline_rssi: -60, confidence: 0.9, enabled: true },
      { id: 'n3', name: 'South', x: 5, y: 9, baseline_rssi: -60, confidence: 0.9, enabled: true },
    ];
  }

  onTelemetry(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit() {
    const telemetry = this.generateTelemetry();
    for (const listener of this.listeners) listener(telemetry);
  }

  generateTelemetry() {
    const radians = (this.config.direction * Math.PI) / 180;
    this.config.position.x = (this.config.position.x + Math.cos(radians) * this.config.speed + this.config.width) % this.config.width;
    this.config.position.y = (this.config.position.y + Math.sin(radians) * this.config.speed + this.config.height) % this.config.height;
    const measurements = this.nodes.map((node, index) => {
      const distance = Math.hypot(this.config.position.x - node.x, this.config.position.y - node.y);
      const bodyLoss = this.config.people * 2.5;
      const obstacleLoss = this.config.sensorFailure && index === 0 ? 15 : 0;
      const noise = (Math.sin(Date.now() / 500 + index) * this.config.noiseLevel * 2);
      const rssi = -45 - distance * 3 - bodyLoss - obstacleLoss + noise;
      return {
        nodeId: node.id,
        bssid: node.id,
        rssi,
        rssi_smoothed: rssi,
        rssi_variance: Math.abs(noise),
        rssi_derivative: Math.cos(Date.now() / 500 + index) * this.config.noiseLevel,
        stability: 1 / (1 + Math.abs(noise)),
        timestamp: Date.now(),
      };
    });
    return {
      timestamp: Date.now(),
      nodes: this.nodes,
      measurements,
      presence_estimate: {
        state: this.config.people > 0 ? 'MOVING' : 'IDLE',
        presence_probability: this.config.people > 0 ? 0.8 : 0.1,
        movement_probability: this.config.speed > 0 ? 0.7 : 0.1,
        activity_score: this.config.people * 3 + this.config.noiseLevel,
        confidence: this.config.sensorFailure ? 0.5 : 0.85,
        estimated_x: this.config.position.x,
        estimated_y: this.config.position.y,
      },
      config: {
        grid_width_m: this.config.width,
        grid_height_m: this.config.height,
        heatmap_resolution: 12,
      },
    };
  }

  async start(config = {}) {
    this.config = { ...this.config, ...config, position: { ...this.config.position, ...(config.position || {}) } };
    this.running = true;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.emit(), this.intervalMs);
    this.emit();
    return { running: true, config: this.config };
  }

  async stop() {
    this.running = false;
    clearInterval(this.timer);
    this.timer = null;
    return { running: false };
  }

  async configure(config = {}) {
    this.config = { ...this.config, ...config, position: { ...this.config.position, ...(config.position || {}) } };
    return { running: this.running, config: this.config };
  }
}
