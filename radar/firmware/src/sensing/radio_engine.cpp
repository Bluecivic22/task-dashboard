#include "sensing/radio_engine.h"

#include <numeric>
#include "utils/logger.h"

bool RadioEngine::begin(const SystemConfig &config) {
  config_ = config;
  WiFi.mode(config.wifi_sta_ssid.isEmpty() ? WIFI_MODE_APSTA : WIFI_MODE_STA);
  return true;
}

float RadioEngine::variance(const MeasurementBuffer &buffer) const {
  auto values = buffer.values();
  if (values.size() < 2) return 0.0f;
  float avg = 0.0f;
  for (const auto &measurement : values) avg += measurement.rssi;
  avg /= values.size();
  float acc = 0.0f;
  for (const auto &measurement : values) acc += (measurement.rssi - avg) * (measurement.rssi - avg);
  return acc / values.size();
}

Measurement RadioEngine::makeMeasurement(int index, SignalState &state) const {
  Measurement measurement;
  measurement.bssid = WiFi.BSSIDstr(index);
  measurement.ssid = WiFi.SSID(index);
  measurement.rssi = WiFi.RSSI(index);
  measurement.channel = WiFi.channel(index);
  measurement.channel_width = "20MHz";
  measurement.timestamp = millis();
  measurement.rssi_smoothed = state.smoothing.add(static_cast<float>(measurement.rssi));
  measurement.rssi_variance = variance(state.history);
  measurement.rssi_derivative = state.history.empty() ? 0.0f : measurement.rssi_smoothed - state.history.latest().rssi_smoothed;
  measurement.stability = 1.0f / (1.0f + measurement.rssi_variance);
  measurement.noise_floor = state.baseline.baseline() - 10.0f;
  return measurement;
}

std::vector<Measurement> RadioEngine::scan() {
  latest_.clear();
  int found = WiFi.scanNetworks(false, true);
  for (int index = 0; index < found; ++index) {
    auto &state = states_[WiFi.BSSIDstr(index)];
    Measurement measurement = makeMeasurement(index, state);
    state.baseline.add(measurement.rssi_smoothed);
    state.history.push(measurement);
    latest_.push_back(measurement);
  }
  WiFi.scanDelete();
  lastScanAt_ = millis();
  LOG_DEBUG("radio", "scan complete: " + String(latest_.size()) + " networks");
  return latest_;
}

const std::vector<Measurement> &RadioEngine::latestMeasurements() const { return latest_; }
uint64_t RadioEngine::lastScanAt() const { return lastScanAt_; }
