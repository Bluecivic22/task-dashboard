#include "spatial/spatial_model.h"

#include <cmath>

#include "spatial/interpolation.h"

void SpatialModel::begin(const SystemConfig &config) {
  resolution_ = config.heatmap_resolution;
  width_ = config.grid_width_m;
  height_ = config.grid_height_m;
  grid_.clear();
  for (uint16_t row = 0; row < resolution_; ++row) {
    for (uint16_t col = 0; col < resolution_; ++col) {
      SpatialCell cell;
      cell.x = (width_ * col) / (resolution_ - 1);
      cell.y = (height_ * row) / (resolution_ - 1);
      grid_.push_back(cell);
    }
  }
}

void SpatialModel::update(const std::vector<Measurement> &measurements, const std::vector<NodeConfig> &nodes, float interpolationPower) {
  std::vector<InterpolationPoint> points;
  for (const auto &node : nodes) {
    for (const auto &measurement : measurements) {
      if (!node.bssid.isEmpty() && node.bssid.equalsIgnoreCase(measurement.bssid)) {
        points.push_back({node.x, node.y, fabsf(measurement.rssi_smoothed - node.baseline_rssi), node.confidence});
      }
    }
  }
  for (auto &cell : grid_) {
    cell.current_deviation = IDWInterpolator::interpolate(cell.x, cell.y, points, interpolationPower);
    cell.activity_score = cell.current_deviation / 10.0f;
    cell.confidence = IDWInterpolator::confidence(cell.x, cell.y, points);
    cell.history_avg = (cell.history_avg * 0.8f) + (cell.activity_score * 0.2f);
    cell.movement_prob = std::min(1.0f, cell.activity_score * cell.confidence);
    cell.noise_level = std::max(0.0f, cell.current_deviation * (1.0f - cell.confidence));
    cell.last_update = millis();
  }
}

const std::vector<SpatialCell> &SpatialModel::cells() const { return grid_; }

float SpatialModel::overallConfidence() const {
  if (grid_.empty()) return 0.0f;
  float total = 0.0f;
  for (const auto &cell : grid_) total += cell.confidence;
  return total / grid_.size();
}

void SpatialModel::getHeatmapData(JsonDocument &doc) const {
  JsonArray cells = doc["cells"].to<JsonArray>();
  for (const auto &cell : grid_) {
    JsonObject entry = cells.add<JsonObject>();
    entry["x"] = cell.x;
    entry["y"] = cell.y;
    entry["baseline"] = cell.baseline;
    entry["current_deviation"] = cell.current_deviation;
    entry["activity_score"] = cell.activity_score;
    entry["confidence"] = cell.confidence;
    entry["last_update"] = cell.last_update;
    entry["movement_prob"] = cell.movement_prob;
    entry["noise_level"] = cell.noise_level;
    entry["history_avg"] = cell.history_avg;
  }
  doc["overall_confidence"] = overallConfidence();
}
