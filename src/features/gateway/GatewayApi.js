/**
 * GatewayApi.js
 *
 * Thin API layer for the ESP32-S3 gateway backend.
 * In production, these functions fetch from `window.ESP32_API_BASE` (set by the
 * ESP32 web-server) or fall back to `/api/*`.
 * During development / demo mode all calls return rich mock data so the UI can
 * be built and iterated without hardware attached.
 */

const DEMO = import.meta.env.VITE_GATEWAY_DEMO !== 'false';
const API_BASE = window?.ESP32_API_BASE ?? '/api';

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(apiUrl(path), {
    credentials: 'include',
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} → HTTP ${res.status}`);
  return res.json();
}

/* ──────────────────────────────────────────────────────────────────────────
   MOCK DATA
   ────────────────────────────────────────────────────────────────────────── */

let _uptimeSeconds = 3 * 3600 + 42 * 60 + 15;
let _rxBytes = 148_230_400;
let _txBytes = 62_880_000;
let _rxPackets = 198_450;
let _txPackets = 87_220;
let _clients = [
  { id: 1, name: "iPhone 14 Pro",  ip: "192.168.4.2", mac: "A4:C3:F0:11:22:33", rssi: -48, rx: 31_457_280, tx: 10_485_760, proto: "802.11n", lastSeen: Date.now() - 12000,   status: "online" },
  { id: 2, name: "MacBook Pro",    ip: "192.168.4.3", mac: "B8:E8:56:44:55:66", rssi: -55, rx: 62_914_560, tx: 20_971_520, proto: "802.11n", lastSeen: Date.now() - 2000,    status: "online" },
  { id: 3, name: "iPad Air",       ip: "192.168.4.4", mac: "CE:1A:2B:77:88:99", rssi: -61, rx: 10_485_760, tx:  5_242_880, proto: "802.11n", lastSeen: Date.now() - 95000,   status: "idle"   },
  { id: 4, name: "Android Tablet", ip: "192.168.4.5", mac: "D0:F8:8C:AA:BB:CC", rssi: -72, rx:  4_194_304, tx:  2_097_152, proto: "802.11g", lastSeen: Date.now() - 300000,  status: "idle"   },
  { id: 5, name: "Smart TV",       ip: "192.168.4.6", mac: "F4:6D:04:DD:EE:FF", rssi: -80, rx:  2_097_152, tx:    524_288, proto: "802.11n", lastSeen: Date.now() - 1800000, status: "offline"},
  { id: 6, name: "Kindle",         ip: "192.168.4.7", mac: "40:B4:CD:12:34:56", rssi: -67, rx:  3_145_728, tx:  1_048_576, proto: "802.11n", lastSeen: Date.now() - 600000,  status: "idle"   },
  { id: 7, name: "Raspberry Pi",   ip: "192.168.4.8", mac: "DC:A6:32:56:78:9A", rssi: -50, rx: 15_728_640, tx:  8_388_608, proto: "802.11n", lastSeen: Date.now() - 5000,    status: "online" },
];

let _trafficHistory = (() => {
  const now = Date.now();
  const arr = [];
  for (let i = 59; i >= 0; i--) {
    const t = now - i * 5000;
    arr.push({
      t,
      rx: Math.round(800_000 + Math.random() * 3_200_000),
      tx: Math.round(200_000 + Math.random() * 800_000),
      pkts: Math.round(600 + Math.random() * 1400),
      conns: Math.round(3 + Math.random() * 8),
    });
  }
  return arr;
})();

let _logs = [
  { id: 1, ts: Date.now() - 7200000, level: "INFO",    cat: "SYSTEM",  msg: "ESP32-S3 gateway firmware v1.0.0 starting…" },
  { id: 2, ts: Date.now() - 7199800, level: "INFO",    cat: "SYSTEM",  msg: "CPU: 240 MHz, Flash: 8 MB, PSRAM: 8 MB" },
  { id: 3, ts: Date.now() - 7199600, level: "INFO",    cat: "WIFI",    msg: "STA mode initialised" },
  { id: 4, ts: Date.now() - 7199400, level: "INFO",    cat: "WIFI",    msg: "Connecting to upstream SSID: HomeNetwork_5G" },
  { id: 5, ts: Date.now() - 7198800, level: "INFO",    cat: "WIFI",    msg: "STA connected – IP 192.168.1.107, GW 192.168.1.1" },
  { id: 6, ts: Date.now() - 7198400, level: "INFO",    cat: "WIFI",    msg: "AP started – SSID: ESP32-Gateway, IP 192.168.4.1" },
  { id: 7, ts: Date.now() - 7198200, level: "INFO",    cat: "GATEWAY", msg: "NAT/NAPT enabled" },
  { id: 8, ts: Date.now() - 7198000, level: "INFO",    cat: "GATEWAY", msg: "DHCP server started (192.168.4.100 – 192.168.4.200)" },
  { id: 9, ts: Date.now() - 3600000, level: "INFO",    cat: "CLIENT",  msg: "Client connected: 192.168.4.2 (A4:C3:F0:11:22:33)" },
  { id:10, ts: Date.now() - 3500000, level: "INFO",    cat: "CLIENT",  msg: "Client connected: 192.168.4.3 (B8:E8:56:44:55:66)" },
  { id:11, ts: Date.now() - 2000000, level: "WARNING", cat: "WIFI",    msg: "STA RSSI degraded: -72 dBm" },
  { id:12, ts: Date.now() - 1800000, level: "INFO",    cat: "WIFI",    msg: "STA RSSI recovered: -55 dBm" },
  { id:13, ts: Date.now() -  900000, level: "INFO",    cat: "CLIENT",  msg: "Client connected: 192.168.4.4 (CE:1A:2B:77:88:99)" },
  { id:14, ts: Date.now() -  600000, level: "WARNING", cat: "NETWORK", msg: "DNS timeout for 8.8.8.8 – retrying" },
  { id:15, ts: Date.now() -  598000, level: "INFO",    cat: "NETWORK", msg: "DNS resolved successfully" },
  { id:16, ts: Date.now() -  300000, level: "INFO",    cat: "CLIENT",  msg: "Client connected: 192.168.4.8 (DC:A6:32:56:78:9A)" },
  { id:17, ts: Date.now() -   60000, level: "INFO",    cat: "SYSTEM",  msg: "Heap: 248 kB free / 320 kB total" },
  { id:18, ts: Date.now() -   10000, level: "INFO",    cat: "NETWORK", msg: "NAT table: 14 active entries" },
];
let _nextLogId = 19;

function tick() {
  _uptimeSeconds++;
  _rxBytes  += Math.round(300_000 + Math.random() * 1_200_000);
  _txBytes  += Math.round(80_000  + Math.random() * 320_000);
  _rxPackets += Math.round(250 + Math.random() * 600);
  _txPackets += Math.round(80  + Math.random() * 200);

  const now = Date.now();
  _trafficHistory.push({
    t: now,
    rx: Math.round(800_000 + Math.random() * 3_200_000),
    tx: Math.round(200_000 + Math.random() * 800_000),
    pkts: Math.round(600 + Math.random() * 1400),
    conns: Math.round(3 + Math.random() * 8),
  });
  if (_trafficHistory.length > 720) _trafficHistory.shift();
}
setInterval(tick, 2000);

/* ──────────────────────────────────────────────────────────────────────────
   PUBLIC API
   ────────────────────────────────────────────────────────────────────────── */

export async function getStatus() {
  if (DEMO) {
    return {
      online: true,
      internet: true,
      staConnected: true,
      staSSID: "HomeNetwork_5G",
      staIP: "192.168.1.107",
      staGW: "192.168.1.1",
      staDNS: "8.8.8.8",
      staRSSI: -54,
      staChannel: 6,
      apActive: true,
      apSSID: "ESP32-Gateway",
      apIP: "192.168.4.1",
      apChannel: 6,
      apSecurity: "WPA2",
      apDHCPRange: "192.168.4.100 – 192.168.4.200",
      clientCount: _clients.filter(c => c.status !== 'offline').length,
      rxBytes: _rxBytes,
      txBytes: _txBytes,
      rxPackets: _rxPackets,
      txPackets: _txPackets,
      uptimeSeconds: _uptimeSeconds,
      cpuFreqMHz: 240,
      cpuCores: 2,
      freeHeap: 248_832,
      totalHeap: 327_680,
      psramFree: 7_654_321,
      psramTotal: 8_388_608,
      flashSize: 8_388_608,
      temperature: 52.3,
      chipModel: "ESP32-S3",
      chipRevision: 0,
      sdkVersion: "v5.2.2",
      firmwareVersion: "1.0.0",
      natActive: true,
      dhcpActive: true,
      dnsActive: true,
    };
  }
  return apiFetch('/status');
}

export async function getClients() {
  if (DEMO) return _clients;
  return apiFetch('/clients');
}

export async function getTraffic(window_ = '1m') {
  if (DEMO) {
    const windowMs = {
      '1m': 60, '5m': 150, '15m': 450, '1h': 1800, '24h': 43200,
    }[window_] ?? 60;
    const now = Date.now();
    return _trafficHistory.filter(p => p.t >= now - windowMs * 1000);
  }
  return apiFetch(`/traffic?window=${window_}`);
}

export async function getLogs(filter = {}) {
  if (DEMO) {
    let logs = [..._logs].reverse();
    if (filter.level) logs = logs.filter(l => l.level === filter.level);
    if (filter.cat)   logs = logs.filter(l => l.cat === filter.cat);
    if (filter.q)     logs = logs.filter(l => l.msg.toLowerCase().includes(filter.q.toLowerCase()));
    return logs;
  }
  const q = new URLSearchParams(filter).toString();
  return apiFetch(`/logs${q ? '?' + q : ''}`);
}

export async function clearLogs() {
  if (DEMO) {
    _logs = [{ id: _nextLogId++, ts: Date.now(), level: "INFO", cat: "SYSTEM", msg: "Logs cleared by user." }];
    return { ok: true };
  }
  return apiFetch('/logs', { method: 'DELETE' });
}

export async function getSystemInfo() {
  if (DEMO) {
    return {
      chipModel: "ESP32-S3",
      chipRevision: 0,
      cpuFreqMHz: 240,
      cpuCores: 2,
      flashSize: 8_388_608,
      psramSize: 8_388_608,
      psramFree: 7_654_321,
      freeHeap: 248_832,
      totalHeap: 327_680,
      uptimeSeconds: _uptimeSeconds,
      firmwareVersion: "1.0.0",
      sdkVersion: "v5.2.2",
      buildVersion: "platformio-esp32s3-gateway@1.0.0",
      idfVersion: "v5.2.2",
      macSTA: "A0:B1:C2:D3:E4:F5",
      macAP:  "A0:B1:C2:D3:E4:F6",
      temperature: 52.3,
    };
  }
  return apiFetch('/system');
}

export async function getSettings() {
  if (DEMO) {
    return {
      staSSID: "HomeNetwork_5G",
      staPassword: "",
      hotspotSSID: "iPhone Hotspot",
      hotspotPassword: "",
      connectionMode: "home",
      apSSID: "ESP32-Gateway",
      apPassword: "",
      apChannel: 6,
      apDHCPStart: "192.168.4.100",
      apDHCPEnd:   "192.168.4.200",
      telemetryLevel: "standard",
      loggingLevel: "info",
      logRetentionDays: 7,
      refreshIntervalMs: 2000,
      adminUser: "admin",
    };
  }
  return apiFetch('/settings');
}

export async function saveSettings(data) {
  if (DEMO) {
    return { ok: true };
  }
  return apiFetch('/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function restartDevice() {
  if (DEMO) return { ok: true };
  return apiFetch('/restart', { method: 'POST' });
}

export async function resetNetworking() {
  if (DEMO) return { ok: true };
  return apiFetch('/reset-networking', { method: 'POST' });
}

export async function factoryReset() {
  if (DEMO) return { ok: true };
  return apiFetch('/factory-reset', { method: 'POST' });
}

export async function login(user, pass) {
  if (DEMO) {
    if (user === 'admin' && pass === 'admin') return { ok: true, token: 'demo-token' };
    throw new Error('Invalid credentials');
  }
  return apiFetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, pass }),
  });
}

export async function logout() {
  if (DEMO) return { ok: true };
  return apiFetch('/logout', { method: 'POST' });
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour12: false });
}

export function formatDateTime(ts) {
  return new Date(ts).toLocaleString([], { hour12: false });
}
