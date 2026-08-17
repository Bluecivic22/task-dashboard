import { useRadar } from '../context/RadarContext.jsx';
import { formatRssi, formatPosition } from '../utils/formatters.js';

export default function NodePanel() {
  const { nodes, radarData } = useRadar();
  return (
    <div className="panel-content">
      <div className="section-header"><h2 className="gold-text">Nodes</h2><button className="btn-carbon">Add</button></div>
      {nodes.length === 0 ? <p>No nodes configured.</p> : null}
      <ul className="node-list">
        {nodes.map((node) => {
          const measurement = radarData.latestMeasurements.find((item) => (item.nodeId || item.bssid) === (node.id || node.bssid));
          return (
            <li key={node.id} className="carbon-panel-inner node-item">
              <div className="node-header"><span className={`status-indicator ${node.enabled ? 'status-normal' : 'status-error'}`} /> {node.name}</div>
              <div>{formatPosition(node.x, node.y)} · {formatRssi(measurement?.rssi_smoothed ?? measurement?.rssi)}</div>
              <div>Calibration: {node.calibrated ? 'Ready' : 'Pending'} · Confidence {Math.round((node.confidence || 0) * 100)}%</div>
              <div className="node-actions"><button className="btn-carbon">Edit</button><button className="btn-carbon">Remove</button></div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
