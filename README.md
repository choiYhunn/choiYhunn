# 최용훈 (Yong Hoon Choi)

[한국어](README.md) | [English](README.en.md)

**Memory Systems · Embedded / Low-Level Software · Experimental Validation**

성균관대학교 전자전기공학부 학부생입니다. 2026년 8월부터 삼성전자 DS부문 메모리사업부 DRAM Solution팀에서 장기현장실습으로 서버 DRAM 모듈·시스템 검증 업무를 하고 있습니다.

MCU 펌웨어, CAN-FD 계측 실험, FPGA SoC 차량 통합을 거쳐 지금은 Linux 서버에서 메모리 오류가 하드웨어 ECC → 메모리 컨트롤러 → 커널 → 디코더를 거쳐 보고되는 경로를 다루고 있습니다. 관심 있는 질문은 **"관측된 기록이 실제 하드웨어 동작의 증거로서 어디까지 유효한가"**, 그리고 **"그 차이를 줄이려면 어떤 통제 실험이 필요한가"**입니다.

## 현재: 삼성전자 DS · DRAM Solution 장기현장실습 (2026.08 – 현재)

Intel/AMD 서버 플랫폼, DDR5 RDIMM, Linux 기반 메모리 테스트와 오류 관측을 다룹니다. 아래는 공개 가능한 수준으로 일반화한 설명이며, 회사 코드·로그·데이터는 어떤 공개 저장소에도 포함하지 않습니다.

- **구현** — C로 Linux machine-check(MCE) 알림을 user-space reader로 전달해 기존 컨트롤러 오류 디코더와 연결하는 이벤트 기반 오류 경로를 만들었습니다. 현재 검증 중인 프로토타입이며 정식 배포된 도구가 아닙니다.
- **검증** — 디코딩 전에 오류 기록의 유효성·중복·최신성·출처를 확인하고, 이벤트 방식과 polling 방식의 관측 수 차이가 손실이 아니라 서로 다른 계수 단위에서 온다는 점을 추적했습니다.
- **학습** — BIOS/MRC training, DDR5 DIMM 구성, MCA/RAS 오류 보고, 시스템 주소와 DRAM 논리 좌표 사이의 변환을 소스와 문서로 공부하고 있습니다.

## 연구 경험: CAN-FD 주기 프레임 타이밍 검증 (학부연구 URP, 2026)

Renesas RA6M5 3-node CAN-FD 환경과 PCAN-USB FD trace로 신호 패킹 전략에 따른 주기 제어 프레임의 도착 간격 지터를 비교했습니다. 저는 Python trace 파싱·품질 점검·통계 분석과 비교 조건 감사를 맡았습니다.

처음 보인 전략 간 지터 차이가 배경 트래픽 생성 간격 차이와 함께 바뀐 비교였다는 점을 찾아, 동일 조건 재측정과 간격 sweep, 리셋·측정 순서를 바꾼 반복 측정으로 결론을 **"평균 버스 점유율만으로 타이밍 조건이 같다고 볼 수 없다"**로 수정했습니다. 2026 한국자동차공학회 추계학술대회 Full Paper로 **제출(Submitted)**했으며 저는 공동저자입니다. 초기 캠페인의 Python 파서·QC·통계 코드, 실험 firmware(사용자 작성분)와 그림은 [canfd-signal-packing-timing-evaluation](https://github.com/choiYhunn/canfd-signal-packing-timing-evaluation)에 있습니다. 원본 trace는 공개하지 않습니다.

## 공개 프로젝트

**[RA6M3 Microprocessor Lab](https://github.com/choiYhunn/ra6m3-microprocessor-lab)** — Bare-metal MCU 제어 로직
엘리베이터 제어기(5-state FSM, IRQ·timer·PWM·UART·CAN)와 교육용 변속 제어기의 애플리케이션 로직을 portable C11로 분리했습니다. `gcc -std=c11 -Werror` host test로 로직을 재현할 수 있습니다. 보드 타이밍·배선은 host test 범위 밖입니다.

**[2026 AI-Chip 자율주행 차량](https://github.com/choiYhunn/2026-autonomous-driving-hackathon-portfolio/tree/main/%EA%B5%90%EB%82%B4_%EC%9E%90%EC%9C%A8%EC%A3%BC%ED%96%89_AI_Chip_%EC%84%A4%EA%B3%84%EB%8C%80%ED%9A%8C_%EC%A7%84%ED%96%89%EC%A4%91%28%EC%B5%9C%EC%9A%A9%ED%9B%88%29)** — PYNQ/Zynq HW-SW 통합 · AI칩 부문 동상(팀)
카메라 → DPU 추론 → 조향 제어 → MMIO PWM으로 이어지는 실행 구조 통합, ADC 피드백 기반 보정과 반복 실차 시험을 맡았습니다. 주행 3위로 주차 단계에 진출했지만 주차는 초음파 미검출로 실패했고 원인은 미확정입니다. 제가 맡은 runtime 부분(차선 미검출 처리, 주행/주차 모드 자원 수명주기, 비차단 주행 녹화)은 보드 없이 PC에서 돌아가는 코드와 테스트로 공개했고, 팀원 알고리즘·교육용 baseline·모델·FPGA 산출물은 제외했습니다.

**[2025 SKKU 자율주행 해커톤](https://github.com/choiYhunn/skku-autonomous-driving-hackathon-2025)** — ROS 주행·주차 제어 · 2위(팀)
ROS Noetic 시뮬레이터에서 전면·평행 주차 FSM, Pure Pursuit, 곡률 기반 속도 제어를 통합했습니다. 대회 제공 환경과 본인 커밋을 구분해 두었습니다.

**[Shared Brain Starter](https://github.com/choiYhunn/shared-brain-starter)** — 소프트웨어 엔지니어링 사이드 프로젝트
여러 AI 도구가 같은 프로젝트 맥락을 이어 쓰도록 Git 기반 지식 저장소를 만드는 starter입니다. importer·validator를 단위 테스트와 E2E 스모크 테스트로 CI에서 검증합니다. 개인 기록은 포함하지 않습니다.

그 외: 2026 AMET 자율주행 해커톤(Raspberry Pi 5 · ROS 2, 우수상·현대모비스상, 팀) — 직접 라벨링·학습한 YOLO26n 후보를 차량에서 측정한 추론 지연(중앙값 약 374 ms) 때문에 레이스 빌드에서 제외했습니다. 팀 저장소가 비공개라 링크하지 않습니다. 2026 국민대학교 자율주행 경진대회 예선(ROS2 시뮬레이터, 팀)에도 참가했습니다 — [mission supervisor 재구성 코드](https://github.com/choiYhunn/kookmin-autonomous-driving-competition-2026).

## 기술

```text
Languages   C · Python · RISC-V assembly · C++ (수업 수준)
Systems     Linux · Git · DDR5 RDIMM 서버, BIOS/MRC, MCA/RAS (실습 중 학습)
Embedded    Renesas RA6M3/RA6M5 (FSP) · Zynq/PYNQ · ROS/ROS 2
Interfaces  CAN/CAN-FD (PCAN-USB FD) · UART · ADC · PWM · Timer/IRQ · MMIO
Methods     통제 비교 · 교란변수 점검 · 반복 측정 · 관측/추정 구분
```

## 수상

- 2026 AMET 자율주행 해커톤 우수상(현대모비스상), 본선 3위 — 팀
- 제4회 성균관대학교 AI 자율주행 경진대회 AI칩 부문 동상 — 팀
- 2025 성균관대학교 자율주행 해커톤 2위 — 팀

## 공개 원칙

- 팀 결과와 개인 기여를 구분하고, 확인되지 않은 성능·수상·역할은 쓰지 않습니다.
- 시뮬레이션 결과와 실제 하드웨어 검증을 구분하고, 실패와 측정 한계를 함께 기록합니다.
- 회사·공동연구·팀원 자료는 공개 권한이 확인된 범위만 설명합니다.
