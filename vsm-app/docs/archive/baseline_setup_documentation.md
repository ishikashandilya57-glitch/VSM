# Telemetry & Baseline Configuration Document

## 1. Overview
This document outlines the architecture, configuration mapped data, and logic workflow for automating machine telemetry assignments (RPM, Vibration) and Alert Thresholds on the production floor. 

The goal is to eliminate manual configuration, adapt limits to the active production context dynamically, and ensure precise machine monitoring to detect mechanical deviations accurately.

---

## 2. Automated Pipeline Workflow
The alert system leverages the following sequential logic to dynamically compute the baseline context the moment a machine is allocated to a line:

1. **Machine QR Scan** (Asset Identification)
2. **Line Identification** (Context association)
3. **Loading Plan Reference** (Retrieving production orders)
4. **Style Detection** (Garment type running)
5. **Fabric Type Identification** (The physical material)
6. **Standard RPM & Baseline Assignment** (Automatically calculated limits)
7. **Real-Time Sensor Comparison** (Live hardware data stream)
8. **Deviation Detection** (Mathematical comparison against bounds)
9. **Alert Generation** (Triggered violations)
10. **Diagnosis Support** (CAP & Solution Library)
11. **Maintenance Analytics** (KPI tracking)

---

## 3. Parameter Specifications & Baselines

### 3.1. Temperature Defaults
- **Sensor:** Environmental / Motor Casing Thermistor
- **Threshold Limit:** **Fixed at 40°C**
- **Logic:** Irrespective of machine type, any continuous thermal reading surpassing 40°C indicates alarming friction or electrical fault, immediately generating an `OVERHEATING` alert.

### 3.2. Vibration Limits (Machine-Type Dependent)
Vibration limits are entirely dependent on the physical mechanics of the machine models (e.g., SNLS vs. Overlock). 

**Extraction Logic:**
The system receives the machine's ID strictly through the initial QR scan (e.g., `JUKI-001`). This ID cross-references a backend registry to identify the *Machine Type*, which then sets the rigid vibration limit:

| Machine Type | Analysis Report Baseline | Alert Threshold Value |
| --- | --- | --- |
| **SNLS** | Peak Acceleration = 180.14 m/s² | **> 180 m/s² (~18.3g)** |
| *Other Types* | *TBD (Data collection required)* | *Pending Model Profile* |

*Note: As additional machine types (Kansai, Overlock, SNEC, Feed of arm, DNLS, DNCS) undergo vibration log analysis, their thresholds will be continuously appended to this repository.*

### 3.3. RPM Baselines (Fabric-Type Dependent)
Rather than static manual input, Target RPM limits are driven instantly by the physical requirements of the active **Fabric Type**. 

**Mapping logic used during "Standard RPM Assignment":**

| Fabric Composition / Type | Standard Target RPM |
| :--- | :--- |
| 100% cotton | 3500 |
| 100% linen | 2700 |
| 100% Viscose | 3500 |
| Wrinkle free | 2700 |
| 68% cotton + 30% tencel + 25% elastic(ne) | 2700 |
| CNS (Cotton Nylon Spandex) | 2700 |
| Cotton + 2% Spandex | 2700 |
| Cotton + Linen | 3500 |
| Cotton + Lyocell | 3000 |
| Cotton + Polyester | 3000 |
| Polyester + Viscose | 3000 |
| 100% polyester | 3000 |

*Operation Criticality Caveat: If the specific sewing operation is deemed highly critical, the backend may supply an override. If this occurs, the "Standard Target RPM" is modified directly at runtime.*

---

## 4. Deviation Execution Loop
1. The **Target RPM** and **Vibration Baseline** are locked-in.
2. The real-time telemetry feed ingests `data.rpm`, `data.vibration_mag`, `data.temperature`.
3. If `data.temperature > 40`, trigger `TEMP_HIGH`.
4. If `data.vibration_mag > 18.3g (for SNLS)`, trigger `VIBRATION_CRITICAL`.
5. If `data.rpm > (Target_RPM + Tolerance)`, trigger `TOO_FAST`.
6. If `data.rpm < (Target_RPM - Tolerance)`, trigger `TOO_SLOW`.
