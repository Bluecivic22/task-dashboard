#pragma once

#include <ESPAsyncWebServer.h>
#include "config/config.h"
#include "diagnostics/diagnostics.h"
#include "nodes/node_manager.h"
#include "spatial/spatial_model.h"
#include "storage/storage.h"
#include "detection/presence_detector.h"
#include "sensing/radio_engine.h"

class ApiHandler {
 public:
  void begin(AsyncWebServer &server,
             ConfigManager &config,
             NodeManager &nodes,
             RadioEngine &radio,
             SpatialModel &spatial,
             PresenceDetector &detector,
             StorageManager &storage,
             DiagnosticsManager &diagnostics);
};
