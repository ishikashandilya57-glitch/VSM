# Quick Formula Reference - Copy & Paste Ready

## 🎯 Essential Formulas for VSM_execution Sheet

Copy these formulas exactly as shown. Paste in Row 2, then copy down to Row 1000.

---

## 📊 Derived Columns (AL-AO)

### **Column AL: Drv_Wash**
```excel
=IF($G2="","",IF(IFERROR(VLOOKUP($G2,SOP_Drivers!$A:$C,3,FALSE),"N")="Y",$D2,"All"))
```

### **Column AM: Drv_Product**
```excel
=IF($G2="","",IF(IFERROR(VLOOKUP($G2,SOP_Drivers!$A:$B,2,FALSE),"N")="Y",$AK2,"All"))
```

### **Column AN: Drv_OrderType**
```excel
=IF($G2="","",IF(IFERROR(VLOOKUP($G2,SOP_Drivers!$A:$D,4,FALSE),"N")="Y",$AJ2,"All"))
```

### **Column AO: Drv_QtyBand**
```excel
=IF($G2="","",IF(IFERROR(VLOOKUP($G2,SOP_Drivers!$A:$E,5,FALSE),"N")="Y",$AH2,"All"))
```

---

## 🔢 SOP Lead Time

### **Column I: SOP Lead Time (Days) - RECOMMENDED**
```excel
=IF($G2="","",IFERROR(FILTER(SOP_Cal!$J:$J,(TRIM(SOP_Cal!$B:$B)=TRIM($G2))*(TRIM(SOP_Cal!$C:$C)=TRIM($AM2))*(TRIM(SOP_Cal!$D:$D)=TRIM($AL2))*(TRIM(SOP_Cal!$E:$E)=TRIM($AN2))*(TRIM(SOP_Cal!$F:$F)=TRIM($AO2))),0))
```

**Alternative (if FILTER doesn't work):**
```excel
=IF($G2="","",IFERROR(INDEX(SOP_Cal!$J:$J,MATCH(1,(SOP_Cal!$B:$B=$G2)*(SOP_Cal!$C:$C=$AM2)*(SOP_Cal!$D:$D=$AL2)*(SOP_Cal!$E:$E=$AN2)*(SOP_Cal!$F:$F=$AO2),0)),0))
```

**Simple (Process Stage only):**
```excel
=IF($G2="","",IFERROR(VLOOKUP($G2,SOP_Cal!$B:$J,9,FALSE),0))
```

---

## 📅 Target Dates

### **Column J: Target Start Date**
```excel
=IF($K2="","",$K2-$I2)
```

### **Column K: Target End Date**
```excel
=IF($B2="","",IF($F2=MAX(FILTER($F:$F,$B:$B=$B2)),$E2,INDEX($J:$J,MATCH($F2+1,FILTER($F:$F,$B:$B=$B2),0))))
```

**Simpler version (if above doesn't work):**
```excel
=IF($J2="","",$J2+$I2)
```

---

## 📊 Status & Metrics

### **Column N: Process Status**
```excel
=IF($M2="","Not Started",IF($M2<=$K2,"Completed - On Time","Completed - Delayed"))
```

### **Column O: Process Time (Days)**
```excel
=IF(AND($L2<>"",$M2<>""),DAYS($M2,$L2),0)
```

### **Column P: Variance (Days)**
```excel
=IF($M2="",$K2-TODAY(),DAYS($M2,$K2))
```

### **Column Q: Delay Reason Category**
```excel
=IF($P2<=0,"On Time",IF($P2<=2,"Minor Delay",IF($P2<=5,"Moderate Delay","Major Delay")))
```

### **Column R: Alert Triggered**
```excel
=IF($P2>2,"Yes","No")
```

### **Column S: Delay Flag**
```excel
=IF($P2>0,"Yes","No")
```

### **Column U: Risk Level**
```excel
=IF($P2>7,"High",IF($P2>3,"Medium","Low"))
```

---

## 🚀 Setup Steps

1. **Open VSM_execution sheet**
2. **Click on cell AL2** → Paste Drv_Wash formula
3. **Click on cell AM2** → Paste Drv_Product formula
4. **Click on cell AN2** → Paste Drv_OrderType formula
5. **Click on cell AO2** → Paste Drv_QtyBand formula
6. **Click on cell I2** → Paste SOP Lead Time formula (RECOMMENDED version)
7. **Click on cell J2** → Paste Target Start Date formula
8. **Click on cell K2** → Paste Target End Date formula
9. **Click on cell N2** → Paste Process Status formula
10. **Click on cell O2** → Paste Process Time formula
11. **Click on cell P2** → Paste Variance formula
12. **Click on cell Q2** → Paste Delay Reason Category formula
13. **Click on cell R2** → Paste Alert Triggered formula
14. **Click on cell S2** → Paste Delay Flag formula
15. **Click on cell U2** → Paste Risk Level formula

16. **Select all cells with formulas in Row 2** (AL2:AO2, I2:K2, N2:U2)
17. **Copy** (Ctrl+C)
18. **Select range Row 3 to Row 1000**
19. **Paste** (Ctrl+V)

---

## 🔍 Testing

After setup, test with this data in Row 2:

| Column | Value |
|--------|-------|
| A2 | DBR_L1 |
| B2 | TEST/25/001 |
| C2 | ORD001 |
| G2 | Cutting |
| L2 | 2026-01-15 |
| M2 | 2026-01-17 |

**Expected Results:**
- AL2, AM2, AN2, AO2 should show values (not blank)
- I2 should show a number (SOP LT)
- J2, K2 should show dates
- N2 should show "Completed - On Time" or "Completed - Delayed"
- O2 should show 2 (days)
- P2 should show variance
- Q2, R2, S2, U2 should show status values

---

## ⚠️ Troubleshooting

### If SOP LT (I2) shows 0:

1. **Check derived columns** - AL2, AM2, AN2, AO2 should have values
2. **Check SOP_Cal sheet** - Must have data in columns B-F and J
3. **Check for spaces** - "Cutting " ≠ "Cutting"
4. **Try simple formula** - Use the "Simple (Process Stage only)" version
5. **Add debug column** - In AQ2: `=$G2&"|"&$AM2&"|"&$AL2&"|"&$AN2&"|"&$AO2`
6. **Check SOP_Cal** - Manually find if this combination exists

### If Target Dates show errors:

1. **Check if I2 has value** - Target dates depend on SOP LT
2. **Check if E2 has Delivery Date** - Required for calculations
3. **Check if F2 has Process Seq** - Required for ordering
4. **Use simpler formulas** - Try the "Simpler version" alternatives

---

## 📞 Need Help?

If formulas still don't work:

1. Check SOP_Drivers sheet structure (columns A-E)
2. Check SOP_Cal sheet structure (columns B-F and J)
3. Verify no blank cells in key columns
4. Check for extra spaces or special characters
5. Try formulas one by one (start with derived columns)

---

## ✅ Success Checklist

- [ ] All formulas pasted in Row 2
- [ ] Formulas copied down to Row 1000
- [ ] Test data entered
- [ ] Derived columns (AL-AO) show values
- [ ] SOP LT (I) shows number
- [ ] Target dates (J, K) show dates
- [ ] Status columns (N-U) show values
- [ ] No #REF! or #N/A errors
- [ ] Apps Script deployed
- [ ] Web App URL in .env.local
- [ ] Test via app successful

---

## 🎉 You're Done!

Once all formulas work:
1. Delete test data
2. Test via the app
3. Check dashboard
4. Enjoy your automated system!

