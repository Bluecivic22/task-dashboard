import { useMemo, useRef } from 'react';

export function useRadarData(telemetry) {
  const historyRef = useRef([]);
  historyRef.current = [...historyRef.current, telemetry].slice(-120);

  return useMemo(() => {
    const chartPoints = historyRef.current.map((entry) => ({
      timestamp: entry.timestamp,
      activity: entry.presence_estimate?.activity_score ?? 0,
      confidence: entry.presence_estimate?.confidence ?? 0,
      movement: entry.presence_estimate?.movement_probability ?? 0,
      ...Object.fromEntries((entry.measurements || []).map((measurement) => [measurement.nodeId || measurement.bssid, measurement.rssi_smoothed ?? measurement.rssi ?? 0])),
    }));

    return {
      history: historyRef.current,
      chartPoints,
      latestNodes: telemetry.nodes || [],
      latestMeasurements: telemetry.measurements || [],
    };
  }, [telemetry]);
}
