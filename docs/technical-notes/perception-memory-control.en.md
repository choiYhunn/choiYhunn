# Memory movement and the vehicle control path

[한국어 / full note](perception-memory-control.md) · [Korean PDF](perception-memory-control.pdf)

Rewritten public technical note based on my Smart Car Engineering literature assignment. The original five-page submission contained externally sourced figures and a school email address. This version uses new prose and an original conceptual diagram. It is coursework analysis, not a published research paper or an implementation result.

The note follows sensor acquisition, preprocessing and memory movement, inference, control decisions, network delivery and actuator output. Compute throughput alone cannot establish end-to-end timing. Eyeriss provides a concrete research example of data reuse and memory hierarchy considered together with accelerator computation; its results are not my measurements. [Eyeriss, ISCA 2016](https://people.csail.mit.edu/emer/media/papers/2016.06.isca.eyeriss_architecture.pdf)

The questions differ by layer: timestamp alignment for sensing, profiling for memory/inference, explicit responsibilities for HPC–zone–ECU integration, and independent tests for invalid input and communication loss. A survey of autonomous-driving deep learning provides context for comparing perception and control approaches. [Grigorescu et al.](https://arxiv.org/abs/1910.07738)

TSN profiles also require concrete configuration and verification. IEEE 802.1DG addresses automotive Ethernet profiles; my workshop's raw-Ethernet/CAN bridge is not evidence of a TSN implementation. [IEEE 802.1DG](https://1.ieee802.org/tsn/802-1dg/)

My Zonal, CAN-FD, RA6M3 and RISC-V projects share a practical question: what operation was requested, what was observed, and which claim does the evidence support? This coursework informs that system view without becoming a claim of DRAM/CXL implementation or safety certification. The revised note excludes generic quantization speedup numbers, unsupported safety guarantees and all third-party figures.
