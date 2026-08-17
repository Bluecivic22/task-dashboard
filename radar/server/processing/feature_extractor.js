function variance(values) {
  if (!values.length) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

function correlation(a, b) {
  if (!a.length || a.length !== b.length) return 0;
  const meanA = a.reduce((s, v) => s + v, 0) / a.length;
  const meanB = b.reduce((s, v) => s + v, 0) / b.length;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  return denA && denB ? num / Math.sqrt(denA * denB) : 0;
}

export function createFeatureExtractor() {
  return {
    extract(measurements = []) {
      const grouped = new Map();
      for (const measurement of measurements) {
        const key = measurement.bssid || measurement.nodeId || 'unknown';
        const series = grouped.get(key) || [];
        series.push(measurement.rssi_smoothed ?? measurement.rssi ?? 0);
        grouped.set(key, series);
      }

      const summary = [];
      for (const [nodeId, values] of grouped.entries()) {
        const derivatives = values.slice(1).map((value, index) => value - values[index]);
        summary.push({
          nodeId,
          mean: values.reduce((sum, value) => sum + value, 0) / values.length,
          variance: variance(values),
          derivativeMean: derivatives.length ? derivatives.reduce((s, v) => s + v, 0) / derivatives.length : 0,
          sampleCount: values.length,
        });
      }

      const keys = [...grouped.keys()];
      const correlationMatrix = keys.map((rowKey) => keys.map((colKey) => correlation(grouped.get(rowKey), grouped.get(colKey))));

      return {
        summary,
        correlationMatrix,
        temporalActivity: summary.reduce((sum, item) => sum + Math.abs(item.derivativeMean), 0),
      };
    },
  };
}
