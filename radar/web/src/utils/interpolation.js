export function idwInterpolate(x, y, points, power = 2) {
  if (!points.length) return 0;
  let numerator = 0;
  let denominator = 0;
  for (const point of points) {
    const distance = Math.hypot(point.x - x, point.y - y);
    if (distance < 1e-6) return point.value;
    const weight = (point.confidence || 1) / distance ** power;
    numerator += weight * point.value;
    denominator += weight;
  }
  return denominator ? numerator / denominator : 0;
}
