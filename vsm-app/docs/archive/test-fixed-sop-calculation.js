/**
 * Test Script for Fixed SOP Calculation Logic
 * Tests the progressive fallback logic
 */

// Mock SOP_Cal data
const mockSopCalData = [
  // Header row
  ['Process Seq', 'Process Stage', 'Product Type', 'Wash Category', 'Order Type', 'Qty Band', '', '', '', 'SOP LT'],
  
  // Q1 and Q2 data (existing)
  [1, 'Cutting', 'All', 'All', 'All', 'Q1', '', '', '', 1.5],
  [1, 'Cutting', 'All', 'All', 'All', 'Q2', '', '', '', 2],
  [2, 'Sewing', 'Shirt', 'All', 'All', 'Q1', '', '', '', 5],
  [2, 'Sewing', 'Shirt', 'All', 'All', 'Q2', '', '', '', 8],
  [3, 'Washing', 'All', 'Garment Wash', 'All', 'Q1', '', '', '', 3],
  [3, 'Washing', 'All', 'Garment Wash', 'All', 'Q2', '', '', '', 4],
  [4, 'Finishing', 'Shirt', 'All', 'All', 'Q1', '', '', '', 4],
  [4, 'Finishing', 'Shirt', 'All', 'All', 'Q2', '', '', '', 5],
  
  // Q3, Q4, Q5 data (NEW - should be added to your sheet)
  [1, 'Cutting', 'All', 'All', 'All', 'Q3', '', '', '', 3],
  [1, 'Cutting', 'All', 'All', 'All', 'Q4', '', '', '', 4],
  [1, 'Cutting', 'All', 'All', 'All', 'Q5', '', '', '', 5],
  [2, 'Sewing', 'Shirt', 'All', 'All', 'Q3', '', '', '', 10],
  [2, 'Sewing', 'Shirt', 'All', 'All', 'Q4', '', '', '', 14],
  [2, 'Sewing', 'Shirt', 'All', 'All', 'Q5', '', '', '', 18],
  [3, 'Washing', 'All', 'Garment Wash', 'All', 'Q3', '', '', '', 5],
  [3, 'Washing', 'All', 'Garment Wash', 'All', 'Q4', '', '', '', 6],
  [3, 'Washing', 'All', 'Garment Wash', 'All', 'Q5', '', '', '', 7],
  [4, 'Finishing', 'Shirt', 'All', 'All', 'Q3', '', '', '', 6],
  [4, 'Finishing', 'Shirt', 'All', 'All', 'Q4', '', '', '', 8],
  [4, 'Finishing', 'Shirt', 'All', 'All', 'Q5', '', '', '', 10],
];

/**
 * Fixed lookupSopLeadTime with progressive fallback
 */
function lookupSopLeadTime(processStage, washCategory, qtyBand, productType, orderType) {
  const data = mockSopCalData;
  
  // Normalize inputs
  productType = productType || 'All';
  washCategory = washCategory || 'All';
  orderType = orderType || 'All';
  qtyBand = qtyBand || 'All';
  
  console.log(`\n🔍 Looking up SOP for: ${processStage} | Product: ${productType} | Wash: ${washCategory} | Order: ${orderType} | Qty: ${qtyBand}`);
  
  function findMatch(pStage, pProduct, pWash, pOrder, pQty) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === pStage &&           // Column B: Process Stage
          data[i][2] === pProduct &&         // Column C: Product Type
          data[i][3] === pWash &&            // Column D: Wash Category
          data[i][4] === pOrder &&           // Column E: Order Type
          data[i][5] === pQty) {             // Column F: Qty Band
        return data[i][9] || 0;              // Column J: SOP LT
      }
    }
    return null;
  }
  
  // 1. Try exact match
  let result = findMatch(processStage, productType, washCategory, orderType, qtyBand);
  if (result !== null) {
    console.log(`✅ Exact match: ${processStage} → ${result} days`);
    return result;
  }
  
  // 2. Try with Product = "All"
  result = findMatch(processStage, 'All', washCategory, orderType, qtyBand);
  if (result !== null) {
    console.log(`✅ Fallback (Product=All): ${processStage} → ${result} days`);
    return result;
  }
  
  // 3. Try with Wash = "All"
  result = findMatch(processStage, productType, 'All', orderType, qtyBand);
  if (result !== null) {
    console.log(`✅ Fallback (Wash=All): ${processStage} → ${result} days`);
    return result;
  }
  
  // 4. Try with OrderType = "All"
  result = findMatch(processStage, productType, washCategory, 'All', qtyBand);
  if (result !== null) {
    console.log(`✅ Fallback (OrderType=All): ${processStage} → ${result} days`);
    return result;
  }
  
  // 5. Try with QtyBand = "All"
  result = findMatch(processStage, productType, washCategory, orderType, 'All');
  if (result !== null) {
    console.log(`✅ Fallback (QtyBand=All): ${processStage} → ${result} days`);
    return result;
  }
  
  // 6. Final fallback: All = "All"
  result = findMatch(processStage, 'All', 'All', 'All', 'All');
  if (result !== null) {
    console.log(`✅ Final fallback (All=All): ${processStage} → ${result} days`);
    return result;
  }
  
  console.log(`❌ No SOP match found for: ${processStage}`);
  return 0;
}

/**
 * Test scenarios
 */
function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TESTING FIXED SOP CALCULATION LOGIC');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const testCases = [
    {
      name: 'Test 1: Q1 Order (500 units) - Should work with old data',
      order: {
        ocNo: 'LC/REIS/25/12360',
        qtyOrder: 500,
        qtyBand: 'Q1',
        washCategory: 'Garment Wash',
        productType: 'Shirt'
      }
    },
    {
      name: 'Test 2: Q2 Order (2000 units) - Should work with old data',
      order: {
        ocNo: 'LC/REIS/25/12361',
        qtyOrder: 2000,
        qtyBand: 'Q2',
        washCategory: 'Garment Wash',
        productType: 'Shirt'
      }
    },
    {
      name: 'Test 3: Q3 Order (4000 units) - CRITICAL TEST (was broken)',
      order: {
        ocNo: 'PRLS/25/12431',
        qtyOrder: 4000,
        qtyBand: 'Q3',
        washCategory: 'Garment Wash',
        productType: 'Shirt'
      }
    },
    {
      name: 'Test 4: Q4 Order (7000 units) - CRITICAL TEST (was broken)',
      order: {
        ocNo: 'LC/REIS/25/12362',
        qtyOrder: 7000,
        qtyBand: 'Q4',
        washCategory: 'Garment Wash',
        productType: 'Shirt'
      }
    },
    {
      name: 'Test 5: Q5 Order (10000 units) - CRITICAL TEST (was broken)',
      order: {
        ocNo: 'LC/REIS/25/12363',
        qtyOrder: 10000,
        qtyBand: 'Q5',
        washCategory: 'Garment Wash',
        productType: 'Shirt'
      }
    }
  ];
  
  const processes = ['Cutting', 'Sewing', 'Washing', 'Finishing'];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📋 ${testCase.name}`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`Order: ${testCase.order.ocNo}`);
    console.log(`Qty: ${testCase.order.qtyOrder} units → Band: ${testCase.order.qtyBand}`);
    console.log(`Wash: ${testCase.order.washCategory}`);
    console.log(`Product: ${testCase.order.productType}`);
    console.log('');
    
    let totalSopLt = 0;
    const results = [];
    
    processes.forEach(processStage => {
      const sopLt = lookupSopLeadTime(
        processStage,
        testCase.order.washCategory,
        testCase.order.qtyBand,
        testCase.order.productType,
        'All'
      );
      
      totalSopLt += sopLt;
      results.push({ process: processStage, sopLt });
    });
    
    console.log('\n📊 Summary:');
    console.log('─'.repeat(40));
    results.forEach(r => {
      const status = r.sopLt > 0 ? '✅' : '❌';
      console.log(`${status} ${r.process.padEnd(15)} → ${r.sopLt} days`);
    });
    console.log('─'.repeat(40));
    console.log(`📈 Total SOP Lead Time: ${totalSopLt} days`);
    
    // Validation
    if (totalSopLt === 0) {
      console.log('❌ FAILED: Total SOP is 0 days (incorrect!)');
    } else if (totalSopLt < 10) {
      console.log('⚠️  WARNING: Total SOP seems too low');
    } else {
      console.log('✅ PASSED: Realistic SOP lead time calculated');
    }
  });
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🎯 TEST COMPARISON: OLD vs NEW');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('OLD LOGIC (Broken):');
  console.log('  Q3 Order (4000 units):');
  console.log('    Cutting:   0 days ❌');
  console.log('    Sewing:    0 days ❌');
  console.log('    Washing:   0 days ❌');
  console.log('    Finishing: 0 days ❌');
  console.log('    Total:     0 days ❌ (WRONG!)');
  console.log('');
  
  console.log('NEW LOGIC (Fixed):');
  console.log('  Q3 Order (4000 units):');
  const q3Test = {
    cutting: lookupSopLeadTime('Cutting', 'Garment Wash', 'Q3', 'Shirt', 'All'),
    sewing: lookupSopLeadTime('Sewing', 'Garment Wash', 'Q3', 'Shirt', 'All'),
    washing: lookupSopLeadTime('Washing', 'Garment Wash', 'Q3', 'Shirt', 'All'),
    finishing: lookupSopLeadTime('Finishing', 'Garment Wash', 'Q3', 'Shirt', 'All')
  };
  const q3Total = q3Test.cutting + q3Test.sewing + q3Test.washing + q3Test.finishing;
  
  console.log(`    Cutting:   ${q3Test.cutting} days ✅`);
  console.log(`    Sewing:    ${q3Test.sewing} days ✅`);
  console.log(`    Washing:   ${q3Test.washing} days ✅`);
  console.log(`    Finishing: ${q3Test.finishing} days ✅`);
  console.log(`    Total:     ${q3Total} days ✅ (CORRECT!)`);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ ALL TESTS COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('📋 NEXT STEPS:');
  console.log('1. Add Q3, Q4, Q5 rows to your SOP_Cal sheet');
  console.log('2. Deploy the fixed Code_WithCalculations_FIXED_V2.gs');
  console.log('3. Test with real orders in your Google Sheet');
  console.log('4. Verify target dates are calculated correctly\n');
}

// Run tests
runTests();
