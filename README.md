# 최용훈 (Yong Hoon Choi)

[한국어](README.md) | [English](README.en.md)

**메모리 신뢰성 · 시스템 검증 · 임베디드/저수준 소프트웨어**

성균관대학교 전자전기공학부 학부생이며, 2026년 8월부터 삼성전자 DS부문 메모리사업부 DRAM Solution팀에서 서버 DDR5 RDIMM 시스템 검증 장기현장실습을 하고 있습니다. 관심 있는 질문은 **"오류 레지스터나 OS 기록이 실제 DRAM 이벤트를 어디까지 정확히 말해 주는가, 그리고 그 결론을 확인하려면 어떤 독립 측정이 필요한가"**입니다.

| 한눈에 | |
|---|---|
| 지금 | 서버 DDR5 RDIMM 플랫폼 검증과 Linux 메모리 오류 관측 경로 (실습) |
| 직접 다룬 하드웨어 | 실 서버 보드·DDR5 RDIMM 실장 구성 · Renesas RA6M3/RA6M5 · Zynq/PYNQ(Ultra96-V2) · Raspberry Pi 5 · PCAN-USB FD · 오실로스코프 |
| 직접 다룬 소프트웨어 | C (Linux user-space, MCU 펌웨어) · Python (trace 분석, 테스트) · RISC-V assembly · ROS/ROS 2 |
| 가장 강한 결과 | CAN-FD: 전략을 고정하고 배경 gap만 238→240 µs로 바꿔도 지터 26.4→56.8 µs (n=3) — 초기 전략 비교가 교란이었음을 보이고 KSAE Full Paper 제출 |
| 진행 중 | Linux machine-check 이벤트 수집 프로토타입 (미배포) |

## 현재: 삼성전자 DS 메모리사업부 DRAM Solution팀 장기현장실습 (2026.08 – )

서버 DDR5 RDIMM bring-up, 실장 구성별 시험, RAS 오류 분석을 합니다. 회사 코드·로그·레지스터 덤프·시험 조건·플랫폼 이름은 어떤 공개 저장소에도 넣지 않으며, 아래는 공개 가능한 개념 수준으로 일반화한 설명입니다.

| 구분 | 내용 |
|---|---|
| 직접 구현·검증 | Linux machine-check 이벤트 reader를 기존 플랫폼별 컨트롤러 오류 디코더와 연결하는 C 프로토타입. reader blocking과 필드 해석 불일치를 디버깅했고, 이벤트 방식과 polling 방식을 capture mode·계수 단위를 맞춰 비교해 두 방식의 관측 수 차이가 오류 손실이 아니라 계수 단위 차이에서 온다는 것을 확인했습니다. **검증 중인 프로토타입이며 배포된 도구가 아닙니다.** |
| 기존 코드 분석·디버깅 | Linux MCA 기록 → 컨트롤러 오류 레지스터 스냅샷 → 기존 위치 디코더로 이어지는 경로와, 메모리 테스트의 패턴 → 컨트롤러 → 오류 보고 흐름을 추적했습니다. 디코딩 전에 레코드의 유효성·중복·최신성·출처를 확인하고, 모호하거나 오래된 스냅샷은 디코딩 결과를 그대로 믿지 않고 따로 조사했습니다. |
| 보드에서 직접 한 시험 | 실제 서버 시험 환경에서 보드·CPU·DIMM 실장 구성을 바꿔 가며 slot/channel 맵과 부팅·training 상태를 확인했고, 차이를 DIMM 탓으로 돌리기 전에 시작 조건과 실장 구성의 영향을 먼저 비교했습니다. 시험 구성, 이벤트 출처, parser 회귀 fixture, 반복성 확인을 기록합니다. |
| 문서·소스로 학습 | reference manual·datasheet로 오류 레지스터 bitfield(validity, parity, detail field), CPU 세대별 레이아웃 차이, 시스템 주소 → 논리 channel/DIMM/rank/bank/row/column 변환 구조, PCI configuration·MMIO·MSR 접근 경로를 해석했습니다. BIOS/MRC의 host–RCD–DRAM CA·DQ/DQS training, PI/Vref sweep, eye/margin centering도 공부했으며 MRC 펌웨어를 맡은 것은 아닙니다. |
| 아직 검증되지 않은 것 | 디코딩된 DQ·위치가 실제 DRAM cell 결함 위치와 같은지(물리적 ground truth로 보지 않음) · 소프트웨어가 요청한 메모리 접근, 측정된 컨트롤러 활동, 실제 row 단위 DRAM command 노출 사이의 대응 · 덮어써지거나 오래된 오류 레코드를 판별하는 기준 |

## 대표 프로젝트

| 프로젝트 | 내가 한 일 | 확인된 결과 | 근거의 종류 |
|---|---|---|---|
| [CAN-FD 신호 패킹 타이밍](https://github.com/choiYhunn/canfd-signal-packing-timing-evaluation) · 학부연구 2026 | Python trace 파싱·QC·지터 통계, 비교 조건 감사 (firmware·배선은 팀 작업) | 초기 전략 차이 37.7 µs가 배경 gap 차이와 겹친 비교였음을 확인. gap 230–250 µs sweep에서 지터가 비단조적으로 변하는 동안 재구성 점유율은 1 pp 안쪽 | RA6M5 3-node 실측, PCAN trace. 핵심 수치는 공개 CSV로 재계산 가능 |
| [RA6M3 Microprocessor Lab](https://github.com/choiYhunn/ra6m3-microprocessor-lab) · A+ | 5-state 엘리베이터 FSM, P/N/D/R 변속 제어(히스테리시스), 보드 원본 소스와 portable C11 재구성 | TCU·엘리베이터 host assertion test 통과 (`-std=c11 -Werror`) | host test. 보드 타이밍은 범위 밖 |
| [RISC-V Pipeline Hazard Study](https://github.com/choiYhunn/riscv-pipeline-hazard-study) · A+ | forwarding 없는 5-stage에서 GCD 루프 hazard 분석, 명령어 재배치 | **121 → 115 cycles**, 명령어 61개 동일 (CPI 1.98 → 1.89) | Ripes 시뮬레이션, 제출 당시 화면 첨부 |
| [AI-Chip 자율주행 차량](https://github.com/choiYhunn/skku-ai-chip-autonomous-driving-2026) · 동상(팀) | 카메라 → DPU → 조향 → MMIO PWM 실행 구조 통합, ADC 피드백 보정, 실차 반복 시험 | 주행 3위로 주차 단계 진출, 주차는 초음파 미검출로 실패(원인 미확정), 종합 5위 | 실차. 공개 코드는 본인 작성 런타임 + PC 재구성본(test 3개) |
| [AMET YOLO26n 후보](https://github.com/choiYhunn/amet-2026-orange-lane-detector) · 팀 우수상 | 라벨링 → Colab 학습 → ONNX 배포 → 실차 지연 측정 | 차량 CPU 추론 p50 318–376 ms, 실차 3런 모두 미완주 → **레이스에 쓰지 않음** | 실차 텔레메트리 + 재계산 스크립트 |
| [SKKU 자율주행 해커톤 2025](https://github.com/choiYhunn/skku-autonomous-driving-hackathon-2025) · 2위(팀) | 주차 FSM, Pure Pursuit, 곡률 기반 속도 제어 통합 | 주차 3개 중 2개 완료 | ROS Noetic 시뮬레이터 |

그 외: [국민대 자율주행 경진대회 2026](https://github.com/choiYhunn/kookmin-autonomous-driving-competition-2026) 예선 참가(팀) — mission supervisor 재구성 코드와 unit test 4개 · [Shared Brain Starter](https://github.com/choiYhunn/shared-brain-starter) — Git 기반 지식 저장소 starter, unit test 5개와 CI.

## 논문과 수상

- 「CAN-FD 환경에서 배경 트래픽 시간 구조에 따른 주기 제어 프레임 도착 간격 지터 분석」, 2026 한국자동차공학회 추계학술대회 Full Paper 8쪽, **제출(Submitted)**, 2저자
- 2026 AMET 자율주행 해커톤 우수상(현대모비스상), 예선 4위 · 본선 3위 — 팀
- 제4회 성균관대학교 AI 자율주행 경진대회 AI칩 부문 동상 — 팀
- 2025 성균관대학교 자율주행 해커톤 2위 — 팀

## 기술

```text
Languages   C · Python · RISC-V assembly · C++ (수업 수준)
Memory      서버 DDR5 RDIMM 플랫폼 · MCA/RAS 오류 레지스터 · 주소 변환 · BIOS/MRC training 개념 (실습)
Embedded    Renesas RA6M3/RA6M5 (FSP) · Zynq/PYNQ · ROS/ROS 2 · CAN/CAN-FD · UART · ADC · PWM · Timer/IRQ · MMIO
Methods     통제 비교 · 교란변수 점검 · 반복 측정 · 측정값과 모델값 구분
```

## 공개 원칙

- 팀 결과와 개인 기여를 나누고, 확인되지 않은 성능·수상·역할은 쓰지 않습니다.
- 실측, 시뮬레이션, 모델 계산을 구분하고 실패와 측정 한계를 함께 적습니다.
- 회사·공동연구·팀원 자료는 공개 권한이 확인된 범위만 다룹니다.
