function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function createPresenceEngine() {
  let lastPosition = { x: 0, y: 0 };
  let velocity = { x: 0, y: 0 };

  return {
    update({ telemetry, features }) {
      const activeNodes = telemetry.nodes?.filter((node) => node.enabled).length ?? 0;
      const activity = telemetry.presence_estimate?.activity_score ?? features.temporalActivity ?? 0;
      const featureVariance = features.summary.reduce((sum, item) => sum + item.variance, 0) / Math.max(1, features.summary.length);
      const confidence = clamp((activeNodes / Math.max(1, telemetry.nodes?.length || 1)) * 0.4 + clamp(activity / 10) * 0.4 + clamp(1 / (1 + featureVariance)) * 0.2);

      const measurementWeights = (telemetry.measurements || []).map((measurement) => Math.abs((measurement.rssi_smoothed ?? measurement.rssi ?? -70) + 90));
      const nodes = telemetry.nodes || [];
      const weightTotal = measurementWeights.reduce((sum, value) => sum + value, 0) || 1;
      const estimated = nodes.reduce((acc, node, index) => {
        const weight = measurementWeights[index] || 0;
        acc.x += (node.x || 0) * weight;
        acc.y += (node.y || 0) * weight;
        return acc;
      }, { x: 0, y: 0 });
      const position = { x: estimated.x / weightTotal, y: estimated.y / weightTotal };

      velocity = {
        x: position.x - lastPosition.x,
        y: position.y - lastPosition.y,
      };
      lastPosition = position;

      const movementProbability = clamp(Math.hypot(velocity.x, velocity.y) / 2);
      const state = confidence < 0.3
        ? 'IDLE'
        : movementProbability > 0.5
          ? 'MOVING'
          : activity > 3
            ? 'LIKELY_PRESENCE'
            : 'POSSIBLE_ACTIVITY';

      return {
        state,
        confidence,
        movementProbability,
        activityScore: activity,
        estimatedX: position.x,
        estimatedY: position.y,
        hypotheses: [
          { id: 'primary', x: position.x, y: position.y, confidence },
        ],
      };
    },
  };
}
