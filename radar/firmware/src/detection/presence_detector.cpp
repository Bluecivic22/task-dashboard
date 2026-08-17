#include "detection/presence_detector.h"

#include <algorithm>
#include <cmath>
#include <numeric>

void PresenceDetector::begin(const SystemConfig &config) {
  threshold_ = config.detection_threshold;
  machine_.configure(config.detection_threshold, config.confidence_threshold);
}

float PresenceDetector::computeAgreement(const std::vector<float> &deviations) const {
  if (deviations.empty()) return 0.0f;
  float avg = 0.0f;
  for (float value : deviations) avg += value;
  avg /= deviations.size();
  float variance = 0.0f;
  for (float value : deviations) variance += (value - avg) * (value - avg);
  variance /= deviations.size();
  return 1.0f / (1.0f + variance);
}

PresenceEstimate PresenceDetector::update(const std::vector<Measurement> &measurements, const std::vector<NodeConfig> &nodes, bool environmentalChange) {
  std::vector<float> deviations;
  float weightedX = 0.0f;
  float weightedY = 0.0f;
  float weightTotal = 0.0f;
  float movement = 0.0f;
  float stability = 0.0f;
  size_t active = 0;

  for (const auto &node : nodes) {
    for (const auto &measurement : measurements) {
      if (!node.enabled || node.bssid.isEmpty() || !node.bssid.equalsIgnoreCase(measurement.bssid)) continue;
      const float deviation = fabsf(measurement.rssi_smoothed - node.baseline_rssi);
      deviations.push_back(deviation);
      movement += fabsf(measurement.rssi_derivative) / 10.0f;
      stability += measurement.stability;
      const float weight = std::max(0.1f, deviation);
      weightedX += node.x * weight;
      weightedY += node.y * weight;
      weightTotal += weight;
      ++active;
    }
  }

  const float avgDeviation = deviations.empty() ? 0.0f : std::accumulate(deviations.begin(), deviations.end(), 0.0f) / deviations.size();
  const float agreement = computeAgreement(deviations);
  const float nodeFactor = nodes.empty() ? 0.0f : static_cast<float>(active) / nodes.size();
  const float stabilityFactor = active == 0 ? 0.0f : stability / active;
  const float confidence = std::min(1.0f, (nodeFactor * 0.35f) + (agreement * 0.35f) + (stabilityFactor * 0.3f));
  const float activity = avgDeviation;
  const float movementProb = std::min(1.0f, movement / std::max<size_t>(1, active));

  latest_.state = machine_.update(activity, movementProb, confidence, active, environmentalChange);
  latest_.presence_probability = std::min(1.0f, activity / std::max(0.1f, threshold_ * 1.5f));
  latest_.movement_probability = movementProb;
  latest_.activity_score = activity;
  latest_.confidence = confidence;
  latest_.estimated_x = weightTotal > 0.0f ? weightedX / weightTotal : 0.0f;
  latest_.estimated_y = weightTotal > 0.0f ? weightedY / weightTotal : 0.0f;
  latest_.direction_deg = movementProb * 180.0f;
  latest_.num_active_nodes = active;
  latest_.timestamp = millis();
  return latest_;
}

PresenceEstimate PresenceDetector::latest() const { return latest_; }
String PresenceDetector::lastReason() const { return machine_.reason(); }
