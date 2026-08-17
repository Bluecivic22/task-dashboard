#pragma once

#include <Arduino.h>
#include <vector>

struct Measurement {
  String bssid;
  String ssid;
  int rssi = 0;
  int channel = 0;
  String channel_width;
  uint64_t timestamp = 0;
  float rssi_smoothed = 0.0f;
  float rssi_variance = 0.0f;
  float rssi_derivative = 0.0f;
  float stability = 0.0f;
  float noise_floor = -95.0f;
};

struct NodeConfig {
  String id;
  String name;
  String bssid;
  float x = 0.0f;
  float y = 0.0f;
  float z = 0.0f;
  int channel = 0;
  bool enabled = true;
  bool calibrated = false;
  float baseline_rssi = -60.0f;
  float confidence = 0.5f;
};

struct SpatialCell {
  float x = 0.0f;
  float y = 0.0f;
  float baseline = 0.0f;
  float current_deviation = 0.0f;
  float activity_score = 0.0f;
  float confidence = 0.0f;
  uint64_t last_update = 0;
  float movement_prob = 0.0f;
  float noise_level = 0.0f;
  float history_avg = 0.0f;
};

enum class DetectionState {
  IDLE,
  POSSIBLE_ACTIVITY,
  LIKELY_PRESENCE,
  MOVING,
  STATIONARY_PRESENCE,
  ENVIRONMENTAL_CHANGE,
  UNKNOWN,
};

struct PresenceEstimate {
  DetectionState state = DetectionState::UNKNOWN;
  float presence_probability = 0.0f;
  float movement_probability = 0.0f;
  float activity_score = 0.0f;
  float confidence = 0.0f;
  float estimated_x = 0.0f;
  float estimated_y = 0.0f;
  float direction_deg = 0.0f;
  size_t num_active_nodes = 0;
  uint64_t timestamp = 0;
};

struct SystemConfig {
  uint16_t version = 1;
  uint32_t sampling_rate_ms = 2000;
  uint32_t scan_interval_ms = 5000;
  float smoothing_alpha = 0.3f;
  float detection_threshold = 5.0f;
  float confidence_threshold = 0.6f;
  uint32_t baseline_duration_s = 30;
  uint16_t heatmap_resolution = 20;
  uint32_t history_retention_hours = 24;
  String wifi_ap_ssid = "RADAR-AP";
  String wifi_ap_password = "";
  String wifi_sta_ssid = "";
  String wifi_sta_password = "";
  String ota_password = "radar-ota";
  String auth_token = "";
  uint8_t log_level = 3;
  bool telemetry_enabled = true;
  bool csi_enabled = false;
  float grid_width_m = 10.0f;
  float grid_height_m = 10.0f;
  uint32_t telemetry_interval_ms = 1000;
  float interpolation_power = 2.0f;
  float environmental_drift_threshold = 8.0f;
  uint16_t measurement_history_size = 100;
  std::vector<NodeConfig> node_list;
};

struct DeviceInfo {
  String chip_model;
  uint32_t cpu_freq = 0;
  uint8_t num_cores = 0;
  uint32_t flash_size = 0;
  uint32_t psram_size = 0;
  String mac;
  String fw_version;
  uint64_t uptime_ms = 0;
  uint32_t free_heap = 0;
  String wifi_status;
  String ap_ssid;
  String sta_ssid;
  String ip_addr;
  bool csi_available = false;
  bool psram_available = false;
};
