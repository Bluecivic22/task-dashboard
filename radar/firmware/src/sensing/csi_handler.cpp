#include "sensing/csi_handler.h"

#include <cmath>
#include <numeric>

bool CSIHandler::begin(bool requested) {
#ifdef CONFIG_ESP_WIFI_CSI_ENABLED
  available_ = requested;
#else
  available_ = false;
#endif
  return available_;
}

bool CSIHandler::isAvailable() const { return available_; }
CsiFeatures CSIHandler::latest() const { return latest_; }

void CSIHandler::injectSample(const std::vector<float> &amplitudes) {
  if (amplitudes.empty()) return;
  const float mean = std::accumulate(amplitudes.begin(), amplitudes.end(), 0.0f) / amplitudes.size();
  float variance = 0.0f;
  for (float value : amplitudes) variance += (value - mean) * (value - mean);
  variance /= amplitudes.size();
  float correlation = 0.0f;
  for (size_t i = 1; i < amplitudes.size(); ++i) correlation += amplitudes[i] * amplitudes[i - 1];
  correlation /= amplitudes.size();
  latest_.mean_amplitude = mean;
  latest_.variance = variance;
  latest_.subcarrier_correlation = correlation;
  latest_.temporal_gradient = mean - previousMean_;
  previousMean_ = mean;
}
