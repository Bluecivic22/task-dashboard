import React from 'react';
import { useGateway } from '../GatewayContext';
import { formatUptime, formatBytes } from '../GatewayApi';

export default function SystemPage() {
  const { sysInfo, status } = useGateway();

  const info = sysInfo ?? {};

  const sections = [
    {
      title: 'Processor',
      rows: [
        { l: 'Chip Model',    v: info.chipModel ?? '—'         },
        { l: 'Revision',      v: `Rev ${info.chipRevision ?? 0}`},
        { l: 'CPU Frequency', v: `${info.cpuFreqMHz ?? 0} MHz` },
        { l: 'CPU Cores',     v: String(info.cpuCores ?? 2)    },
        { l: 'STA MAC',       v: info.macSTA ?? '—', mono: true },
        { l: 'AP MAC',        v: info.macAP  ?? '—', mono: true },
      ],
    },
    {
      title: 'Memory',
      rows: [
        { l: 'Flash Size',  v: formatBytes(info.flashSize ?? 0)  },
        { l: 'PSRAM Total', v: formatBytes(info.psramSize ?? 0)  },
        { l: 'PSRAM Free',  v: formatBytes(info.psramFree ?? 0), color: '#22c55e' },
        { l: 'Heap Total',  v: formatBytes(info.totalHeap ?? 0)  },
        { l: 'Heap Free',   v: formatBytes(info.freeHeap  ?? 0), color: heapColor(info.freeHeap, info.totalHeap) },
      ],
    },
    {
      title: 'Runtime',
      rows: [
        { l: 'Uptime',          v: formatUptime(info.uptimeSeconds ?? 0), color: '#c9a020' },
        { l: 'Temperature',     v: `${info.temperature?.toFixed(1) ?? '—'} °C`,
          color: info.temperature > 70 ? '#ef4444' : info.temperature > 55 ? '#f59e0b' : '#22c55e' },
      ],
    },
    {
      title: 'Firmware',
      rows: [
        { l: 'Firmware Version', v: info.firmwareVersion ?? '—', color: '#c9a020' },
        { l: 'ESP-IDF Version',  v: info.sdkVersion ?? '—'       },
        { l: 'IDF Version',      v: info.idfVersion ?? '—'       },
        { l: 'Build',            v: info.buildVersion ?? '—', small: true },
      ],
    },
  ];

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <div className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-0.5">Gateway</div>
        <h1 className="text-2xl font-bold tracking-wider text-white">
          SYSTEM <span style={{ color: '#c9a020' }}>INFO</span>
        </h1>
      </div>

      {/* Big status */}
      <div className="carbon-panel rounded-lg p-5 flex items-center gap-5">
        <ChipIcon />
        <div>
          <div className="text-[10px] tracking-[0.2em] text-gray-500 mb-1">Hardware</div>
          <div className="text-2xl font-bold text-white tracking-wider">{info.chipModel ?? 'ESP32-S3'}</div>
          <div className="text-[12px] text-gray-500 mt-1 font-mono">
            {info.cpuFreqMHz ?? 240} MHz · {formatBytes(info.flashSize ?? 8388608)} Flash · {formatBytes(info.psramSize ?? 8388608)} PSRAM
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[10px] tracking-[0.14em] text-gray-600 mb-1">Uptime</div>
          <div className="text-xl font-mono font-semibold" style={{ color: '#c9a020' }}>
            {formatUptime(status?.uptimeSeconds ?? 0)}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(sec => (
          <div key={sec.title} className="carbon-panel rounded-lg p-4">
            <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-3">{sec.title}</div>
            <div className="space-y-2">
              {sec.rows.map(({ l, v, mono, color, small }) => (
                <div key={l} className="flex justify-between items-baseline border-b border-gray-900 pb-1.5">
                  <span className="text-[11px] text-gray-600">{l}</span>
                  <span className={`${mono ? 'font-mono' : ''} ${small ? 'text-[11px]' : 'text-[12px]'}`}
                    style={{ color: color ?? '#c4c4c4' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Memory bars */}
      <div className="carbon-panel rounded-lg p-5">
        <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-4">Memory Usage</div>
        <div className="space-y-4">
          <MemBar label="Internal Heap"
            used={(info.totalHeap ?? 0) - (info.freeHeap ?? 0)}
            total={info.totalHeap ?? 1} color="#c8a828"/>
          <MemBar label="PSRAM"
            used={(info.psramSize ?? 0) - (info.psramFree ?? 0)}
            total={info.psramSize ?? 1} color="#60a5fa"/>
        </div>
      </div>

      {/* OTA note */}
      <div className="carbon-panel rounded-lg p-4">
        <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-2">Firmware Update (OTA)</div>
        <div className="text-[12px] text-gray-500 mb-3">
          OTA update infrastructure is architecturally prepared. Upload endpoint authentication is required.
          Connect to the upstream network and use PlatformIO OTA or the update endpoint.
        </div>
        <button className="btn-ghost px-4 py-2 text-[11px] tracking-widest opacity-50 cursor-not-allowed">
          UPLOAD FIRMWARE
        </button>
        <span className="ml-3 text-[10px] text-gray-700">OTA not yet enabled in this build</span>
      </div>
    </div>
  );
}

function MemBar({ label, used, total, color }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-mono" style={{ color }}>
          {formatBytes(used)} / {formatBytes(total)} ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: pct > 85 ? '#ef4444' : color }}/>
      </div>
    </div>
  );
}

function heapColor(free, total) {
  if (!free || !total) return '#c4c4c4';
  const pct = free / total;
  if (pct < 0.2) return '#ef4444';
  if (pct < 0.4) return '#f59e0b';
  return '#22c55e';
}

function ChipIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#c8a828" strokeWidth="1.5">
      <rect x="14" y="14" width="20" height="20" rx="3"/>
      <line x1="18" y1="14" x2="18" y2="8"/><line x1="24" y1="14" x2="24" y2="8"/><line x1="30" y1="14" x2="30" y2="8"/>
      <line x1="18" y1="34" x2="18" y2="40"/><line x1="24" y1="34" x2="24" y2="40"/><line x1="30" y1="34" x2="30" y2="40"/>
      <line x1="14" y1="18" x2="8" y2="18"/><line x1="14" y1="24" x2="8" y2="24"/><line x1="14" y1="30" x2="8" y2="30"/>
      <line x1="34" y1="18" x2="40" y2="18"/><line x1="34" y1="24" x2="40" y2="24"/><line x1="34" y1="30" x2="40" y2="30"/>
      <rect x="19" y="19" width="10" height="10" rx="2" fill="rgba(200,168,40,0.1)"/>
    </svg>
  );
}
