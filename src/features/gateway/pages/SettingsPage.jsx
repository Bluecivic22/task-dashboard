import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, restartDevice, resetNetworking, clearLogs, factoryReset } from '../GatewayApi';

export default function SettingsPage() {
  const [cfg, setCfg]         = useState(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [showPass, setShowPass] = useState({});

  useEffect(() => {
    getSettings().then(setCfg);
  }, []);

  function set(key, val) {
    setCfg(p => ({ ...p, [key]: val }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings(cfg);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function doAction(action) {
    setConfirm(null);
    switch (action) {
      case 'restart':    await restartDevice();   break;
      case 'netReset':   await resetNetworking();  break;
      case 'clearLogs':  await clearLogs();        break;
      case 'factory':    await factoryReset();     break;
    }
  }

  if (!cfg) return <div className="text-gray-600 text-[12px] tracking-widest p-8">LOADING SETTINGS…</div>;

  const togglePass = k => setShowPass(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <div className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-0.5">Gateway</div>
        <h1 className="text-2xl font-bold tracking-wider text-white">
          SETTINGS
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Wi-Fi Section */}
        <Section title="Wi-Fi Networks">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Home Network SSID">
              <input className="carbon-input" value={cfg.staSSID} onChange={e => set('staSSID', e.target.value)}/>
            </Field>
            <Field label="Home Network Password">
              <PasswordInput value={cfg.staPassword} show={showPass.sta} onToggle={() => togglePass('sta')}
                onChange={v => set('staPassword', v)} placeholder="Leave blank to keep current"/>
            </Field>
            <Field label="Hotspot SSID">
              <input className="carbon-input" value={cfg.hotspotSSID} onChange={e => set('hotspotSSID', e.target.value)}/>
            </Field>
            <Field label="Hotspot Password">
              <PasswordInput value={cfg.hotspotPassword} show={showPass.hotspot} onToggle={() => togglePass('hotspot')}
                onChange={v => set('hotspotPassword', v)} placeholder="Leave blank to keep current"/>
            </Field>
          </div>
          <Field label="Connection Mode">
            <div className="flex gap-2 mt-1">
              {[['home', 'Home Network'], ['hotspot', 'Phone Hotspot']].map(([val, label]) => (
                <button type="button" key={val}
                  onClick={() => set('connectionMode', val)}
                  className={`flex-1 py-2 text-[11px] tracking-widest rounded transition-all ${
                    cfg.connectionMode === val ? 'btn-gold' : 'btn-ghost'
                  }`}>{label}</button>
              ))}
            </div>
          </Field>
        </Section>

        {/* Access Point */}
        <Section title="Access Point">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="AP SSID">
              <input className="carbon-input" value={cfg.apSSID} onChange={e => set('apSSID', e.target.value)}/>
            </Field>
            <Field label="AP Password">
              <PasswordInput value={cfg.apPassword} show={showPass.ap} onToggle={() => togglePass('ap')}
                onChange={v => set('apPassword', v)} placeholder="Minimum 8 characters"/>
            </Field>
            <Field label="AP Channel (1–13)">
              <input className="carbon-input" type="number" min="1" max="13"
                value={cfg.apChannel} onChange={e => set('apChannel', Number(e.target.value))}/>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Field label="DHCP Range Start">
              <input className="carbon-input font-mono" value={cfg.apDHCPStart}
                onChange={e => set('apDHCPStart', e.target.value)}/>
            </Field>
            <Field label="DHCP Range End">
              <input className="carbon-input font-mono" value={cfg.apDHCPEnd}
                onChange={e => set('apDHCPEnd', e.target.value)}/>
            </Field>
          </div>
        </Section>

        {/* Monitoring */}
        <Section title="Monitoring">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Telemetry Level">
              <select className="carbon-input" value={cfg.telemetryLevel} onChange={e => set('telemetryLevel', e.target.value)}>
                {['minimal', 'standard', 'verbose'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Logging Level">
              <select className="carbon-input" value={cfg.loggingLevel} onChange={e => set('loggingLevel', e.target.value)}>
                {['error', 'warning', 'info', 'debug', 'verbose'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Log Retention (days)">
              <input className="carbon-input" type="number" min="1" max="30"
                value={cfg.logRetentionDays} onChange={e => set('logRetentionDays', Number(e.target.value))}/>
            </Field>
            <Field label="Dashboard Refresh (ms)">
              <input className="carbon-input" type="number" min="500" max="10000" step="500"
                value={cfg.refreshIntervalMs} onChange={e => set('refreshIntervalMs', Number(e.target.value))}/>
            </Field>
          </div>
        </Section>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-gold px-6 py-2.5 text-[12px] tracking-[0.12em] disabled:opacity-50">
            {saving ? 'SAVING…' : 'SAVE SETTINGS'}
          </button>
          {saved && (
            <span className="text-[12px] text-green-400 flex items-center gap-1.5">
              <span className="status-dot status-online"/>SAVED
            </span>
          )}
        </div>
      </form>

      {/* Danger Zone */}
      <div className="carbon-panel rounded-lg p-5 space-y-3"
        style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <div className="text-[11px] tracking-[0.18em] text-red-600 uppercase mb-1">System Actions</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'restart',   label: 'Restart',         desc: 'Reboot device',     danger: false },
            { id: 'netReset',  label: 'Reset Networking', desc: 'Reconnect Wi-Fi',   danger: false },
            { id: 'clearLogs', label: 'Clear Logs',       desc: 'Delete all logs',   danger: true  },
            { id: 'factory',   label: 'Factory Reset',    desc: 'Erase all settings',danger: true  },
          ].map(({ id, label, desc, danger }) => (
            <div key={id} className="text-center">
              <button type="button"
                onClick={() => setConfirm(id)}
                className={`w-full py-2 text-[11px] tracking-widest mb-1 ${danger ? 'btn-danger' : 'btn-ghost'}`}>
                {label}
              </button>
              <div className="text-[10px] text-gray-700">{desc}</div>
            </div>
          ))}
        </div>

        {/* Confirm dialog */}
        {confirm && (
          <div className="mt-3 p-3 rounded border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <p className="text-[12px] text-red-400 mb-3">
              Confirm: <strong>{confirm}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirm(null)} className="btn-ghost px-3 py-1.5 text-[10px]">CANCEL</button>
              <button type="button" onClick={() => doAction(confirm)} className="btn-danger px-3 py-1.5 text-[10px]">CONFIRM</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="carbon-panel rounded-lg p-5">
      <div className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mb-4">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.14em] text-gray-500 uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({ value, show, onToggle, onChange, placeholder }) {
  return (
    <div className="relative">
      <input
        className="carbon-input pr-10"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
      />
      <button type="button" onClick={onToggle}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 text-[11px]">
        {show ? 'HIDE' : 'SHOW'}
      </button>
    </div>
  );
}
