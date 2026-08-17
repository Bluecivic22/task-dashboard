import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGateway } from '../GatewayContext';
import { formatBytes, formatUptime } from '../GatewayApi';

export default function DashboardPage() {
  const { status, clients, sysInfo, loading } = useGateway();

  if (loading && !status) {
    return <PageSkeleton />;
  }

  const onlineClients = clients.filter(c => c.status !== 'offline');

  return (
    <div className="animate-fadeIn space-y-5">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-0.5">Network Gateway</div>
          <h1 className="text-2xl font-bold tracking-wider text-white">ESP32-S3 <span style={{ color: '#c9a020' }}>GATEWAY</span></h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <span className="status-dot status-online" />
          <span className="text-[12px] font-semibold tracking-wider text-green-400">ONLINE</span>
        </div>
      </div>

      {/* ── Top metrics strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricPanel
          label="INTERNET"
          value={status?.internet ? 'CONNECTED' : 'OFFLINE'}
          sub={status?.staSSID}
          color={status?.internet ? '#22c55e' : '#ef4444'}
          icon={<IconInternet />}
        />
        <MetricPanel
          label="CLIENTS"
          value={String(onlineClients.length).padStart(2, '0')}
          sub={`${clients.length} total`}
          color="#c9a020"
          icon={<IconClients />}
        />
        <MetricPanel
          label="DOWNLOAD"
          value={formatBytes(status?.rxBytes ?? 0)}
          sub={`${status?.rxPackets?.toLocaleString() ?? 0} pkts`}
          color="#c9a020"
          icon={<IconDown />}
        />
        <MetricPanel
          label="UPLOAD"
          value={formatBytes(status?.txBytes ?? 0)}
          sub={`${status?.txPackets?.toLocaleString() ?? 0} pkts`}
          color="#a0b8d0"
          icon={<IconUp />}
        />
      </div>

      {/* ── Secondary metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SmallMetric label="UPTIME"   value={formatUptime(status?.uptimeSeconds ?? 0)} />
        <SmallMetric label="CPU"      value={`${status?.cpuFreqMHz ?? 0} MHz`} />
        <SmallMetric label="HEAP"
          value={`${Math.round((status?.freeHeap ?? 0) / 1024)} KB`}
          sub={`of ${Math.round((status?.totalHeap ?? 0) / 1024)} KB`}
          bar={(status?.freeHeap ?? 0) / (status?.totalHeap ?? 1)}
        />
        <SmallMetric label="PSRAM"
          value={`${Math.round((sysInfo?.psramFree ?? 0) / 1024 / 1024 * 10) / 10} MB`}
          sub={`of ${Math.round((sysInfo?.psramTotal ?? 0) / 1024 / 1024)} MB`}
          bar={(sysInfo?.psramFree ?? 0) / (sysInfo?.psramTotal ?? 1)}
        />
        <SmallMetric label="FLASH"    value={`${Math.round((status?.flashSize ?? 0) / 1024 / 1024)} MB`} />
        <SmallMetric label="TEMP"     value={`${status?.temperature?.toFixed(1) ?? '--'}°C`}
          color={status?.temperature > 70 ? '#ef4444' : status?.temperature > 55 ? '#f59e0b' : '#22c55e'} />
      </div>

      {/* ── Topology + Connection info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="carbon-panel rounded-lg p-4">
          <div className="text-[11px] tracking-[0.18em] text-gray-500 mb-3 uppercase">Network Topology</div>
          <NetworkTopology status={status} clients={onlineClients} />
        </div>

        <div className="carbon-panel rounded-lg p-4 space-y-3">
          <div className="text-[11px] tracking-[0.18em] text-gray-500 mb-3 uppercase">Connection Info</div>
          <InfoRow label="STA IP"      value={status?.staIP ?? '—'}         mono />
          <InfoRow label="Gateway"     value={status?.staGW ?? '—'}         mono />
          <InfoRow label="DNS"         value={status?.staDNS ?? '—'}        mono />
          <InfoRow label="RSSI"        value={`${status?.staRSSI ?? '—'} dBm`}
            color={rssiColor(status?.staRSSI)} />
          <hr className="gold-divider" />
          <InfoRow label="AP SSID"     value={status?.apSSID ?? '—'} />
          <InfoRow label="AP IP"       value={status?.apIP ?? '—'}          mono />
          <InfoRow label="AP Channel"  value={`Ch ${status?.apChannel ?? '—'}`} />
          <InfoRow label="AP Security" value={status?.apSecurity ?? '—'} />
          <InfoRow label="DHCP Range"  value={status?.apDHCPRange ?? '—'}   mono small />
        </div>
      </div>

      {/* ── Recent clients ── */}
      <div className="carbon-panel rounded-lg p-4">
        <div className="text-[11px] tracking-[0.18em] text-gray-500 mb-3 uppercase">Connected Clients</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] tracking-[0.14em] text-gray-600 border-b border-gray-800">
                <th className="text-left py-1.5 pr-4">Device</th>
                <th className="text-left py-1.5 pr-4 font-mono">IP</th>
                <th className="text-left py-1.5 pr-4">Signal</th>
                <th className="text-left py-1.5 pr-4">Down</th>
                <th className="text-left py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 5).map(c => (
                <tr key={c.id} className="border-b border-gray-900 hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 pr-4 text-gray-200">{c.name}</td>
                  <td className="py-2 pr-4 font-mono text-gray-400">{c.ip}</td>
                  <td className="py-2 pr-4" style={{ color: rssiColor(c.rssi) }}>{c.rssi} dBm</td>
                  <td className="py-2 pr-4 text-gray-400">{formatBytes(c.rx)}</td>
                  <td className="py-2">
                    <span className={`status-dot ${
                      c.status === 'online' ? 'status-online' :
                      c.status === 'idle'   ? 'status-idle'   : 'status-offline'}`} />
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

/* ── Sub-components ── */

function MetricPanel({ label, value, sub, color = '#c9a020', icon }) {
  return (
    <div className="metric-panel p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="text-[10px] tracking-[0.18em] text-gray-500 uppercase">{label}</div>
        <div className="opacity-60">{icon}</div>
      </div>
      <div className="text-xl font-bold tracking-wide" style={{ color }}>{value}</div>
      {sub && <div className="text-[11px] text-gray-600 mt-0.5 truncate">{sub}</div>}
    </div>
  );
}

function SmallMetric({ label, value, sub, bar, color = '#c9a020', small }) {
  return (
    <div className="metric-panel p-3">
      <div className="text-[10px] tracking-[0.16em] text-gray-600 uppercase mb-1">{label}</div>
      <div className="text-[15px] font-semibold" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] text-gray-700">{sub}</div>}
      {bar !== undefined && (
        <div className="mt-1.5 h-0.5 rounded-full bg-gray-800 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(bar * 100)}%`, background: bar < 0.3 ? '#ef4444' : '#c8a828' }} />
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono, color, small }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[11px] tracking-wide text-gray-600 uppercase shrink-0 mr-3">{label}</span>
      <span className={`text-right truncate ${small ? 'text-[11px]' : 'text-[13px]'} ${mono ? 'font-mono' : ''}`}
        style={{ color: color ?? '#c4c4c4' }}>{value}</span>
    </div>
  );
}

function rssiColor(rssi) {
  if (!rssi) return '#6b7280';
  if (rssi >= -55) return '#22c55e';
  if (rssi >= -70) return '#f59e0b';
  return '#ef4444';
}

/* ── Network Topology SVG ── */
function NetworkTopology({ status, clients }) {
  const clientNodes = useMemo(() => {
    const items = (clients ?? []).slice(0, 5);
    const total = items.length || 1;
    return items.map((c, i) => {
      const angle = (Math.PI / (total + 1)) * (i + 1) + Math.PI / 2;
      const r = 72;
      return {
        ...c,
        x: 150 + r * Math.cos(angle),
        y: 160 + r * Math.sin(angle) * 0.6,
      };
    });
  }, [clients]);

  return (
    <svg viewBox="0 0 300 200" className="w-full" style={{ maxHeight: 200 }}>
      <defs>
        <filter id="gold-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#c8a82866"/>
        </marker>
      </defs>

      {/* Internet cloud */}
      <g>
        <ellipse cx="150" cy="18" rx="30" ry="12" fill="none" stroke="#c8a82844" strokeWidth="1"/>
        <text x="150" y="22" textAnchor="middle" fontSize="8" fill="#9a7a20" fontFamily="Inter,sans-serif"
          letterSpacing="2">INTERNET</text>
      </g>

      {/* Internet → Upstream line */}
      <line x1="150" y1="30" x2="150" y2="54" stroke="#c8a82855" strokeWidth="1" strokeDasharray="4 3"/>
      <PacketDot cx={150} cy={30} dy={24} delay={0} />

      {/* Upstream router */}
      <g>
        <rect x="120" y="55" width="60" height="24" rx="4" fill="#1c1c1f" stroke="#c8a82855" strokeWidth="1"/>
        <text x="150" y="65" textAnchor="middle" fontSize="6" fill="#9a7a20" fontFamily="Inter" letterSpacing="1.5">
          {status?.staSSID ? status.staSSID.substring(0, 14) : 'HOME WIFI'}
        </text>
        <text x="150" y="74" textAnchor="middle" fontSize="5.5" fill="#555" fontFamily="monospace">
          {status?.staGW ?? '192.168.1.1'}
        </text>
      </g>

      {/* Upstream → ESP32 */}
      <line x1="150" y1="79" x2="150" y2="103" stroke="#c8a82855" strokeWidth="1" strokeDasharray="4 3"/>
      <PacketDot cx={150} cy={79} dy={24} delay={0.8} />

      {/* ESP32 node */}
      <g filter="url(#gold-glow)">
        <rect x="112" y="104" width="76" height="28" rx="5" fill="#1a1500" stroke="#c8a828" strokeWidth="1.5"/>
        <text x="150" y="116" textAnchor="middle" fontSize="7" fill="#c9a020" fontFamily="Inter" fontWeight="600" letterSpacing="1.5">ESP32-S3</text>
        <text x="150" y="126" textAnchor="middle" fontSize="5.5" fill="#c8a82888" fontFamily="monospace">
          {status?.apIP ?? '192.168.4.1'}
        </text>
      </g>

      {/* ESP32 → clients */}
      {clientNodes.map((c, i) => (
        <g key={c.id}>
          <line x1="150" y1="132" x2={c.x} y2={c.y - 10}
            stroke="#c8a82840" strokeWidth="1" strokeDasharray="3 4"/>
          <PacketDot cx={150} cy={132} targetX={c.x} targetY={c.y - 10} delay={i * 0.5} />
        </g>
      ))}

      {/* Client nodes */}
      {clientNodes.map(c => (
        <g key={c.id}>
          <circle cx={c.x} cy={c.y} r="14" fill="#1c1c1f" stroke={c.status === 'online' ? '#22c55e55' : '#c8a82833'} strokeWidth="1"/>
          <text x={c.x} y={c.y + 2.5} textAnchor="middle" fontSize="5.5" fill={c.status === 'online' ? '#22c55e' : '#888'}
            fontFamily="Inter" letterSpacing="0.5">
            {c.name.length > 8 ? c.name.substring(0, 8) : c.name}
          </text>
        </g>
      ))}

      {clientNodes.length === 0 && (
        <text x="150" y="170" textAnchor="middle" fontSize="7" fill="#444" fontFamily="Inter" letterSpacing="2">
          NO CLIENTS
        </text>
      )}
    </svg>
  );
}

function PacketDot({ cx, cy, dy, targetX, targetY, delay = 0 }) {
  const tx = targetX ?? cx;
  const ty = targetY ?? cy + (dy ?? 0);
  return (
    <circle r="2" fill="#c8a828" opacity="0.7">
      <animateMotion dur="2.4s" begin={`${delay}s`} repeatCount="indefinite"
        path={`M${cx},${cy} L${tx},${ty}`} />
      <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" begin={`${delay}s`} repeatCount="indefinite"/>
    </circle>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-800"/>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-gray-900"/>)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-gray-900"/>)}
      </div>
    </div>
  );
}

/* ── Metric icons ── */
function IconInternet() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#c8a828" strokeWidth="1.5">
      <circle cx="10" cy="10" r="8"/>
      <ellipse cx="10" cy="10" rx="3.5" ry="8"/>
      <line x1="2" y1="10" x2="18" y2="10"/>
      <line x1="3" y1="6" x2="17" y2="6"/>
      <line x1="3" y1="14" x2="17" y2="14"/>
    </svg>
  );
}
function IconClients() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#c8a828" strokeWidth="1.5">
      <circle cx="7" cy="7" r="2.5"/>
      <path d="M2 17c0-3 2.2-5 5-5s5 2 5 5"/>
      <circle cx="15" cy="6" r="2"/>
      <path d="M13 17c0-2 1-4 2-4s3 2 3 4"/>
    </svg>
  );
}
function IconDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#c8a828" strokeWidth="1.5">
      <line x1="10" y1="3" x2="10" y2="14"/>
      <polyline points="5,10 10,15 15,10"/>
      <line x1="4" y1="17" x2="16" y2="17"/>
    </svg>
  );
}
function IconUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#a0b8d0" strokeWidth="1.5">
      <line x1="10" y1="17" x2="10" y2="6"/>
      <polyline points="5,10 10,5 15,10"/>
      <line x1="4" y1="3" x2="16" y2="3"/>
    </svg>
  );
}
