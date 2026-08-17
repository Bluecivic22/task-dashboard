import React from 'react';
import { useGateway } from '../GatewayContext';

export default function WifiPage() {
  const { status } = useGateway();

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <div className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-0.5">Gateway</div>
        <h1 className="text-2xl font-bold tracking-wider text-white">
          WI-FI <span style={{ color: '#c9a020' }}>STATUS</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upstream STA */}
        <div className="carbon-panel rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-1">Upstream</div>
              <div className="text-lg font-semibold text-white">Station Connection</div>
            </div>
            <StatusBadge online={status?.staConnected} />
          </div>
          <div className="space-y-3">
            <InfoRow l="SSID"    v={status?.staSSID ?? '—'} />
            <InfoRow l="IP"      v={status?.staIP   ?? '—'} mono />
            <InfoRow l="Gateway" v={status?.staGW   ?? '—'} mono />
            <InfoRow l="DNS"     v={status?.staDNS  ?? '—'} mono />
            <InfoRow l="Channel" v={`Ch ${status?.staChannel ?? '—'}`} />
            <InfoRow l="Signal"  v={`${status?.staRSSI ?? '—'} dBm`}
              color={rssiColor(status?.staRSSI)} />
          </div>
          {/* Signal bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-gray-600 mb-1">
              <span>SIGNAL STRENGTH</span>
              <span className="font-mono" style={{ color: rssiColor(status?.staRSSI) }}>
                {status?.staRSSI ?? '—'} dBm
              </span>
            </div>
            <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${rssiPct(status?.staRSSI)}%`,
                  background: rssiColor(status?.staRSSI),
                }} />
            </div>
            <div className="flex justify-between text-[9px] text-gray-800 mt-0.5">
              <span>–100 dBm</span><span>–50 dBm</span>
            </div>
          </div>
        </div>

        {/* AP */}
        <div className="carbon-panel rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-1">ESP32 Access Point</div>
              <div className="text-lg font-semibold text-white">SoftAP</div>
            </div>
            <StatusBadge online={status?.apActive} />
          </div>
          <div className="space-y-3">
            <InfoRow l="SSID"       v={status?.apSSID      ?? '—'} />
            <InfoRow l="IP"         v={status?.apIP        ?? '—'} mono />
            <InfoRow l="Channel"    v={`Ch ${status?.apChannel ?? '—'}`} />
            <InfoRow l="Security"   v={status?.apSecurity  ?? '—'} />
            <InfoRow l="Clients"    v={String(status?.clientCount ?? 0)} color="#c9a020" />
            <InfoRow l="DHCP Range" v={status?.apDHCPRange ?? '—'} mono small />
          </div>
        </div>
      </div>

      {/* Quick Connect Guide */}
      <div className="carbon-panel rounded-lg p-5">
        <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-3">Quick Connect</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px]">
          <div>
            <div className="text-[10px] tracking-[0.14em] text-gray-600 uppercase mb-2">1. Connect Device</div>
            <div className="text-gray-300">
              Open Wi-Fi settings on your phone or laptop and connect to:
            </div>
            <div className="mt-1.5 font-mono text-sm" style={{ color: '#c9a020' }}>
              {status?.apSSID ?? 'ESP32-Gateway'}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.14em] text-gray-600 uppercase mb-2">2. Use Password</div>
            <div className="text-gray-300">Enter the AP password you configured.</div>
            <div className="mt-1.5 badge badge-gray font-mono">AP_PASSWORD</div>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.14em] text-gray-600 uppercase mb-2">3. Open Dashboard</div>
            <div className="text-gray-300">Browse to the gateway address:</div>
            <div className="mt-1.5 font-mono text-sm" style={{ color: '#c9a020' }}>
              http://{status?.apIP ?? '192.168.4.1'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ l, v, mono, color, small }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[10px] tracking-widest text-gray-600 uppercase shrink-0 mr-3">{l}</span>
      <span className={`text-right truncate ${small ? 'text-[11px]' : 'text-[12px]'} ${mono ? 'font-mono' : ''}`}
        style={{ color: color ?? '#c4c4c4' }}>{v}</span>
    </div>
  );
}

function StatusBadge({ online }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded"
      style={{
        background: online ? 'rgba(34,197,94,0.08)' : 'rgba(107,114,128,0.08)',
        border: `1px solid ${online ? 'rgba(34,197,94,0.25)' : 'rgba(107,114,128,0.2)'}`,
      }}>
      <span className={`status-dot ${online ? 'status-online' : 'status-offline'}`}/>
      <span className="text-[11px] tracking-widest font-medium" style={{ color: online ? '#22c55e' : '#6b7280' }}>
        {online ? 'ACTIVE' : 'DOWN'}
      </span>
    </div>
  );
}

function rssiColor(rssi) {
  if (!rssi) return '#6b7280';
  if (rssi >= -55) return '#22c55e';
  if (rssi >= -70) return '#f59e0b';
  return '#ef4444';
}

function rssiPct(rssi) {
  if (!rssi) return 0;
  return Math.max(0, Math.min(100, ((rssi + 100) / 50) * 100));
}
