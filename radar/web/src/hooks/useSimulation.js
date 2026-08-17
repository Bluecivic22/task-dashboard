import { useEffect, useMemo, useState } from 'react';

function generateTelemetry(config) {
  const { x, y, speed, direction, noiseLevel, people, sensorFailure } = config;
  const nodes = [
    { id: 'n1', name: 'North', x: 1, y: 1, baseline_rssi: -60, confidence: 0.9, enabled: true, calibrated: true },
    { id: 'n2', name: 'East', x: 9, y: 1, baseline_rssi: -60, confidence: 0.9, enabled: true, calibrated: true },
    { id: 'n3', name: 'South', x: 5, y: 9, baseline_rssi: -60, confidence: 0.9, enabled: true, calibrated: true },
  ];
  const measurements = nodes.map((node, index) => {
    const distance = Math.hypot(node.x - x, node.y - y);
    const noise = Math.sin(Date.now() / 600 + index) * noiseLevel;
    const loss = sensorFailure && index === 0 ? 10 : 0;
    const rssi = -45 - distance * 3 - people * 2 - loss + noise;
    return {
      nodeId: node.id,
      bssid: node.id,
      rssi,
      rssi_smoothed: rssi,
      rssi_variance: Math.abs(noise),
      rssi_derivative: Math.cos(Date.now() / 600 + index) * speed,
      stability: 1 / (1 + Math.abs(noise)),
      timestamp: Date.now(),
    };
  });
  return {
    timestamp: Date.now(),
    device_info: { fw_version: 'sim', uptime_ms: Date.now(), wifi_status: 'SIMULATION', free_heap: 999999 },
    nodes,
    measurements,
    presence_estimate: {
      state: people > 0 ? (speed > 0.1 ? 'MOVING' : 'LIKELY_PRESENCE') : 'IDLE',
      presence_probability: people > 0 ? 0.86 : 0.12,
      movement_probability: speed > 0 ? 0.74 : 0.14,
      activity_score: people * 2 + noiseLevel,
      confidence: sensorFailure ? 0.56 : 0.88,
      estimated_x: x,
      estimated_y: y,
      direction_deg: direction,
      num_active_nodes: sensorFailure ? 2 : 3,
    },
    spatial_model_summary: {
      cells: Array.from({ length: 25 }, (_, index) => ({
        x: (index % 5) * 2.5,
        y: Math.floor(index / 5) * 2.5,
        activity_score: Math.max(0, 1 - Math.hypot((index % 5) * 2.5 - x, Math.floor(index / 5) * 2.5 - y) / 10),
        confidence: sensorFailure ? 0.6 : 0.9,
      })),
    },
    system_health: sensorFailure ? 0.62 : 0.91,
  };
}

export function useSimulation() {
  const [config, setConfig] = useState({ x: 5, y: 5, speed: 0.2, direction: 45, people: 1, noiseLevel: 0.4, sensorFailure: false });
  const [telemetry, setTelemetry] = useState(generateTelemetry(config));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setConfig((current) => ({
        ...current,
        x: (current.x + Math.cos((current.direction * Math.PI) / 180) * current.speed + 10) % 10,
        y: (current.y + Math.sin((current.direction * Math.PI) / 180) * current.speed + 10) % 10,
      }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setTelemetry(generateTelemetry(config));
  }, [config]);

  return useMemo(() => ({ telemetry, config, setConfig }), [telemetry, config]);
}
