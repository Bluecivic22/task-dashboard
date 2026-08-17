import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getTraffic, formatBytes } from '../GatewayApi';

const WINDOWS = ['1m', '5m', '15m', '1h', '24h'];
const SERIES  = [
  { key: 'rx',    label: 'Download', color: '#c8a828' },
  { key: 'tx',    label: 'Upload',   color: '#60a5fa' },
  { key: 'pkts',  label: 'Packets',  color: '#22c55e' },
  { key: 'conns', label: 'Connections', color: '#a78bfa' },
];

export default function TrafficPage() {
  const [win, setWin]         = useState('1m');
  const [data, setData]       = useState([]);
  const [activeSeries, setActiveSeries] = useState(['rx', 'tx']);
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  const load = useCallback(async () => {
    const d = await getTraffic(win);
    setData(d);
  }, [win]);

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [load]);

  const toggleSeries = s =>
    setActiveSeries(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  // Compute latest aggregates
  const latest = data[data.length - 1] ?? {};
  const total = data.reduce((a, p) => ({
    rx: a.rx + p.rx, tx: a.tx + p.tx, pkts: a.pkts + p.pkts, conns: 0
  }), { rx: 0, tx: 0, pkts: 0, conns: 0 });

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <div className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-0.5">Gateway</div>
        <h1 className="text-2xl font-bold tracking-wider text-white">
          TRAFFIC <span style={{ color: '#c9a020' }}>MONITOR</span>
        </h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: 'CURRENT RX', v: formatBytes(latest.rx ?? 0) + '/s', c: '#c8a828' },
          { l: 'CURRENT TX', v: formatBytes(latest.tx ?? 0) + '/s', c: '#60a5fa' },
          { l: 'TOTAL RX',   v: formatBytes(total.rx),              c: '#c8a828' },
          { l: 'TOTAL TX',   v: formatBytes(total.tx),              c: '#60a5fa' },
        ].map(({ l, v, c }) => (
          <div key={l} className="metric-panel p-4">
            <div className="text-[10px] tracking-[0.18em] text-gray-500 uppercase mb-2">{l}</div>
            <div className="text-xl font-bold" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Graph */}
      <div className="carbon-panel rounded-lg p-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-1">
            {WINDOWS.map(w => (
              <button
                key={w}
                onClick={() => setWin(w)}
                className={`px-2.5 py-1 text-[11px] tracking-widest rounded transition-all ${
                  win === w ? 'btn-gold' : 'btn-ghost'
                }`}
              >{w.toUpperCase()}</button>
            ))}
          </div>
          <div className="flex gap-3">
            {SERIES.map(s => (
              <button
                key={s.key}
                onClick={() => toggleSeries(s.key)}
                className="flex items-center gap-1.5 text-[11px] tracking-wide transition-opacity"
                style={{ opacity: activeSeries.includes(s.key) ? 1 : 0.35 }}
              >
                <span className="w-3 h-0.5 inline-block rounded" style={{ background: s.color }}/>
                <span style={{ color: activeSeries.includes(s.key) ? '#ccc' : '#555' }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SVG Graph */}
        <TrafficGraph
          data={data}
          activeSeries={activeSeries}
          tooltip={tooltip}
          setTooltip={setTooltip}
          svgRef={svgRef}
        />
      </div>

      {/* Data table */}
      <div className="carbon-panel rounded-lg p-4">
        <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-3">Recent Samples</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] tracking-[0.12em] text-gray-600 border-b border-gray-800">
                <th className="text-left py-1.5 pr-4">Time</th>
                <th className="text-right py-1.5 pr-4" style={{ color: '#c8a828' }}>Download</th>
                <th className="text-right py-1.5 pr-4" style={{ color: '#60a5fa' }}>Upload</th>
                <th className="text-right py-1.5 pr-4" style={{ color: '#22c55e' }}>Packets</th>
                <th className="text-right py-1.5" style={{ color: '#a78bfa' }}>Conns</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().slice(0, 12).map((p, i) => (
                <tr key={i} className="border-b border-gray-900 hover:bg-white/[0.02] transition-colors">
                  <td className="py-1.5 pr-4 font-mono text-gray-500 text-[11px]">
                    {new Date(p.t).toLocaleTimeString([], { hour12: false })}
                  </td>
                  <td className="py-1.5 pr-4 text-right font-mono" style={{ color: '#c8a828' }}>
                    {formatBytes(p.rx)}/s
                  </td>
                  <td className="py-1.5 pr-4 text-right font-mono" style={{ color: '#60a5fa' }}>
                    {formatBytes(p.tx)}/s
                  </td>
                  <td className="py-1.5 pr-4 text-right font-mono" style={{ color: '#22c55e' }}>
                    {p.pkts.toLocaleString()}
                  </td>
                  <td className="py-1.5 text-right font-mono" style={{ color: '#a78bfa' }}>
                    {p.conns}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── SVG Traffic Graph ── */
function TrafficGraph({ data, activeSeries, tooltip, setTooltip, svgRef }) {
  const W = 600, H = 160, PAD = { t: 10, r: 10, b: 30, l: 55 };
  const gW = W - PAD.l - PAD.r;
  const gH = H - PAD.t - PAD.b;

  if (!data.length) return (
    <div className="graph-area h-40 flex items-center justify-center text-gray-700 text-[12px] tracking-widest">
      LOADING DATA…
    </div>
  );

  // Determine max per active series
  const maxVals = {};
  SERIES.filter(s => activeSeries.includes(s.key)).forEach(s => {
    maxVals[s.key] = Math.max(...data.map(p => p[s.key] ?? 0), 1);
  });

  function points(key, max) {
    return data.map((p, i) => {
      const x = PAD.l + (i / (data.length - 1)) * gW;
      const y = PAD.t + gH - ((p[key] ?? 0) / max) * gH;
      return `${x},${y}`;
    }).join(' ');
  }

  function handleMouseMove(e) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xFrac = (e.clientX - rect.left - PAD.l) / gW;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(xFrac * (data.length - 1))));
    const p = data[idx];
    if (!p) return;
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, p });
  }

  // Y axis labels (using rx max)
  const primaryKey = activeSeries[0] ?? 'rx';
  const primaryMax = maxVals[primaryKey] ?? 1;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    val: f * primaryMax,
    y: PAD.t + gH - f * gH,
  }));

  // X axis labels
  const xStep = Math.max(1, Math.floor(data.length / 5));
  const xTicks = data
    .filter((_, i) => i % xStep === 0 || i === data.length - 1)
    .map((p, i, arr) => ({
      x: PAD.l + (data.indexOf(p) / (data.length - 1)) * gW,
      label: new Date(p.t).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
    }));

  return (
    <div className="graph-area relative" onMouseLeave={() => setTooltip(null)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 160, cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
      >
        {/* Grid lines */}
        {yTicks.map(({ y, val }, i) => (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
              stroke="#1e1e22" strokeWidth="1" strokeDasharray="4 6"/>
            <text x={PAD.l - 4} y={y + 3.5} textAnchor="end" fontSize="8" fill="#444" fontFamily="monospace">
              {formatYLabel(primaryKey, val)}
            </text>
          </g>
        ))}
        {/* X axis labels */}
        {xTicks.map(({ x, label }, i) => (
          <text key={i} x={x} y={H - 5} textAnchor="middle" fontSize="7.5" fill="#444" fontFamily="monospace">
            {label}
          </text>
        ))}

        {/* Series lines + fill */}
        {SERIES.filter(s => activeSeries.includes(s.key)).map(s => {
          const max = maxVals[s.key];
          const pts = data.map((p, i) => {
            const x = PAD.l + (i / Math.max(data.length - 1, 1)) * gW;
            const y = PAD.t + gH - ((p[s.key] ?? 0) / max) * gH;
            return [x, y];
          });
          const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
          const areaPath = `${linePath} L${pts[pts.length-1][0]},${PAD.t + gH} L${PAD.l},${PAD.t + gH} Z`;
          return (
            <g key={s.key}>
              <defs>
                <linearGradient id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={s.color} stopOpacity="0.15"/>
                  <stop offset="100%" stopColor={s.color} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d={areaPath} fill={`url(#grad-${s.key})`}/>
              <path d={linePath} fill="none" stroke={s.color} strokeWidth="1.5"/>
            </g>
          );
        })}

        {/* Tooltip crosshair */}
        {tooltip && (
          <line
            x1={tooltip.x} y1={PAD.t} x2={tooltip.x} y2={PAD.t + gH}
            stroke="#c8a82855" strokeWidth="1" strokeDasharray="3 4"
          />
        )}
      </svg>

      {/* Tooltip bubble */}
      {tooltip && (
        <div className="tooltip absolute pointer-events-none z-20"
          style={{ left: Math.min(tooltip.x + 10, 400), top: 10 }}>
          <div className="text-[10px] tracking-widest text-gray-500 mb-1 font-mono">
            {new Date(tooltip.p.t).toLocaleTimeString([], { hour12: false })}
          </div>
          {SERIES.filter(s => activeSeries.includes(s.key)).map(s => (
            <div key={s.key} className="flex justify-between gap-4 text-[11px]">
              <span style={{ color: s.color }}>{s.label}</span>
              <span className="font-mono text-gray-300">{formatSample(s.key, tooltip.p[s.key])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatYLabel(key, val) {
  if (key === 'rx' || key === 'tx') return formatBytes(val);
  if (val >= 1000) return `${(val/1000).toFixed(0)}K`;
  return String(Math.round(val));
}
function formatSample(key, val) {
  if (key === 'rx' || key === 'tx') return formatBytes(val) + '/s';
  return val?.toLocaleString() ?? '0';
}
