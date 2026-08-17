#include "detection/state_machine.h"

void DetectionStateMachine::configure(float detectionThreshold, float confidenceThreshold) {
  detectionThreshold_ = detectionThreshold;
  confidenceThreshold_ = confidenceThreshold;
}

void DetectionStateMachine::setState(DetectionState next, const String &reason) {
  current_ = next;
  reason_ = reason;
}

DetectionState DetectionStateMachine::update(float activity, float movement, float confidence, size_t activeNodes, bool environmentalChange) {
  if (environmentalChange) {
    setState(DetectionState::ENVIRONMENTAL_CHANGE, "baseline drift exceeded threshold");
  } else if (activeNodes == 0 || activity < detectionThreshold_ * 0.2f) {
    setState(DetectionState::IDLE, "low activity");
  } else if (activity >= detectionThreshold_ && activeNodes >= 2 && confidence >= confidenceThreshold_) {
    if (movement > 0.7f) {
      setState(DetectionState::MOVING, "high movement probability");
    } else {
      setState(DetectionState::LIKELY_PRESENCE, "multi-node correlated deviation");
    }
  } else if (activity >= detectionThreshold_ * 0.75f && confidence >= confidenceThreshold_ * 0.8f) {
    setState(DetectionState::POSSIBLE_ACTIVITY, "moderate deviation");
  } else if (current_ == DetectionState::MOVING && movement < 0.35f && confidence >= confidenceThreshold_) {
    setState(DetectionState::STATIONARY_PRESENCE, "movement settled");
  }
  return current_;
}

DetectionState DetectionStateMachine::state() const { return current_; }
String DetectionStateMachine::reason() const { return reason_; }
