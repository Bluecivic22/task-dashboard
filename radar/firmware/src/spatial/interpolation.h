#pragma once

#include <vector>

struct InterpolationPoint {
  float x = 0.0f;
  float y = 0.0f;
  float value = 0.0f;
  float confidence = 1.0f;
};

class IDWInterpolator {
 public:
  static float interpolate(float x, float y, const std::vector<InterpolationPoint> &points, float power = 2.0f);
  static float confidence(float x, float y, const std::vector<InterpolationPoint> &points);
};
