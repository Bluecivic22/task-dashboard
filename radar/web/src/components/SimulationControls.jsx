import { useRadar } from '../context/RadarContext.jsx';

export default function SimulationControls() {
  const { simulation, setSimulationMode } = useRadar();
  const { config, setConfig } = simulation;
  return (
    <section className="carbon-panel simulation-banner">
      <strong className="gold-bright-text">SIMULATION MODE</strong>
      <div className="simulation-grid">
        {[
          ['x', 'X position'],
          ['y', 'Y position'],
          ['speed', 'Speed'],
          ['direction', 'Direction'],
          ['people', 'People'],
          ['noiseLevel', 'Noise'],
        ].map(([key, label]) => (
          <label key={key} className="setting-row">
            <span>{label}</span>
            <input value={config[key]} type="number" step="0.1" onChange={(event) => setConfig((current) => ({ ...current, [key]: Number(event.target.value) }))} />
          </label>
        ))}
        <label className="setting-row">
          <span>Sensor failure</span>
          <input type="checkbox" checked={config.sensorFailure} onChange={(event) => setConfig((current) => ({ ...current, sensorFailure: event.target.checked }))} />
        </label>
        <button className="btn-carbon" onClick={() => setConfig((current) => ({ ...current, noiseLevel: current.noiseLevel + 0.5 }))}>Environmental change</button>
        <button className="btn-carbon" onClick={() => setSimulationMode(false)}>Use Live Radar</button>
      </div>
    </section>
  );
}
