/**
 * Test Script for SOP Lead Time Calculation
 * This simulates the Google Apps Script logic to identify bugs
 */

// Sample data structures based on your sheets

const ORDER_MASTER = [
  { ocNo: 'PRLS/25/12307', buyer: 'Polo Ralph lauren', delDate: '2026-01-23', qtyOrder: 4552, remarks: 'garment wash', derivedWash: 'Garment Wash' },
  { ocNo: 'PRLS/25/12431', buyer: 'Polo Ralph lauren', delDate: '2026-01-01', qtyOrder: 4000, remarks: 'garment wash', derivedWash: 'Garment Wash' },
  { ocNo: 'LC/PVI/25/11726', buyer: 'Test Buyer', delDate: '2026-01-14', qtyOrder: 466, remarks: 'Garment Wash', derivedWash: 'Garment Wash' }
];

const SOP_CAL = [
  // Process Seq, Process Stage, Product Type, Wash Category, Order Type, Qty Band, VA, NVA, NVA, SOP LT
  { processSeq: 1, processStage: 'Fabric Inhouse', productType: 'All', washCategory: 'All', orderType: 'All', qtyBand: 'All', va: 0, nva: 0.1, nva2: 0.9, sopLt: 1 },
  { processSeq: 2, processStage: 'Fabric QC', productType: 'All', washCategory: 'Non-Wash', orderType: 'All', qtyBand: 'All', va: 0.5, nva: 1, nva2: 0, sopLt: 0.5 },
  { processSeq: 2, processStage: 'Fabric QC', productType: 'All', washCategory: 'Garment Wash', orderType: 'All', qtyBand: 'All', va: 0.5, nva: 1, nva2: 0, sopLt: 2 },
  { processSeq: 3, processStage: 'File Release', productType: 'All', washCategory: 'All', orderType: 'Repeat', qtyBand: 'All', va: 0, nva: 0.5, nva2: 0, sopLt: 1 },
  { processSeq: 3, processStage: 'File Release', productType: 'All', washCategory: 'All', orderType: 'Non-Repeat', qtyBand: 'All', va: 0, nva: 1, nva2: 0, sopLt: 2 },
  { processSeq: 4, processStage: 'Pre-Production', productType: 'All', washCategory: 'Garment Wash', orderType: 'Repeat', qtyBand: 'All', va: 0, nva: 1, nva2: 0, sopLt: 2 },
  { processSeq: 4, processStage: 'Pre-Production', productType: 'All', washCategory: 'Garment Wash', orderType: 'Non-Repeat', qtyBand: 'All', va: 0, nva: 2, nva2: 0, sopLt: 3 },
  { processSeq: 5, processStage: 'CAD / Pattern', productType: 'All', washCategory: 'All', orderType: 'All', qtyBand: 'All', va: 0, nva: 1, nva2: 0, sopLt: 1 },
  { processSeq: 6, processStage: 'Cutting', productType: 'All', washCategory: 'All', orderType: 'All', qtyBand: 'Q1', va: 1, nva: 0.5, nva2: 0, sopLt: 1.5 },
  { processSeq: 6, processStage: 'Cutting', productType: 'All', washCategory: 'All', orderType: 'All', qtyBand: 'Q2', va: 1.5, nva: 0.5, nva2: 0, sopLt: 2 },
  { processSeq: 6, processStage: 'Cutting', productType: 'All', washCategory: 'All', orderType: 'All', qtyBand: 'Q3', va: 2, nva: 1, nva2: 0, sopLt: 3 },
  { processSeq: 7, processStage: 'Sewing', productType: 'Shirt', washCategory: 'All', orderType: 'All', qtyBand: 'Q1', va: 3, nva: 1, nva2: 0, sopLt: 4 },
  { processSeq: 7, processStage: 'Sewing', productType: 'Shirt', washCategory: 'All', orderType: 'All', qtyBand: 'Q2', va: 5, nva: 2, nva2: 0, sopLt: 7 },
  { processSeq: 8, processStage: 'Washing', productType: 'All', washCategory: 'Garment Wash', orderType: 'All', qtyBand: 'Q1', va: 2, nva: 1, nva2: 0, sopLt: 3 },
  { processSeq: 8, processStage: 'Washing', productType: 'All', washCategory: 'Garment Wash', orderType: 'All', qtyBand: 'Q2', va: 3, nva: 1, nva2: 0, sopLt: 4 },
  { processSeq: 9, processStage: 'Finishing', productType: 'Shirt', washCategory: 'All', orderType: 'All', qtyBand: 'Q1', va: 2, nva: 1, nva2: 0, sopLt: 3 },
  { processSeq: 9, processStage: 'Finishing', productType: 'Shirt', washCategory: 'All', orderType: 'All', qtyBand: 'Q2', va: 3, nva: 1.5, nva2: 0, sopLt: 4.5 },
  { processSeq: 10, processStage: 'Inspection', productType: 'All', washCategory: 'All', orderType: 'All', qtyBand: 'All', va: 0, nva: 1, nva2: 0, sopLt: 1 },
  { processSeq: 11, processStage: 'Dispatch', productType: 'All', washCategory: 'All', orderType: 'All', qtyBand: 'All', va: 0, nva: 0.5, nva2: 0, sopLt: 0.5 }
];

const SOP_DRIVERS = [
  { processStage: 'Fabric Inhouse', useProduct: 'N', useWash: 'N', useOrderType: 'N', useQtyBand: 'N' },
  { processStage: 'Fabric QC', useProduct: 'N', useWash: 'Y', useOrderType: 'N', useQtyBand: 'N' },
  { processStage: 'File Release', useProduct: 'N', useWash: 'N', useOrderType: 'Y', useQtyBand: 'N' },
  { processStage: 'Pre-Production', useProduct: 'N', useWash: 'Y', useOrderType: 'Y', useQtyBand: 'N' },
  { processStage: 'CAD / Pattern', useProduct: 'N', useWash: 'N', useOrderType: 'N', useQtyBand: 'N' },
  { processStage: 'Cutting', useProduct: 'Y', useWash: 'N', useOrderType: 'N', useQtyBand: 'Y' },
  { processStage: 'Sewing', useProduct: 'Y', useWash: 'N', useOrderType: 'N', useQtyBand: 'Y' },
  { processStage: 'Washing', useProduct: 'N', useWash: 'Y', useOrderType: 'N', useQtyBand: 'Y' },
  { processStage: 'Finishing', useProduct: 'Y', useWash: 'N', useOrderType: 'N', useQtyBand: 'Y' },
  { processStage: 'Inspection', useProduct: 'N', useWash: 'N', useOrderType: 'N', useQtyBand: 'N' },
  { processStage: 'Dispatch', useProduct: 'N', useWash: 'N', useOrderType: 'N', useQtyBand: 'N' }
];

// Helper functions
function getOrderDetails(ocNo) {
  const order = ORDER_MASTER.find(o => o.ocNo === ocNo);
  if (!order) {
    console.log(`❌ Order not found: ${ocNo}`);
    return null;
  }

  // Calculate Qty Band
  let qtyBand = 'Q5';
  if (order.qtyOrder <= 1000) qtyBand = 'Q1';
  else if (order.qtyOrder <= 3000) qtyBand = 'Q2';
  else if (order.qtyOrder <= 5000) qtyBand = 'Q3';
  else if (order.qtyOrder <= 8000) qtyBand = 'Q4';

  return {
    ocNo: order.ocNo,
    washCategory: order.derivedWash,
    deliveryDate: new Date(order.delDate),
    qtyOrder: order.qtyOrder,
    qtyBand: qtyBand
  };
}

function getSopDrivers(processStage) {
  const driver = SOP_DRIVERS.find(d => d.processStage === processStage);
  if (!driver) {
    return { useProduct: true, useWash: true, useOrderType: true, useQtyBand: true };
  }
  return {
    useProduct: driver.useProduct === 'Y',
    useWash: driver.useWash === 'Y',
    useOrderType: driver.useOrderType === 'Y',
    useQtyBand: driver.useQtyBand === 'Y'
  };
}

function getAllProcessStages() {
  const stages = new Map();
  SOP_CAL.forEach(row => {
    if (!stages.has(row.processStage)) {
      stages.set(row.processStage, { seq: row.processSeq, stage: row.processStage });
    }
  });
  
  const stagesArray = Array.from(stages.values());
  stagesArray.sort((a, b) => a.seq - b.seq);
  return stagesArray;
}

function lookupSopLeadTime(processStage, washCategory, qtyBand, productType = 'All', orderType = 'All') {
  console.log(`  🔍 Looking up SOP LT for: ${processStage} | Wash: ${washCategory} | Qty: ${qtyBand} | Product: ${productType} | Order: ${orderType}`);
  
  // Try exact match first
  let match = SOP_CAL.find(row => 
    row.processStage === processStage &&
    row.washCategory === washCategory &&
    row.qtyBand === qtyBand &&
    row.productType === productType &&
    row.orderType === orderType
  );

  if (match) {
    console.log(`  ✅ Exact match found: ${match.sopLt} days`);
    return match.sopLt;
  }

  // Fallback: Try with "All" values
  match = SOP_CAL.find(row =>
    row.processStage === processStage &&
    row.washCategory === 'All' &&
    row.qtyBand === 'All' &&
    row.productType === 'All' &&
    row.orderType === 'All'
  );

  if (match) {
    console.log(`  ⚠️  Fallback match found: ${match.sopLt} days`);
    return match.sopLt;
  }

  console.log(`  ❌ No match found, returning 0`);
  return 0;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateTargetDatesWithSteps(ocNo, currentProcessStage, productType = 'Shirt', orderType = 'Non-Repeat') {
  console.log('\n' + '='.repeat(80));
  console.log(`🧪 TESTING SOP CALCULATION`);
  console.log('='.repeat(80));
  
  const orderDetails = getOrderDetails(ocNo);
  if (!orderDetails) {
    return { success: false, error: 'Order not found' };
  }

  console.log(`\n📋 Order Details:`);
  console.log(`  OC NO: ${orderDetails.ocNo}`);
  console.log(`  Wash Category: ${orderDetails.washCategory}`);
  console.log(`  Delivery Date: ${formatDate(orderDetails.deliveryDate)}`);
  console.log(`  Qty Order: ${orderDetails.qtyOrder}`);
  console.log(`  Qty Band: ${orderDetails.qtyBand}`);
  console.log(`  Product Type: ${productType}`);
  console.log(`  Order Type: ${orderType}`);

  // Get all process stages
  const allStages = getAllProcessStages();
  console.log(`\n📊 All Process Stages (${allStages.length}):`);
  allStages.forEach(s => console.log(`  ${s.seq}. ${s.stage}`));

  // Find current process index
  const currentIndex = allStages.findIndex(s => s.stage === currentProcessStage);
  if (currentIndex === -1) {
    console.log(`\n❌ Process stage "${currentProcessStage}" not found`);
    return { success: false, error: 'Process not found' };
  }

  console.log(`\n🎯 Current Process: ${currentProcessStage} (Seq: ${allStages[currentIndex].seq})`);

  // Get processes from current to end
  const remainingProcesses = allStages.slice(currentIndex);
  console.log(`\n📈 Remaining Processes (${remainingProcesses.length}):`);

  // Calculate SOP LT for each remaining process
  const processesWithSop = [];
  let totalSopLt = 0;

  for (const process of remainingProcesses) {
    const drivers = getSopDrivers(process.stage);
    
    // Determine which values to use based on drivers
    const useWash = drivers.useWash ? orderDetails.washCategory : 'All';
    const useQtyBand = drivers.useQtyBand ? orderDetails.qtyBand : 'All';
    const useProduct = drivers.useProduct ? productType : 'All';
    const useOrderType = drivers.useOrderType ? orderType : 'All';

    console.log(`\n  ${process.seq}. ${process.stage}:`);
    console.log(`     Drivers: Product=${drivers.useProduct?'Y':'N'}, Wash=${drivers.useWash?'Y':'N'}, OrderType=${drivers.useOrderType?'Y':'N'}, QtyBand=${drivers.useQtyBand?'Y':'N'}`);
    console.log(`     Using: Product=${useProduct}, Wash=${useWash}, OrderType=${useOrderType}, QtyBand=${useQtyBand}`);
    
    const sopLt = lookupSopLeadTime(process.stage, useWash, useQtyBand, useProduct, useOrderType);
    
    processesWithSop.push({
      seq: process.seq,
      stage: process.stage,
      sopLt: sopLt
    });
    
    totalSopLt += sopLt;
  }

  console.log(`\n📊 Total SOP Lead Time: ${totalSopLt} days`);

  // Calculate target dates working backwards from delivery date
  const deliveryDate = new Date(orderDetails.deliveryDate);
  console.log(`\n📅 Delivery Date: ${formatDate(deliveryDate)}`);
  console.log(`\n🔙 Calculating backwards from Delivery Date:`);

  let currentEndDate = new Date(deliveryDate);
  const calculatedDates = [];

  // Work backwards through processes (reverse order)
  for (let i = processesWithSop.length - 1; i >= 0; i--) {
    const process = processesWithSop[i];
    
    const targetEndDate = new Date(currentEndDate);
    const targetStartDate = new Date(currentEndDate);
    targetStartDate.setDate(targetStartDate.getDate() - process.sopLt);
    
    calculatedDates.unshift({
      seq: process.seq,
      stage: process.stage,
      sopLt: process.sopLt,
      targetStartDate: targetStartDate,
      targetEndDate: targetEndDate
    });
    
    console.log(`\n  ${process.seq}. ${process.stage}:`);
    console.log(`     Current End Date: ${formatDate(targetEndDate)}`);
    console.log(`     Subtract SOP LT: ${process.sopLt} days`);
    console.log(`     Target Start: ${formatDate(targetStartDate)}`);
    console.log(`     Target End: ${formatDate(targetEndDate)}`);
    
    // Move backwards for next process
    currentEndDate = new Date(targetStartDate);
  }

  console.log(`\n✅ RESULT for ${currentProcessStage}:`);
  console.log(`   Target Start Date: ${formatDate(calculatedDates[0].targetStartDate)}`);
  console.log(`   Target End Date: ${formatDate(calculatedDates[0].targetEndDate)}`);
  console.log(`   SOP Lead Time: ${calculatedDates[0].sopLt} days`);

  console.log('\n' + '='.repeat(80));
  console.log('📋 ALL PROCESS DATES:');
  console.log('='.repeat(80));
  calculatedDates.forEach(p => {
    console.log(`${p.seq}. ${p.stage.padEnd(20)} | SOP: ${String(p.sopLt).padStart(4)} days | Start: ${formatDate(p.targetStartDate)} | End: ${formatDate(p.targetEndDate)}`);
  });
  console.log('='.repeat(80) + '\n');

  return {
    success: true,
    orderDetails: orderDetails,
    currentProcess: calculatedDates[0],
    allProcesses: calculatedDates,
    totalSopLt: totalSopLt
  };
}

// Run tests
console.log('\n🚀 Starting SOP Calculation Tests...\n');

// Test 1: Small order (Q1)
calculateTargetDatesWithSteps('LC/PVI/25/11726', 'Fabric Inhouse', 'Shirt', 'Non-Repeat');

// Test 2: Medium order (Q2)
calculateTargetDatesWithSteps('PRLS/25/12431', 'Sewing', 'Shirt', 'Repeat');

// Test 3: Check specific process
calculateTargetDatesWithSteps('PRLS/25/12307', 'Washing', 'Shirt', 'Non-Repeat');

console.log('\n✅ All tests completed!\n');
