import { useState } from 'react';
import { useRadar } from '../context/RadarContext.jsx';

export default function FloorPlan() {
  const { nodes } = useRadar();
  const [elements, setElements] = useState([]);

  const addElement = (type) => setElements((current) => [...current, { id: `${type}-${current.length}`, type }]);

  return (
    <section className="page-layout carbon-panel floor-plan-page">
      <div className="toolbar">
        {['wall', 'perimeter', 'node', 'calibration', 'obstacle'].map((type) => (
          <button key={type} className="btn-carbon" onClick={() => addElement(type)}>{type}</button>
        ))}
        <button className="btn-carbon">Undo</button>
        <button className="btn-carbon">Redo</button>
        <button className="btn-carbon">Export SVG</button>
      </div>
      <div className="floor-plan-canvas carbon-panel-inner">
        <p className="gold-text">Interactive editor scaffold</p>
        <p>Elements: {elements.length} · Nodes placed: {nodes.length}</p>
        <ul>
          {elements.map((element) => <li key={element.id}>{element.type}</li>)}
        </ul>
      </div>
    </section>
  );
}
