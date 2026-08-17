import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { RadarProvider } from './context/RadarContext.jsx';
import { ConfigProvider } from './context/ConfigContext.jsx';
import './styles/carbon.css';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider>
      <RadarProvider>
        <App />
      </RadarProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
