# Hardware Connection Diagram

This document details the wiring between the ESP32 microcontroller and the NEO-6M GPS module.

## Components
1. **ESP32 Development Board** (e.g., ESP32 DevKit V1)
2. **NEO-6M GPS Module**
3. **Jumper Wires** (Female-to-Male or Male-to-Male depending on headers)

## Wiring Table

| NEO-6M Pin | ESP32 Pin | Description |
|---|---|---|
| VCC | 3.3V or 5V | Power Supply (Check module spec, usually 3.3V-5V tolerant) |
| GND | GND | Ground |
| TX | GPIO 16 (RX2) | Transmit Data (GPS -> ESP32) |
| RX | GPIO 17 (TX2) | Receive Data (ESP32 -> GPS) |

> **Note**: The RX pin on the GPS module is not strictly needed if we are only reading data *from* the GPS. However, connecting it allows for configuration commands if necessary. We primarily need GPS TX -> ESP32 RX.

## Connection Diagram (ASCII)

```
       ESP32 Board                  NEO-6M GPS Module
    +---------------+             +-------------------+
    |               |             |                   |
    |      3V3/5V   |-------------| VCC               |
    |      GND      |-------------| GND               |
    |               |             |                   |
    |      GPIO 16  |<------------| TX                |
    |      GPIO 17  |------------>| RX                |
    |               |             |                   |
    +---------------+             +-------------------+
```

## Setup Notes
1. **Power**: Ensure the GPS module gets stable power. Some ESP32 boards have weak 3.3V regulators. If the GPS LED doesn't blink, try using the 5V (VIN) pin if the module supports it.
2. **Antenna**: The NEO-6M comes with a ceramic antenna. It works best outdoors with a clear view of the sky. It may take a few minutes to get a "fix" (LED blinking) initially.
3. **Serial Port**: The code will use `HardwareSerial` on pins 16 and 17.
