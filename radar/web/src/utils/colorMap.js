export function heatColor(value = 0, alpha = 1) {
  if (value < 0.2) return `rgba(102, 102, 102, ${alpha})`;
  if (value < 0.5) return `rgba(201, 168, 76, ${alpha})`;
  if (value < 0.8) return `rgba(232, 201, 106, ${alpha})`;
  return `rgba(232, 122, 58, ${alpha})`;
}

export function statusColor(state = 'UNKNOWN') {
  return {
    IDLE: '#4a9e6b',
    POSSIBLE_ACTIVITY: '#e8c96a',
    LIKELY_PRESENCE: '#c9a84c',
    MOVING: '#e87a3a',
    STATIONARY_PRESENCE: '#c9a84c',
    ENVIRONMENTAL_CHANGE: '#6699cc',
    UNKNOWN: '#666666',
  }[state] || '#666666';
}

export function statusLabel(state = 'UNKNOWN') {
  return {
    IDLE: { title: 'Idle', description: 'No confident activity above baseline.' },
    POSSIBLE_ACTIVITY: { title: 'Possible Activity', description: 'Single-node or moderate deviation observed.' },
    LIKELY_PRESENCE: { title: 'Likely Presence', description: 'Multi-node correlation suggests occupancy.' },
    MOVING: { title: 'Moving Presence', description: 'Telemetry indicates active movement across the grid.' },
    STATIONARY_PRESENCE: { title: 'Stationary Presence', description: 'Strong presence with low movement.' },
    ENVIRONMENTAL_CHANGE: { title: 'Environmental Change', description: 'Baseline drift suggests a persistent room change.' },
    UNKNOWN: { title: 'Unknown', description: 'Awaiting telemetry or calibration.' },
  }[state] || { title: 'Unknown', description: 'Awaiting telemetry or calibration.' };
}
