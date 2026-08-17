import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { useRadarData } from '../hooks/useRadarData.js';
import { useSimulation } from '../hooks/useSimulation.js';

const RadarContext = createContext(null);

const defaultTelemetry = {
  timestamp: Date.now(),
  device_info: { fw_version: '1.0.0', uptime_ms: 0, wifi_status: 'DISCONNECTED', free_heap: 0 },
  nodes: [],
  measurements: [],
  presence_estimate: { state: 'UNKNOWN', presence_probability: 0, confidence: 0, activity_score: 0, movement_probability: 0, num_active_nodes: 0 },
  spatial_model_summary: { cells: [] },
  system_health: 0,
};

export function RadarProvider({ children }) {
  const [simulationMode, setSimulationMode] = useState(true);
  const [telemetry, setTelemetry] = useState(defaultTelemetry);
  const [loading, setLoading] = useState(true);
  const simulation = useSimulation();
  const websocket = useWebSocket({ enabled: !simulationMode, url: import.meta.env.VITE_RADAR_WS_URL || 'ws://localhost:4780/ws' });

  useEffect(() => {
    if (simulationMode) {
      setTelemetry(simulation.telemetry);
      setLoading(false);
      return;
    }
    if (websocket.lastMessage?.payload) {
      setTelemetry(websocket.lastMessage.payload.telemetry || websocket.lastMessage.payload);
      setLoading(false);
    }
  }, [simulationMode, simulation.telemetry, websocket.lastMessage]);

  const radarData = useRadarData(telemetry);

  const value = useMemo(() => ({
    loading,
    simulationMode,
    setSimulationMode,
    telemetry,
    nodes: telemetry.nodes || [],
    presence: telemetry.presence_estimate || defaultTelemetry.presence_estimate,
    spatial: telemetry.spatial_model_summary || { cells: [] },
    connectionStatus: simulationMode ? 'SIMULATED' : websocket.status,
    reconnect: websocket.reconnect,
    send: websocket.send,
    radarData,
    simulation,
  }), [loading, simulationMode, telemetry, websocket, radarData, simulation]);

  return <RadarContext.Provider value={value}>{children}</RadarContext.Provider>;
}

export function useRadar() {
  const context = useContext(RadarContext);
  if (!context) throw new Error('useRadar must be used inside RadarProvider');
  return context;
}
