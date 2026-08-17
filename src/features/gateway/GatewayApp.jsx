import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GatewayProvider, useGateway } from './GatewayContext';

import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NetworkPage  from './pages/NetworkPage';
import ClientsPage  from './pages/ClientsPage';
import TrafficPage  from './pages/TrafficPage';
import WifiPage     from './pages/WifiPage';
import GatewayPage  from './pages/GatewayPage';
import LogsPage     from './pages/LogsPage';
import TelemetryPage from './pages/TelemetryPage';
import SettingsPage from './pages/SettingsPage';
import SystemPage   from './pages/SystemPage';

import { Sidebar, BottomNav } from './components/Navigation';

const PAGE_MAP = {
  dashboard: DashboardPage,
  network:   NetworkPage,
  clients:   ClientsPage,
  traffic:   TrafficPage,
  wifi:      WifiPage,
  gateway:   GatewayPage,
  logs:      LogsPage,
  telemetry: TelemetryPage,
  settings:  SettingsPage,
  system:    SystemPage,
};

function GatewayShell() {
  const { authed } = useGateway();
  const [page, setPage] = useState('dashboard');

  if (!authed) return <LoginPage />;

  const PageComponent = PAGE_MAP[page] ?? DashboardPage;

  return (
    <div className="carbon-bg min-h-screen">
      {/* Sidebar – hidden on small screens */}
      <div className="hidden md:block">
        <Sidebar page={page} onPage={setPage} />
      </div>

      {/* Main content */}
      <main className="md:main-with-sidebar min-h-screen pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom nav – mobile only */}
      <BottomNav page={page} onPage={setPage} />
    </div>
  );
}

export default function GatewayApp() {
  return (
    <GatewayProvider>
      <GatewayShell />
    </GatewayProvider>
  );
}
