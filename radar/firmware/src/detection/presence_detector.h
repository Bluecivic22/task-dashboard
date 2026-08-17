#pragma once

#include <vector>
#include "common_types.h"
#include "detection/state_machine.h"

class PresenceDetector {
 public:
  void begin(const SystemConfig &config);
  PresenceEstimate update(const std::vector<Measurement> &measurements, const std::vector<NodeConfig> &nodes, bool environmentalChange = false);
  PresenceEstimate latest() const;
  String lastReason() const;

 private:
  float computeAgreement(const std::vector<float> &deviations) const;
  PresenceEstimate latest_;
  DetectionStateMachine machine_;
  float threshold_ = 5.0f;
};
