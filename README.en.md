# Yong Hoon Choi (최용훈)

[한국어](README.md) | [English](README.en.md)

**Memory reliability · System validation · Embedded / low-level software**

I am an undergraduate in Electronic and Electrical Engineering at Sungkyunkwan University (SKKU). Since August 2026 I have been on a long-term industry practicum in server DDR5 RDIMM system validation with the DRAM Solution Team, Memory Business, Samsung Electronics DS. The question I care about: **how faithfully does an error register or OS record describe a real DRAM event, and what independent measurement is needed to confirm a test's conclusion?**

| At a glance | |
|---|---|
| Now | Server DDR5 RDIMM platform validation and the Linux memory-error observation path (practicum) |
| Hardware I have worked on | Physical server boards and DDR5 RDIMM populations · Renesas RA6M3/RA6M5 · Zynq/PYNQ (Ultra96-V2) · Raspberry Pi 5 · PCAN-USB FD · oscilloscope |
| Software | C (Linux user space, MCU firmware) · Python (trace analysis, tests) · RISC-V assembly · ROS/ROS 2 |
| Strongest result | CAN-FD: with the packing strategy fixed, changing only the background gap from 238 to 240 µs moved jitter from 26.4 to 56.8 µs (n = 3) — showing the earlier strategy comparison was confounded; KSAE full paper submitted |
| In progress | Linux machine-check event-capture prototype (not released) |

## Now: Samsung Electronics DS, DRAM Solution Team practicum (Aug 2026 – )

Server DDR5 RDIMM bring-up, population-dependent testing, and RAS error analysis. No company code, logs, register dumps, test conditions, or platform names appear in any public repository; the description below is generalized to public concepts.

| Category | What |
|---|---|
| Built and verified | A C prototype that connects a Linux machine-check event reader to an existing platform-specific controller error decoder. Debugged reader blocking and inconsistent field interpretation; compared event-triggered and polling capture with matched capture mode and count units, and traced their count difference to different counting units rather than lost errors. **A prototype under validation, not a released tool.** |
| Analyzed / debugged existing code | Traced Linux MCA records to controller error-register snapshots and the existing location decoder, and the memory-test pattern → controller → error-report flow. Checked record validity, duplication, staleness, and provenance before decoding, and investigated ambiguous or stale snapshots instead of trusting the decoded result. |
| Hands-on experiments | On physical server test setups with different board/CPU/DIMM population configurations, examined slot/channel maps and boot/training state, and compared startup conditions and population effects before attributing a difference to the DIMM. Recorded test configuration, event provenance, parser regression fixtures, and repeatability checks. |
| Learned from documents and source | Error-register bitfields (validity, parity, detail fields) and CPU-generation layout differences from reference manuals and datasheets; system address → logical channel/DIMM/rank/bank/row/column translation; PCI configuration, MMIO, and MSR access paths; BIOS/MRC host–RCD–DRAM CA and DQ/DQS training, PI/Vref sweeps, eye/margin centering. I did not own MRC firmware. |
| Not yet verified | Whether a decoded DQ/position equals the physical DRAM cell location (not treated as ground truth) · how software-requested accesses, measured controller activity, and actual row-level DRAM command exposure correspond · criteria for detecting overwritten or stale error records |

## Selected projects

| Project | My part | Verified result | Kind of evidence |
|---|---|---|---|
| [CAN-FD signal-packing timing](https://github.com/choiYhunn/canfd-signal-packing-timing-evaluation) · undergraduate research 2026 | Python trace parsing, QC, jitter statistics, comparison-condition audit (firmware and wiring were team work) | The initial 37.7 µs strategy difference coincided with a background-gap difference; across a 230–250 µs gap sweep jitter changed non-monotonically while reconstructed occupancy moved by less than 1 pp | RA6M5 three-node hardware, PCAN traces; headline numbers recomputable from public CSVs |
| [RA6M3 Microprocessor Lab](https://github.com/choiYhunn/ra6m3-microprocessor-lab) · A+ | Five-state elevator FSM, P/N/D/R transmission control with hysteresis; original board source plus a portable C11 extraction | TCU and elevator host assertion tests pass (`-std=c11 -Werror`) | Host tests; board timing out of scope |
| [RISC-V Pipeline Hazard Study](https://github.com/choiYhunn/riscv-pipeline-hazard-study) · A+ | GCD hazard analysis and instruction reordering on a five-stage pipeline without forwarding | **121 → 115 cycles**, 61 instructions in both (CPI 1.98 → 1.89) | Ripes simulation; submission-time screenshots |
| [AI-Chip autonomous vehicle](https://github.com/choiYhunn/2026-autonomous-driving-hackathon-portfolio/tree/main/%EA%B5%90%EB%82%B4_%EC%9E%90%EC%9C%A8%EC%A3%BC%ED%96%89_AI_Chip_%EC%84%A4%EA%B3%84%EB%8C%80%ED%9A%8C_%EC%A7%84%ED%96%89%EC%A4%91%28%EC%B5%9C%EC%9A%A9%ED%9B%88%29) · Bronze (team) | Integrated camera → DPU → steering → MMIO PWM; ADC-feedback calibration; repeated vehicle tests | 3rd in the driving run; parking failed on ultrasonic no-detection (cause unresolved); 5th overall | Vehicle runs; public code is my runtime files plus a PC reconstruction with 3 tests |
| [AMET YOLO26n candidate](https://github.com/choiYhunn/amet-2026-orange-lane-detector) · team Excellence Award | Labeling → Colab training → ONNX deployment → on-vehicle latency measurement | Vehicle-CPU inference p50 318–376 ms; no completed lap in three runs → **not used in the race** | Vehicle telemetry plus a recomputation script |
| [SKKU Autonomous Driving Hackathon 2025](https://github.com/choiYhunn/skku-autonomous-driving-hackathon-2025) · 2nd (team) | Integrated parking FSM, Pure Pursuit, curvature-based speed control | Two of three parking missions completed | ROS Noetic simulator |

Also: [2026 Kookmin University Autonomous Driving Competition](https://github.com/choiYhunn/kookmin-autonomous-driving-competition-2026), preliminary round (team) — mission-supervisor reconstruction with 4 unit tests · [Shared Brain Starter](https://github.com/choiYhunn/shared-brain-starter) — Git-backed knowledge-repository starter with 5 unit tests and CI.

## Paper and awards

- "Analysis of Inter-Arrival Jitter in Periodic Control Frames under Different Temporal Structures of Background Traffic in CAN-FD," KSAE 2026 Autumn Conference, 8-page full paper, **submitted**; second author
- 2026 AMET Autonomous Driving Hackathon — Excellence Award (Hyundai Mobis), 4th in preliminaries, 3rd in finals (team)
- 4th SKKU AI Autonomous Driving Competition, AI-Chip division — Bronze Award (team)
- 2025 SKKU Autonomous Driving Hackathon — 2nd place (team)

## Skills

```text
Languages   C · Python · RISC-V assembly · C++ (coursework level)
Memory      Server DDR5 RDIMM platforms · MCA/RAS error registers · address translation · BIOS/MRC training concepts (practicum)
Embedded    Renesas RA6M3/RA6M5 (FSP) · Zynq/PYNQ · ROS/ROS 2 · CAN/CAN-FD · UART · ADC · PWM · Timer/IRQ · MMIO
Methods     Controlled comparison · confound checks · repeated measurement · separating measurements from model outputs
```

## How I publish

- Team results and my own contribution are kept apart; unverified performance, awards, or roles are not claimed.
- Measurements, simulations, and model calculations are labeled as such, with failures and measurement limits.
- Company, joint-research, and teammate material is covered only to the extent publication is confirmed.
