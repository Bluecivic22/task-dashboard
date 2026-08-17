#pragma once

#include <map>
#include <vector>
#include <WiFi.h>
#include "common_types.h"
#include "config/config.h"
#include "sensing/filters.h"
#include "sensing/measurement.h"

class RadioEngine {
 public:
  bool begin(const SystemConfig &config);
  std::vector<Measurement> scan();
  const std::vector<Measurement> &latestMeasurements() const;
  uint64_t lastScanAt() const;

 private:
  struct SignalState {
    MeasurementBuffer history{100};
    ExponentialSmoothingFilter smoothing{0.3f};
    BaselineTracker baseline{0.02f, 8.0f};
  };

  Measurement makeMeasurement(int index, SignalState &state) const;
  float variance(const MeasurementBuffer &buffer) const;

  SystemConfig config_;
  std::map<String, SignalState> states_;
  std::vector<Measurement> latest_;
  uint64_t lastScanAt_ = 0;
};
