import React, { useState } from 'react';
import { useGateway } from '../GatewayContext';
import { formatBytes, formatDateTime } from '../GatewayApi';

export default function ClientsPage() {
  const { clients } = useGateway();
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.ip.includes(search) ||
    c.mac.toLowerCase().includes(search.toLowerCase())
  );

  const active = selected ? clients.find(c => c.id === selected) : null;

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <div className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-0.5">Gateway</div>
        <h1 className="text-2xl font-bold tracking-wider text-white">
          CONNECTED <span style={{ color: '#c9a020' }}>CLIENTS</span>
        </h1>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'ONLINE',  count: clients.filter(c=>c.status==='online').length,  color: '#22c55e' },
          { label: 'IDLE',    count: clients.filter(c=>c.status==='idle').length,    color: '#f59e0b' },
          { label: 'OFFLINE', count: clients.filter(c=>c.status==='offline').length, color: '#6b7280' },
        ].map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className={`status-dot ${label === 'ONLINE' ? 'status-online' : label === 'IDLE' ? 'status-idle' : 'status-offline'}`}/>
            <span className="text-[11px] tracking-widest font-medium" style={{ color }}>{count} {label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className={`carbon-panel rounded-lg p-4 flex-1 min-w-0 transition-all ${active ? 'lg:max-w-[calc(100%-320px)]' : ''}`}>
          <div className="mb-3">
            <input
              className="carbon-input text-[12px]"
              placeholder="Search by name, IP, or MAC…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[10px] tracking-[0.12em] text-gray-600 border-b border-gray-800">
                  <th className="text-left py-2 pr-4">●</th>
                  <th className="text-left py-2 pr-4">Device</th>
                  <th className="text-left py-2 pr-4 hidden sm:table-cell">IP</th>
                  <th className="text-left py-2 pr-4 hidden md:table-cell">MAC</th>
                  <th className="text-left py-2 pr-4 hidden lg:table-cell">Signal</th>
                  <th className="text-right py-2 pr-4 hidden lg:table-cell">Down</th>
                  <th className="text-right py-2 hidden lg:table-cell">Up</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(selected === c.id ? null : c.id)}
                    className={`border-b border-gray-900 cursor-pointer transition-colors ${
                      selected === c.id ? 'bg-yellow-900/10' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-2.5 pr-3">
                      <span className={`status-dot ${
                        c.status === 'online' ? 'status-online' :
                        c.status === 'idle'   ? 'status-idle'   : 'status-offline'}`} />
                    </td>
                    <td className="py-2.5 pr-4 text-gray-200 font-medium">{c.name}</td>
                    <td className="py-2.5 pr-4 font-mono text-gray-400 hidden sm:table-cell">{c.ip}</td>
                    <td className="py-2.5 pr-4 font-mono text-gray-600 text-[11px] hidden md:table-cell">{c.mac}</td>
                    <td className="py-2.5 pr-4 hidden lg:table-cell" style={{ color: rssiColor(c.rssi) }}>{c.rssi} dBm</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-gray-400 hidden lg:table-cell">{formatBytes(c.rx)}</td>
                    <td className="py-2.5 text-right font-mono text-gray-500 hidden lg:table-cell">{formatBytes(c.tx)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-6 text-center text-gray-700 text-[12px] tracking-widest">NO CLIENTS MATCH</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {active && (
          <div className="w-72 flex-shrink-0 carbon-panel rounded-lg p-4 animate-slideIn hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] tracking-[0.14em] text-gray-500 uppercase">Client Detail</div>
              <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-400 text-lg leading-none">&times;</button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className={`status-dot ${
                active.status === 'online' ? 'status-online' :
                active.status === 'idle'   ? 'status-idle'   : 'status-offline'}`} />
              <span className="font-semibold text-white text-sm">{active.name}</span>
            </div>
            <div className="space-y-2.5">
              {[
                { l: 'IP',          v: active.ip,       mono: true  },
                { l: 'MAC',         v: active.mac,      mono: true  },
                { l: 'Signal',      v: `${active.rssi} dBm`, color: rssiColor(active.rssi) },
                { l: 'Protocol',    v: active.proto                  },
                { l: 'Download',    v: formatBytes(active.rx)        },
                { l: 'Upload',      v: formatBytes(active.tx)        },
                { l: 'Last Seen',   v: formatDateTime(active.lastSeen), small: true },
              ].map(({ l, v, mono, color, small }) => (
                <div key={l} className="flex justify-between items-baseline">
                  <span className="text-[10px] tracking-widest text-gray-600 uppercase shrink-0 mr-2">{l}</span>
                  <span className={`text-right truncate ${small ? 'text-[10px]' : 'text-[12px]'} ${mono ? 'font-mono' : ''}`}
                    style={{ color: color ?? '#c4c4c4' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-800">
              <div className="text-[10px] tracking-[0.14em] text-gray-600 uppercase mb-2">Bandwidth</div>
              <BandwidthBar label="Down" bytes={active.rx} max={62_914_560} color="#c8a828"/>
              <BandwidthBar label="Up"   bytes={active.tx} max={20_971_520} color="#60a5fa"/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BandwidthBar({ label, bytes, max, color }) {
  const pct = Math.min(100, Math.round((bytes / max) * 100));
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono" style={{ color }}>{formatBytes(bytes)}</span>
      </div>
      <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}/>
      </div>
    </div>
  );
}

function rssiColor(rssi) {
  if (!rssi) return '#6b7280';
  if (rssi >= -55) return '#22c55e';
  if (rssi >= -70) return '#f59e0b';
  return '#ef4444';
}
