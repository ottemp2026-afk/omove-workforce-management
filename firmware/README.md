# ESP32 Biometric Attendance & Overtime Terminal Firmware

Complete firmware and hardware guide for connecting the **ESP32 DevKit V1** with an **R307 / R307S Optical Fingerprint Sensor**, **DS3231 High-Precision RTC**, and **0.96" I2C OLED Display (SSD1306)** directly to the **Omove Workforce Management Web Application & Cloud Firestore**.

---

## 1. Hardware Pinout & Wiring Guide

| Module | Pin on Module | Wire Color (Typical) | ESP32 GPIO Pin | Description / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **R307 / R307S Sensor** | VCC (Pin 1) | Red | **VIN (5V)** | Optical sensor power (4.2V - 6V) |
| | GND (Pin 2) | Black | **GND** | Ground |
| | TX (Pin 3) | Yellow | **GPIO 16 (RX2)** | Sensor TX -> ESP32 HardwareSerial2 RX |
| | RX (Pin 4) | Green / White | **GPIO 17 (TX2)** | Sensor RX <- ESP32 HardwareSerial2 TX |
| **DS3231 Precision RTC** | VCC | Red | **3.3V / VIN** | Module power |
| | GND | Black | **GND** | Common ground |
| | SDA | Blue | **GPIO 21** | Shared I2C Data bus (0x68) |
| | SCL | Yellow | **GPIO 22** | Shared I2C Clock bus (0x68) |
| **0.96" OLED (SSD1306)** | VCC | Red | **3.3V** | Display power |
| | GND | Black | **GND** | Ground |
| | SDA | Blue | **GPIO 21** | Shared I2C Data bus (0x3C) |
| | SCL | Yellow | **GPIO 22** | Shared I2C Clock bus (0x3C) |
| **Status Indicators** | WiFi Red LED (+) | Red | **GPIO 25** | Offline / Disconnected status |
| | WiFi Green LED (+) | Green | **GPIO 26** | Online / Connected status |
| | Match LED (+) | Blue/Green | **GPIO 32** | Fingerprint Verified & Logged |
| | Unmatch LED (+) | Red/Orange | **GPIO 33** | Fingerprint Denied / Unrecognized |
| | Buzzer (+) | Red | **GPIO 27** | Active Buzzer (Punches, clicks, alerts) |
| **Physical Switches** | SW1 (Button) | Signal to GND | **GPIO 13** | **Enroll Mode** switch |
| | SW2 (Button) | Signal to GND | **GPIO 14** | **Delete Mode** switch |
| | SW3 (Button) | Signal to GND | **GPIO 18** | **Next ID (+)** switch |
| | SW4 (Button) | Signal to GND | **GPIO 19** | **Previous ID (-)** switch |
| | SW5 (Button) | Signal to GND | **GPIO 23** | **OK / Confirm** switch |

> **Tip:** The DS3231 RTC and SSD1306 OLED share the exact same I2C bus pins (`GPIO 21` for SDA and `GPIO 22` for SCL) without conflicts because they have different I2C addresses (`0x68` and `0x3C`).

---

## 2. Required Arduino Libraries

Open the **Arduino IDE** -> Navigate to **Sketch** -> **Include Library** -> **Manage Libraries...** (or `Ctrl+Shift+I`) and install:

1. **Adafruit Fingerprint Sensor Library** by *Adafruit* (v2.1.3+)
2. **RTClib** by *Adafruit* (v2.1.4+)
3. **Adafruit SSD1306** by *Adafruit* (v2.5.9+)
4. **Adafruit GFX Library** by *Adafruit* (v1.11.9+)
5. **ArduinoJson** by *Benoît Blanchon* (v6.21.x or v7.x)

---

## 3. Configuration Setup

Open [config.h](file:///c:/Users/ad182/Downloads/biometric-attendance-system/firmware/esp32_biometric_attendance/config.h) and set your local Wi-Fi credentials:

```cpp
#define WIFI_SSID         "Your_WiFi_Network"
#define WIFI_PASSWORD     "Your_WiFi_Password"
```

Firebase credentials are pre-configured to point to your live project:
- **Project ID**: `omove-workforce-management`
- **API Key**: `AIzaSyD1mIKsN8EWwM7dODxnDztyEjuhvau4mG8`
- **Device ID**: `ESP32-001`

---

## 4. Arduino IDE Board Settings

1. In Arduino IDE, go to **Tools** -> **Board** -> **ESP32 Arduino** -> select **ESP32 Dev Module** (or **DOIT ESP32 DEVKIT V1**).
2. Configure options:
   - **CPU Frequency**: `240MHz (WiFi/BT)`
   - **Flash Frequency**: `80MHz`
   - **Partition Scheme**: `Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS)` or `Minimal SPIFFS (1.9MB APP with OTA/190KB SPIFFS)`
   - **Upload Speed**: `921600` (or `115200` if upload fails)
   - **Port**: Select the COM port corresponding to your ESP32 board
3. Click **Verify** (Compile) and then **Upload**.

---

## 5. How Attendance & Overtime Works

1. **Automatic WORK IN vs WORK OUT**:
   - When an enrolled employee places their finger on the sensor, the ESP32 looks up their registered employee ID from its local RAM cache.
   - It queries Cloud Firestore to check if the employee already has an open session (`status: "Working"`).
   - If **NO session exists**:
     - Records **WORK IN** with the current DS3231 timestamp and status `"Working"`.
     - Displays employee name, time, and plays a single success beep.
   - If an **open session EXISTS**:
     - Calculates total worked minutes.
     - Enforces the **Authoritative Complete 1-Hour Block Overtime Rule**:
       $$\text{OT Hours} = \left\lfloor \frac{\text{Total Work Minutes} - 480}{60} \right\rfloor$$
       $$\text{OT Amount} = \text{OT Hours} \times \text{Employee Overtime Rate (default ₹80)}$$
     - Updates the Firestore record to `"Completed"`, logs `outTime`, `workHours`, `regularHours`, `overtimeHours`, and `overtimeAmount`.
     - Displays total time worked and earned overtime pay, accompanied by a double check-out chime.

2. **30-Second Duplicate Scan Protection**:
   - If the same finger is scanned within 30 seconds, the terminal alerts `"COOLDOWN ACTIVE"` with the remaining seconds to prevent accidental double punches.

---

## 6. How to Enroll New Fingerprints

There are two easy methods:

### Method A: Via Serial Monitor
1. Open the Arduino Serial Monitor at **115200 baud**.
2. Type `E` and press **Enter**.
3. Type the desired slot ID (e.g. `1`, `2`, `3`) and follow the on-screen and OLED instructions:
   - Place finger -> Remove -> Place same finger again -> Success!
4. Register the corresponding employee in the web dashboard with the exact same **Fingerprint ID**.

### Method B: Via Physical Button
1. Press and hold the on-board **BOOT button (GPIO 0)** for 2 seconds.
2. The OLED will switch to `--- ENROLL MODE ---` and prompt you to proceed.
