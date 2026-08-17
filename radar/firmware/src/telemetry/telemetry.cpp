#include "telemetry/telemetry.h"

void TelemetryManager::begin(uint32_t intervalMs) { intervalMs_ = intervalMs; }
uint32_t TelemetryManager::intervalMs() const { return intervalMs_; }
const std::deque<String> &TelemetryManager::buffer() const { return recent_; }

String TelemetryManager::buildSnapshot(const DeviceInfo &deviceInfo,
                                       const std::vector<NodeConfig> &nodes,
                                       const std::vector<Measurement> &measurements,
                                       const PresenceEstimate &presence,
                                       const JsonDocument &spatialSummary,
                                       float systemHealth) {
  JsonDocument doc;
  doc["timestamp"] = millis();
  JsonObject info = doc["device_info"].to<JsonObject>();
  info["chip_model"] = deviceInfo.chip_model;
  info["cpu_freq"] = deviceInfo.cpu_freq;
  info["num_cores"] = deviceInfo.num_cores;
  info["flash_size"] = deviceInfo.flash_size;
  info["psram_size"] = deviceInfo.psram_size;
  info["mac"] = deviceInfo.mac;
  info["fw_version"] = deviceInfo.fw_version;
  info["uptime_ms"] = deviceInfo.uptime_ms;
  info["free_heap"] = deviceInfo.free_heap;
  info["wifi_status"] = deviceInfo.wifi_status;
  info["ap_ssid"] = deviceInfo.ap_ssid;
  info["sta_ssid"] = deviceInfo.sta_ssid;
  info["ip_addr"] = deviceInfo.ip_addr;
  info["csi_available"] = deviceInfo.csi_available;
  info["psram_available"] = deviceInfo.psram_available;

  JsonArray nodeArray = doc["nodes"].to<JsonArray>();
  for (const auto &node : nodes) {
    JsonObject obj = nodeArray.add<JsonObject>();
    obj["id"] = node.id;
    obj["name"] = node.name;
    obj["bssid"] = node.bssid;
    obj["x"] = node.x;
    obj["y"] = node.y;
    obj["enabled"] = node.enabled;
    obj["calibrated"] = node.calibrated;
    obj["baseline_rssi"] = node.baseline_rssi;
    obj["confidence"] = node.confidence;
  }

  JsonArray measurementArray = doc["measurements"].to<JsonArray>();
  for (const auto &measurement : measurements) {
    JsonObject obj = measurementArray.add<JsonObject>();
    obj["bssid"] = measurement.bssid;
    obj["ssid"] = measurement.ssid;
    obj["rssi"] = measurement.rssi;
    obj["channel"] = measurement.channel;
    obj["timestamp"] = measurement.timestamp;
    obj["rssi_smoothed"] = measurement.rssi_smoothed;
    obj["rssi_variance"] = measurement.rssi_variance;
    obj["rssi_derivative"] = measurement.rssi_derivative;
    obj["stability"] = measurement.stability;
  }

  JsonObject presenceObj = doc["presence_estimate"].to<JsonObject>();
  presenceObj["state"] = static_cast<int>(presence.state);
  presenceObj["presence_probability"] = presence.presence_probability;
  presenceObj["movement_probability"] = presence.movement_probability;
  presenceObj["activity_score"] = presence.activity_score;
  presenceObj["confidence"] = presence.confidence;
  presenceObj["estimated_x"] = presence.estimated_x;
  presenceObj["estimated_y"] = presence.estimated_y;
  presenceObj["direction_deg"] = presence.direction_deg;
  presenceObj["num_active_nodes"] = presence.num_active_nodes;

  doc["spatial_model_summary"] = spatialSummary.as<JsonVariantConst>();
  doc["system_health"] = systemHealth;

  String serialized;
  serializeJson(doc, serialized);
  recent_.push_back(serialized);
  while (recent_.size() > maxBuffer_) recent_.pop_front();
  return serialized;
}
