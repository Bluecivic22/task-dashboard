import { useCallback, useEffect, useRef, useState } from 'react';

export function useWebSocket({ url, enabled = true }) {
  const socketRef = useRef(null);
  const retryRef = useRef(null);
  const [status, setStatus] = useState(enabled ? 'connecting' : 'disabled');
  const [lastMessage, setLastMessage] = useState(null);

  const connect = useCallback(() => {
    if (!enabled) return;
    setStatus('connecting');
    const socket = new WebSocket(url);
    socketRef.current = socket;
    socket.onopen = () => setStatus('connected');
    socket.onerror = () => setStatus('error');
    socket.onclose = () => {
      setStatus('disconnected');
      retryRef.current = window.setTimeout(connect, 1500);
    };
    socket.onmessage = (event) => {
      try {
        setLastMessage(JSON.parse(event.data));
      } catch {
        setLastMessage({ type: 'ERROR', payload: { message: 'Invalid JSON' } });
      }
    };
  }, [enabled, url]);

  useEffect(() => {
    if (enabled) connect();
    return () => {
      if (retryRef.current) window.clearTimeout(retryRef.current);
      socketRef.current?.close();
    };
  }, [connect, enabled]);

  return {
    status,
    lastMessage,
    reconnect: connect,
    send: (payload) => socketRef.current?.readyState === WebSocket.OPEN && socketRef.current.send(JSON.stringify(payload)),
  };
}
