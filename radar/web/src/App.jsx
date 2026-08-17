import { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import StatusBar from './components/StatusBar.jsx';
import RadarView from './components/RadarView.jsx';
import FloorPlan from './components/FloorPlan.jsx';
import HeatMap from './components/HeatMap.jsx';
import NodePanel from './components/NodePanel.jsx';
import TelemetryPanel from './components/TelemetryPanel.jsx';
import PresencePanel from './components/PresencePanel.jsx';
import DiagnosticsPage from './components/DiagnosticsPage.jsx';
import CalibrationWizard from './components/CalibrationWizard.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import SimulationControls from './components/SimulationControls.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import { useRadar } from './context/RadarContext.jsx';

const tabs = ['dashboard', 'calibration', 'settings', 'diagnostics', 'floorplan'];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const { loading, simulationMode } = useRadar();
  const nav = useMemo(() => tabs, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="app-shell carbon-bg">
      <Header onNavigate={setPage} />
      <nav className="nav-strip carbon-panel">
        {nav.map((item) => (
          <button key={item} className={`btn-carbon ${page === item ? 'active' : ''}`} onClick={() => setPage(item)}>
            {item}
          </button>
        ))}
      </nav>
      <StatusBar />
      {simulationMode ? <SimulationControls /> : null}
      {page === 'dashboard' ? (
        <main className="dashboard-grid">
          <section className="carbon-panel panel-large"><RadarView /></section>
          <section className="carbon-panel panel-side"><PresencePanel /><NodePanel /></section>
          <section className="carbon-panel panel-half"><HeatMap /></section>
          <section className="carbon-panel panel-half"><TelemetryPanel /></section>
        </main>
      ) : null}
      {page === 'floorplan' ? <FloorPlan /> : null}
      {page === 'diagnostics' ? <DiagnosticsPage /> : null}
      {page === 'calibration' ? <CalibrationWizard onFinish={() => setPage('dashboard')} /> : null}
      {page === 'settings' ? <SettingsPage /> : null}
    </div>
  );
}
