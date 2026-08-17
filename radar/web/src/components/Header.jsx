import { useRadar } from '../context/RadarContext.jsx';
import { formatUptime } from '../utils/formatters.js';

export default function Header({ onNavigate }) {
  const { telemetry, nodes, connectionStatus } = useRadar();
  const activeNodes = nodes.filter((node) => node.enabled).length;
  const connected = connectionStatus === 'connected' || connectionStatus === 'SIMULATED';

  return (
    <header className="header carbon-panel">
      <div>
        <h1 className="gold-bright-text">RADAR</h1>
        <p className="header-subtitle">ESP32-S3 Wi-Fi passive sensing</p>
      </div>
      <div className="header-metrics">
        <span><span className={`status-indicator ${connected ? 'status-presence' : 'status-error'}`} /> {connectionStatus}</span>
        <span>FW {telemetry.device_info?.fw_version || 'unknown'}</span>
        <span>Uptime {formatUptime(telemetry.device_info?.uptime_ms || 0)}</span>
        <span>Wi-Fi {telemetry.device_info?.wifi_status || 'offline'}</span>
        <span>Nodes {activeNodes}/{nodes.length}</span>
        <span>Health {Math.round((telemetry.system_health || 0) * 100)}%</span>
        <button className="btn-carbon" onClick={() => onNavigate?.('settings')}>Settings</button>
        <button className="btn-carbon" onClick={() => onNavigate?.('diagnostics')}>Diagnostics</button>
      </div>
    </header>
  );
}
