/**
 * VSM Execution System - ABSOLUTE GOD MODE ENGINE
 * Version: 3.5.1 (HARDCODED FALLBACK OVERRIDE)
 * 
 * ⚠️ MASTER UPDATE:
 * Enhanced payload mapping: UI-enriched data is directly inserted into sheet to fix missing fields. Fallbacks used minimally.
 */

'use strict';

const VERSION = "3.6.2"; 
const SHEET_VSM_EXEC  = 'VSM_Execution';
const SHEET_SOP_CAL   = 'SOP_Cal';
const SHEET_ORD_MSTR  = 'Order_Master';
const SHEET_HOLIDAYS  = 'Holidays';

const PROCESS_SEQUENCE = [
  { seq: 1,  stage: 'Fabric Inhouse',  group: 'pre'  },
  { seq: 2,  stage: 'Fabric QC',       group: 'pre'  },
  { seq: 3,  stage: 'File Release',    group: 'anchor' },
  { seq: 4,  stage: 'Pre-Production',  group: 'post' },
  { seq: 5,  stage: 'CAD / Pattern',   group: 'post' },
  { seq: 6,  stage: 'Cutting',         group: 'post' },
  { seq: 7,  stage: 'Sewing',          group: 'post' },
  { seq: 8,  stage: 'Washing',         group: 'post' },
  { seq: 9,  stage: 'Finishing',       group: 'post' },
  { seq: 10, stage: 'Inspection',      group: 'post' },
  { seq: 11, stage: 'Dispatch',        group: 'post' }
];

function doGet(e) {
  try {
    if (!e || !e.parameter) throw new Error('Invalid request');
    switch (e.parameter.action) {
      case 'getOcNumbers': return createSuccessResponse(getOcNumbersAction(), 'Fetched');
      case 'getIntegratedData': return getIntegratedProductionData(e.parameter.limit);
      case 'health': return createSuccessResponse(getHealthData(), 'Healthy');
      case 'debug_mapping': 
          const ss = SpreadsheetApp.getActiveSpreadsheet();
          return createSuccessResponse({
             vsm: getHeaderMapping_CI(ss.getSheetByName(SHEET_VSM_EXEC)),
             om: getHeaderMapping_CI(ss.getSheetByName(SHEET_ORD_MSTR))
          }, 'Debug');
      case 'calculate': {
          const oNo = String(e.parameter.ocNo || '').trim().toUpperCase();
          const pStageRaw = String(e.parameter.processStage || '').trim();
          const pStage = pStageRaw.replace(/^\d+[\s\-]+/, '').trim();
          const pType = String(e.parameter.productType || 'All');
          const oType = String(e.parameter.orderType || 'All');
          
          const calc = calculateTimeline_New(oNo, oType, pType);
          if (!calc.success) throw new Error(calc.error);
          
          const cProc = calc.timeline ? calc.timeline.find(t => String(t.stage).toUpperCase() === pStage.toUpperCase()) : null;
          
          return createSuccessResponse({
            orderDetails: {
              ocNo: oNo,
              washCategory: calc.washCategory,
              deliveryDate: calc.deliveryDate,
              qtyOrder: calc.qtyOrder,
              qtyBand: calc.qtyBand,
              productType: calc.productType,
              orderType: calc.orderType
            },
            currentProcess: cProc ? {
               stage: cProc.stage,
               sopLt: cProc.sopLt,
               targetStart: cProc.targetStart,
               targetEnd: cProc.targetEnd
            } : null,
            allProcesses: calc.timeline,
            timeline: calc.timeline,
            steps: calc.steps || []
          }, 'Calculated');
      }
      case 'getOCsByStageAndDateRange': {
          const stage = String(e.parameter.processStage || '').trim();
          const pStage = stage.replace(/^\d+[\s\-]+/, '').trim();
          const start = e.parameter.startDate;
          const end = e.parameter.endDate;
          return createSuccessResponse(getOCsByStageAndDateRange(pStage, start, end), 'Queue fetched');
      }
      default: throw new Error(`Unknown action: ${e.parameter.action}`);
    }
  } catch (error) { return createErrorResponse(error, 'doGet'); }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('No data');
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'bulkRepair') return handleBulkRepair(data.ocs);
    
    validateParams(data, ['ocNo', 'processStage', 'actualStartDate']);
    const ocNo = String(data.ocNo).trim().toUpperCase();
    
    // UI sometimes sends "3 File Release". We must strip the prefix to match master sequences.
    let rawStage = String(data.processStage).trim();
    const stage = rawStage.replace(/^\d+[\s\-]+/, '').trim();
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_VSM_EXEC);
    const cols = getHeaderMapping_CI(sheet);

    const calc = calculateTimeline_New(ocNo, 'All', 'All');
    if (!calc.success) throw new Error(calc.error);

    let targetRow = findTaskRow_Dynamic(sheet, ocNo, stage, cols);
    const isNewRow = targetRow === -1;
    if (isNewRow) targetRow = sheet.getLastRow() + 1;

    // ERP-style Fixed 50 columns
    const TOTAL_COLS = Math.max(50, sheet.getLastColumn());
    const range = sheet.getRange(targetRow, 1, 1, TOTAL_COLS);
    const rowValues = isNewRow ? new Array(TOTAL_COLS).fill('') : range.getValues()[0];
    
    setFields_CI(rowValues, cols, ocNo, calc, stage, data);
    range.setValues([rowValues]);
    
    // Auto-update target dates ONLY for existing processes (do NOT append missing ones)
    syncCalculatedData_CI(sheet, ocNo, calc, cols);
    SpreadsheetApp.flush();
    
    return createSuccessResponse({ version: VERSION, ocNo }, 'Task saved successfully');
  } catch (error) { return createErrorResponse(error, 'doPost'); }
}

function getHealthData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const vsm = ss.getSheetByName(SHEET_VSM_EXEC);
  const om = ss.getSheetByName(SHEET_ORD_MSTR);
  
  const vsmData = vsm ? vsm.getRange(2, 1, Math.max(1, vsm.getLastRow() - 1), vsm.getLastColumn()).getValues() : [];
  const vsmCols = getHeaderMapping_CI(vsm);
  const vsmOcIdx = vsmCols['OC NO'] ? vsmCols['OC NO'] - 1 : -1;
  const uniqueOcsVsm = new Set();
  if (vsmOcIdx !== -1) vsmData.forEach(r => { if (r[vsmOcIdx]) uniqueOcsVsm.add(String(r[vsmOcIdx]).trim().toUpperCase()); });

  const omData = om ? om.getRange(2, 1, Math.max(1, om.getLastRow() - 1), om.getLastColumn()).getValues() : [];
  const omCols = om ? getHeaderMapping_CI(om) : {};
  const omOcIdx = (omCols['OC NO'] || omCols['OC NO.']) ? (omCols['OC NO'] || omCols['OC NO.']) - 1 : -1;
  const uniqueOcsOm = new Set();
  if (omOcIdx !== -1) omData.forEach(r => { if (r[omOcIdx]) uniqueOcsOm.add(String(r[omOcIdx]).trim().toUpperCase()); });

  return { 
    version: VERSION, 
    status: 'healthy',
    ssName: ss.getName(),
    ssId: ss.getId(),
    vsmRowCount: vsm ? vsm.getLastRow() : 0,
    vsmUniqueOcs: uniqueOcsVsm.size,
    omUniqueOcs: uniqueOcsOm.size,
    lastUpdate: new Date().toISOString()
  };
}

function getIntegratedProductionData(limit) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_VSM_EXEC);
  if (!sheet) return createErrorResponse(new Error(`Sheet ${SHEET_VSM_EXEC} not found`), 'getIntegrated');
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return createSuccessResponse({ columns: [], rows: [] }, 'Empty Sheet');

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const maxRowsToRead = limit ? Math.min(limit, lastRow - 1) : (lastRow - 1);
  const startRow = Math.max(2, lastRow - maxRowsToRead + 1);
  const numRows = lastRow - startRow + 1;
  
  // Strategy: Read from bottom up if a limit is provide, or read all
  const data = sheet.getRange(startRow, 1, numRows, lastCol).getValues();
  
  const cols = {};
  headers.forEach((h, i) => { cols[String(h).trim().toUpperCase()] = i; });

  const SIXH_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
  const cutoffTime = new Date().getTime() - SIXH_DAYS_MS;

  // Use a faster loop and avoid creating objects inside filter if possible
  const filteredData = [];
  const statusIdx = cols['PROCESS STATUS'];
  const aeIdx = cols['ACTUAL END DATE'];
  const teIdx = cols['TARGET END DATE'];

  for (let i = data.length - 1; i >= 0; i--) {
    const r = data[i];
    const status = String(r[statusIdx] || '').trim().toUpperCase();
    
    let keep = status.includes('IN PROGRESS') || status === 'NOT STARTED';
    
    if (!keep && aeIdx !== undefined) {
      const aeDateRaw = r[aeIdx];
      if (aeDateRaw instanceof Date) {
        if (aeDateRaw.getTime() > cutoffTime) keep = true;
      } else if (aeDateRaw) {
        const d = new Date(aeDateRaw);
        if (!isNaN(d.getTime()) && d.getTime() > cutoffTime) keep = true;
      }
    }
    
    if (!keep && teIdx !== undefined) {
      const teDateRaw = r[teIdx];
      if (teDateRaw instanceof Date) {
        if (teDateRaw.getTime() > cutoffTime) keep = true;
      }
    }

    if (keep) filteredData.push(r);
    
    // Hard limit on returned results for the dashboard to prevent 150s timeouts
    if (limit && filteredData.length >= limit) break;
  }

  const wlpOcs = getMasterOcList();

  return createSuccessResponse({
    columns: headers.map(h => String(h || '').trim()),
    rows: filteredData.reverse(), // Restore original order
    wlpOcs: wlpOcs,
    totalRecords: lastRow - 1,
    filteredCount: filteredData.length,
    version: VERSION
  }, 'Dashboard Data Aggregated (Optimized v4)');
}

function getMasterOcList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const om = ss.getSheetByName(SHEET_ORD_MSTR);
  if (!om) return [];
  const cols = getHeaderMapping_CI(om);
  const lastRow = om.getLastRow();
  if (lastRow < 2) return [];
  const data = om.getRange(2, 1, lastRow - 1, om.getLastColumn()).getValues();
  const ocIdx = (cols['OC NO'] || cols['OC NO.'] || 3) - 1;
  const lineIdx = (cols['LINE'] || 2) - 1;
  const prodIdx = (cols['PRODUCT TYPE'] || 0) - 1;
  const delIdx = (cols['NEW DEL'] || 8) - 1;
  
  // Use a map to ensure unique OCs and take the most recent record
  const ocMap = new Map();
  data.forEach(r => {
    const oc = String(r[ocIdx] || '').trim().toUpperCase();
    if (!oc) return;
    const delDateRaw = r[delIdx];
    const delDate = delDateRaw instanceof Date ? delDateRaw : (delDateRaw ? new Date(delDateRaw) : null);
    
    ocMap.set(oc, {
      ocNo: oc,
      lineNo: String(r[lineIdx] || ''),
      productType: prodIdx >= 0 ? String(r[prodIdx] || 'All') : 'All',
      deliveryDate: (delDate && !isNaN(delDate.getTime())) ? delDate.toISOString() : ''
    });
  });
  
  return Array.from(ocMap.values());
}


function getProcessStatusAction(ocNo) {
  if (!ocNo) return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_VSM_EXEC);
  if (!sheet) return [];
  const cols = getHeaderMapping_CI(sheet);
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const search = String(ocNo).trim().toUpperCase();
  const results = [];
  
  const ocIdx = (cols['OC NO'] || 2) - 1;
  const stageIdx = (cols['PROCESS STAGE'] || 7) - 1;
  const seqIdx = (cols['PROCESS SEQ'] || 6) - 1;
  const aStartIdx = (cols['ACTUAL START DATE'] || 12) - 1;
  const aEndIdx = (cols['ACTUAL END DATE'] || 13) - 1;
  const statusIdx = (cols['PROCESS STATUS'] || 14) - 1;
  
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][ocIdx]).trim().toUpperCase() === search) {
      const aStart = parseDate_New(data[i][aStartIdx]);
      const aEnd = parseDate_New(data[i][aEndIdx]);
      results.push({
        processStage: String(data[i][stageIdx] || ''),
        processSeq: Number(data[i][seqIdx]) || 0,
        actualStartDate: aStart ? new Date(aStart).toISOString() : '',
        actualEndDate: aEnd ? new Date(aEnd).toISOString() : '',
        processStatus: String(data[i][statusIdx] || '')
      });
    }
  }
  return results;
}

function handleBulkRepair(ocs) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_VSM_EXEC);
  const cols = getHeaderMapping_CI(sheet);
  const results = [];

  ocs.forEach(oc => {
    const search = String(oc).trim().toUpperCase();
    const calc = calculateTimeline_New(search, 'All', 'All');
    if (!calc.success) { results.push(`❌ ${search}: NOT FOUND`); return; }

    writeTimelineToSheet_New(sheet, search, calc, cols);
    results.push(`✔ ${search}: REBUILT & SYNCED`);
  });
  SpreadsheetApp.flush();
  return createSuccessResponse({ version: VERSION, results }, 'Bulk Repair Completed');
}

function writeTimelineToSheet_New(sheet, ocNo, calc, cols) {
  // Sync any existing rows with new calculations
  syncCalculatedData_CI(sheet, ocNo, calc, cols);

  // Generate missing process stages
  const existingStages = getExistingStages_CI(sheet, ocNo, cols);
  const newRows = [];
  
  PROCESS_SEQUENCE.forEach(p => {
    if (!existingStages.has(String(p.stage).toUpperCase())) {
      // ── Build a 50-column row array (ONE batch write per row) ────────────────
      const TOTAL_COLS = Math.max(50, sheet.getLastColumn());
      const rowData = new Array(TOTAL_COLS).fill('');
      
      setFields_CI(rowData, cols, ocNo, calc, p.stage, {});
      newRows.push(rowData);
    }
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }
}

function getHeaderMapping_CI(sheet) {
  if (!sheet) return {};
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return {};
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  headers.forEach((h, i) => { 
    if (h) { 
      const name = String(h).trim().toUpperCase();
      const stripped = name.replace(/\s+/g, ''); // Foolproof matching
      map[name] = i + 1; 
      map[stripped] = i + 1; // Map stripped version (e.g. WASHCATEGORY)
      
      // Explicit fallbacks for known troublesome headers
      if (stripped === 'LINENO.' || stripped === 'LINENO' || stripped === 'LINE') {
         map['LINE NO.'] = i + 1;
         map['LINE NO'] = i + 1;
         map['LINE'] = i + 1;
      }
      if (stripped === 'WASHCATEGORY' || stripped === 'WASH') map['WASH CATEGORY'] = i + 1;
      if (stripped === 'DELIVERYDATE' || stripped === 'DELDATE') map['DELIVERY DATE'] = i + 1;
      if (stripped === 'PROCESSSTATUS' || stripped === 'STATUS') map['PROCESS STATUS'] = i + 1;
      if (stripped === 'SOPLEADTIME' || stripped === 'SOPLT') map['SOP LEAD TIME'] = i + 1;
      if (stripped === 'TARGETENDDATE') map['TARGET END DATE'] = i + 1;
      if (stripped === 'ACTUALENDDATE') map['ACTUAL END DATE'] = i + 1;
      if (stripped === 'ORDERQTY' || stripped === 'QUANTITY') map['ORDER QTY'] = i + 1;
      if (stripped === 'PROCESSSTAGE' || stripped === 'STAGE') map['PROCESS STAGE'] = i + 1;
      if (stripped === 'ACTUALSTARTDATE') map['ACTUAL START DATE'] = i + 1;
      if (stripped === 'TARGETSTARTDATE') map['TARGET START DATE'] = i + 1;
      if (stripped === 'PROCESSSEQ') map['PROCESS SEQ'] = i + 1;
      
      // Supermarkets
      if (stripped === 'SM1' || stripped === 'SUPERMARKET1') map['SM1'] = i + 1;
      if (stripped === 'SM2' || stripped === 'SUPERMARKET2') map['SM2'] = i + 1;
      if (stripped === 'SM3' || stripped === 'SUPERMARKET3') map['SM3'] = i + 1;
      if (stripped === 'SM4' || stripped === 'SUPERMARKET4') map['SM4'] = i + 1;
      if (stripped === 'SM5' || stripped === 'SUPERMARKET5') map['SM5'] = i + 1;
      if (stripped === 'SM6' || stripped === 'SUPERMARKET6') map['SM6'] = i + 1;
      if (stripped === 'TOTALSUPERMARKET' || stripped === 'TOTALSM' || stripped === 'TOTAL_SM' || stripped === 'TOTAL') map['TOTAL SUPERMARKET'] = i + 1;
      if (stripped === 'VATIME' || stripped === 'VA_TIME' || stripped === 'VALUEADDTIME') map['VA TIME'] = i + 1;
      if (stripped === 'NVATIME' || stripped === 'NVA_TIME' || stripped === 'NONVALUEADDTIME') map['NVA TIME'] = i + 1;
      if (stripped === 'NNVATIME' || stripped === 'NNVA_TIME') map['NNVA TIME'] = i + 1;
      
      // UI / Calculated extra fields
      if (stripped === 'DELAYREASON') map['DELAY REASON'] = i + 1;
      if (stripped === 'DELAYREMARK' || stripped === 'REMARK') map['DELAY REMARK'] = i + 1;
      if (stripped === 'ACTUALQUANTITY' || stripped === 'QTYACHIEVEDTODAY' || stripped === 'QUANTITYACHIEVED' || stripped === 'ACHIEVEDQTY') map['ACTUAL QUANTITY'] = i + 1;
      if (stripped === 'REVISEDQTY' || stripped === 'REVISEDQUANTITY') map['REVISED QTY'] = i + 1;
      if (stripped === 'INSPECTIONRECEIVEDQTY' || stripped === 'QTYRECEIVED' || stripped === 'RECEIVEDQTY') map['INSPECTION RECEIVED QTY'] = i + 1;
      if (stripped === 'TOTALQTY' || stripped === 'CUMACHIEVED' || stripped === 'CUMULATIVEQTY') map['TOTAL QTY'] = i + 1;
      if (stripped === 'WIPQTY' || stripped === 'WIPQUANTITY') map['WIP QTY'] = i + 1;
      if (stripped === 'VANVA' || stripped === 'VA/NVA') map['VA / NVA'] = i + 1;
      if (stripped === 'RISKLEVEL' || stripped === 'RISK') map['RISK LEVEL'] = i + 1;
      if (stripped === 'VARIANCE') map['VARIANCE'] = i + 1;
      if (stripped === 'DELAYCATEGORY') map['DELAY CATEGORY'] = i + 1;
      if (stripped === 'ALERT') map['ALERT'] = i + 1;
      if (stripped === 'DELAYFLAG') map['DELAY FLAG'] = i + 1;
      if (stripped === 'ORDERTYPE') map['ORDER TYPE'] = i + 1;
      if (stripped === 'PRODUCTTYPE' || stripped === 'PRODUCT') map['PRODUCT TYPE'] = i + 1;
    } 
  });
  return map;
}

function setVal_CI(arr, colIndex, val) { if (colIndex && colIndex > 0) arr[colIndex - 1] = val; }

function setFields_CI(row, cols, oc, calc, stage, data) {
  setVal_CI(row, cols['FACTORY NAME'] || 0, data.factory || '');
  setVal_CI(row, cols['OC NO'] || 2, oc);
  setVal_CI(row, cols['LINE NO.'] || 1, data.lineNo || (calc ? calc.lineNo : ''));
  setVal_CI(row, cols['ORDER NO'] || 3, data.orderNo || ''); // ERP logic checks orderNo
  setVal_CI(row, cols['WASH CATEGORY'] || 4, data.washCategory || (calc ? calc.washCategory : '') || '');
  setVal_CI(row, cols['DELIVERY DATE'] || 5, parseDate_New(data.deliveryDate || (calc ? calc.deliveryDate : '')));
  setVal_CI(row, cols['PROCESS STAGE'] || 7, stage);
  
  if (data.actualStartDate) setVal_CI(row, cols['ACTUAL START DATE'] || 12, parseDate_New(data.actualStartDate));
  if (data.actualEndDate) setVal_CI(row, cols['ACTUAL END DATE'] || 13, parseDate_New(data.actualEndDate));

  if (data.delayReason) setVal_CI(row, cols['DELAY REASON'], data.delayReason);
  if (data.delayRemark) setVal_CI(row, cols['DELAY REMARK'], data.delayRemark);
  if (data.actualQuantity !== undefined) setVal_CI(row, cols['ACTUAL QUANTITY'], data.actualQuantity);
  if (data.revisedQty !== undefined) setVal_CI(row, cols['REVISED QTY'], data.revisedQty);
  if (data.inspectionReceivedQty !== undefined) setVal_CI(row, cols['INSPECTION RECEIVED QTY'], data.inspectionReceivedQty);
  if (data.cumAchieved !== undefined) setVal_CI(row, cols['TOTAL QTY'], data.cumAchieved);
  if (data.wipQty !== undefined) setVal_CI(row, cols['WIP QTY'], data.wipQty);
  if (data.orderType) setVal_CI(row, cols['ORDER TYPE'], data.orderType);
  if (data.productType) setVal_CI(row, cols['PRODUCT TYPE'], data.productType);

  const plan = (calc && calc.timeline) ? calc.timeline.find(t => String(t.stage).toUpperCase() === String(stage).toUpperCase()) : null;

  if (plan) {
    setVal_CI(row, cols['VA TIME'] || 31, plan.va);
    setVal_CI(row, cols['NVA TIME'] || 32, plan.nnva + plan.nva);
    setVal_CI(row, cols['NNVA TIME'], plan.nnva);
  }

  if (data.targetStartDate) setVal_CI(row, cols['TARGET START DATE'] || 10, parseDate_New(data.targetStartDate));
  else if (plan) setVal_CI(row, cols['TARGET START DATE'] || 10, new Date(plan.targetStart));

  if (data.targetEndDate) setVal_CI(row, cols['TARGET END DATE'] || 11, parseDate_New(data.targetEndDate));
  else if (plan) setVal_CI(row, cols['TARGET END DATE'] || 11, new Date(plan.targetEnd));

  if (data.sopLeadTime !== undefined) setVal_CI(row, cols['SOP LEAD TIME'] || 9, data.sopLeadTime);
  else if (plan) setVal_CI(row, cols['SOP LEAD TIME'] || 9, plan.sopLt);

  if (data.processSeq !== undefined) setVal_CI(row, cols['PROCESS SEQ'] || 6, data.processSeq);
  else if (plan) setVal_CI(row, cols['PROCESS SEQ'] || 6, plan.seq);

  if (data.vaNva) setVal_CI(row, cols['VA / NVA'] || 8, data.vaNva);
  else if (plan) setVal_CI(row, cols['VA / NVA'] || 8, plan.va > 0 ? 'VA' : 'NVA');

  // Persist Supermarkets logic removed - deriving in Dashboard instead
  
  recalculateRowData_CI(row, cols);
}

function syncCalculatedData_CI(sheet, oc, calc, cols) {
  const lastRow = sheet.getLastRow(); if (lastRow < 2) return;
  const lastCol = sheet.getLastColumn();
  const range = sheet.getRange(2, 1, lastRow - 1, lastCol);
  const data = range.getValues();
  const search = String(oc).trim().toUpperCase();
  let changed = false;

  for (let i = 0; i < data.length; i++) {
    if (String(data[i][(cols['OC NO'] || 2) - 1]).trim().toUpperCase() === search) {
      setVal_CI(data[i], cols['LINE NO.'] || 1, calc.lineNo);
      setVal_CI(data[i], cols['WASH CATEGORY'] || 4, calc.washCategory || 'Non-Wash');
      setVal_CI(data[i], cols['DELIVERY DATE'] || 5, parseDate_New(calc.deliveryDate));
      
      const stage = String(data[i][(cols['PROCESS STAGE'] || 7) - 1]).toUpperCase();
      const plan = calc.timeline.find(t => String(t.stage).toUpperCase() === stage);
      if (plan) {
        setVal_CI(data[i], cols['TARGET START DATE'] || 10, new Date(plan.targetStart));
        setVal_CI(data[i], cols['TARGET END DATE'] || 11, new Date(plan.targetEnd));
        setVal_CI(data[i], cols['SOP LEAD TIME'] || 9, plan.sopLt);
        setVal_CI(data[i], cols['PROCESS SEQ'] || 6, plan.seq);
        
        setVal_CI(data[i], cols['VA TIME'] || 31, plan.va);
        setVal_CI(data[i], cols['NVA TIME'] || 32, plan.nnva + plan.nva);
        
        // Sync Supermarkets logic removed
        
        recalculateRowData_CI(data[i], cols);
      }
      changed = true;
    }
  }
  if (changed) range.setValues(data);
}

function recalculateRowData_CI(row, cols) {
  const tEndRaw = row[(cols['TARGET END DATE'] || 11) - 1];
  const aEndRaw = row[(cols['ACTUAL END DATE'] || 13) - 1];
  const aStartRaw = row[(cols['ACTUAL START DATE'] || 12) - 1];
  
  // Graceful date parsing (Google Sheets might return numbers or strings)
  const tEnd = tEndRaw ? new Date(tEndRaw) : null;
  const aEnd = aEndRaw ? new Date(aEndRaw) : null;
  const aStart = aStartRaw ? new Date(aStartRaw) : null;
  
  let status = 'Not Started';
  if (aEnd && !isNaN(aEnd)) {
    status = (tEnd && aEnd <= tEnd) ? 'Completed - On Time' : 'Completed - Delayed';
  } else if (aStart && !isNaN(aStart)) {
    status = 'In Progress';
  }
  
  let pTime = 0; if (aStart && aEnd && !isNaN(aEnd) && !isNaN(aStart)) pTime = Math.ceil((aEnd - aStart) / 86400000);
  let variance = 0;
  if (aEnd && tEnd && !isNaN(aEnd) && !isNaN(tEnd)) {
    variance = Math.ceil((aEnd - tEnd) / 86400000);
  } else if (tEnd && !isNaN(tEnd)) {
    variance = Math.ceil((new Date().setHours(0,0,0,0) - tEnd.setHours(0,0,0,0)) / 86400000);
  }
  
  const delayCategory = variance <= 0 ? 'On Time' : variance <= 2 ? 'Minor Delay' : variance <= 5 ? 'Moderate Delay' : 'Major Delay';
  const alert = variance > 2 ? 'Yes' : 'No';
  const delayFlag = variance > 0 ? 'Yes' : 'No';
  const riskLevel = variance > 7 ? 'High' : (variance > 3 ? 'Medium' : 'Low');

  setVal_CI(row, cols['PROCESS STATUS'] || 14, status);
  setVal_CI(row, cols['PROCESS TIME'] || 15, pTime);
  setVal_CI(row, cols['VARIANCE'] || 16, variance);
  setVal_CI(row, cols['DELAY CATEGORY'], delayCategory);
  setVal_CI(row, cols['ALERT'], alert);
  setVal_CI(row, cols['DELAY FLAG'], delayFlag);
  setVal_CI(row, cols['RISK LEVEL'] || 21, riskLevel);
}

function calculateTimeline_New(ocNo, oType, pType) {
  const order = getOrderDetails_Dynamic(ocNo);
  if (!order) return { success: false, error: `OC ${ocNo} not in sheets - V:${VERSION}` };
  
  const finalPType = (pType && pType !== 'All') ? pType : (order.productType || 'All');
  const finalOType = (oType && oType !== 'All') ? oType : (order.orderType || 'All');
  
  const supermarkets = { sm1: 0, sm2: 0, sm3: 0, sm4: 0, sm5: 0, sm6: 0, total: 0 };
  const frDate = new Date(order.effectiveFileReleaseDate); frDate.setHours(0,0,0,0);
  const h = getHolidays();
  const timeline = [];
  let steps = [];

  const logSkips = (skips) => {
    skips.forEach(s => {
      const dateRange = `[${Utilities.formatDate(new Date(s.date), "GMT+5:30", "dd/MM")}]`;
      steps.push(`🗓️ Holiday Skip: ${s.date} (${s.reason}) ${dateRange}`);
    });
  };

  // 1. Calculate Backwards: Pre-production stages anchored to File Release
  let bDate = new Date(frDate);
  const preStages = PROCESS_SEQUENCE.filter(p => p.group === 'pre').reverse();
  
  // SM1: Pre-production Wait
  const sm1Res = getSkippedDaysFull(bDate, 0, h, -1);
  const sm1Range = `[${Utilities.formatDate(sm1Res.finalDate, "GMT+5:30", "dd/MM")}]`;
  steps.push(`🔋 Supermarket 1: Pre-Production Wait ${sm1Range}`);
  
  preStages.forEach(p => {
    const sop = lookupSopLt(p.stage, finalPType, order.washCategory, finalOType, order.qtyBand);
    const end = new Date(bDate); 
    const result = getSkippedDaysFull(bDate, sop.sopLt, h, -1);
    const start = result.finalDate;
    
    timeline.unshift({ stage: p.stage, seq: p.seq, ...sop, targetStart: start, targetEnd: end });
    
    if (sop.sopLt > 0) {
      const matchTrace = `(${sop.matchLevel}: ${finalPType} / ${order.washCategory} / ${finalOType} / ${order.qtyBand})`;
      const dateRange = `[${Utilities.formatDate(start, "GMT+5:30", "dd/MM")} - ${Utilities.formatDate(end, "GMT+5:30", "dd/MM")}]`;
      steps.push(`⬇️ ${p.stage}: ${sop.sopLt} days ${dateRange} ${matchTrace} (VA: ${sop.va} + NNVA: ${sop.nnva} + NVA: ${sop.nva})`);
      logSkips(result.skipped); 
    } else {
      steps.push(`🗓️ Skip: ${p.stage} (No time allocated)`);
    }
    bDate = new Date(start);
  });

  // 2. Anchor: File Release
  timeline.push({ stage: 'File Release', seq: 3, targetStart: frDate, targetEnd: frDate, sopLt: 0 });
  steps.push(`⚓ Anchor: File Release [${Utilities.formatDate(frDate, "GMT+5:30", "dd/MM/yyyy")}]`);

  // 3. Calculate Forwards: Post-production stages
  let fDate = new Date(frDate);
  const postStages = PROCESS_SEQUENCE.filter(p => p.group === 'post');
  
  postStages.forEach(p => {
    let sop = lookupSopLt(p.stage, finalPType, order.washCategory, finalOType, order.qtyBand);
    
    // SM2 logic: Before Cutting
    if (p.stage === 'Cutting' && sop.nva > 0) {
      const sm2Res = getSkippedDaysFull(fDate, sop.nva, h, 1);
      const sm2End = sm2Res.finalDate;
      const dateRange = `[${Utilities.formatDate(fDate, "GMT+5:30", "dd/MM")} - ${Utilities.formatDate(sm2End, "GMT+5:30", "dd/MM")}]`;
      steps.push(`🔋 Supermarket 2: Pre-Cutting Buffer (${sop.nva} days) ${dateRange}`);
      logSkips(sm2Res.skipped);
      fDate = sm2End;
      supermarkets.sm2 = sop.nva;
    }

    const start = new Date(fDate); 
    const adjSop = sop.sopLt - (p.stage === 'Cutting' ? sop.nva : (p.stage === 'Finishing' ? (sop.nva || 0) : 0));
    const result = getSkippedDaysFull(fDate, adjSop, h, 1);
    const end = result.finalDate;
    
    timeline.push({ stage: p.stage, seq: p.seq, ...sop, targetStart: start, targetEnd: end });
    
    if (sop.sopLt > 0) {
      const matchTrace = `(${sop.matchLevel}: ${finalPType} / ${order.washCategory} / ${finalOType} / ${order.qtyBand})`;
      const dateRange = `[${Utilities.formatDate(start, "GMT+5:30", "dd/MM")} - ${Utilities.formatDate(end, "GMT+5:30", "dd/MM")}]`;
      steps.push(`⬆️ ${p.stage}: ${sop.sopLt} days ${dateRange} ${matchTrace} (VA: ${sop.va} + NNVA: ${sop.nnva})`);
      logSkips(result.skipped);
    } else {
      steps.push(`🗓️ Skip: ${p.stage} ${matchTrace}`);
    }
    fDate = new Date(end);
    
    // SM5 logic: Finishing WIP
    if (p.stage === 'Finishing' && sop.nva > 0) {
      const sm5Res = getSkippedDaysFull(fDate, sop.nva, h, 1);
      const sm5End = sm5Res.finalDate;
      const dateRange = `[${Utilities.formatDate(fDate, "GMT+5:30", "dd/MM")} - ${Utilities.formatDate(sm5End, "GMT+5:30", "dd/MM")}]`;
      steps.push(`🔋 Supermarket 5: Finishing WIP (${sop.nva} days) ${dateRange}`);
      logSkips(sm5Res.skipped);
      fDate = sm5End;
      supermarkets.sm5 = sop.nva;
    }

    // Fixed Supermarkets
    if (p.stage === 'Cutting') {
      const sm3Result = getSkippedDaysFull(fDate, 3, h, 1);
      const sm3End = sm3Result.finalDate;
      const dateRange = `[${Utilities.formatDate(fDate, "GMT+5:30", "dd/MM")} - ${Utilities.formatDate(sm3End, "GMT+5:30", "dd/MM")}]`;
      steps.push(`🔋 Supermarket 3: Cutting WIP (3 days) ${dateRange}`);
      logSkips(sm3Result.skipped);
      fDate = sm3End; supermarkets.sm3 = 3;
    }
    if (p.stage === 'Sewing') {
      const sm4Result = getSkippedDaysFull(fDate, 3, h, 1);
      const sm4End = sm4Result.finalDate;
      const dateRange = `[${Utilities.formatDate(fDate, "GMT+5:30", "dd/MM")} - ${Utilities.formatDate(sm4End, "GMT+5:30", "dd/MM")}]`;
      steps.push(`🔋 Supermarket 4: Sewing WIP (3 days) ${dateRange}`);
      logSkips(sm4Result.skipped);
      fDate = sm4End; supermarkets.sm4 = 3;
    }
    if (p.stage === 'Finishing') {
      const sm6Result = getSkippedDaysFull(fDate, 1, h, 1);
      const sm6End = sm6Result.finalDate;
      const dateRange = `[${Utilities.formatDate(fDate, "GMT+5:30", "dd/MM")} - ${Utilities.formatDate(sm6End, "GMT+5:30", "dd/MM")}]`;
      steps.push(`🔋 Supermarket 6: Cartoning (1 day) ${dateRange}`);
      logSkips(sm6Result.skipped);
      fDate = sm6End; supermarkets.sm6 = 1;
    }
  });

  supermarkets.total = supermarkets.sm1 + supermarkets.sm2 + supermarkets.sm3 + supermarkets.sm4 + supermarkets.sm5 + supermarkets.sm6;

  // FINAL POLISH: Chronological Sorting & Deduplication
  const extractDate = (s) => {
    // Matches [dd/mm] or [dd/mm/yyyy]
    const m = s.match(/\[(\d{2})\/(\d{2})(?:\/(\d{4}))?/);
    if (!m) return 0; // Unknown date items at bottom
    
    const day = Number(m[1]);
    const mon = Number(m[2]) - 1;
    const year = m[3] ? Number(m[3]) : 2026;
    return new Date(year, mon, day).getTime();
  };
  
  steps = [...new Set(steps)].sort((a, b) => extractDate(a) - extractDate(b));

  return { success: true, ...order, timeline, steps, supermarkets };
}

function getSkippedDaysFull(s, n, h, direction) {
  let d = new Date(s); d.setHours(0,0,0,0);
  let c = 0;
  const skipped = [];
  
  if (n <= 0) return { finalDate: d, skipped: [] };
  
  while (c < n) {
    d.setDate(d.getDate() + direction);
    const day = d.getDay();
    const curTime = d.getTime();
    let isWork = true;
    let reason = "";

    if (day === 0) { isWork = false; reason = "Sunday"; }
    else if (day === 6) { 
      const weekNum = Math.ceil(d.getDate()/7);
      if (weekNum >= 2 && weekNum <= 4) { isWork = false; reason = `${weekNum}${weekNum===2?'nd':weekNum===3?'rd':'th'} Saturday`; }
    }
    
    if (isWork && h.has(curTime)) {
      isWork = false; reason = "Sheet Holiday";
    }

    if (isWork) {
      c++;
    } else {
      skipped.push({
        date: Utilities.formatDate(new Date(curTime), "GMT+5:30", "yyyy-MM-dd"),
        reason: reason
      });
    }
  }
  return { finalDate: d, skipped: skipped };
}

function getOrderDetails_Dynamic(ocNo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); const search = String(ocNo).trim().toUpperCase();
  const om = ss.getSheetByName(SHEET_ORD_MSTR);
  if (om) {
    const cols = getHeaderMapping_CI(om);
    const d = om.getDataRange().getValues();
    const ocIdx = (cols['OC NO'] || cols['OC NO.'] || 3);
    for (let i=1; i<d.length; i++) {
      if (String(d[i][ocIdx - 1]).trim().toUpperCase() === search) {
        const fr_raw = d[i][(cols['REVISED F/R'] || 10) - 1] || d[i][cols['REVISED F/R'] ? cols['REVISED F/R'] - 2 : 8];
        const q = Number(d[i][(cols['QTY ORDER'] || 6) - 1]);
        
        let qtyBand = 'Q5';
        if (q <= 1000) qtyBand = 'Q1';
        else if (q <= 3000) qtyBand = 'Q2';
        else if (q <= 5000) qtyBand = 'Q3';
        else if (q <= 8000) qtyBand = 'Q4';

        return { 
          lineNo: String(d[i][(cols['LINE'] || 2) - 1] || ''), 
          washCategory: deriveWashCategory(d[i][(cols['REMARKS'] || 7) - 1]),
          deliveryDate: d[i][(cols['NEW DEL'] || 8) - 1] || d[i][(cols['DEL DATE'] || 5) - 1], 
          qtyOrder: q, 
          qtyBand: qtyBand,
          productType: String(d[i][(cols['PRODUCT TYPE'] || 0) - 1] || 'All'),
          orderType: String(d[i][(cols['ORDER TYPE'] || 0) - 1] || 'All'),
          effectiveFileReleaseDate: parseDate_New(fr_raw)
        };
      }
    }
  }
  return null;
}

function deriveWashCategory(rem) {
  if (!rem) return 'Non-Wash'; const r = String(rem).toLowerCase();
  if (r.includes('enzyme')) return 'Enzyme'; if (r.includes('dye')) return 'Garment Dyed';
  if (r.includes('wash')) return 'Garment Wash'; return 'Non-Wash';
}

function getExistingStages_CI(sheet, oc, cols) {
  const lastRow = sheet.getLastRow(); if (lastRow < 2) return new Set();
  const data = sheet.getRange(2, cols['OC NO'], lastRow - 1, 15).getValues();
  const stIdx = cols['PROCESS STAGE'] - cols['OC NO'];
  const stages = new Set();
  const search = String(oc).toUpperCase();
  data.forEach(r => { if (String(r[0]).toUpperCase() === search) stages.add(String(r[stIdx]).toUpperCase()); });
  return stages;
}

function findTaskRow_Dynamic(sheet, ocNo, stage, cols) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const d = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const search = String(ocNo).trim().toUpperCase();
  const sStage = String(stage).trim().toUpperCase();
  for (let i = 0; i < d.length; i++) {
    const rowOc = String(d[i][(cols['OC NO'] || 2) - 1] || '').trim().toUpperCase();
    const rowStage = String(d[i][(cols['PROCESS STAGE'] || 7) - 1] || '').trim().toUpperCase();
    if (rowOc === search && rowStage === sStage) {
      return i + 2;
    }
  }
  return -1;
}

function isWorkingDay(d, h) { const day = d.getDay(); if (day === 0) return false; const c = new Date(d); c.setHours(0,0,0,0); if (day === 6) { const w = Math.ceil(c.getDate()/7); if (w>=2 && w<=4) return false; } return !h.has(c.getTime()); }
function addWorkingDays(s, n, h) { let d = new Date(s); d.setHours(0,0,0,0); let c = 0; while (c < n) { d.setDate(d.getDate()+1); if (isWorkingDay(d, h)) c++; } return d; }
function subtractWorkingDays(s, n, h) { let d = new Date(s); d.setHours(0,0,0,0); let c = 0; while (c < n) { d.setDate(d.getDate()-1); if (isWorkingDay(d, h)) c++; } return d; }
function getHolidays() { const set = new Set(); const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_HOLIDAYS); if (!s) return set; s.getDataRange().getValues().slice(1).forEach(r => { if(r[0]) { let d = new Date(r[0]); d.setHours(0,0,0,0); set.add(d.getTime()); }}); return set; }
function lookupSopLt(processStage, productType, washCategory, orderType, qtyBand) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); 
  const s = ss.getSheetByName(SHEET_SOP_CAL); 
  if (!s) return { sopLt: 2, nva: 0 };
  
  const data = s.getDataRange().getValues();
  
  // Normalize inputs
  const pProduct = String(productType || 'All').trim().toUpperCase();
  const pWash = String(washCategory || 'All').trim().toUpperCase();
  const pOrder = String(orderType || 'All').trim().toUpperCase();
  const pQty = String(qtyBand || 'All').trim().toUpperCase();
  const pStage = String(processStage || '').trim().toUpperCase();

  function findMatch(stage, product, wash, oType, qty, levelLabel) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim().toUpperCase() === stage && 
          String(data[i][2]).trim().toUpperCase() === product &&
          String(data[i][3]).trim().toUpperCase() === wash &&
          String(data[i][4]).trim().toUpperCase() === oType &&
          String(data[i][5]).trim().toUpperCase() === qty) {
        return { 
          sopLt: Number(data[i][9] || 0), 
          nva: Number(data[i][8] || 0),
          nnva: Number(data[i][7] || 0),
          va: Number(data[i][6] || 0),
          matchLevel: levelLabel
        };
      }
    }
    return null;
  }

  // Progressive Fallback Strategy
  let res = findMatch(pStage, pProduct, pWash, pOrder, pQty, 'Exact'); 
  if (!res) res = findMatch(pStage, 'ALL', pWash, pOrder, pQty, 'Product=ALL');
  if (!res) res = findMatch(pStage, pProduct, 'ALL', pOrder, pQty, 'Wash=ALL');
  if (!res) res = findMatch(pStage, pProduct, pWash, 'ALL', pQty, 'Order=ALL');
  if (!res) res = findMatch(pStage, pProduct, pWash, pOrder, 'ALL', 'Qty=ALL');
  if (!res) res = findMatch(pStage, 'ALL', 'ALL', 'ALL', 'ALL', 'Global Fallback');

  return res || { sopLt: 2, nva: 0, matchLevel: 'Hardcoded Fallback' };
}

function getOCsByStageAndDateRange(stage, startDate, endDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_VSM_EXEC);
  if (!sheet) return [];

  const cols = getHeaderMapping_CI(sheet);
  const data = sheet.getDataRange().getValues().slice(1);
  
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const pStage = String(stage).trim().toUpperCase();
  
  return data.filter(r => {
    const rowStage = String(r[cols['PROCESS STAGE']-1]).trim().toUpperCase();
    if (rowStage !== pStage) return false;
    
    // Check if target end date falls within range
    const tEndRaw = r[cols['TARGET END DATE']-1];
    const tEnd = tEndRaw ? new Date(tEndRaw) : null;
    
    if (!tEnd || isNaN(tEnd.getTime())) return false;
    
    let inRange = true;
    if (start && tEnd < start) inRange = false;
    if (end && tEnd > end) inRange = false;
    
    return inRange;
  }).map(r => ({
    ocNo: r[cols['OC NO']-1],
    targetStartDate: parseDate_New(r[cols['TARGET START DATE']-1]),
    targetEndDate: parseDate_New(r[cols['TARGET END DATE']-1]),
    processStatus: r[cols['PROCESS STATUS']-1],
    lineNo: r[cols['LINE NO']-1] || r[cols['LINE NO.']-1],
    orderQty: r[cols['ORDER QTY']-1]
  }));
}

function createSuccessResponse(d, m) { return ContentService.createTextOutput(JSON.stringify({success:true,message:m,data:d})).setMimeType(ContentService.MimeType.JSON); }
function createErrorResponse(e, c) { return ContentService.createTextOutput(JSON.stringify({success:false,error:e.toString(),version:VERSION})).setMimeType(ContentService.MimeType.JSON); }
function parseDate_New(v) { if (!v) return ''; let d = new Date(v); return isNaN(d.getTime()) ? '' : d; }
function validateParams(d, p) { p.forEach(x => { if (!d[x]) throw new Error(`Missing ${x}`); });}
function getOcNumbersAction() { return []; }
