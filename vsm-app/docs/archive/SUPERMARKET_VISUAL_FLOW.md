# 🏬 Supermarket Visual Flow Diagram

## Complete Production Flow with Supermarkets (Q1 Example)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION TIMELINE                              │
└─────────────────────────────────────────────────────────────────────────┘

Day 0                                                              Day 32.65
│                                                                         │
├─────────┬─────┬─────┬─────┬─────┬──────────┬──────────┬─────┬─────────┤
│ Fabric  │ QC  │File │Pre  │CAD  │ CUTTING  │ SEWING   │Wash │Finish   │
│ Inhouse │     │Rel  │Prod │     │          │          │     │+Inspect │
│ 2 days  │1 day│1 day│2 day│0.5d │  4.9 d   │  4.85 d  │5 d  │ 4.4 d   │
└─────────┴─────┴─────┴─────┴─────┴──────────┴──────────┴─────┴─────────┘
                                    │          │          │     │
                                    │          │          │     │
                                    ▼          ▼          ▼     ▼
                              ┌──────────┐┌──────────┐┌──────────┐
                              │   SM1    ││   SM2    ││   SM4    │
                              │ 2.2 days ││  3 days  ││ 0.6 days │
                              │(in Cut)  ││(after Cut)│(in Finish)│
                              └──────────┘└──────────┘└──────────┘
                                           │   SM3    │
                                           │  3 days  │
                                           │(after Sew)│
                                           └──────────┘
```

---

## Detailed Breakdown: Cutting Process (4.9 days)

```
┌─────────────────────────────────────────────────────────────┐
│                    CUTTING PROCESS (4.9 days)                │
└─────────────────────────────────────────────────────────────┘

Day 0                                                    Day 4.9
│                                                             │
├──────────────┬──────────────────┬──────────────────────────┤
│   NNVA-Prep  │   Supermarket 1  │         VA (Cutting)     │
│   0.8 days   │    2.2 days      │        1.9 days          │
│              │                  │                          │
│ Fabric Issue │  Queue/Waiting   │   Blade-on-fabric        │
│ + Relaxation │  before cutting  │   Pure cutting time      │
└──────────────┴──────────────────┴──────────────────────────┘
     NNVA             NVA                    VA
   (Column L)      (Column M)             (Column K)

Total: 0.8 + 2.2 + 1.9 = 4.9 days ✅
```

### After Cutting Finishes:

```
┌─────────────────────────────────────────────────────────────┐
│              INTER-PROCESS WIP (6 days)                      │
└─────────────────────────────────────────────────────────────┘

Day 4.9                                              Day 10.9
│                                                          │
├──────────────────────────┬───────────────────────────────┤
│    Supermarket 2         │      Supermarket 3            │
│    3 days                │      3 days                   │
│                          │                               │
│  Cutting WIP             │   Sewing WIP                  │
│  (Material waiting       │   (Material waiting           │
│   after cutting)         │    before sewing)             │
└──────────────────────────┴───────────────────────────────┘
      NOT in Cutting SOP          NOT in Sewing SOP
      ADDED separately            ADDED separately
```

---

## Detailed Breakdown: Sewing Process (4.85 days)

```
┌─────────────────────────────────────────────────────────────┐
│                    SEWING PROCESS (4.85 days)                │
└─────────────────────────────────────────────────────────────┘

Day 10.9                                              Day 15.75
│                                                             │
├──────────────┬──────────────────┬──────────────────────────┤
│   NNVA-Prep  │   Internal Queue │         VA (Sewing)      │
│   0.8 days   │    2.2 days      │        1.85 days         │
│              │                  │                          │
│ Setup +      │  Internal sewing │   Pure sewing time       │
│ Material     │  queue/batching  │   Needle-on-fabric       │
│ handling     │                  │                          │
└──────────────┴──────────────────┴──────────────────────────┘
     NNVA             NVA                    VA
   (Column L)      (Column M)             (Column K)

Total: 0.8 + 2.2 + 1.85 = 4.85 days ✅

NOTE: Supermarket 2 and 3 are BEFORE this process starts
      They are NOT part of Sewing's 4.85 days
```

---

## Detailed Breakdown: Finishing Process (2.4 days)

```
┌─────────────────────────────────────────────────────────────┐
│                  FINISHING PROCESS (2.4 days)                │
└─────────────────────────────────────────────────────────────┘

Day 28                                                Day 30.4
│                                                             │
├──────────────┬──────────────────┬──────────────────────────┤
│   NNVA-Prep  │   Supermarket 4  │      VA (Finishing)      │
│   0.8 days   │    0.6 days      │        1.0 days          │
│              │                  │                          │
│ Setup +      │  Finishing WIP   │   Pure finishing time    │
│ Material     │  (1 day buffer)  │   Actual finishing work  │
│ handling     │                  │                          │
└──────────────┴──────────────────┴──────────────────────────┘
     NNVA             NVA                    VA
   (Column L)      (Column M)             (Column K)

Total: 0.8 + 0.6 + 1.0 = 2.4 days ✅
```

---

## Summary Table: Where Supermarkets Come From

| Supermarket | Source | Value (Q1) | Location in Flow |
|-------------|--------|------------|------------------|
| **SM1** | Cutting NVA (Column M) | 2.2 days | Inside Cutting SOP (before blade touches fabric) |
| **SM2** | Hardcoded constant | 3.0 days | AFTER Cutting ends, BEFORE Sewing starts |
| **SM3** | Hardcoded constant | 3.0 days | AFTER Sewing ends, BEFORE next process |
| **SM4** | Finishing NVA (Column M) | 0.6 days | Inside Finishing SOP (WIP buffer) |

---

## Total Lead Time Calculation

```
Process SOP Lead Times (from SOP_Cal Column J):
  Fabric Inhouse:    2.0 days
  Fabric QC:         1.0 days
  File Release:      1.0 days
  Pre-Production:    2.0 days
  CAD/Pattern:       0.5 days
  Cutting:           4.9 days  ← Contains SM1 (2.2d)
  Sewing:            4.85 days
  Washing:           5.0 days
  Finishing:         2.4 days  ← Contains SM4 (0.6d)
  Inspection:        2.0 days
  Dispatch:          1.0 days
  ─────────────────────────
  Total Process SOP: 26.65 days

Inter-Process WIP (NOT in SOP_Cal):
  Supermarket 2:     3.0 days  ← Added between Cutting and Sewing
  Supermarket 3:     3.0 days  ← Added after Sewing
  ─────────────────────────
  Total Inter-WIP:   6.0 days

FINAL TOTAL LEAD TIME:
  Process SOP + Inter-WIP = 26.65 + 6.0 = 32.65 days ✅
```

---

## Key Insights:

1. **SM1 and SM4 are INSIDE their process SOP** (already counted in Column J)
2. **SM2 and SM3 are OUTSIDE all process SOPs** (added on top)
3. **Nothing is deducted** - we only READ and DISPLAY the breakdown
4. **Total Lead Time = Process SOP + Inter-Process WIP**

This is why your actual tables show:
- Cutting Sub Total: 4.9 days (includes SM1)
- Sewing Super market+WIP: 3 days (this is SM2+SM3 combined in your table)
- Sewing: 1.85 days (pure VA)
- Finishing WIP: 1 day (this is SM4)

**The code correctly reads and displays this breakdown!** 🎯
