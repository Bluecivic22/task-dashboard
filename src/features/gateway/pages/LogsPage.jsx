import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getLogs, clearLogs, formatDateTime } from '../GatewayApi';

const LEVELS = ['ALL', 'INFO', 'WARNING', 'ERROR'];
const CATS   = ['ALL', 'SYSTEM', 'WIFI', 'NETWORK', 'CLIENT', 'GATEWAY'];

const LEVEL_COLORS = {
  INFO:    '#a0a0a8',
  WARNING: '#f59e0b',
  ERROR:   '#ef4444',
};

export default function LogsPage() {
  const [logs, setLogs]       = useState([]);
  const [level, setLevel]     = useState('ALL');
  const [cat, setCat]         = useState('ALL');
  const [search, setSearch]   = useState('');
  const [paused, setPaused]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const bottomRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const load = useCallback(async () => {
    if (paused) return;
    const filter = {};
    if (level !== 'ALL') filter.level = level;
    if (cat !== 'ALL')   filter.cat = cat;
    if (search)          filter.q = search;
    const data = await getLogs(filter);
    setLogs(data);
  }, [paused, level, cat, search]);

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  async function handleClear() {
    await clearLogs();
    setShowConfirm(false);
    load();
  }

  function exportLogs() {
    const text = logs.map(l =>
      `[${formatDateTime(l.ts)}] [${l.level}] [${l.cat}] ${l.msg}`
    ).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = `esp32-gateway-logs-${Date.now()}.txt`;
    a.click();
  }

  return (
    <div className="animate-fadeIn space-y-4 flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div>
        <div className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-0.5">Gateway</div>
        <h1 className="text-2xl font-bold tracking-wider text-white">
          SYSTEM <span style={{ color: '#c9a020' }}>LOGS</span>
        </h1>
      </div>

      {/* Controls */}
      <div className="carbon-panel rounded-lg p-3 flex flex-wrap items-center gap-3">
        {/* Level filter */}
        <div className="flex gap-1">
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-2.5 py-1 text-[10px] tracking-widest rounded transition-all ${level === l ? 'btn-gold' : 'btn-ghost'}`}>
              {l}
            </button>
          ))}
        </div>
        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-2 py-1 text-[9px] tracking-widest rounded transition-all ${cat === c ? 'btn-gold' : 'btn-ghost'}`}>
              {c}
            </button>
          ))}
        </div>
        {/* Search */}
        <input
          className="carbon-input text-[11px] max-w-xs"
          placeholder="Search logs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '5px 10px' }}
        />
        <div className="ml-auto flex gap-2">
          <button onClick={() => setPaused(p => !p)}
            className={`px-3 py-1.5 text-[10px] tracking-widest rounded transition-all ${paused ? 'btn-gold' : 'btn-ghost'}`}>
            {paused ? '▶ RESUME' : '‖ PAUSE'}
          </button>
          <button onClick={exportLogs} className="btn-ghost px-3 py-1.5 text-[10px] tracking-widest">
            ↓ EXPORT
          </button>
          <button onClick={() => setShowConfirm(true)} className="btn-danger px-3 py-1.5 text-[10px] tracking-widest">
            ✕ CLEAR
          </button>
        </div>
      </div>

      {/* Clear confirm */}
      {showConfirm && (
        <div className="carbon-panel rounded-lg p-4 flex items-center justify-between"
          style={{ borderColor: 'rgba(239,68,68,0.35)' }}>
          <span className="text-[12px] text-red-400">Clear all logs? This cannot be undone.</span>
          <div className="flex gap-2">
            <button onClick={() => setShowConfirm(false)} className="btn-ghost px-3 py-1.5 text-[10px]">CANCEL</button>
            <button onClick={handleClear} className="btn-danger px-3 py-1.5 text-[10px]">CONFIRM CLEAR</button>
          </div>
        </div>
      )}

      {/* Terminal */}
      <div className="terminal-bg rounded-lg flex-1 overflow-y-auto p-4 space-y-0.5"
        style={{ maxHeight: 'calc(100vh - 380px)', minHeight: 300 }}
        onScroll={e => {
          const el = e.currentTarget;
          const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 60;
          setAutoScroll(atBottom);
        }}
      >
        {logs.length === 0 && (
          <div className="text-[11px] text-gray-700 tracking-widest text-center py-10">
            NO LOG ENTRIES
          </div>
        )}
        {logs.map(log => (
          <div key={log.id} className="flex gap-2 text-[11px] hover:bg-white/[0.02] px-1 rounded group">
            <span className="shrink-0 font-mono" style={{ color: '#c8a82877' }}>
              {new Date(log.ts).toLocaleTimeString([], { hour12: false })}
            </span>
            <span className="shrink-0 badge text-[9px] self-center" style={{
              background: log.level === 'ERROR'   ? 'rgba(239,68,68,0.1)'  :
                          log.level === 'WARNING' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
              color: LEVEL_COLORS[log.level] ?? '#888',
              border: `1px solid ${
                log.level === 'ERROR'   ? 'rgba(239,68,68,0.3)'  :
                log.level === 'WARNING' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
              padding: '1px 5px',
            }}>
              {log.level}
            </span>
            <span className="shrink-0 text-[9px] font-mono text-gray-600 self-center w-16">{log.cat}</span>
            <span style={{ color: LEVEL_COLORS[log.level] ?? '#a0a0a8' }}>{log.msg}</span>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-700">
        <span>{logs.length} ENTRIES</span>
        <span className="flex items-center gap-1.5">
          {paused
            ? <><span className="status-dot status-idle"/>PAUSED</>
            : <><span className="status-dot status-online"/>LIVE</>
          }
        </span>
      </div>
    </div>
  );
}
