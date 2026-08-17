import { useState } from 'react';
import { useRadar } from '../context/RadarContext.jsx';

export default function HeatMap() {
  const { spatial } = useRadar();
  const [view, setView] = useState('Activity');

  return (
    <div className="panel-content">
      <div className="section-header">
        <h2 className="gold-text">Heatmap</h2>
        <select value={view} onChange={(event) => setView(event.target.value)}>
          {['Current', 'Baseline', 'Difference', 'Activity', 'Confidence', 'Movement'].map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>
      <div className="heatmap-legend">Cells: {spatial.cells?.length || 0} · View: {view}</div>
      <div className="heatmap-grid">
        {(spatial.cells || []).slice(0, 36).map((cell, index) => (
          <div key={index} className="heatmap-cell" style={{ opacity: Math.max(0.15, cell.confidence || 0.2) }}>
            {Math.round((cell.activity_score || cell.value || 0) * 100)}
          </div>
        ))}
      </div>
    </div>
  );
}
