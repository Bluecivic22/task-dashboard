import React from 'react';
import { useGateway } from '../GatewayContext';
import { formatBytes } from '../GatewayApi';

export default function GatewayPage() {
  const { status } = useGateway();

  const services = [
    { key: 'natActive',  label: 'NAT / NAPT',     desc: 'Network address translation',       val: status?.natActive  },
    { key: 'dhcpActive', label: 'DHCP Server',     desc: `Range ${status?.apDHCPRange ?? '…'}`, val: status?.dhcpActive },
    { key: 'staConnected',label: 'Upstream WAN',   desc: status?.staSSID ?? 'Not connected',  val: status?.staConnected },
    { key: 'apActive',   label: 'Access Point',    desc: status?.apSSID ?? 'AP down',         val: status?.apActive  },
    { key: 'internet',   label: 'Internet',        desc: 'Outbound connectivity',              val: status?.internet  },
    { key: 'dnsActive',  label: 'DNS Resolver',    desc: status?.staDNS ?? '8.8.8.8',         val: status?.dnsActive },
  ];

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <div className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-0.5">Gateway</div>
        <h1 className="text-2xl font-bold tracking-wider text-white">
          GATEWAY <span style={{ color: '#c9a020' }}>STATUS</span>
        </h1>
      </div>

      {/* Service tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {services.map(({ key, label, desc, val }) => (
          <div key={key} className="metric-panel p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className={`status-dot ${val ? 'status-online' : 'status-offline'}`}/>
              <span className="text-[11px] tracking-[0.14em] font-semibold text-white">{label}</span>
            </div>
            <div className={`text-[18px] font-bold tracking-wider mb-1 ${val ? '' : 'opacity-40'}`}
              style={{ color: val ? '#c9a020' : '#6b7280' }}>
              {val ? 'ACTIVE' : 'DOWN'}
            </div>
            <div className="text-[10px] text-gray-600 truncate">{desc}</div>
          </div>
        ))}
      </div>

      {/* Routing stats */}
      <div className="carbon-panel rounded-lg p-5">
        <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-4">Routing Statistics</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { l: 'Bytes Routed (RX)',  v: formatBytes(status?.rxBytes ?? 0),    c: '#c8a828' },
            { l: 'Bytes Routed (TX)',  v: formatBytes(status?.txBytes ?? 0),    c: '#60a5fa' },
            { l: 'Packets (RX)',       v: (status?.rxPackets ?? 0).toLocaleString(), c: '#c8a828' },
            { l: 'Packets (TX)',       v: (status?.txPackets ?? 0).toLocaleString(), c: '#60a5fa' },
          ].map(({ l, v, c }) => (
            <div key={l}>
              <div className="text-[10px] tracking-widest text-gray-600 uppercase mb-1">{l}</div>
              <div className="text-base font-semibold font-mono" style={{ color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Flow diagram */}
      <div className="carbon-panel rounded-lg p-5">
        <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-4">Data Flow</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { label: 'INTERNET', active: status?.internet },
            null,
            { label: status?.staSSID ?? 'HOME WIFI', active: status?.staConnected },
            null,
            { label: 'ESP32-S3', active: true, highlight: true },
            null,
            { label: 'AP CLIENTS', active: status?.apActive },
          ].map((node, i) => {
            if (node === null) return (
              <div key={i} className="flex items-center gap-1 text-gray-700 shrink-0">
                <span className="text-[10px]">──</span>
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <circle r="2.5" cx="7" cy="7" fill="#c8a82888">
                    <animateTransform attributeName="transform" type="translate"
                      values="0,0;4,0;0,0" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <span className="text-[10px]">──</span>
              </div>
            );
            return (
              <div key={node.label} className={`shrink-0 px-3 py-2 rounded text-center text-[10px] tracking-widest font-semibold
                ${node.highlight ? '' : ''}`}
                style={{
                  background: node.highlight
                    ? 'rgba(200,168,40,0.12)'
                    : node.active ? 'rgba(34,197,94,0.06)' : 'rgba(107,114,128,0.06)',
                  border: `1px solid ${
                    node.highlight ? 'rgba(200,168,40,0.4)' :
                    node.active ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.15)'}`,
                  color: node.highlight ? '#c9a020' : node.active ? '#22c55e' : '#6b7280',
                }}>
                {node.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
