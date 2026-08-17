export function formatUptime(ms = 0) {
  const total = Math.floor(ms / 1000);
  const hours = String(Math.floor(total / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function formatRssi(value) {
  return Number.isFinite(value) ? `${Math.round(value)} dBm` : 'n/a';
}

export function formatConfidence(value = 0) {
  return `${Math.round(value * 100)}%`;
}

export function formatPosition(x = 0, y = 0) {
  return `${x.toFixed(1)} m, ${y.toFixed(1)} m`;
}

export function formatTimestamp(value) {
  return new Date(value).toLocaleTimeString();
}
