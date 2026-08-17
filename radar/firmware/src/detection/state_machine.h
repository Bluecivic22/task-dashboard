#pragma once

#include "common_types.h"

class DetectionStateMachine {
 public:
  void configure(float detectionThreshold, float confidenceThreshold);
  DetectionState update(float activity, float movement, float confidence, size_t activeNodes, bool environmentalChange);
  DetectionState state() const;
  String reason() const;

 private:
  void setState(DetectionState next, const String &reason);
  DetectionState current_ = DetectionState::IDLE;
  String reason_ = "boot";
  float detectionThreshold_ = 5.0f;
  float confidenceThreshold_ = 0.6f;
};
