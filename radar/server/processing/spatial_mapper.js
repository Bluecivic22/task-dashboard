function idw(x, y, points, power = 2) {
  if (!points.length) return 0;
  let numerator = 0;
  let denominator = 0;
  for (const point of points) {
    const distance = Math.hypot(x - point.x, y - point.y);
    if (distance < 1e-6) return point.value;
    const weight = point.confidence / distance ** power;
    numerator += weight * point.value;
    denominator += weight;
  }
  return denominator ? numerator / denominator : 0;
}

function rbf(x, y, points, sigma = 2) {
  if (!points.length) return 0;
  let numerator = 0;
  let denominator = 0;
  for (const point of points) {
    const distance = Math.hypot(x - point.x, y - point.y);
    const weight = Math.exp(-(distance ** 2) / (2 * sigma ** 2));
    numerator += weight * point.value;
    denominator += weight;
  }
  return denominator ? numerator / denominator : 0;
}

export function createSpatialMapper() {
  return {
    generate({ nodes = [], measurements = [], width = 10, height = 10, resolution = 20, method = 'idw' }) {
      const points = nodes.map((node, index) => ({
        x: node.x || 0,
        y: node.y || 0,
        value: Math.abs((measurements[index]?.rssi_smoothed ?? measurements[index]?.rssi ?? -70) - (node.baseline_rssi ?? -60)),
        confidence: node.confidence ?? 0.5,
      }));
      const cells = [];
      for (let row = 0; row < resolution; row += 1) {
        for (let col = 0; col < resolution; col += 1) {
          const x = (width * col) / Math.max(1, resolution - 1);
          const y = (height * row) / Math.max(1, resolution - 1);
          const value = method === 'rbf' ? rbf(x, y, points) : idw(x, y, points);
          const nearest = points.length ? Math.min(...points.map((point) => Math.hypot(point.x - x, point.y - y))) : width + height;
          cells.push({ x, y, value, confidence: 1 / (1 + nearest) });
        }
      }
      return { method, width, height, resolution, cells };
    },
  };
}
