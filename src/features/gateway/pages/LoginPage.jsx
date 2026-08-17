import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGateway } from '../GatewayContext';

export default function LoginPage() {
  const { doLogin } = useGateway();
  const [user, setUser]     = useState('admin');
  const [pass, setPass]     = useState('');
  const [err, setErr]       = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await doLogin(user, pass);
    } catch (ex) {
      setErr(ex.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="carbon-bg min-h-screen flex flex-col items-center justify-center px-4">
      {/* Subtle grid overlay */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(200,168,40,0.04) 0%, transparent 60%)',
        }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
            style={{ background: 'rgba(200,168,40,0.08)', border: '1px solid rgba(200,168,40,0.25)' }}>
            <ChipIcon />
          </div>
          <div className="text-[13px] tracking-[0.22em] font-semibold mb-1" style={{ color: '#c9a020' }}>
            ESP32-S3
          </div>
          <div className="text-xl font-semibold text-white tracking-wider">NETWORK GATEWAY</div>
          <div className="text-[11px] tracking-[0.2em] text-gray-500 mt-1 uppercase">Secure Access</div>
        </div>

        {/* Form */}
        <div className="carbon-panel rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] tracking-[0.14em] text-gray-400 mb-1.5 uppercase">Username</label>
              <input
                className="carbon-input"
                value={user}
                onChange={e => setUser(e.target.value)}
                autoComplete="username"
                spellCheck={false}
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.14em] text-gray-400 mb-1.5 uppercase">Password</label>
              <input
                className="carbon-input"
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            {err && (
              <div className="text-[12px] text-red-400 bg-red-900/20 border border-red-800/40 rounded px-3 py-2">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-2.5 text-[12px] tracking-[0.14em] disabled:opacity-50"
            >
              {loading ? 'AUTHENTICATING…' : 'AUTHENTICATE'}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-gray-800/60 text-center text-[10px] text-gray-600 tracking-wider">
            DEMO: admin / admin
          </div>
        </div>

        <div className="mt-6 text-center text-[10px] text-gray-700 tracking-widest">
          FIRMWARE v1.0.0 · ESP32-S3 GATEWAY
        </div>
      </motion.div>
    </div>
  );
}

function ChipIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8a828" strokeWidth="1.5">
      <rect x="7" y="7" width="10" height="10" rx="2"/>
      <line x1="9" y1="7" x2="9" y2="4"/><line x1="12" y1="7" x2="12" y2="4"/><line x1="15" y1="7" x2="15" y2="4"/>
      <line x1="9" y1="17" x2="9" y2="20"/><line x1="12" y1="17" x2="12" y2="20"/><line x1="15" y1="17" x2="15" y2="20"/>
      <line x1="7" y1="9" x2="4" y2="9"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="7" y1="15" x2="4" y2="15"/>
      <line x1="17" y1="9" x2="20" y2="9"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="17" y1="15" x2="20" y2="15"/>
    </svg>
  );
}
