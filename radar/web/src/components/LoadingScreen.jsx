export default function LoadingScreen() {
  return (
    <div className="loading-screen carbon-bg">
      <div className="carbon-panel loading-card">
        <h1 className="gold-bright-text glow-title">RADAR</h1>
        <p className="loading-subtitle">Initializing Wi-Fi passive sensing system</p>
        <div className="progress-shell"><div className="progress-bar" /></div>
        <p className="loading-status">Establishing telemetry link…</p>
        <span className="pulse-indicator status-indicator status-activity" />
      </div>
    </div>
  );
}
