import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

const FACTORY = 'dbr';
const APPS_SCRIPT_URL = process.env.DBR_GOOGLE_APPS_SCRIPT_URL;

// MASTER DATA MAPPING (Combined from the user's provided data and Order_Master)
const OCS_TO_UPDATE = [
  "LC/VLT/25/13431.1", "LC/VLT/25/13443", "LC/VLT/25/13449", "LC/VLT/25/13431.2",
  "PRLS/25/13706", "PRLS/25/13515", "LC/VLT/25/12758", "LC/DMN/25/13076",
  "LC/DMN/25/13403", "LC/DMN/25/13447", "LC/DMN/25/13445", "PRLS/25/13340",
  "PRLS/25/13345", "PRLS/25/12975", "LC/DMN/25/13411", "LC/DMN/25/13423",
  "LC/DMN/25/13027", "LC/DMN/25/13029", "LC/DMN/25/13082", "LC/DMN/25/13399",
  "LC/DMN/25/13045", "LC/DMN/25/13080", "LC/DMN/25/13363", "LC/DMN/25/13419",
  "LC/DMN/25/13351", "LC/DMN/25/13371", "LC/DMN/25/13373", "LC/DMN/25/13381",
  "LC/DMN/25/13357", "LC/ARKT/25/13550.1.1", "LC/ARKT/25/13347.1.1", "LC/DMN/25/13365",
  "LC/COS/25/13740.1", "LC/COS/25/13646.1", "LC/DMN/25/13033", "LC/DMN/25/13397",
  "LC/DMN/25/13407"
];

async function updateTaskEnhanced(taskData: any) {
  try {
    const response = await fetch(APPS_SCRIPT_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
      redirect: 'follow'
    });
    const result = await response.json();
    return result;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.DBR_GOOGLE_SHEET_ID;

  // 1. Fetch Order_Master for mapping
  const resOm = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Order_Master!A2:E20000' });
  const omRows = resOm.data.values || [];
  const omMap: Record<string, any> = {};
  omRows.forEach(row => {
    omMap[row[2]] = { line: row[1], wash: "All", delDate: row[4] };
  });

  // 2. Fetch VSM_Execution to get current status/dates
  const resVsm = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'VSM_Execution!A2:AZ10000' });
  const vsmRows = resVsm.data.values || [];

  const updateTasks: any[] = [];
  
  OCS_TO_UPDATE.forEach(oc => {
    const matchingRows = vsmRows.filter(r => r[1] === oc && (r[6] === 'Fabric Inhouse' || r[6] === 'Fabric QC'));
    
    matchingRows.forEach(row => {
      const stage = row[6];
      const master = omMap[oc] || { line: "DBR L1", wash: "All", delDate: "" };
      
      const payload = {
        ocNo: oc,
        processStage: stage,
        lineNo: master.line,
        washCategory: master.wash,
        deliveryDate: master.delDate,
        sopLeadTime: 1, // Defaulting to 1 for these stages
        actualStartDate: row[11] || '',
        actualEndDate: row[12] || '',
        processStatus: row[13] || 'Completed',
        riskLevel: 'Low',
        vaTime: '00:00:00',
        nvaTime: '24:00:00',
        completionStatus: 'Completed'
      };
      updateTasks.push(payload);
    });
  });

  console.log(`Starting bulk enhanced update for ${updateTasks.length} tasks...`);
  for (const task of updateTasks) {
    console.log(`Updating ${task.ocNo} - ${task.processStage}...`);
    const result = await updateTaskEnhanced(task) as any;
    if (result.success) {
      console.log(`✅ Success for ${task.ocNo} - ${task.processStage}`);
    } else {
      console.error(`❌ Error for ${task.ocNo} - ${task.processStage}: ${result.error}`);
    }
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  console.log('✅ Bulk update finished!');
}

main();
