import { useMemo } from 'react';
import { useConfig } from '../context/ConfigContext.jsx';

const sections = {
  Sensing: ['sampling_rate_ms', 'scan_interval_ms', 'smoothing_alpha'],
  Detection: ['detection_threshold', 'confidence_threshold', 'baseline_duration_s'],
  Visualization: ['heatmap_resolution'],
  Storage: ['history_retention_hours'],
  WiFi: ['wifi_ap_ssid', 'wifi_sta_ssid'],
  Security: ['auth_token', 'ota_password'],
  Logging: ['log_level', 'telemetry_enabled', 'csi_enabled'],
  Advanced: ['grid_width_m', 'grid_height_m'],
};

export default function SettingsPage() {
  const { config, setConfig, save, load } = useConfig();
  const entries = useMemo(() => Object.entries(sections), []);

  return (
    <section className="page-layout carbon-panel settings-page">
      <h2 className="gold-bright-text">Settings</h2>
      {entries.map(([section, keys]) => (
        <div key={section} className="settings-section carbon-panel-inner">
          <h3 className="gold-text">{section}</h3>
          {keys.map((key) => (
            <label key={key} className="setting-row">
              <span>{key}</span>
              <input
                value={String(config[key])}
                onChange={(event) => setConfig((current) => ({ ...current, [key]: event.target.value }))}
              />
            </label>
          ))}
        </div>
      ))}
      <div className="action-row">
        <button className="btn-carbon" onClick={() => save(config)}>Save</button>
        <button className="btn-carbon" onClick={() => load()}>Reload</button>
        <button className="btn-carbon">Factory Reset</button>
      </div>
    </section>
  );
}
