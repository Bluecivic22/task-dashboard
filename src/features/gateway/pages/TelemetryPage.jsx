import React from 'react';
import { useGateway } from '../GatewayContext';
import { formatBytes, formatUptime } from '../GatewayApi';

export default function TelemetryPage() {
  const { status, clients } = useGateway();

  const total = clients.reduce((a, c) => ({
    rx: a.rx + c.rx, tx: a.tx + c.tx,
  }), { rx: 0, tx: 0 });

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <div className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-0.5">Gateway</div>
        <h1 className="text-2xl font-bold tracking-wider text-white">
          TELEMETRY <span style={{ color: '#c9a020' }}>DATA</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gateway Telemetry */}
        <div className="carbon-panel rounded-lg p-5">
          <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-4">Gateway Counters</div>
          <div className="space-y-3">
            {[
              { l: 'Uptime',         v: formatUptime(status?.uptimeSeconds ?? 0),   c: '#c9a020' },
              { l: 'Bytes Received', v: formatBytes(status?.rxBytes ?? 0),           c: '#c8a828' },
              { l: 'Bytes Sent',     v: formatBytes(status?.txBytes ?? 0),           c: '#60a5fa' },
              { l: 'Pkts Received',  v: (status?.rxPackets ?? 0).toLocaleString(),   c: '#c8a828' },
              { l: 'Pkts Sent',      v: (status?.txPackets ?? 0).toLocaleString(),   c: '#60a5fa' },
              { l: 'Client Count',   v: String(status?.clientCount ?? 0),            c: '#c9a020' },
              { l: 'CPU Temp',       v: `${status?.temperature?.toFixed(1) ?? '—'}°C`,
                c: status?.temperature > 70 ? '#ef4444' : status?.temperature > 55 ? '#f59e0b' : '#22c55e' },
              { l: 'Free Heap',      v: `${Math.round((status?.freeHeap ?? 0) / 1024)} KB`, c: '#a0a8c0' },
            ].map(({ l, v, c }) => (
              <div key={l} className="flex justify-between items-center border-b border-gray-900 pb-2">
                <span className="text-[11px] tracking-wide text-gray-500">{l}</span>
                <span className="font-mono text-[13px] font-medium" style={{ color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Per-client traffic */}
        <div className="carbon-panel rounded-lg p-5">
          <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-4">Client Telemetry</div>
          <div className="space-y-3">
            {clients.map(c => (
              <div key={c.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`status-dot ${
                      c.status === 'online' ? 'status-online' :
                      c.status === 'idle'   ? 'status-idle'   : 'status-offline'}`}/>
                    <span className="text-[12px] text-gray-300">{c.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-gray-500">{c.ip}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MiniBar label="RX" bytes={c.rx} max={62_914_560} color="#c8a828"/>
                  <MiniBar label="TX" bytes={c.tx} max={20_971_520} color="#60a5fa"/>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between text-[11px]">
            <span className="text-gray-600">Total client traffic</span>
            <span className="font-mono" style={{ color: '#c9a020' }}>
              ↓{formatBytes(total.rx)} ↑{formatBytes(total.tx)}
            </span>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="carbon-panel rounded-lg p-4 flex gap-3"
        style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="shrink-0 mt-0.5">
          <circle cx="8" cy="8" r="7"/>
          <line x1="8" y1="5" x2="8" y2="8.5"/><circle cx="8" cy="11" r="0.8" fill="#f59e0b"/>
        </svg>
        <div className="text-[11px] text-gray-500 leading-relaxed">
          <span className="text-amber-500 font-semibold">Monitoring scope:</span>{' '}
          This telemetry covers only traffic routed through this ESP32 gateway.
          Only metadata (IP addresses, packet counts, byte counts, timestamps) is collected.
          Application-layer content, HTTPS traffic, passwords, and private data are
          never inspected or stored.
        </div>
      </div>
    </div>
  );
}

function MiniBar({ label, bytes, max, color }) {
  const pct = Math.min(100, Math.round((bytes / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[9px] mb-0.5">
        <span className="text-gray-700">{label}</span>
        <span className="font-mono" style={{ color }}>{formatBytes(bytes)}</span>
      </div>
      <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }}/>
      </div>
    </div>
  );
}
