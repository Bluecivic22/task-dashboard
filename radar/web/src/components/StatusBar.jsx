import { useRadar } from '../context/RadarContext.jsx';
import { statusColor, statusLabel } from '../utils/colorMap.js';

export default function StatusBar() {
  const { presence } = useRadar();
  const label = statusLabel(presence.state);
  return (
    <div className="status-bar carbon-panel" style={{ borderLeft: `4px solid ${statusColor(presence.state)}` }}>
      <strong>{label.title}</strong>
      <span>{label.description}</span>
    </div>
  );
}
