import { createContext, useContext, useMemo, useState } from 'react';

const ConfigContext = createContext(null);

const defaultConfig = {
  sampling_rate_ms: 2000,
  scan_interval_ms: 5000,
  smoothing_alpha: 0.3,
  detection_threshold: 5,
  confidence_threshold: 0.6,
  baseline_duration_s: 30,
  heatmap_resolution: 20,
  history_retention_hours: 24,
  wifi_ap_ssid: 'RADAR-AP',
  wifi_sta_ssid: '',
  auth_token: '',
  ota_password: 'radar-ota',
  log_level: 3,
  telemetry_enabled: true,
  csi_enabled: false,
  grid_width_m: 10,
  grid_height_m: 10,
};

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);
  const apiBase = import.meta.env.VITE_RADAR_API_URL || 'http://localhost:4780';

  const value = useMemo(() => ({
    config,
    setConfig,
    async load() {
      try {
        const response = await fetch(`${apiBase}/api/config`);
        if (response.ok) setConfig(await response.json());
      } catch {
        // offline-friendly noop
      }
    },
    async save(next) {
      setConfig(next);
      try {
        await fetch(`${apiBase}/api/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });
      } catch {
        // offline-friendly noop
      }
    },
  }), [config, apiBase]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used inside ConfigProvider');
  return context;
}
