/**
 * Test Apps Script Connection
 * Run this with: node test-apps-script-connection.js
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec';

const testData = {
  lineNo: 'TEST_LINE',
  ocNo: 'LC/DMN/25/12270',
  orderNo: 'TEST_ORDER',
  processStage: 'Sewing',
  actualStartDate: '2026-01-20',
  actualEndDate: '2026-01-25',
  delayReason: ''
};

console.log('🧪 Testing Apps Script Connection...');
console.log('📤 Sending test data:', testData);
console.log('');

fetch(APPS_SCRIPT_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
  redirect: 'follow'
})
  .then(response => {
    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));
    return response.text();
  })
  .then(text => {
    console.log('');
    console.log('📨 Raw response:');
    console.log(text);
    console.log('');
    
    try {
      const json = JSON.parse(text);
      console.log('✅ Parsed JSON response:');
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success) {
        console.log('');
        console.log('✅ SUCCESS - Data was saved to VSM_execution sheet!');
        console.log(`   Row: ${json.row}`);
        console.log(`   Action: ${json.action}`);
      } else {
        console.log('');
        console.log('❌ FAILED - Apps Script returned error:');
        console.log(`   Error: ${json.error}`);
      }
    } catch (e) {
      console.log('❌ Failed to parse as JSON');
      console.log('   This might be an HTML error page or redirect');
    }
  })
  .catch(error => {
    console.error('');
    console.error('❌ Connection error:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('  1. Apps Script not deployed as Web App');
    console.error('  2. Wrong URL in .env.local');
    console.error('  3. Apps Script permissions not set to "Anyone"');
    console.error('  4. Network/firewall blocking the request');
  });
