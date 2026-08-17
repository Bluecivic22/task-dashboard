import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useRadar } from '../context/RadarContext.jsx';

export default function TelemetryPanel() {
  const { radarData } = useRadar();
  const data = radarData.chartPoints.map((point, index) => ({ ...point, label: index + 1 }));
  return (
    <div className="panel-content telemetry-panel">
      <div className="section-header">
        <h2 className="gold-text">Telemetry</h2>
        <div className="time-range-group">{['1m', '5m', '15m', '1h', '24h'].map((range) => <button key={range} className="btn-carbon">{range}</button>)}</div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <XAxis dataKey="label" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip contentStyle={{ background: '#141414', border: '1px solid #8a6f32' }} />
          <Line type="monotone" dataKey="activity" stroke="#e8c96a" dot={false} />
          <Line type="monotone" dataKey="confidence" stroke="#c9a84c" dot={false} />
          <Line type="monotone" dataKey="movement" stroke="#e87a3a" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
