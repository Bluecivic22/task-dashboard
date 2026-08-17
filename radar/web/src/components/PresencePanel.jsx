import { useRadar } from '../context/RadarContext.jsx';
import { formatConfidence, formatPosition } from '../utils/formatters.js';

export default function PresencePanel() {
  const { presence } = useRadar();
  return (
    <div className="panel-content presence-grid">
      <div><div className="instrumentation-label">Presence</div><div className="instrumentation-value">{formatConfidence(presence.presence_probability)}</div></div>
      <div><div className="instrumentation-label">Confidence</div><div className="instrumentation-value">{formatConfidence(presence.confidence)}</div></div>
      <div><div className="instrumentation-label">Activity</div><div className="instrumentation-value">{(presence.activity_score || 0).toFixed(1)}</div></div>
      <div><div className="instrumentation-label">Movement</div><div className="instrumentation-value">{formatConfidence(presence.movement_probability)}</div></div>
      <div><div className="instrumentation-label">Direction</div><div className="instrumentation-value">{Math.round(presence.direction_deg || 0)}°</div></div>
      <div><div className="instrumentation-label">State</div><div className="instrumentation-value smaller">{presence.state || 'UNKNOWN'}</div></div>
      <div><div className="instrumentation-label">Active Nodes</div><div className="instrumentation-value">{presence.num_active_nodes || 0}</div></div>
      <div><div className="instrumentation-label">Position</div><div className="instrumentation-value smaller">{formatPosition(presence.estimated_x || 0, presence.estimated_y || 0)}</div></div>
    </div>
  );
}
