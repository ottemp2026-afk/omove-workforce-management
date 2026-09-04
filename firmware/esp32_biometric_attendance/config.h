#ifndef CONFIG_H
#define CONFIG_H

// =============================================================================
//  OMOVE WORKFORCE MANAGEMENT - ESP32 BIOMETRIC TERMINAL CONFIGURATION
// =============================================================================

// 1. Wi-Fi Configuration
#define WIFI_SSID         "DIGISOL"
#define WIFI_PASSWORD     "Ashik@11"

// 2. Firebase / Google Cloud Project Configuration
#define FIREBASE_PROJECT_ID   "omove-workforce-management"
#define FIREBASE_API_KEY      "AIzaSyD1mIKsN8EWwM7dODxnDztyEjuhvau4mG8"
#define DEVICE_ID             "ESP32-001"

// 3. Optional: Firebase Auth Device Credentials
// If your Firestore rules require authentication (request.auth != null),
// create an email/password account in Firebase Auth console for the device
// (e.g. esp32-device@omove.local) and enter credentials below.
// If your rules allow open write for attendance, leave empty.
#define FIREBASE_AUTH_EMAIL    ""
#define FIREBASE_AUTH_PASSWORD ""

// 4. Hardware Pinout (ESP32-WROOM-32 / DevKit V1)
// --- R307 / R307S Fingerprint Optical Sensor (Serial2) ---
#define FP_RX_PIN         16    // ESP32 RX2 connects to R307 TX (Green/White wire)
#define FP_TX_PIN         17    // ESP32 TX2 connects to R307 RX (Yellow wire)
#define FP_BAUD_RATE      57600 // Default R307/R307S UART baud rate

// --- I2C Bus (Shared by DS3231 RTC & SSD1306 0.96" OLED) ---
#define I2C_SDA_PIN       21    // ESP32 SDA
#define I2C_SCL_PIN       22    // ESP32 SCL
#define OLED_I2C_ADDR     0x3C  // Default 0.96" SSD1306 I2C address
#define SCREEN_WIDTH      128
#define SCREEN_HEIGHT     64

// --- Status Indicators & Buzzer ---
#define LED_WIFI_RED      25    // WiFi Red LED (Disconnected / Offline)
#define LED_WIFI_GREEN    26    // WiFi Green LED (Connected / Online)
#define LED_MATCH         32    // Match LED (Fingerprint Verified / Attendance Logged)
#define LED_UNMATCH       33    // Unmatch LED (Fingerprint Denied / Unknown)
#define BUZZER_PIN        27    // Active Buzzer (HIGH = BEEP)

// --- Physical Navigation & Control Switches (Active LOW / INPUT_PULLUP) ---
#define SW_ENROLL_PIN     13    // SW1: Enroll Mode
#define SW_DELETE_PIN     14    // SW2: Delete Mode
#define SW_NEXT_PIN       18    // SW3: Next ID (+)
#define SW_PREV_PIN       19    // SW4: Previous ID (-)
#define SW_OK_PIN         23    // SW5: OK / Confirm     

// 5. Workforce Attendance & Overtime Rules (Matching Web Application)
#define NORMAL_WORK_MINUTES     480  // 8 Hours standard shift (480 minutes)
#define DEFAULT_OVERTIME_RATE   80   // Default ₹80 per complete 1-hour block
#define SCAN_COOLDOWN_SECONDS   30   // 30-second cooldown per employee against double punches

// 6. Timezone & NTP Synchronization
// Indian Standard Time (IST) = UTC + 5:30 = 5.5 * 3600 = 19800 seconds
#define TIMEZONE_OFFSET_SEC     19800
#define DAYLIGHT_OFFSET_SEC     0
#define NTP_SERVER_1            "pool.ntp.org"
#define NTP_SERVER_2            "time.nist.gov"

// 7. Maximum Cached Employees in ESP32 RAM
#define MAX_EMPLOYEES_CACHE     100

#endif // CONFIG_H
