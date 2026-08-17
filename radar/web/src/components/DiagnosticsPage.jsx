import { useRadar } from '../context/RadarContext.jsx';

export default function DiagnosticsPage() {
  const { telemetry, nodes, reconnect } = useRadar();
  const logs = [
    '[INFO][radio] passive scan healthy',
    '[INFO][presence] confidence stable',
    '[WARN][storage] pruning disabled in simulation',
  ];

  return (
    <section className="page-layout carbon-panel diagnostics-grid">
      <div className="carbon-panel-inner card"><h2 className="gold-text">Chip Info</h2><p>{telemetry.device_info?.chip_model || 'SIM'}</p><p>FW {telemetry.device_info?.fw_version}</p></div>
      <div className="carbon-panel-inner card"><h2 className="gold-text">Memory</h2><p>Heap {telemetry.device_info?.free_heap ?? 0}</p><p>PSRAM availability inferred from firmware status.</p></div>
      <div className="carbon-panel-inner card"><h2 className="gold-text">Wi-Fi</h2><p>{telemetry.device_info?.wifi_status}</p><p>{telemetry.device_info?.ip_addr || 'offline'}</p></div>
      <div className="carbon-panel-inner card"><h2 className="gold-text">Nodes</h2><p>{nodes.length} configured</p></div>
      <div className="carbon-panel-inner card logs-card"><h2 className="gold-text">Recent Logs</h2><div className="log-viewer">{logs.map((log) => <div key={log}>{log}</div>)}</div></div>
      <div className="action-row">
        {['Restart', 'Clear History', 'Reset Calibration', 'Export Diagnostics', 'Factory Reset'].map((action) => <button key={action} className="btn-carbon">{action}</button>)}
        <button className="btn-carbon" onClick={reconnect}>Reconnect</button>
      </div>
    </section>
  );
}
