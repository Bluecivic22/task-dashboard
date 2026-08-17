import React from 'react';
import { motion } from 'framer-motion';
import { useGateway } from '../GatewayContext';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  { id: 'network',   label: 'Network',   icon: IconNetwork   },
  { id: 'clients',   label: 'Clients',   icon: IconClients   },
  { id: 'traffic',   label: 'Traffic',   icon: IconTraffic   },
  { id: 'wifi',      label: 'Wi-Fi',     icon: IconWifi      },
  { id: 'gateway',   label: 'Gateway',   icon: IconGateway   },
  { id: 'logs',      label: 'Logs',      icon: IconLogs      },
  { id: 'telemetry', label: 'Telemetry', icon: IconTelemetry },
  { id: 'settings',  label: 'Settings',  icon: IconSettings  },
  { id: 'system',    label: 'System',    icon: IconSystem    },
];

/* ── Sidebar (desktop) ── */
export function Sidebar({ page, onPage }) {
  const { status, doLogout } = useGateway();

  return (
    <nav className="sidebar fixed top-0 left-0 h-full flex flex-col z-40"
      style={{ background: '#0f0f10', borderRight: '1px solid rgba(200,168,40,0.14)' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(200,168,40,0.12)' }}>
        <div className="flex items-center gap-2 mb-1">
          <ChipIcon />
          <span className="text-xs tracking-[0.18em] font-semibold" style={{ color: '#c9a020' }}>ESP32-S3</span>
        </div>
        <div className="text-[11px] tracking-[0.12em] text-gray-500 uppercase">Network Gateway</div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`status-dot ${status?.online ? 'status-online' : 'status-offline'}`} />
          <span className="text-[11px] tracking-widest font-medium"
            style={{ color: status?.online ? '#22c55e' : '#6b7280' }}>
            {status?.online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3">
        {PAGES.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => onPage(id)}
              className={`nav-active-bar w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-150
                ${active ? 'nav-active-bar' : ''}`}
              style={{
                background: active ? 'rgba(200,168,40,0.07)' : 'transparent',
                color: active ? '#c9a020' : '#7a7a88',
              }}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r"
                  style={{ background: '#c8a828', boxShadow: '0 0 8px rgba(200,168,40,0.5)' }} />
              )}
              <Icon size={16} active={active} />
              <span className="text-[13px] font-medium tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(200,168,40,0.12)' }}>
        <div className="text-[10px] text-gray-600 tracking-widest mb-2">FIRMWARE v1.0.0</div>
        <button onClick={doLogout} className="btn-ghost px-3 py-1.5 text-[11px] w-full">
          LOGOUT
        </button>
      </div>
    </nav>
  );
}

/* ── Bottom nav (mobile) ── */
export function BottomNav({ page, onPage }) {
  const topPages = ['dashboard', 'clients', 'traffic', 'wifi', 'settings'];
  const visible = PAGES.filter(p => topPages.includes(p.id));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden"
      style={{ background: '#0f0f10', borderTop: '1px solid rgba(200,168,40,0.18)' }}>
      {visible.map(({ id, label, icon: Icon }) => {
        const active = page === id;
        return (
          <button
            key={id}
            onClick={() => onPage(id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all"
            style={{ color: active ? '#c9a020' : '#4a4a56' }}
          >
            <Icon size={20} active={active} />
            <span className="text-[9px] tracking-wider font-medium uppercase">{label}</span>
            {active && <span className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: '#c8a828' }} />}
          </button>
        );
      })}
    </nav>
  );
}

/* ── SVG Icons ── */
function IconDashboard({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={active ? '#c8a828' : 'currentColor'} strokeWidth="1.5">
      <rect x="2" y="2" width="7" height="7" rx="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5"/>
    </svg>
  );
}
function IconNetwork({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={active ? '#c8a828' : 'currentColor'} strokeWidth="1.5">
      <circle cx="10" cy="10" r="2"/>
      <circle cx="10" cy="3"  r="1.5"/>
      <circle cx="3"  cy="17" r="1.5"/>
      <circle cx="17" cy="17" r="1.5"/>
      <line x1="10" y1="4.5" x2="10" y2="8"/>
      <line x1="8.6" y1="11.4" x2="4.2" y2="15.8"/>
      <line x1="11.4" y1="11.4" x2="15.8" y2="15.8"/>
    </svg>
  );
}
function IconClients({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={active ? '#c8a828' : 'currentColor'} strokeWidth="1.5">
      <circle cx="7" cy="7" r="2.5"/>
      <path d="M2 17c0-3 2.2-5 5-5s5 2 5 5"/>
      <circle cx="15" cy="6" r="2"/>
      <path d="M13 17c0-2 1-4 2-4s3 2 3 4" strokeDasharray="2 2"/>
    </svg>
  );
}
function IconTraffic({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={active ? '#c8a828' : 'currentColor'} strokeWidth="1.5">
      <polyline points="2,14 6,8 10,11 14,5 18,9"/>
      <line x1="2" y1="17" x2="18" y2="17"/>
    </svg>
  );
}
function IconWifi({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={active ? '#c8a828' : 'currentColor'} strokeWidth="1.5">
      <path d="M1 7.5C4.5 4 8 2.5 10 2.5s5.5 1.5 9 5"/>
      <path d="M3.5 11C6 8.5 8 7.5 10 7.5s4 1 6.5 3.5"/>
      <path d="M6.5 14c1-1.2 2.2-2 3.5-2s2.5.8 3.5 2"/>
      <circle cx="10" cy="17" r="1" fill={active ? '#c8a828' : 'currentColor'}/>
    </svg>
  );
}
function IconGateway({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={active ? '#c8a828' : 'currentColor'} strokeWidth="1.5">
      <rect x="2" y="7" width="16" height="6" rx="2"/>
      <circle cx="6" cy="10" r="1" fill={active ? '#c8a828' : 'currentColor'}/>
      <circle cx="10" cy="10" r="1" fill={active ? '#c8a828' : 'currentColor'}/>
      <line x1="14" y1="8.5" x2="16" y2="8.5"/>
      <line x1="14" y1="10" x2="16" y2="10"/>
      <line x1="14" y1="11.5" x2="16" y2="11.5"/>
      <line x1="6" y1="4" x2="6" y2="7"/>
      <line x1="14" y1="4" x2="14" y2="7"/>
    </svg>
  );
}
function IconLogs({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={active ? '#c8a828' : 'currentColor'} strokeWidth="1.5">
      <rect x="3" y="2" width="14" height="16" rx="2"/>
      <line x1="7" y1="7"  x2="13" y2="7"/>
      <line x1="7" y1="10" x2="13" y2="10"/>
      <line x1="7" y1="13" x2="11" y2="13"/>
    </svg>
  );
}
function IconTelemetry({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={active ? '#c8a828' : 'currentColor'} strokeWidth="1.5">
      <path d="M3 15 L7 9 L10 12 L13 6 L17 10"/>
      <path d="M2 18 L18 18"/>
      <circle cx="17" cy="10" r="1.5" fill={active ? '#c8a828' : 'none'}/>
    </svg>
  );
}
function IconSettings({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={active ? '#c8a828' : 'currentColor'} strokeWidth="1.5">
      <circle cx="10" cy="10" r="2.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/>
    </svg>
  );
}
function IconSystem({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={active ? '#c8a828' : 'currentColor'} strokeWidth="1.5">
      <rect x="2" y="4" width="16" height="12" rx="2"/>
      <line x1="6" y1="8" x2="6" y2="12"/>
      <line x1="9" y1="7" x2="9" y2="13"/>
      <line x1="12" y1="9" x2="12" y2="11"/>
      <line x1="15" y1="8" x2="15" y2="12"/>
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a828" strokeWidth="1.5">
      <rect x="7" y="7" width="10" height="10" rx="2"/>
      <line x1="9" y1="7" x2="9" y2="4"/><line x1="12" y1="7" x2="12" y2="4"/><line x1="15" y1="7" x2="15" y2="4"/>
      <line x1="9" y1="17" x2="9" y2="20"/><line x1="12" y1="17" x2="12" y2="20"/><line x1="15" y1="17" x2="15" y2="20"/>
      <line x1="7" y1="9" x2="4" y2="9"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="7" y1="15" x2="4" y2="15"/>
      <line x1="17" y1="9" x2="20" y2="9"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="17" y1="15" x2="20" y2="15"/>
    </svg>
  );
}
