import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as Api from './GatewayApi';

const GatewayContext = createContext(null);

export function GatewayProvider({ children }) {
  const [status, setStatus]   = useState(null);
  const [clients, setClients] = useState([]);
  const [sysInfo, setSysInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [authed, setAuthed]   = useState(() => !!sessionStorage.getItem('gw_authed'));
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const [s, c, si] = await Promise.all([
        Api.getStatus(),
        Api.getClients(),
        Api.getSystemInfo(),
      ]);
      setStatus(s);
      setClients(c);
      setSysInfo(si);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, 2000);
    return () => clearInterval(timerRef.current);
  }, [refresh]);

  const doLogin = useCallback(async (user, pass) => {
    await Api.login(user, pass);
    sessionStorage.setItem('gw_authed', '1');
    setAuthed(true);
  }, []);

  const doLogout = useCallback(async () => {
    await Api.logout();
    sessionStorage.removeItem('gw_authed');
    setAuthed(false);
  }, []);

  return (
    <GatewayContext.Provider value={{
      status, clients, sysInfo, loading, error,
      authed, doLogin, doLogout, refresh,
    }}>
      {children}
    </GatewayContext.Provider>
  );
}

export function useGateway() {
  const ctx = useContext(GatewayContext);
  if (!ctx) throw new Error('useGateway must be used inside GatewayProvider');
  return ctx;
}
