#include "web/ota_handler.h"

#include <ElegantOTA.h>

void OTAHandler::begin(AsyncWebServer &server, const String &password) {
  ElegantOTA.begin(&server, "", password.c_str());
}
