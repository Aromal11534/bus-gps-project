#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <TinyGPS++.h>
#include <ArduinoJson.h>
#include <time.h>

const char* WIFI_SSID = "Serpent-2.4";
const char* WIFI_PASSWORD = "passwordallaketto123";
const char* SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const char* SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const char* BUS_ID = "BUS-UUID-HERE";

const uint32_t GPS_BAUD_RATE = 9600;
const uint32_t SERIAL_BAUD_RATE = 115200;
const uint32_t SEND_INTERVAL_MS = 5000;
const uint8_t MAX_HTTP_RETRIES = 3;
const uint32_t WIFI_RECONNECT_INTERVAL_MS = 10000;

const int GPS_RX_PIN = 16;
const int GPS_TX_PIN = 17;

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

uint32_t lastSendMs = 0;
uint32_t lastWifiReconnectAttemptMs = 0;
bool timeSynced = false;

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  uint8_t attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    attempts++;
  }
}

void ensureWifiConnected() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }
  uint32_t now = millis();
  if (now - lastWifiReconnectAttemptMs < WIFI_RECONNECT_INTERVAL_MS) {
    return;
  }
  lastWifiReconnectAttemptMs = now;
  connectWifi();
}

void syncClockIfNeeded() {
  if (timeSynced || WiFi.status() != WL_CONNECTED) {
    return;
  }
  configTime(0, 0, "pool.ntp.org", "time.nist.gov", "time.google.com");
  struct tm timeInfo;
  for (uint8_t i = 0; i < 20; i++) {
    if (getLocalTime(&timeInfo, 500)) {
      timeSynced = true;
      return;
    }
    delay(200);
  }
}

String getIsoTimestamp() {
  struct tm timeInfo;
  if (!getLocalTime(&timeInfo, 100)) {
    return "";
  }
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeInfo);
  return String(buffer);
}

bool sendLocation(float latitude, float longitude, float speedKmph, float headingDeg) {
  ensureWifiConnected();
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  HTTPClient http;
  WiFiClientSecure client;
  client.setInsecure();
  http.setConnectTimeout(5000);
  http.setTimeout(5000);
  String endpoint = String(SUPABASE_URL) + "/rest/v1/bus_locations";
  http.begin(client, endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
  http.addHeader("Prefer", "return=minimal");

  StaticJsonDocument<256> doc;
  doc["bus_id"] = BUS_ID;
  doc["latitude"] = latitude;
  doc["longitude"] = longitude;
  doc["speed"] = speedKmph;
  doc["heading"] = headingDeg;
  String timestamp = getIsoTimestamp();
  if (timestamp.length() > 0) {
    doc["timestamp"] = timestamp;
  }

  String body;
  serializeJson(doc, body);

  for (uint8_t attempt = 0; attempt < MAX_HTTP_RETRIES; attempt++) {
    int responseCode = http.POST(body);
    if (responseCode >= 200 && responseCode < 300) {
      http.end();
      return true;
    }
    delay(400);
  }

  http.end();
  return false;
}

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  gpsSerial.begin(GPS_BAUD_RATE, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  connectWifi();
  syncClockIfNeeded();
}

void loop() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  ensureWifiConnected();
  syncClockIfNeeded();

  if (!gps.location.isValid()) {
    delay(200);
    return;
  }

  uint32_t now = millis();
  if (now - lastSendMs < SEND_INTERVAL_MS) {
    delay(100);
    return;
  }

  float latitude = gps.location.lat();
  float longitude = gps.location.lng();
  float speedKmph = gps.speed.isValid() ? gps.speed.kmph() : 0.0f;
  float headingDeg = gps.course.isValid() ? gps.course.deg() : 0.0f;
  sendLocation(latitude, longitude, speedKmph, headingDeg);
  lastSendMs = now;
}
