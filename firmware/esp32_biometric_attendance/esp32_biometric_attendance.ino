/**
 * =============================================================================
 *   OMOVE WORKFORCE MANAGEMENT - ESP32 BIOMETRIC ATTENDANCE FIRMWARE
 * =============================================================================
 *   Lead Developer: Ashik Das
 *   Institution: Coochbehar Polytechnic Biometric Attendance System
 *   Target MCU: ESP32 DevKit V1 (ESP32-WROOM-32)
 *
 *   Key Features:
 *   - R307 / R307S Optical Fingerprint Sensor (HardwareSerial 2: GPIO 16/17)
 *   - DS3231 High-Precision RTC module + NTP Automatic Time Synchronization
 *   - 0.96" I2C OLED (SSD1306) visual punch terminal interface
 *   - Direct Cloud Firestore REST API integration (No bulky SDK required)
 *   - Auto-detection of WORK IN vs WORK OUT with 30s duplicate punch protection
 *   - Authoritative Complete 1-Hour Block Overtime Calculation (₹80/hr default)
 *   - Interactive Serial / Button Fingerprint Enrollment mode
 * =============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_Fingerprint.h>
#include <RTClib.h>
#include <ArduinoJson.h>
#include <time.h>
#include "config.h"

// -----------------------------------------------------------------------------
//  Hardware Objects & Global Variables
// -----------------------------------------------------------------------------
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
HardwareSerial mySerial(2); // UART2 for R307 (RX=16, TX=17)
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);
RTC_DS3231 rtc;

// Employee In-Memory Cache
struct EmployeeRecord {
  int fingerprintId;
  char employeeId[24];
  char name[48];
  char department[32];
  char shiftId[24];
  float overtimeRate;
  bool active;
  unsigned long lastScanMillis;
};

EmployeeRecord employeesCache[MAX_EMPLOYEES_CACHE];
int employeeCount = 0;

// Firebase Auth Token State
String idToken = "";
unsigned long tokenExpiresAt = 0;

// System Timers
unsigned long lastEmployeeSyncMillis = 0;
const unsigned long EMPLOYEE_SYNC_INTERVAL = 15 * 60 * 1000; // 15 mins
unsigned long lastDisplayRefreshMillis = 0;
const unsigned long DISPLAY_REFRESH_INTERVAL = 1000;          // 1 sec

// Mode State
bool isEnrollmentMode = false;

// -----------------------------------------------------------------------------
//  Audio & Visual Indicator Helpers
// -----------------------------------------------------------------------------
void beepTone(int durationMs, int repetitions = 1, int pauseMs = 80) {
  for (int i = 0; i < repetitions; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(durationMs);
    digitalWrite(BUZZER_PIN, LOW);
    if (i < repetitions - 1) delay(pauseMs);
  }
}

void beepClick() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(25);
  digitalWrite(BUZZER_PIN, LOW);
}

void updateWiFiLeds() {
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(LED_WIFI_GREEN, HIGH);
    digitalWrite(LED_WIFI_RED, LOW);
  } else {
    digitalWrite(LED_WIFI_GREEN, LOW);
    digitalWrite(LED_WIFI_RED, HIGH);
  }
}

void signalSuccess(bool isWorkOut = false) {
  digitalWrite(LED_MATCH, HIGH);
  digitalWrite(LED_UNMATCH, LOW);
  if (isWorkOut) {
    beepTone(90, 2, 60); // Double beep for check-out
  } else {
    beepTone(140, 1);    // Single crisp beep for check-in
  }
  delay(350);
  digitalWrite(LED_MATCH, LOW);
}

void signalError() {
  digitalWrite(LED_UNMATCH, HIGH);
  digitalWrite(LED_MATCH, LOW);
  beepTone(70, 3, 50); // 3 short warning beeps
  delay(350);
  digitalWrite(LED_UNMATCH, LOW);
}

void signalWarning() {
  digitalWrite(LED_UNMATCH, HIGH);
  beepTone(200, 1);
  digitalWrite(LED_UNMATCH, LOW);
}

// -----------------------------------------------------------------------------
//  OLED Display Screens
// -----------------------------------------------------------------------------
void showSplash() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(14, 10);
  display.println(F("OMOVE WORKFORCE"));
  display.drawFastHLine(0, 24, 128, SSD1306_WHITE);
  display.setCursor(8, 32);
  display.println(F("BIOMETRIC TERMINAL"));
  display.setCursor(16, 48);
  display.println(F("Initializing..."));
  display.display();
}

void showStatusMsg(const String &line1, const String &line2, const String &line3 = "", int delayMs = 0) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 8);
  display.println(line1);
  display.drawFastHLine(0, 20, 128, SSD1306_WHITE);
  display.setCursor(0, 26);
  display.println(line2);
  if (line3.length() > 0) {
    display.setCursor(0, 42);
    display.println(line3);
  }
  display.display();
  if (delayMs > 0) delay(delayMs);
}

void showIdleScreen() {
  DateTime now = rtc.now();

  char timeStr[16];
  char dateStr[16];
  int hour12 = now.hour() % 12;
  if (hour12 == 0) hour12 = 12;
  const char *ampm = (now.hour() >= 12) ? "PM" : "AM";
  snprintf(timeStr, sizeof(timeStr), "%02d:%02d:%02d %s", hour12, now.minute(), now.second(), ampm);
  snprintf(dateStr, sizeof(dateStr), "%02d/%02d/%04d", now.day(), now.month(), now.year());

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Status Bar
  display.setTextSize(1);
  display.setCursor(0, 0);
  if (WiFi.status() == WL_CONNECTED) {
    display.print(F("WiFi:OK"));
  } else {
    display.print(F("WiFi:OFF"));
  }
  display.setCursor(76, 0);
  display.print(F("FP:READY"));
  display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

  // Time & Date Display
  display.setCursor(8, 14);
  display.setTextSize(1);
  display.println(timeStr);

  display.setCursor(24, 26);
  display.setTextSize(1);
  display.println(dateStr);

  display.drawFastHLine(0, 38, 128, SSD1306_WHITE);

  // Action Prompt
  display.setCursor(4, 44);
  display.setTextSize(1);
  display.println(F("PLACE FINGER ON"));
  display.setCursor(14, 54);
  display.println(F("OPTICAL SENSOR"));

  display.display();
}

// -----------------------------------------------------------------------------
//  Time Formatting & NTP Helpers
// -----------------------------------------------------------------------------
String getFormattedDate(const DateTime &dt) {
  char buf[16];
  snprintf(buf, sizeof(buf), "%02d/%02d/%04d", dt.day(), dt.month(), dt.year());
  return String(buf);
}

String getFormattedTime(const DateTime &dt) {
  int hour12 = dt.hour() % 12;
  if (hour12 == 0) hour12 = 12;
  const char *ampm = (dt.hour() >= 12) ? "PM" : "AM";
  char buf[16];
  snprintf(buf, sizeof(buf), "%02d:%02d %s", hour12, dt.minute(), ampm);
  return String(buf);
}

uint64_t getEpochTimestampMs(const DateTime &dt) {
  uint32_t unixSec = dt.unixtime();
  if (unixSec >= TIMEZONE_OFFSET_SEC) {
    unixSec -= TIMEZONE_OFFSET_SEC;
  }
  return ((uint64_t)unixSec) * 1000ULL;
}

void syncNtpTime() {
  if (WiFi.status() != WL_CONNECTED) return;
  Serial.println(F("[NTP] Fetching network time..."));
  configTime(TIMEZONE_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER_1, NTP_SERVER_2);

  struct tm timeinfo;
  if (getLocalTime(&timeinfo, 5000)) {
    rtc.adjust(DateTime(
      timeinfo.tm_year + 1900,
      timeinfo.tm_mon + 1,
      timeinfo.tm_mday,
      timeinfo.tm_hour,
      timeinfo.tm_min,
      timeinfo.tm_sec
    ));
    Serial.println(F("[NTP] DS3231 RTC synchronized with NTP successfully."));
  } else {
    Serial.println(F("[NTP] Failed to obtain network time, keeping DS3231 clock."));
  }
}

// -----------------------------------------------------------------------------
//  Firebase Authentication & ID Token Management
// -----------------------------------------------------------------------------
bool refreshFirebaseAuthToken() {
  String email = FIREBASE_AUTH_EMAIL;
  String pass = FIREBASE_AUTH_PASSWORD;
  if (email.length() == 0 || pass.length() == 0) {
    // Unauthenticated REST mode
    return true;
  }

  if (idToken.length() > 0 && millis() < tokenExpiresAt) {
    return true; // Token still valid
  }

  WiFiClientSecure client;
  client.setInsecure(); // ESP32 handles HTTPS without bulky cert bundles
  HTTPClient http;

  String authUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";
  authUrl += FIREBASE_API_KEY;

  http.begin(client, authUrl);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["email"] = email;
  doc["password"] = pass;
  doc["returnSecureToken"] = true;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode == HTTP_CODE_OK) {
    String response = http.getString();
    StaticJsonDocument<1024> resDoc;
    deserializeJson(resDoc, response);
    idToken = resDoc["idToken"].as<String>();
    unsigned long expiresInSec = resDoc["expiresIn"] | 3600;
    tokenExpiresAt = millis() + (expiresInSec - 300) * 1000; // Refresh 5 mins early
    Serial.println(F("[AUTH] Firebase ID token refreshed successfully."));
    http.end();
    return true;
  } else {
    Serial.printf("[AUTH] Sign-in error. HTTP %d: %s\n", httpCode, http.getString().c_str());
    http.end();
    return false;
  }
}

// -----------------------------------------------------------------------------
//  Firestore REST API: Sync & Cache Employees
// -----------------------------------------------------------------------------
void syncEmployeesFromFirestore() {
  if (WiFi.status() != WL_CONNECTED) return;
  refreshFirebaseAuthToken();

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  String url = "https://firestore.googleapis.com/v1/projects/";
  url += FIREBASE_PROJECT_ID;
  url += "/databases/(default)/documents/employees?pageSize=100&key=";
  url += FIREBASE_API_KEY;

  http.begin(client, url);
  if (idToken.length() > 0) {
    http.addHeader("Authorization", "Bearer " + idToken);
  }

  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error && doc.containsKey("documents")) {
      JsonArray docs = doc["documents"].as<JsonArray>();
      employeeCount = 0;

      for (JsonObject d : docs) {
        if (employeeCount >= MAX_EMPLOYEES_CACHE) break;
        JsonObject fields = d["fields"];

        // In Firestore REST API, integerValue is serialized as a string (e.g. "1", "80")
        int fpId = -1;
        if (fields.containsKey("fingerprintId")) {
          JsonObject fpObj = fields["fingerprintId"];
          if (fpObj.containsKey("integerValue")) {
            fpId = fpObj["integerValue"].as<String>().toInt();
          } else if (fpObj.containsKey("stringValue")) {
            fpId = fpObj["stringValue"].as<String>().toInt();
          } else if (fpObj.containsKey("doubleValue")) {
            fpId = (int)fpObj["doubleValue"].as<float>();
          }
        }
        if (fpId <= 0) continue;

        bool active = true;
        if (fields.containsKey("active")) {
          JsonObject actObj = fields["active"];
          if (actObj.containsKey("booleanValue")) {
            active = actObj["booleanValue"].as<bool>();
          } else if (actObj.containsKey("stringValue")) {
            active = (actObj["stringValue"].as<String>() == "true");
          }
        }

        EmployeeRecord &emp = employeesCache[employeeCount];
        emp.fingerprintId = fpId;
        emp.active = active;
        emp.lastScanMillis = 0;

        String empId = "";
        if (fields.containsKey("employeeId") && fields["employeeId"].containsKey("stringValue")) {
          empId = fields["employeeId"]["stringValue"].as<String>();
        }
        if (empId.length() == 0) {
          String namePath = d["name"].as<String>();
          int lastSlash = namePath.lastIndexOf('/');
          empId = (lastSlash >= 0) ? namePath.substring(lastSlash + 1) : "EMP";
        }
        strncpy(emp.employeeId, empId.c_str(), sizeof(emp.employeeId) - 1);

        String name = "Employee";
        if (fields.containsKey("name") && fields["name"].containsKey("stringValue")) {
          name = fields["name"]["stringValue"].as<String>();
        }
        strncpy(emp.name, name.c_str(), sizeof(emp.name) - 1);

        String dept = "General";
        if (fields.containsKey("department") && fields["department"].containsKey("stringValue")) {
          dept = fields["department"]["stringValue"].as<String>();
        }
        strncpy(emp.department, dept.c_str(), sizeof(emp.department) - 1);

        String shift = "SHIFT-A";
        if (fields.containsKey("shiftId") && fields["shiftId"].containsKey("stringValue")) {
          shift = fields["shiftId"]["stringValue"].as<String>();
        }
        strncpy(emp.shiftId, shift.c_str(), sizeof(emp.shiftId) - 1);

        float otRate = DEFAULT_OVERTIME_RATE;
        if (fields.containsKey("overtimeRate")) {
          JsonObject otObj = fields["overtimeRate"];
          if (otObj.containsKey("integerValue")) {
            otRate = (float)otObj["integerValue"].as<String>().toInt();
          } else if (otObj.containsKey("doubleValue")) {
            otRate = otObj["doubleValue"].as<float>();
          }
        }
        emp.overtimeRate = otRate;

        employeeCount++;
      }

      Serial.printf("[FIRESTORE] Cached %d registered employees in local RAM.\n", employeeCount);
    }
  } else {
    Serial.printf("[FIRESTORE] Employees sync failed. HTTP: %d\n", httpCode);
  }
  http.end();
}

// -----------------------------------------------------------------------------
//  Firestore REST API: Check Active Working Attendance
// -----------------------------------------------------------------------------
bool findActiveAttendance(
  const char *empId, 
  String &outDocName, 
  uint64_t &outInTimestamp, 
  String &outInTime
) {
  if (WiFi.status() != WL_CONNECTED) return false;
  refreshFirebaseAuthToken();

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  String url = "https://firestore.googleapis.com/v1/projects/";
  url += FIREBASE_PROJECT_ID;
  url += "/databases/(default)/documents:runQuery?key=";
  url += FIREBASE_API_KEY;

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  if (idToken.length() > 0) {
    http.addHeader("Authorization", "Bearer " + idToken);
  }

  // Structured Query: attendance where employeeId == empId AND status == 'Working'
  StaticJsonDocument<1024> queryDoc;
  JsonObject structuredQuery = queryDoc.createNestedObject("structuredQuery");
  JsonArray from = structuredQuery.createNestedArray("from");
  JsonObject col = from.createNestedObject();
  col["collectionId"] = "attendance";

  JsonObject where = structuredQuery.createNestedObject("where");
  JsonObject compositeFilter = where.createNestedObject("compositeFilter");
  compositeFilter["op"] = "AND";
  JsonArray filters = compositeFilter.createNestedArray("filters");

  JsonObject f1 = filters.createNestedObject();
  JsonObject ff1 = f1.createNestedObject("fieldFilter");
  ff1["field"]["fieldPath"] = "employeeId";
  ff1["op"] = "EQUAL";
  ff1["value"]["stringValue"] = empId;

  JsonObject f2 = filters.createNestedObject();
  JsonObject ff2 = f2.createNestedObject("fieldFilter");
  ff2["field"]["fieldPath"] = "status";
  ff2["op"] = "EQUAL";
  ff2["value"]["stringValue"] = "Working";

  structuredQuery["limit"] = 1;

  String body;
  serializeJson(queryDoc, body);

  int httpCode = http.POST(body);
  bool found = false;

  if (httpCode == HTTP_CODE_OK) {
    String res = http.getString();
    JsonDocument resDoc;
    deserializeJson(resDoc, res);

    if (resDoc.is<JsonArray>() && resDoc.size() > 0) {
      JsonObject item = resDoc[0];
      if (item.containsKey("document")) {
        JsonObject docData = item["document"];
        outDocName = docData["name"].as<String>();
        JsonObject fields = docData["fields"];
        
        if (fields.containsKey("inTimestamp")) {
          JsonObject tsObj = fields["inTimestamp"];
          if (tsObj.containsKey("integerValue")) {
            String tsStr = tsObj["integerValue"].as<String>();
            outInTimestamp = strtoull(tsStr.c_str(), NULL, 10);
          } else if (tsObj.containsKey("stringValue")) {
            String tsStr = tsObj["stringValue"].as<String>();
            outInTimestamp = strtoull(tsStr.c_str(), NULL, 10);
          }
        }
        if (fields.containsKey("inTime") && fields["inTime"].containsKey("stringValue")) {
          outInTime = fields["inTime"]["stringValue"].as<String>();
        }
        found = true;
      }
    }
  }

  http.end();
  return found;
}

// -----------------------------------------------------------------------------
//  Firestore REST API: Record WORK IN (New Document)
// -----------------------------------------------------------------------------
bool recordWorkIn(const EmployeeRecord &emp, const DateTime &dt) {
  if (WiFi.status() != WL_CONNECTED) return false;
  refreshFirebaseAuthToken();

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  String url = "https://firestore.googleapis.com/v1/projects/";
  url += FIREBASE_PROJECT_ID;
  url += "/databases/(default)/documents/attendance?key=";
  url += FIREBASE_API_KEY;

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  if (idToken.length() > 0) {
    http.addHeader("Authorization", "Bearer " + idToken);
  }

  String dateStr = getFormattedDate(dt);
  String timeStr = getFormattedTime(dt);
  uint64_t nowMs = getEpochTimestampMs(dt);

  DynamicJsonDocument doc(1024);
  JsonObject fields = doc.createNestedObject("fields");
  fields["employeeId"]["stringValue"] = emp.employeeId;
  fields["employeeName"]["stringValue"] = emp.name;
  fields["department"]["stringValue"] = emp.department;
  fields["fingerprintId"]["integerValue"] = String(emp.fingerprintId);
  fields["date"]["stringValue"] = dateStr;
  fields["shiftId"]["stringValue"] = emp.shiftId;
  fields["inTime"]["stringValue"] = timeStr;
  fields["inTimestamp"]["integerValue"] = String(nowMs);
  fields["outTime"]["nullValue"] = nullptr;
  fields["outTimestamp"]["nullValue"] = nullptr;
  fields["regularHours"]["doubleValue"] = 0.0;
  fields["overtimeHours"]["integerValue"] = "0";
  fields["overtimeRate"]["doubleValue"] = emp.overtimeRate;
  fields["overtimeAmount"]["doubleValue"] = 0.0;
  fields["deviceId"]["stringValue"] = DEVICE_ID;
  fields["status"]["stringValue"] = "Working";

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  bool success = (httpCode == HTTP_CODE_OK);
  if (!success) {
    Serial.printf("[WORK IN] HTTP write failed: %d\n", httpCode);
  }
  http.end();
  return success;
}

// -----------------------------------------------------------------------------
//  Firestore REST API: Record WORK OUT (Update Existing Document)
// -----------------------------------------------------------------------------
bool recordWorkOut(
  const EmployeeRecord &emp, 
  const String &docName, 
  uint64_t inTimestampMs, 
  const DateTime &dt,
  String &outWorkedStr,
  int &outOtHours,
  float &outOtAmount
) {
  if (WiFi.status() != WL_CONNECTED) return false;
  refreshFirebaseAuthToken();

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  // Build PATCH URL with updateMask query parameters
  String url = "https://firestore.googleapis.com/v1/";
  url += docName;
  url += "?updateMask.fieldPaths=outTime"
         "&updateMask.fieldPaths=outTimestamp"
         "&updateMask.fieldPaths=workHours"
         "&updateMask.fieldPaths=regularHours"
         "&updateMask.fieldPaths=overtimeHours"
         "&updateMask.fieldPaths=overtimeAmount"
         "&updateMask.fieldPaths=status"
         "&key=";
  url += FIREBASE_API_KEY;

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  if (idToken.length() > 0) {
    http.addHeader("Authorization", "Bearer " + idToken);
  }

  uint64_t outTimestampMs = getEpochTimestampMs(dt);
  uint64_t elapsedMs = (outTimestampMs > inTimestampMs) ? (outTimestampMs - inTimestampMs) : 0;
  long totalWorkMinutes = (long)(elapsedMs / (1000ULL * 60ULL));
  if (totalWorkMinutes < 1) totalWorkMinutes = 1;

  // Regular Hours
  long regularMinutes = (totalWorkMinutes < NORMAL_WORK_MINUTES) ? totalWorkMinutes : NORMAL_WORK_MINUTES;
  double regularHoursNum = round((double)regularMinutes / 60.0 * 100.0) / 100.0;

  // Complete 1-Hour Blocks Overtime Formula:
  // overtimeHours = FLOOR((totalWorkMinutes - 480) / 60)
  outOtHours = 0;
  if (totalWorkMinutes > NORMAL_WORK_MINUTES) {
    outOtHours = (int)((totalWorkMinutes - NORMAL_WORK_MINUTES) / 60);
  }
  outOtAmount = (float)outOtHours * emp.overtimeRate;

  // Formatted Work Duration (e.g. "09h 15m")
  char workBuf[16];
  snprintf(workBuf, sizeof(workBuf), "%02ldh %02ldm", totalWorkMinutes / 60, totalWorkMinutes % 60);
  outWorkedStr = String(workBuf);

  String outTimeStr = getFormattedTime(dt);

  DynamicJsonDocument doc(1024);
  JsonObject fields = doc.createNestedObject("fields");
  fields["outTime"]["stringValue"] = outTimeStr;
  fields["outTimestamp"]["integerValue"] = String(outTimestampMs);
  fields["workHours"]["stringValue"] = outWorkedStr;
  fields["regularHours"]["doubleValue"] = regularHoursNum;
  fields["overtimeHours"]["integerValue"] = String(outOtHours);
  fields["overtimeAmount"]["doubleValue"] = outOtAmount;
  fields["status"]["stringValue"] = "Completed";

  String body;
  serializeJson(doc, body);

  int httpCode = http.PATCH(body);
  bool success = (httpCode == HTTP_CODE_OK);
  if (!success) {
    Serial.printf("[WORK OUT] HTTP patch failed: %d\n", httpCode);
  }
  http.end();
  return success;
}

// -----------------------------------------------------------------------------
//  Biometric Processing Pipeline
// -----------------------------------------------------------------------------
void handleFingerprintMatch(int fingerId) {
  // 1. Locate employee in cache
  EmployeeRecord *matchedEmp = nullptr;
  for (int i = 0; i < employeeCount; i++) {
    if (employeesCache[i].fingerprintId == fingerId) {
      matchedEmp = &employeesCache[i];
      break;
    }
  }

  if (!matchedEmp) {
    // If not in cache, refresh once from Firestore
    syncEmployeesFromFirestore();
    for (int i = 0; i < employeeCount; i++) {
      if (employeesCache[i].fingerprintId == fingerId) {
        matchedEmp = &employeesCache[i];
        break;
      }
    }
  }

  if (!matchedEmp) {
    showStatusMsg(F("NOT REGISTERED"), "Finger ID #" + String(fingerId), F("Contact HR/Admin"), 2500);
    signalError();
    return;
  }

  if (!matchedEmp->active) {
    showStatusMsg(F("ACCESS INACTIVE"), String(matchedEmp->name), F("Account Disabled"), 2500);
    signalError();
    return;
  }

  // 2. Cooldown check (30 seconds per employee)
  unsigned long nowMillis = millis();
  if (matchedEmp->lastScanMillis > 0 && (nowMillis - matchedEmp->lastScanMillis < SCAN_COOLDOWN_SECONDS * 1000UL)) {
    unsigned long remSec = (SCAN_COOLDOWN_SECONDS * 1000UL - (nowMillis - matchedEmp->lastScanMillis)) / 1000UL;
    showStatusMsg(F("COOLDOWN ACTIVE"), "Wait " + String(remSec) + "s before", F("scanning again!"), 2000);
    signalWarning();
    return;
  }
  matchedEmp->lastScanMillis = nowMillis;

  DateTime now = rtc.now();
  String timeStr = getFormattedTime(now);

  showStatusMsg(F("VERIFYING PUNCH"), String(matchedEmp->name), F("Checking status..."));

  // 3. Determine WORK IN vs WORK OUT
  String activeDocName = "";
  uint64_t inTimestampMs = 0;
  String inTimeStr = "";
  bool hasActiveRecord = findActiveAttendance(matchedEmp->employeeId, activeDocName, inTimestampMs, inTimeStr);

  if (!hasActiveRecord) {
    // Perform WORK IN
    bool ok = recordWorkIn(*matchedEmp, now);
    if (ok) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 4);
      display.println(F("✓ WORK IN RECORDED"));
      display.drawFastHLine(0, 16, 128, SSD1306_WHITE);
      display.setCursor(0, 22);
      display.println(matchedEmp->name);
      display.setCursor(0, 34);
      display.println("ID: " + String(matchedEmp->employeeId));
      display.setCursor(0, 48);
      display.println("TIME: " + timeStr);
      display.display();

      signalSuccess(false);
      delay(2200);
    } else {
      showStatusMsg(F("SYNC ERROR"), F("Cloud save failed."), F("Check connection."), 2500);
      signalError();
    }
  } else {
    // Perform WORK OUT
    String workedStr = "";
    int otHours = 0;
    float otAmount = 0.0;
    bool ok = recordWorkOut(*matchedEmp, activeDocName, inTimestampMs, now, workedStr, otHours, otAmount);

    if (ok) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 4);
      display.println(F("✓ WORK OUT RECORDED"));
      display.drawFastHLine(0, 16, 128, SSD1306_WHITE);
      display.setCursor(0, 20);
      display.println(matchedEmp->name);
      display.setCursor(0, 32);
      display.println("WORKED: " + workedStr);
      display.setCursor(0, 44);
      if (otHours > 0) {
        display.printf("OT: %dh (+Rs.%.0f)\n", otHours, otAmount);
      } else {
        display.println(F("OT: 00h (No OT)"));
      }
      display.setCursor(0, 56);
      display.println("OUT: " + timeStr);
      display.display();

      signalSuccess(true);
      delay(3000);
    } else {
      showStatusMsg(F("SYNC ERROR"), F("Cloud update failed."), F("Check connection."), 2500);
      signalError();
    }
  }
}

// -----------------------------------------------------------------------------
//  Interactive Fingerprint Enrollment Mode
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
//  Interactive Fingerprint Enrollment Mode (SW1 / SW3 / SW4 / SW5)
// -----------------------------------------------------------------------------
void runEnrollmentMode() {
  int targetId = 1;
  bool selecting = true;

  auto drawEnrollSelection = [](int id) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(14, 2);
    display.println(F("[ENROLL MODE]"));
    display.drawFastHLine(0, 13, 128, SSD1306_WHITE);
    display.setCursor(8, 18);
    display.printf("SELECT SLOT: < #%d >\n", id);
    display.setCursor(0, 32);
    display.println(F("SW3:+ ID   SW4:- ID"));
    display.setCursor(0, 44);
    display.println(F("SW5: START ENROLL"));
    display.setCursor(0, 56);
    display.println(F("SW1/SW2: Cancel"));
    display.display();
  };

  Serial.println(F("\n============================================="));
  Serial.println(F("       FINGERPRINT ENROLLMENT MODE           "));
  Serial.println(F("============================================="));
  Serial.println(F("Use SW3 (+) and SW4 (-) to select Slot ID, then press SW5 (OK)."));
  Serial.println(F("Or type ID number (1-127) in Serial Monitor and press Enter."));

  drawEnrollSelection(targetId);

  while (selecting) {
    // SW3: Next ID
    if (digitalRead(SW_NEXT_PIN) == LOW) {
      beepClick();
      targetId++;
      if (targetId > 127) targetId = 1;
      drawEnrollSelection(targetId);
      delay(200);
    }

    // SW4: Previous ID
    if (digitalRead(SW_PREV_PIN) == LOW) {
      beepClick();
      targetId--;
      if (targetId < 1) targetId = 127;
      drawEnrollSelection(targetId);
      delay(200);
    }

    // SW1 or SW2: Cancel and exit
    if (digitalRead(SW_ENROLL_PIN) == LOW || digitalRead(SW_DELETE_PIN) == LOW) {
      beepClick();
      showStatusMsg(F("CANCELLED"), F("Exiting enroll mode"), "", 1000);
      return;
    }

    // SW5: OK / Confirm ID selection
    if (digitalRead(SW_OK_PIN) == LOW) {
      beepClick();
      selecting = false;
      delay(300);
    }

    // Fallback: Serial input
    if (Serial.available()) {
      int sId = Serial.parseInt();
      if (sId >= 1 && sId <= 127) {
        targetId = sId;
        selecting = false;
      }
    }
    delay(30);
  }

  Serial.printf("[ENROLL] Starting enrollment for Slot ID #%d...\n", targetId);

  showStatusMsg("ENROLL ID #" + String(targetId), "Place finger on", "sensor now...");
  int p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (digitalRead(SW_DELETE_PIN) == LOW) {
      beepClick();
      return;
    }
    delay(50);
  }

  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) {
    Serial.println(F("First image conversion failed!"));
    signalError();
    return;
  }

  beepClick();
  showStatusMsg(F("REMOVE FINGER"), F("Lift your finger"), F("from sensor..."));
  delay(1200);
  while (finger.getImage() != FINGERPRINT_NOFINGER) delay(50);

  showStatusMsg(F("SAME FINGER AGAIN"), F("Place the same"), F("finger again..."));
  p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    delay(50);
  }

  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) {
    Serial.println(F("Second image conversion failed!"));
    signalError();
    return;
  }

  p = finger.createModel();
  if (p != FINGERPRINT_OK) {
    Serial.println(F("Fingerprints did not match! Try again."));
    showStatusMsg(F("ENROLL FAILED"), F("Fingers did not match"), F("Please try again"), 2500);
    signalError();
    return;
  }

  p = finger.storeModel(targetId);
  if (p == FINGERPRINT_OK) {
    Serial.printf("SUCCESS! Fingerprint enrolled in slot ID #%d.\n", targetId);
    showStatusMsg(F("✓ ENROLL SUCCESS!"), "Stored in Slot #" + String(targetId), F("Ready to punch!"), 2500);
    signalSuccess(false);
    syncEmployeesFromFirestore();
  } else {
    Serial.println(F("Sensor storage error!"));
    showStatusMsg(F("STORAGE ERROR"), F("Could not save to R307"), F("Try another slot"), 2500);
    signalError();
  }
}

// -----------------------------------------------------------------------------
//  Interactive Fingerprint Delete Mode (SW2 / SW3 / SW4 / SW5)
// -----------------------------------------------------------------------------
void runDeleteMode() {
  int targetId = 1;
  bool selecting = true;

  auto drawDeleteSelection = [](int id) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(14, 2);
    display.println(F("[DELETE MODE]"));
    display.drawFastHLine(0, 13, 128, SSD1306_WHITE);
    display.setCursor(8, 18);
    display.printf("DELETE SLOT: < #%d >\n", id);
    display.setCursor(0, 32);
    display.println(F("SW3:+ ID   SW4:- ID"));
    display.setCursor(0, 44);
    display.println(F("SW5: CONFIRM DELETE"));
    display.setCursor(0, 56);
    display.println(F("SW1/SW2: Cancel"));
    display.display();
  };

  Serial.println(F("\n============================================="));
  Serial.println(F("        FINGERPRINT DELETE MODE              "));
  Serial.println(F("============================================="));
  Serial.println(F("Use SW3 (+) and SW4 (-) to select Slot ID, then press SW5 (OK)."));

  drawDeleteSelection(targetId);

  while (selecting) {
    // SW3: Next ID
    if (digitalRead(SW_NEXT_PIN) == LOW) {
      beepClick();
      targetId++;
      if (targetId > 127) targetId = 1;
      drawDeleteSelection(targetId);
      delay(200);
    }

    // SW4: Previous ID
    if (digitalRead(SW_PREV_PIN) == LOW) {
      beepClick();
      targetId--;
      if (targetId < 1) targetId = 127;
      drawDeleteSelection(targetId);
      delay(200);
    }

    // SW1 or SW2: Cancel
    if (digitalRead(SW_ENROLL_PIN) == LOW || digitalRead(SW_DELETE_PIN) == LOW) {
      beepClick();
      showStatusMsg(F("CANCELLED"), F("Exiting delete mode"), "", 1000);
      return;
    }

    // SW5: Confirm
    if (digitalRead(SW_OK_PIN) == LOW) {
      beepClick();
      selecting = false;
      delay(300);
    }

    if (Serial.available()) {
      int sId = Serial.parseInt();
      if (sId >= 1 && sId <= 127) {
        targetId = sId;
        selecting = false;
      }
    }
    delay(30);
  }

  showStatusMsg(F("DELETING..."), "Slot #" + String(targetId), F("Clearing memory..."));
  uint8_t p = finger.deleteModel(targetId);

  if (p == FINGERPRINT_OK) {
    Serial.printf("[DELETE] Slot ID #%d deleted successfully from sensor.\n", targetId);
    showStatusMsg(F("✓ SLOT DELETED!"), "Slot #" + String(targetId) + " cleared", F("from sensor memory"), 2500);
    digitalWrite(LED_MATCH, HIGH);
    beepTone(250, 1);
    digitalWrite(LED_MATCH, LOW);
  } else {
    Serial.println(F("[DELETE] Failed to delete slot or slot already empty."));
    showStatusMsg(F("DELETE FAILED"), F("Slot already empty"), F("or sensor error"), 2500);
    signalError();
  }
}

// -----------------------------------------------------------------------------
//  Arduino Setup
// -----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n[BOOT] Starting Omove Biometric Attendance Terminal..."));

  // Pins Setup: Indicators & Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_WIFI_RED, OUTPUT);
  pinMode(LED_WIFI_GREEN, OUTPUT);
  pinMode(LED_MATCH, OUTPUT);
  pinMode(LED_UNMATCH, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_WIFI_RED, HIGH); // Red ON while searching for Wi-Fi
  digitalWrite(LED_WIFI_GREEN, LOW);
  digitalWrite(LED_MATCH, LOW);
  digitalWrite(LED_UNMATCH, LOW);

  // Pins Setup: Hardware Navigation Switches (Active LOW with internal pullup)
  pinMode(SW_ENROLL_PIN, INPUT_PULLUP);
  pinMode(SW_DELETE_PIN, INPUT_PULLUP);
  pinMode(SW_NEXT_PIN, INPUT_PULLUP);
  pinMode(SW_PREV_PIN, INPUT_PULLUP);
  pinMode(SW_OK_PIN, INPUT_PULLUP);

  // Initialize I2C Bus & OLED
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDR)) {
    Serial.println(F("[ERROR] SSD1306 OLED allocation failed!"));
  } else {
    showSplash();
    delay(1000);
  }

  // Initialize DS3231 RTC
  if (!rtc.begin()) {
    Serial.println(F("[WARN] Couldn't find DS3231 RTC module!"));
  } else {
    if (rtc.lostPower()) {
      Serial.println(F("[RTC] RTC lost power, setting compile time..."));
      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
  }

  // Initialize R307 Fingerprint Sensor
  mySerial.begin(FP_BAUD_RATE, SERIAL_8N1, FP_RX_PIN, FP_TX_PIN);
  finger.begin(FP_BAUD_RATE);
  delay(100);

  if (finger.verifyPassword()) {
    Serial.println(F("[R307] Biometric optical fingerprint sensor found & ready."));
  } else {
    Serial.println(F("[ERROR] R307 fingerprint sensor not detected! Check wiring."));
    showStatusMsg(F("HARDWARE ERROR"), F("R307 Sensor not"), F("detected on UART2!"), 2000);
  }

  // Connect to Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print(F("[WIFI] Connecting to "));
  Serial.println(WIFI_SSID);

  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(500);
    Serial.print(F("."));
    wifiAttempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    updateWiFiLeds();
    Serial.print(F("\n[WIFI] Connected! IP: "));
    Serial.println(WiFi.localIP());
    syncNtpTime();
    syncEmployeesFromFirestore();
    signalSuccess(false);
  } else {
    updateWiFiLeds();
    Serial.println(F("\n[WIFI] Connection timed out. Operating in RTC-only mode."));
    signalWarning();
  }
}

// -----------------------------------------------------------------------------
//  Arduino Main Loop
// -----------------------------------------------------------------------------
void loop() {
  updateWiFiLeds();

  // SW1 (GPIO 13): Enter Enroll Mode
  if (digitalRead(SW_ENROLL_PIN) == LOW) {
    beepClick();
    delay(200);
    runEnrollmentMode();
    return;
  }

  // SW2 (GPIO 14): Enter Delete Mode
  if (digitalRead(SW_DELETE_PIN) == LOW) {
    beepClick();
    delay(200);
    runDeleteMode();
    return;
  }

  // Serial Monitor Commands ('E' = Enroll, 'D' = Delete, 'S' = Sync)
  if (Serial.available()) {
    char ch = Serial.read();
    if (ch == 'E' || ch == 'e') {
      runEnrollmentMode();
      return;
    } else if (ch == 'D' || ch == 'd') {
      runDeleteMode();
      return;
    } else if (ch == 'S' || ch == 's') {
      syncEmployeesFromFirestore();
    }
  }

  // Periodic display refresh
  unsigned long currentMillis = millis();
  if (currentMillis - lastDisplayRefreshMillis >= DISPLAY_REFRESH_INTERVAL) {
    lastDisplayRefreshMillis = currentMillis;
    showIdleScreen();
  }

  // Periodic Employee Cache Refresh
  if (currentMillis - lastEmployeeSyncMillis >= EMPLOYEE_SYNC_INTERVAL) {
    lastEmployeeSyncMillis = currentMillis;
    syncEmployeesFromFirestore();
  }

  // Fast check for finger on optical sensor
  uint8_t p = finger.getImage();
  if (p == FINGERPRINT_OK) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(16, 20);
    display.println(F("SCANNING FINGER"));
    display.drawFastHLine(0, 34, 128, SSD1306_WHITE);
    display.setCursor(22, 42);
    display.println(F("Hold steady..."));
    display.display();

    p = finger.image2Tz();
    if (p == FINGERPRINT_OK) {
      p = finger.fingerFastSearch();
      if (p == FINGERPRINT_OK) {
        Serial.printf("[SCAN] Fingerprint Matched! ID: #%d (Score: %d)\n", finger.fingerID, finger.confidence);
        handleFingerprintMatch(finger.fingerID);
      } else {
        Serial.println(F("[SCAN] Fingerprint not found in sensor database."));
        showStatusMsg(F("NOT RECOGNIZED"), F("Unknown fingerprint"), F("Try placing again"), 2000);
        signalError();
      }
    } else {
      signalError();
    }

    // Wait until finger is removed to prevent rapid re-triggers
    while (finger.getImage() != FINGERPRINT_NOFINGER) {
      delay(50);
    }
  }
}
