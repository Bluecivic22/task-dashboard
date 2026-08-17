#include "spatial/interpolation.h"

#include <cmath>

float IDWInterpolator::interpolate(float x, float y, const std::vector<InterpolationPoint> &points, float power) {
  if (points.empty()) return 0.0f;
  float weighted = 0.0f;
  float sumWeights = 0.0f;
  for (const auto &point : points) {
    const float dx = x - point.x;
    const float dy = y - point.y;
    const float distance = std::sqrt(dx * dx + dy * dy);
    if (distance < 0.0001f) return point.value;
    const float weight = point.confidence / std::pow(distance, power);
    weighted += weight * point.value;
    sumWeights += weight;
  }
  return sumWeights > 0.0f ? weighted / sumWeights : 0.0f;
}

float IDWInterpolator::confidence(float x, float y, const std::vector<InterpolationPoint> &points) {
  if (points.empty()) return 0.0f;
  float nearest = 9999.0f;
  for (const auto &point : points) {
    const float dx = x - point.x;
    const float dy = y - point.y;
    nearest = std::min(nearest, std::sqrt(dx * dx + dy * dy));
  }
  return 1.0f / (1.0f + nearest);
}
