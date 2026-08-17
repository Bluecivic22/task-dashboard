#include <Arduino.h>
#include <WiFi.h>

#include "config/config.h"
#include "detection/presence_detector.h"
#include "diagnostics/diagnostics.h"
#include "nodes/node_manager.h"
#include "sensing/csi_handler.h"
#include "sensing/radio_engine.h"
#include "spatial/spatial_model.h"
#include "storage/storage.h"
#include "telemetry/telemetry.h"
#include "utils/hw_info.h"
#include "utils/logger.h"
#include "web/web_server.h"

ConfigManager configManager;
StorageManager storageManager;
NodeManager nodeManager;
RadioEngine radioEngine;
CSIHandler csiHandler;
SpatialModel spatialModel;
PresenceDetector presenceDetector;
TelemetryManager telemetryManager;
RadarWebServer webServer;
DiagnosticsManager diagnosticsManager;
DeviceInfo deviceInfo;

uint64_t lastScan = 0;
uint64_t lastTelemetry = 0;

void setupWifi(const SystemConfig &config) {
  WiFi.mode(config.wifi_sta_ssid.isEmpty() ? WIFI_MODE_APSTA : WIFI_MODE_STA);
  WiFi.softAP(config.wifi_ap_ssid.c_str(), config.wifi_ap_password.isEmpty() ? nullptr : config.wifi_ap_password.c_str());
  if (!config.wifi_sta_ssid.isEmpty()) {
    WiFi.begin(config.wifi_sta_ssid.c_str(), config.wifi_sta_password.c_str());
  }
}

void setup() {
  Logger::instance().begin(LogLevel::INFO);
  configManager.begin();
  Logger::instance().setLevel(static_cast<LogLevel>(configManager.get().log_level));
  storageManager.begin();
  setupWifi(configManager.get());
  nodeManager.loadFromConfig(configManager.get());
  radioEngine.begin(configManager.get());
  const bool csiAvailable = csiHandler.begin(configManager.get().csi_enabled);
  spatialModel.begin(configManager.get());
  presenceDetector.begin(configManager.get());
  telemetryManager.begin(configManager.get().telemetry_interval_ms);
  deviceInfo = HardwareInfo::detect(csiAvailable);
  diagnosticsManager.begin(deviceInfo, &nodeManager);
  webServer.begin(configManager, nodeManager, radioEngine, spatialModel, presenceDetector, storageManager, diagnosticsManager, telemetryManager);
  LOG_INFO("main", "RADAR firmware initialized");
}

void loop() {
  const auto &config = configManager.get();
  const uint64_t now = millis();

  if (now - lastScan >= config.scan_interval_ms) {
    auto measurements = radioEngine.scan();
    for (const auto &measurement : measurements) nodeManager.matchMeasurement(measurement);
    spatialModel.update(measurements, nodeManager.getActiveNodes(), config.interpolation_power);
    presenceDetector.update(measurements, nodeManager.getActiveNodes());
    storageManager.prune(config.history_retention_hours);
    lastScan = now;
  }

  if (config.telemetry_enabled && now - lastTelemetry >= telemetryManager.intervalMs()) {
    JsonDocument spatialDoc;
    spatialModel.getHeatmapData(spatialDoc);
    deviceInfo = HardwareInfo::detect(csiHandler.isAvailable());
    const String payload = telemetryManager.buildSnapshot(deviceInfo,
                                                          nodeManager.getActiveNodes(),
                                                          radioEngine.latestMeasurements(),
                                                          presenceDetector.latest(),
                                                          spatialDoc,
                                                          spatialModel.overallConfidence());
    webServer.broadcastTelemetry(payload);
    lastTelemetry = now;
  }

  delay(10);
}
