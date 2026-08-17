#include "diagnostics/diagnostics.h"

#include <ArduinoJson.h>

void DiagnosticsManager::begin(const DeviceInfo &deviceInfo, const NodeManager *nodes) {
  info_ = deviceInfo;
  nodes_ = nodes;
}

void DiagnosticsManager::exportJson(JsonDocument &doc) const {
  doc["chip_model"] = info_.chip_model;
  doc["cpu_freq"] = info_.cpu_freq;
  doc["num_cores"] = info_.num_cores;
  doc["flash_size"] = info_.flash_size;
  doc["psram_size"] = info_.psram_size;
  doc["mac"] = info_.mac;
  doc["fw_version"] = info_.fw_version;
  doc["uptime_ms"] = millis();
  doc["free_heap"] = ESP.getFreeHeap();
  doc["wifi_status"] = info_.wifi_status;
  doc["ip_addr"] = info_.ip_addr;
  doc["csi_available"] = info_.csi_available;
  doc["self_test"] = selfTest();
  JsonArray nodes = doc["nodes"].to<JsonArray>();
  if (nodes_) {
    for (const auto &node : nodes_->allNodes()) {
      JsonObject obj = nodes.add<JsonObject>();
      obj["id"] = node.config.id;
      obj["enabled"] = node.config.enabled;
      obj["calibrated"] = node.config.calibrated;
      obj["confidence"] = node.config.confidence;
    }
  }
  JsonArray logs = doc["logs"].to<JsonArray>();
  for (const auto &entry : Logger::instance().recent()) {
    JsonObject obj = logs.add<JsonObject>();
    obj["timestamp"] = entry.timestamp;
    obj["level"] = entry.level;
    obj["subsystem"] = entry.subsystem;
    obj["message"] = entry.message;
  }
}

bool DiagnosticsManager::selfTest() const { return !info_.chip_model.isEmpty(); }

void DiagnosticsManager::logsResponse(AsyncWebServerRequest *request) const {
  JsonDocument doc;
  JsonArray logs = doc["logs"].to<JsonArray>();
  for (const auto &entry : Logger::instance().recent()) {
    JsonObject obj = logs.add<JsonObject>();
    obj["timestamp"] = entry.timestamp;
    obj["level"] = entry.level;
    obj["subsystem"] = entry.subsystem;
    obj["message"] = entry.message;
  }
  String body;
  serializeJson(doc, body);
  request->send(200, "application/json", body);
}
