#include "config/config.h"

namespace {
constexpr const char *kNamespace = "radar";
constexpr const char *kConfigKey = "config";
}

bool ConfigManager::begin() {
  resetToDefaults();
  preferencesReady = preferences.begin(kNamespace, false);
  return load();
}

const SystemConfig &ConfigManager::get() const { return config; }
SystemConfig &ConfigManager::mutableConfig() { return config; }

void ConfigManager::resetToDefaults() { config = SystemConfig{}; }

bool ConfigManager::validate(const SystemConfig &cfg, String *error) const {
  auto fail = [&](const String &msg) {
    if (error) *error = msg;
    return false;
  };
  if (cfg.sampling_rate_ms < 100 || cfg.sampling_rate_ms > 60000) return fail("sampling_rate_ms out of range");
  if (cfg.scan_interval_ms < 500 || cfg.scan_interval_ms > 120000) return fail("scan_interval_ms out of range");
  if (cfg.smoothing_alpha < 0.0f || cfg.smoothing_alpha > 1.0f) return fail("smoothing_alpha out of range");
  if (cfg.detection_threshold < 0.1f || cfg.detection_threshold > 50.0f) return fail("detection_threshold out of range");
  if (cfg.confidence_threshold < 0.0f || cfg.confidence_threshold > 1.0f) return fail("confidence_threshold out of range");
  if (cfg.heatmap_resolution < 4 || cfg.heatmap_resolution > 200) return fail("heatmap_resolution out of range");
  if (cfg.grid_width_m <= 0.5f || cfg.grid_height_m <= 0.5f) return fail("grid dimensions invalid");
  return true;
}

NodeConfig ConfigManager::nodeFromJson(JsonObjectConst obj) const {
  NodeConfig node;
  node.id = obj["id"] | "";
  node.name = obj["name"] | node.id;
  node.bssid = obj["bssid"] | "";
  node.x = obj["x"] | 0.0f;
  node.y = obj["y"] | 0.0f;
  node.z = obj["z"] | 0.0f;
  node.channel = obj["channel"] | 0;
  node.enabled = obj["enabled"] | true;
  node.calibrated = obj["calibrated"] | false;
  node.baseline_rssi = obj["baseline_rssi"] | -60.0f;
  node.confidence = obj["confidence"] | 0.5f;
  return node;
}

void ConfigManager::nodeToJson(const NodeConfig &node, JsonArray array) const {
  JsonObject obj = array.add<JsonObject>();
  obj["id"] = node.id;
  obj["name"] = node.name;
  obj["bssid"] = node.bssid;
  obj["x"] = node.x;
  obj["y"] = node.y;
  obj["z"] = node.z;
  obj["channel"] = node.channel;
  obj["enabled"] = node.enabled;
  obj["calibrated"] = node.calibrated;
  obj["baseline_rssi"] = node.baseline_rssi;
  obj["confidence"] = node.confidence;
}

void ConfigManager::toJson(JsonDocument &doc) const {
  doc["version"] = config.version;
  doc["sampling_rate_ms"] = config.sampling_rate_ms;
  doc["scan_interval_ms"] = config.scan_interval_ms;
  doc["smoothing_alpha"] = config.smoothing_alpha;
  doc["detection_threshold"] = config.detection_threshold;
  doc["confidence_threshold"] = config.confidence_threshold;
  doc["baseline_duration_s"] = config.baseline_duration_s;
  doc["heatmap_resolution"] = config.heatmap_resolution;
  doc["history_retention_hours"] = config.history_retention_hours;
  doc["wifi_ap_ssid"] = config.wifi_ap_ssid;
  doc["wifi_ap_password"] = config.wifi_ap_password;
  doc["wifi_sta_ssid"] = config.wifi_sta_ssid;
  doc["wifi_sta_password"] = config.wifi_sta_password;
  doc["ota_password"] = config.ota_password;
  doc["auth_token"] = config.auth_token;
  doc["log_level"] = config.log_level;
  doc["telemetry_enabled"] = config.telemetry_enabled;
  doc["csi_enabled"] = config.csi_enabled;
  doc["grid_width_m"] = config.grid_width_m;
  doc["grid_height_m"] = config.grid_height_m;
  doc["telemetry_interval_ms"] = config.telemetry_interval_ms;
  doc["interpolation_power"] = config.interpolation_power;
  JsonArray nodes = doc["node_list"].to<JsonArray>();
  for (const auto &node : config.node_list) nodeToJson(node, nodes);
}

bool ConfigManager::save() {
  if (!preferencesReady) {
    return true;
  }
  JsonDocument doc;
  toJson(doc);
  String serialized;
  serializeJson(doc, serialized);
  return preferences.putString(kConfigKey, serialized) > 0;
}

bool ConfigManager::load() {
  if (!preferencesReady) {
    return true;
  }
  String raw = preferences.getString(kConfigKey, "");
  if (raw.isEmpty()) {
    return save();
  }
  JsonDocument doc;
  if (deserializeJson(doc, raw) != DeserializationError::Ok) {
    resetToDefaults();
    save();
    return false;
  }
  return updateFromJson(doc.as<JsonVariantConst>());
}

bool ConfigManager::updateFromJson(JsonVariantConst input, String *error) {
  SystemConfig next = config;
  next.version = input["version"] | next.version;
  next.sampling_rate_ms = input["sampling_rate_ms"] | next.sampling_rate_ms;
  next.scan_interval_ms = input["scan_interval_ms"] | next.scan_interval_ms;
  next.smoothing_alpha = input["smoothing_alpha"] | next.smoothing_alpha;
  next.detection_threshold = input["detection_threshold"] | next.detection_threshold;
  next.confidence_threshold = input["confidence_threshold"] | next.confidence_threshold;
  next.baseline_duration_s = input["baseline_duration_s"] | next.baseline_duration_s;
  next.heatmap_resolution = input["heatmap_resolution"] | next.heatmap_resolution;
  next.history_retention_hours = input["history_retention_hours"] | next.history_retention_hours;
  next.wifi_ap_ssid = String((const char *)(input["wifi_ap_ssid"] | next.wifi_ap_ssid.c_str()));
  next.wifi_ap_password = String((const char *)(input["wifi_ap_password"] | next.wifi_ap_password.c_str()));
  next.wifi_sta_ssid = String((const char *)(input["wifi_sta_ssid"] | next.wifi_sta_ssid.c_str()));
  next.wifi_sta_password = String((const char *)(input["wifi_sta_password"] | next.wifi_sta_password.c_str()));
  next.ota_password = String((const char *)(input["ota_password"] | next.ota_password.c_str()));
  next.auth_token = String((const char *)(input["auth_token"] | next.auth_token.c_str()));
  next.log_level = input["log_level"] | next.log_level;
  next.telemetry_enabled = input["telemetry_enabled"] | next.telemetry_enabled;
  next.csi_enabled = input["csi_enabled"] | next.csi_enabled;
  next.grid_width_m = input["grid_width_m"] | next.grid_width_m;
  next.grid_height_m = input["grid_height_m"] | next.grid_height_m;
  next.telemetry_interval_ms = input["telemetry_interval_ms"] | next.telemetry_interval_ms;
  next.interpolation_power = input["interpolation_power"] | next.interpolation_power;
  if (input["node_list"].is<JsonArrayConst>()) {
    next.node_list.clear();
    for (JsonObjectConst node : input["node_list"].as<JsonArrayConst>()) {
      next.node_list.push_back(nodeFromJson(node));
    }
  }
  if (!validate(next, error)) return false;
  config = next;
  return save();
}
