# CAN-FD ringing and SIC

[한국어 / full note](can-fd-ringing-sic.md) · [Korean PDF](can-fd-ringing-sic.pdf)

Public revision of my Automotive Networks literature-analysis assignment. This is not a measured or simulated signal-integrity study. The original questions and personal identifiers are excluded; the public text corrects several unsupported generalizations.

The analysis separates wiring and analog settling, controller sampling, and application-level arrival timing. A jitter trace alone does not identify ringing. A physical-layer hypothesis needs waveform evidence together with error/retransmission records under controlled traffic conditions. My separate CAN-FD study's background-traffic cadence finding should not be reinterpreted as evidence of ringing.

SIC is described through active bus-transition control rather than as a generic RX filter. TDC/SSP concerns transmitter loop-delay compensation and does not remove reflections from the bus. [TI SLLA581A](https://www.ti.com/lit/wp/slla581a/slla581a.pdf), [CiA 601 overview](https://www.can-cia.org/can-knowledge/cia-601-series-can-fd-guidelines-and-recommendations)

The revised note removes universal stub-length/data-rate claims, a claim that payload-front placement guarantees lower control latency, and an unmeasured link from packing density to instability. It identifies the applicable device documentation explicitly: TJA1463 Rev.3.0 describes SIC under ISO 11898-2:2024 parameter set C. I did not test that device. [NXP datasheet](https://www.nxp.com/docs/en/data-sheet/TJA1463.pdf)

The next experiment would hold traffic and transceiver configuration fixed while collecting bus waveforms, error records and timestamps, changing one topology or transceiver factor at a time. That experiment remains planned. The Korean note contains the full correction table and an original conceptual diagram; no course or vendor figures are reproduced.
