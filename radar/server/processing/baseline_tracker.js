export class BaselineTracker {
  constructor(alpha = 0.02, driftThreshold = 8) {
    this.alpha = alpha;
    this.driftThreshold = driftThreshold;
    this.baselines = new Map();
  }

  update(nodeId, value) {
    const current = this.baselines.get(nodeId) ?? value;
    const next = current + this.alpha * (value - current);
    this.baselines.set(nodeId, next);
    return next;
  }

  deviation(nodeId, value) {
    const baseline = this.baselines.get(nodeId) ?? value;
    return value - baseline;
  }

  classify(nodeId, value) {
    const deviation = Math.abs(this.deviation(nodeId, value));
    return deviation >= this.driftThreshold ? 'environmental-change' : 'transient';
  }
}
