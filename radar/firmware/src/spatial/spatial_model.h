#pragma once

#include <ArduinoJson.h>
#include <vector>
#include "common_types.h"

class SpatialModel {
 public:
  void begin(const SystemConfig &config);
  void update(const std::vector<Measurement> &measurements, const std::vector<NodeConfig> &nodes, float interpolationPower);
  const std::vector<SpatialCell> &cells() const;
  float overallConfidence() const;
  void getHeatmapData(JsonDocument &doc) const;

 private:
  std::vector<SpatialCell> grid_;
  uint16_t resolution_ = 20;
  float width_ = 10.0f;
  float height_ = 10.0f;
};
