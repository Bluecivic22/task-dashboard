#include "web/websocket_handler.h"

WebSocketHandler::WebSocketHandler() : ws_("/ws") {}

void WebSocketHandler::begin(AsyncWebServer &server) {
  ws_.onEvent([](AsyncWebSocket *, AsyncWebSocketClient *client, AwsEventType type, void *, uint8_t *data, size_t len) {
    if (type == WS_EVT_CONNECT) {
      client->text("{\"type\":\"SYSTEM\",\"payload\":{\"message\":\"connected\"}}");
    }
    if (type == WS_EVT_DATA && data && len > 0) {
      client->text("{\"type\":\"SYSTEM\",\"payload\":{\"ack\":true}}");
    }
  });
  server.addHandler(&ws_);
}

void WebSocketHandler::broadcast(const String &payload) { ws_.textAll(payload); }

void WebSocketHandler::broadcastType(const String &type, JsonVariantConst payload) {
  JsonDocument doc;
  doc["type"] = type;
  doc["payload"] = payload;
  String serialized;
  serializeJson(doc, serialized);
  broadcast(serialized);
}

AsyncWebSocket &WebSocketHandler::socket() { return ws_; }
