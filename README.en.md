# Choi Yonghun | Automotive Embedded & System Software

[한국어](README.md) | [English](README.en.md)

I study Electronic and Electrical Engineering at Sungkyunkwan University, focusing on **automotive embedded software, autonomous-system integration, in-vehicle networking, and validation automation**.

My main interest is connecting the complete path from sensor input to decision, control command, logging, and recovery behavior so that the system is both operational and verifiable.

```text
Sensor / Perception → Decision → Control → Actuator
          └──────── Logging · Fail-Safe · Validation ────────┘
```

## Core Strengths

| Area | Experience |
|---|---|
| Autonomous control | Pure Pursuit, Stanley-family control, parking FSMs, speed and steering tuning |
| Embedded software | C/C++, MCU state machines, timer/PWM/ADC/UART/CAN integration |
| Vehicle networking | CAN/CAN-FD, signal packing, trace parsing, timing analysis |
| System integration | ROS, PYNQ/DPU, MMIO, camera/sensor/control data paths |
| Validation | Fail-safe behavior, event logging, data QC, host-side tests, reproducible analysis |

## Featured Projects

### 1. SKKU Autonomous Driving Hackathon — 2nd Place

Our four-person team built a ROS-based autonomous-driving simulation system. I integrated parking state machines, Pure Pursuit tracking, curvature-aware speed control, and RViz debugging tools.

- Role: driving and parking control integration, fail-safe behavior, speed and steering tuning
- Problem solved: structured parking as explicit states and separated high-speed and high-steering speed strategies
- Result: completed two of three parking missions and finished in second place
- [View source and contribution evidence](https://github.com/choiYhunn/skku-autonomous-driving-hackathon-2025)

### 2. Autonomous Driving AI Chip Design Competition — In Progress

This project integrates PYNQ DPU inference with PWM vehicle control, driving and parking modes, ADC steering feedback, and lane-loss fail-safe behavior.

- Role: steering/driving integration, `max_jump` and lane-loss recovery tuning, vehicle-level debugging
- Disclosure: team source, models, and FPGA artifacts remain private; only verified system-level work is documented
- [View the bilingual portfolio](https://github.com/junmyounggyu/2026-autonomous-driving-hackathon-portfolio/tree/main/%EA%B5%90%EB%82%B4_%EC%9E%90%EC%9C%A8%EC%A3%BC%ED%96%89_AI_Chip_%EC%84%A4%EA%B3%84%EB%8C%80%ED%9A%8C_%EC%A7%84%ED%96%89%EC%A4%91%28%EC%B5%9C%EC%9A%A9%ED%9B%88%29)

### 3. CAN-FD Signal Packing and Receive-Timing Study

A joint study using RA6M5 TX/RX nodes and PCAN traces to compare RX inter-arrival jitter and reconstructed occupancy across three packing strategies.

- Role: analysis workflow, data QC, condition-error discovery, remeasurement, and interpretation
- Validation principle: separate measured and reconstructed quantities and preserve failed claim gates
- Disclosure: methodology and limitations are public; traces, firmware, and numerical results remain private pending approval
- [View the bilingual portfolio](https://github.com/junmyounggyu/2026-autonomous-driving-hackathon-portfolio/tree/main/CAN-FD_%EC%8B%A0%ED%98%B8%ED%8C%A8%ED%82%B9_%EC%8B%A4%EC%8B%9C%EA%B0%84%EC%84%B1_%EC%97%B0%EA%B5%AC%28%EC%B5%9C%EC%9A%A9%ED%9B%88%29)

### 4. RA6M3 Microprocessor Laboratory

Portable C11 extraction of application logic from EK-RA6M3 coursework. The elevator controller and educational TCU state machines compile and run assertion-based tests on a host PC.

- Role: state-based control, peripheral integration, public-core extraction, and host testing
- Disclosure: directly implemented logic only; FSP-generated code, course skeletons, and personal information are excluded
- [View source and tests](https://github.com/choiYhunn/ra6m3-microprocessor-lab)

## Technology

```text
Languages     C · C++ · Python
Embedded      Renesas RA6M3/RA6M5 · PYNQ · PWM · ADC · UART · CAN/CAN-FD
Autonomy      ROS · Pure Pursuit · Stanley · FSM · RViz
Validation    Git · Linux · CSV/TRC analysis · event logging · host-side testing
```

## Engineering Principles

- Separate team outcomes from individual contribution.
- Do not invent unverified performance, awards, or roles.
- Record failed conditions and measurement limits with the results.
- Keep personal information, teammate source, models, datasets, and device identifiers private.

> Public repositories contain only reviewable source and documentation. Private team projects are described only within approved disclosure boundaries.
