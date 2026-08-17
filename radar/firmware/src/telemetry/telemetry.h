#pragma once

#include <ArduinoJson.h>
#include <deque>
#include <vector>
#include "common_types.h"

class TelemetryManager {
 public:
  void begin(uint32_t intervalMs);
  String buildSnapshot(const DeviceInfo &deviceInfo,
                       const std::vector<NodeConfig> &nodes,
                       const std::vector<Measurement> &measurements,
                       const PresenceEstimate &presence,
                       const JsonDocument &spatialSummary,
                       float systemHealth);
  const std::deque<String> &buffer() const;
  uint32_t intervalMs() const;

 private:
  uint32_t intervalMs_ = 1000;
  std::deque<String> recent_;
  size_t maxBuffer_ = 20;
};
