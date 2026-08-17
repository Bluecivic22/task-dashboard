import React from 'react';
import { useGateway } from '../GatewayContext';

export default function NetworkPage() {
  const { status, clients } = useGateway();

  const onlineClients = clients.filter(c => c.status !== 'offline');

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <div className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-0.5">Gateway</div>
        <h1 className="text-2xl font-bold tracking-wider text-white">
          NETWORK <span style={{ color: '#c9a020' }}>OVERVIEW</span>
        </h1>
      </div>

      {/* Large topology */}
      <div className="carbon-panel rounded-lg p-5">
        <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-4">Topology</div>
        <FullTopology status={status} clients={onlineClients} />
      </div>

      {/* Network addresses table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="carbon-panel rounded-lg p-5">
          <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-3">Upstream Network</div>
          <div className="space-y-2">
            {[
              { l: 'Interface',  v: 'STA (Station)',         },
              { l: 'SSID',       v: status?.staSSID ?? '—'  },
              { l: 'IP',         v: status?.staIP   ?? '—',   mono: true },
              { l: 'Gateway',    v: status?.staGW   ?? '—',   mono: true },
              { l: 'DNS',        v: status?.staDNS  ?? '—',   mono: true },
              { l: 'Channel',    v: `Ch ${status?.staChannel ?? '—'}` },
              { l: 'MAC (STA)',  v: '—', mono: true },
            ].map(({ l, v, mono }) => (
              <div key={l} className="flex justify-between text-[12px] border-b border-gray-900 pb-1.5">
                <span className="text-gray-500">{l}</span>
                <span className={`${mono ? 'font-mono' : ''} text-gray-300`}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="carbon-panel rounded-lg p-5">
          <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-3">AP Network</div>
          <div className="space-y-2">
            {[
              { l: 'Interface',    v: 'SoftAP'                        },
              { l: 'SSID',         v: status?.apSSID  ?? '—'         },
              { l: 'IP',           v: status?.apIP    ?? '—',   mono: true },
              { l: 'Subnet',       v: '255.255.255.0',          mono: true },
              { l: 'DHCP Start',   v: '192.168.4.100',          mono: true },
              { l: 'DHCP End',     v: '192.168.4.200',          mono: true },
              { l: 'Channel',      v: `Ch ${status?.apChannel ?? '—'}` },
            ].map(({ l, v, mono }) => (
              <div key={l} className="flex justify-between text-[12px] border-b border-gray-900 pb-1.5">
                <span className="text-gray-500">{l}</span>
                <span className={`${mono ? 'font-mono' : ''} text-gray-300`}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FullTopology({ status, clients }) {
  const clientCount = clients.length || 0;
  const cols = Math.max(1, Math.min(clientCount, 5));
  const colW = 480 / (cols + 1);
  const clientNodes = clients.slice(0, 5).map((c, i) => ({
    ...c,
    x: colW * (i + 1),
    y: 200,
  }));

  return (
    <svg viewBox="0 0 480 240" className="w-full" style={{ maxHeight: 240 }}>
      <defs>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      {/* INTERNET */}
      <rect x="180" y="5" width="120" height="28" rx="5" fill="#0d0d0d" stroke="#c8a82844" strokeWidth="1"/>
      <text x="240" y="18" textAnchor="middle" fontSize="8" fill="#9a7a20" fontFamily="Inter" letterSpacing="3">
        INTERNET
      </text>
      <GlobeIcon cx={195} cy={18} />

      {/* Vert line Internet → Router */}
      <line x1="240" y1="33" x2="240" y2="57" stroke="#c8a82855" strokeWidth="1" strokeDasharray="4 4"/>
      <PacketAnim x1={240} y1={33} x2={240} y2={57} dur="2s" delay="0s"/>

      {/* Router */}
      <rect x="180" y="58" width="120" height="28" rx="5" fill="#1c1c1f" stroke={status?.staConnected ? '#22c55e44' : '#c8a82833'} strokeWidth="1"/>
      <text x="240" y="70" textAnchor="middle" fontSize="7" fill={status?.staConnected ? '#22c55e99' : '#9a7a20'} fontFamily="Inter" letterSpacing="1.5">
        {(status?.staSSID ?? 'HOME WIFI').substring(0, 16)}
      </text>
      <text x="240" y="80" textAnchor="middle" fontSize="6" fill="#555" fontFamily="monospace">
        {status?.staGW ?? '192.168.1.1'}
      </text>

      {/* Router → ESP32 */}
      <line x1="240" y1="86" x2="240" y2="110" stroke="#c8a82855" strokeWidth="1" strokeDasharray="4 4"/>
      <PacketAnim x1={240} y1={86} x2={240} y2={110} dur="2.4s" delay="0.4s"/>

      {/* ESP32 */}
      <rect x="190" y="111" width="100" height="32" rx="6" fill="#1a1500" stroke="#c8a828" strokeWidth="1.5" filter="url(#glow2)"/>
      <text x="240" y="124" textAnchor="middle" fontSize="8" fill="#c9a020" fontFamily="Inter" fontWeight="600" letterSpacing="2">ESP32-S3</text>
      <text x="240" y="136" textAnchor="middle" fontSize="6" fill="#c8a82888" fontFamily="monospace">
        {status?.apIP ?? '192.168.4.1'}
      </text>

      {/* ESP32 → clients */}
      {clientNodes.map((c, i) => (
        <g key={c.id}>
          <line x1="240" y1="143" x2={c.x} y2={c.y - 18}
            stroke="#c8a82840" strokeWidth="1" strokeDasharray="3 5"/>
          <PacketAnim x1={240} y1={143} x2={c.x} y2={c.y - 18} dur={`${2 + i * 0.4}s`} delay={`${i * 0.6}s`}/>
        </g>
      ))}

      {/* Client nodes */}
      {clientNodes.map(c => (
        <g key={c.id}>
          <circle cx={c.x} cy={c.y} r="18" fill="#1c1c1f"
            stroke={c.status === 'online' ? '#22c55e44' : '#c8a82830'} strokeWidth="1"/>
          <text x={c.x} y={c.y - 4} textAnchor="middle" fontSize="5.5" fill={c.status === 'online' ? '#22c55e' : '#888'}
            fontFamily="Inter" letterSpacing="0.5">
            {c.name.length > 9 ? c.name.substring(0, 9) : c.name}
          </text>
          <text x={c.x} y={c.y + 5} textAnchor="middle" fontSize="5" fill="#555" fontFamily="monospace">
            {c.ip}
          </text>
          <circle cx={c.x + 12} cy={c.y - 12} r="3.5"
            fill={c.status === 'online' ? '#22c55e' : '#374151'}/>
        </g>
      ))}

      {clientNodes.length === 0 && (
        <text x="240" y="190" textAnchor="middle" fontSize="8" fill="#333" fontFamily="Inter" letterSpacing="3">
          NO CLIENTS CONNECTED
        </text>
      )}
    </svg>
  );
}

function PacketAnim({ x1, y1, x2, y2, dur, delay }) {
  return (
    <circle r="2.5" fill="#c8a828" opacity="0.75">
      <animateMotion dur={dur} begin={delay} repeatCount="indefinite"
        path={`M${x1},${y1} L${x2},${y2}`}/>
      <animate attributeName="opacity" values="0;0.9;0.9;0" dur={dur} begin={delay} repeatCount="indefinite"/>
    </circle>
  );
}

function GlobeIcon({ cx, cy }) {
  return (
    <g transform={`translate(${cx - 8}, ${cy - 8})`}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="#c8a82866" strokeWidth="1"/>
      <ellipse cx="8" cy="8" rx="3" ry="6" fill="none" stroke="#c8a82844" strokeWidth="0.8"/>
      <line x1="2" y1="8" x2="14" y2="8" stroke="#c8a82844" strokeWidth="0.8"/>
    </g>
  );
}
