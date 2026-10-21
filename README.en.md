# Yong Hoon Choi (최용훈)

[한국어](README.md) | [English](README.en.md)

**Memory Systems · Embedded / Low-Level Software · Experimental Validation**

I am an undergraduate in Electronic and Electrical Engineering at Sungkyunkwan University (SKKU). Since August 2026 I have been on a long-term industry practicum with the DRAM Solution Team, Memory Business, Samsung Electronics DS, working on server DRAM module and system validation.

My path ran from MCU firmware through CAN-FD measurement experiments and FPGA-SoC vehicle integration to my current work: the path by which a memory error on a Linux server is reported through hardware ECC → memory controller → kernel → decoder. The questions I care about are **how far an observed record can serve as evidence of real hardware behavior**, and **which controlled experiments close the gap**.

## Now: Samsung Electronics DS · DRAM Solution practicum (Aug 2026 – present)

Intel and AMD server platforms, DDR5 RDIMMs, Linux-based memory testing and error observation. The description below is generalized to a public-safe level; no company code, logs, or data are included in any public repository.

- **Built** — an event-driven error path in C that forwards Linux machine-check (MCE) notifications to a user-space reader connected to the team’s existing controller-level error decoder. It is a prototype under validation, not a released tool.
- **Verified** — record validity, duplication, staleness, and provenance before decoding; traced a count difference between event-driven and polling observation to different counting units rather than lost errors.
- **Studied** — BIOS/MRC training, DDR5 DIMM organization, MCA/RAS error reporting, and the translation between system addresses and logical DRAM coordinates, through source and documentation.

## Research: CAN-FD periodic-frame timing validation (Undergraduate Research Program, 2026)

Using a three-node Renesas RA6M5 CAN-FD setup and PCAN-USB FD traces, we compared how signal-packing strategies affect the inter-arrival jitter of a periodic control frame. I handled Python trace parsing, quality checks, statistics, and the audit of comparison conditions.

I found that an early jitter difference between strategies came from a comparison in which the background-traffic generation gap had changed as well. After re-measuring under identical conditions, sweeping the gap, and repeating runs with board resets and permuted order, we revised the conclusion to **mean bus occupancy alone does not establish equivalent timing conditions**. The full paper was **submitted** to the KSAE 2026 Annual Autumn Conference, and I am a co-author. Raw traces and firmware are joint research material, so there is no public repository.

## Public projects

**[RA6M3 Microprocessor Lab](https://github.com/choiYhunn/ra6m3-microprocessor-lab/blob/main/README.en.md)** — bare-metal MCU control logic
Application logic of an elevator controller (five-state FSM with IRQ, timer, PWM, UART, CAN) and an educational transmission controller, extracted as portable C11. The logic is reproducible with `gcc -std=c11 -Werror` host tests; board timing and wiring are outside their scope. The original EK-RA6M3 submission application source the reconstruction was derived from is also kept under [`board_original/`](https://github.com/choiYhunn/ra6m3-microprocessor-lab/tree/main/board_original) (FSP-generated trees and audio excluded).

**[2026 AI-Chip autonomous vehicle](https://github.com/choiYhunn/2026-autonomous-driving-hackathon-portfolio/blob/main/%EA%B5%90%EB%82%B4_%EC%9E%90%EC%9C%A8%EC%A3%BC%ED%96%89_AI_Chip_%EC%84%A4%EA%B3%84%EB%8C%80%ED%9A%8C_%EC%A7%84%ED%96%89%EC%A4%91%28%EC%B5%9C%EC%9A%A9%ED%9B%88%29/README.en.md)** — PYNQ/Zynq hardware–software integration · Bronze Award, AI-Chip Division (team)
I integrated the run-time chain camera → DPU inference → steering control → PWM over MMIO, calibrated against ADC feedback, and ran repeated vehicle tests. The car placed 3rd in the driving run and reached the parking stage, where the mission failed on intermittent ultrasonic no-detection whose cause is still unresolved. The runtime parts I owned (lane-loss handling, drive/park mode resource lifecycle, non-blocking drive recording) are published both as a PC-runnable reconstruction (`src/portfolio_2026/`) and as my own files from the actual competition package (`src/competition_runtime/`); teammates’ algorithms, the educational baseline, models, and FPGA artifacts are excluded.

**[2025 SKKU Autonomous Driving Hackathon](https://github.com/choiYhunn/skku-autonomous-driving-hackathon-2025/blob/main/README.en.md)** — ROS driving and parking control · 2nd place (team)
Front and parallel parking FSMs, Pure Pursuit, and curvature-based speed control integrated in a ROS Noetic simulator. Competition-provided code and my own commits are separated.

**[RISC-V Pipeline Hazard Study](https://github.com/choiYhunn/riscv-pipeline-hazard-study)** — Computer Architecture HW1 · pipeline hazard analysis
On Ripes (forwarding 5-stage pipeline), analyzed RAW and control hazards in a GCD routine and hid stall slots via instruction scheduling, reducing the cycle count from **121 to 118**; completed a selection-sort skeleton with load-use-hazard-aware ordering. The numbers are simulator results; the provided skeleton and the PII-bearing report are excluded.

**[Shared Brain Starter](https://github.com/choiYhunn/shared-brain-starter)** — software-engineering side project
A starter kit for a Git-backed knowledge repository that lets several AI tools continue the same project context. Its importer and validator are covered by unit tests and an end-to-end smoke test in CI. It contains no personal records.

Also: 2026 AMET Autonomous Driving Hackathon (Raspberry Pi 5 · ROS 2, Excellence Award from Hyundai Mobis, team). I trained a YOLO26n candidate on images I labeled, then kept it out of the primary race pipeline — used only as a far-geometry assist — after measuring on-vehicle CPU inference of about 318 ms p50 / 400 ms p95. The team repository is private, so it is not linked.

## Skills

```text
Languages   C · Python · RISC-V assembly · C++ (coursework level)
Systems     Linux · Git · DDR5 RDIMM servers, BIOS/MRC, MCA/RAS (learned during the practicum)
Embedded    Renesas RA6M3/RA6M5 (FSP) · Zynq/PYNQ · ROS/ROS 2
Interfaces  CAN/CAN-FD (PCAN-USB FD) · UART · ADC · PWM · Timer/IRQ · MMIO
Methods     controlled comparison · confound checks · repeated measurement · observed vs. inferred
```

## Awards

- 2026 AMET Autonomous Driving Hackathon — Excellence Award (Hyundai Mobis Award), 3rd in finals — team
- 4th SKKU AI Autonomous Driving Competition — Bronze Award, AI-Chip Division — team
- 2025 SKKU Autonomous Driving Hackathon — 2nd place — team

## Disclosure principles

- Team outcomes and individual contributions are kept separate; unverified performance, awards, or roles are not claimed.
- Simulation and real-hardware validation are kept separate, and failures and measurement limits are recorded with the results.
- Company, joint-research, and teammate material is described only within confirmed disclosure permissions.
