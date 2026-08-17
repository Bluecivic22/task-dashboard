#include "utils/hw_info.h"

#include <WiFi.h>
#ifdef ESP_ARDUINO_VERSION
#include <esp_chip_info.h>
#include <esp_flash.h>
#include <esp_mac.h>
#include <esp_psram.h>
#endif
#include "version.h"

DeviceInfo HardwareInfo::detect(bool csiAvailable) {
  DeviceInfo info;
#ifdef ESP_ARDUINO_VERSION
  esp_chip_info_t chipInfo;
  esp_chip_info(&chipInfo);
  info.chip_model = "ESP32-S3";
  info.num_cores = chipInfo.cores;
  info.cpu_freq = getCpuFrequencyMhz();
  info.flash_size = ESP.getFlashChipSize();
  info.psram_available = psramFound();
  info.psram_size = info.psram_available ? ESP.getPsramSize() : 0;
#else
  info.chip_model = "SIMULATED";
#endif
  uint8_t mac[6] = {0};
  WiFi.macAddress(mac);
  char macStr[18];
  snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  info.mac = macStr;
  info.fw_version = FIRMWARE_VERSION_STR;
  info.uptime_ms = millis();
  info.free_heap = ESP.getFreeHeap();
  info.wifi_status = WiFi.isConnected() ? "STA_CONNECTED" : (WiFi.getMode() == WIFI_MODE_AP ? "AP" : "DISCONNECTED");
  info.ap_ssid = WiFi.softAPSSID();
  info.sta_ssid = WiFi.SSID();
  info.ip_addr = WiFi.isConnected() ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
  info.csi_available = csiAvailable;
  return info;
}
