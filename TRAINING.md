# 교육·실습 기록

[프로필](README.md) · [English](TRAINING.en.md)

이수한 전공 과목과 외부 실습 교육을 **무엇을 배웠고, 실제로 무엇을 만들었고, 어디까지 확인됐는지** 기준으로 정리했습니다. 수강했다는 사실과 직접 구현했다는 사실은 구분합니다.

| 표시 | 뜻 |
|---|---|
| 수료 확인 | 수료증이 있음 (개인정보가 있어 파일은 공개하지 않음) |
| 참여 | 배포 자료·실습 환경으로 참여는 확인되지만 수료증은 없음 |
| 본인 산출물 | 제가 작성했음을 원본으로 확인한 코드·보고서 |

## 배운 것이 어디로 이어졌나

```mermaid
flowchart LR
    VN["차량용네트워크"] --> CF["CAN-FD 3-node 측정"] --> CFV["PCAN 실측<br/>논문 제출"]
    ML["마이크로프로세서실험"] --> WL["레지스터 과제<br/>TCU·엘리베이터 FSM"] --> WLV["보드 채점<br/>host test"]
    ML --> PQ["PYNQ MMIO·PWM 통합"] --> PQV["실차 주행 3위"]
    CA["컴퓨터구조"] --> RV["GCD 명령어 재배치"] --> RVV["Ripes 121→115"]
```

외부 실습 교육(Zonal, 차량용 이더넷, AUTOSAR 등)은 이 그림에 넣지 않았습니다. 본인 구현으로 이어졌다는 근거가 남아 있지 않기 때문입니다.

## Zonal E/E Architecture 워크숍

성균관대학교 자동화연구실 · 미래차 부트캠프 단기강좌 · 2026-07-06 ~ 07-08 (3일) · **참여**

HPC 한 대와 4개 Zone이 CAN과 Ethernet으로 연결된 소형 Zonal 테스트베드에서, 센서·조향·구동 명령이 ECU → Zone 제어기 → HPC로 오가는 흐름을 단계별로 구성했습니다. 아래 구조는 워크숍이 배포한 최종 소스(`project/`)에서 확인한 내용입니다. 소스 자체는 워크숍 제공 코드라 재배포하지 않습니다.

```mermaid
flowchart LR
    HPC["HPC"] <-->|"raw Ethernet<br/>EtherType 0x88B5"| ZCU["Zone 제어기 ×4<br/>Raspberry Pi · Python<br/>SocketCAN can0 500 kbit/s"]
    ZCU <-->|"CAN 500 kbit/s"| ECU["Zone ECU ×4<br/>Arduino · FreeRTOS<br/>MCP2515 (SPI)"]
    ECU --> ACT["조향 모터 (Zone 1)<br/>구동 모터 (Zone 2–4)"]
    SEN["초음파 · 가변저항"] --> ECU
```

**Zone별 CAN ID**

| Zone | 역할 | 명령 | 센서 | Heartbeat | 기타 |
|---|---|---:|---:|---:|---|
| 1 | 전방·조향 | `0x11` | `0x13` | `0x14` | 조향 피드백 `0x12` |
| 2 | 우측·구동 | `0x21` | `0x23` | `0x24` | |
| 3 | 좌측·구동 | `0x31` | `0x33` | `0x34` | |
| 4 | 후방·구동 | `0x41` | `0x43` | `0x44` | |

**Zone 제어기 ↔ HPC 프레임**: EtherType `0x88B5`, payload `!4sBBBBHB8s` = magic `ZCAN` · version 1 · 메시지 종류 · 출발 Zone · 도착 Zone · CAN ID · DLC · 데이터 8바이트. Zone 제어기는 세 스레드로 동작합니다.
- 1초 주기 keepalive
- CAN → HPC: 자기 Zone의 센서·heartbeat·피드백 ID만 전달
- HPC → CAN: 출발 Zone이 HPC(0)이고, 도착 Zone·메시지 종류·명령 ID가 맞는 프레임만 CAN으로 송신

**ECU (FreeRTOS)**: 제어 태스크(우선순위 4), 센서 태스크(3, 100 ms), heartbeat 태스크(5, 50 ms)가 mutex로 CAN 접근을 나눕니다. Heartbeat 상태 비트는 alive `0x01`, 센서 이상 `0x02`, 구동기 이상 `0x04`, CAN 오류 `0x08`입니다. Zone 1은 조향 명령의 크기를 12°로 제한하고, 엔코더 없이 1°당 65 ms 구동하는 시간 기반 방식으로 조향합니다.

**실습 단계**: ECU 1개 브리지(명령이 1초 끊기면 모터 정지) → 3 Zone → 4 Zone + 카메라 스트리밍 → 카메라 전용 → 최종 4 Zone CAN/Ethernet 브리지.

**확인된 본인 작업**
- 4개 Zone 제어기 실행 절차 기록: `python3-can` 설치, `sudo python3 zcu.py --zone <n>`, 카메라 실험용 Wayland 디스플레이 설정
- 실험 5에서 Zone 1 ECU에 초음파 거리 직렬 출력 1줄 추가(07-07). 배포본과 비교했을 때 남아 있는 유일한 소스 변경입니다. 같은 시기 최종 배포본은 "응답 없음(4000)"을 센서 고장이 아닌 범위 밖 값으로 처리하도록 바뀌어 있었습니다.

**확인하지 못한 것**: 자율주차 과제의 완료 여부, 통신 지연·신뢰성 측정, 최종 4-Zone 구성에서 명령이 끊겼을 때의 정지 동작(실험 3에만 1초 timeout이 있음), HPC 쪽 애플리케이션, 실제 배선. 조향 반전·배선 극성 같은 당시 디버깅 기억은 소스 근거가 없어 적지 않았습니다.

## 외부 실습 교육

| 교육 | 기간 · 상태 | 다룬 내용 | 하드웨어·도구 | 남은 본인 산출물 |
|---|---|---|---|---|
| 차량용 이더넷 (미래차 부트캠프) | 2026-06-30 ~ 07-02 · 참여 | 차량 내부 Ethernet, Ethernet–CAN 변환, VLAN 보안, TSN(PTP·TAS), Wireshark 분석 | Renesas RA6M3 평가보드, Kvaser | 없음 — 남은 캡처는 배포 예제뿐 |
| 차량용 임베디드 SW 플랫폼 (AUTOSAR) | 2025-12 · 참여 | Classic AUTOSAR 계층(SWC·RTE·BSW·MCAL), EB tresos 기반 ECU 구성 | EB tresos | 없음 — 설정 산출물이 남아 있지 않음. AUTOSAR ECU를 구현했다는 뜻이 아닙니다 |
| 차량용 임베디드 시스템 | 2026-01-26 ~ 02-07 · 참여 | Register/HAL, 인터럽트, FND, DC 모터 | Renesas RA6M3, e² studio/FSP | 없음 — 로컬 실습 소스가 배포본과 같음. 직접 작성한 RA6M3 코드는 [마이크로프로세서실험](https://github.com/choiYhunn/ra6m3-microprocessor-lab)에 있음 |
| 모빌리티 ROS2 핵심입문 | 2026-02-05 ~ 06 · 참여 | ROS 2 노드·토픽, 카메라·센서 패키지, YOLO 입문 | ROS 2 | 없음 |
| H-Mobility Class (현대자동차 NGV, 온라인) | 2026-04-20 ~ 06-26 · **수료 확인** | 자율주행 통신 및 네트워크 18시간: CAN/CAN-FD/CAN-XL, LIN, Automotive Ethernet·TSN, 게이트웨이·AUTOSAR 통신, UDS·XCP, V2X, UWB · 카인사이드아웃 D 14시간: 자동차 구조 | — | 기본교육 수료(심화과정은 아님). 과제는 시나리오 서술형 |

## 전공 과목

| 과목 | 직접 한 것 | 근거의 종류 |
|---|---|---|
| 마이크로프로세서실험 (RA6M3) | 주차별 과제를 레지스터 수준으로 구현([skeleton 대비 변경분](https://github.com/choiYhunn/ra6m3-microprocessor-lab/tree/main/weekly_labs)), TCU·엘리베이터 FSM | 보드 제출·채점, FSM은 host test |
| 컴퓨터구조론 | forwarding 없는 5-stage에서 GCD 루프 hazard 분석·재배치 ([저장소](https://github.com/choiYhunn/riscv-pipeline-hazard-study)) | Ripes 시뮬레이션 121→115 cycles |
| 차량용네트워크 (대학원 번호 과목) | 보고서 「What is Ringing? — CAN-FD 관련」: 임피던스 불연속과 반사, 스텁·종단·샘플 포인트·TDC/SSP, SIC 트랜시버 | 문헌 분석. 측정·시뮬레이션 아님 (보고서는 개인정보가 있어 비공개) |
| 스마트카공학개론 | 논문 과제 「자율주행 시스템에서 AI 인지와 실시간 제어 구조의 발전 동향」: 센서 퓨전, AI 반도체와 메모리 병목, 차량 내부 네트워크 | 문헌 분석 (비공개) |
| 제어공학, 전자회로1, 신호및시스템 | 수강 | 공개할 본인 산출물 없음 |

**진행 중**: 반도체소자회로설계및시스템 융합트랙(마이크로디그리) — 2027-2까지 이수 예정이며 아직 수료가 아닙니다.

## 공개하지 않는 것

강의 교안·영상·대본, 워크숍과 수업이 배포한 실습 코드와 정답, 기출 자료, 다른 학생의 자료, 상용 도구와 설치 파일, 수료증·성적표 등 개인정보가 담긴 파일.
