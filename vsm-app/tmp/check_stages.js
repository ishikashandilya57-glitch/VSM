function checkStageNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('VSM_Execution');
  if (!sheet) {
    Logger.log('Sheet VSM_Execution not found');
    return;
  }
  const data = sheet.getDataRange().getValues();
  const stages = new Set();
  const cols = {};
  data[0].forEach((h, i) => { cols[String(h).toUpperCase().trim()] = i; });
  
  const stageIdx = cols['PROCESS STAGE'];
  if (stageIdx === undefined) {
    Logger.log('Column PROCESS STAGE not found');
    return;
  }
  
  for (let i = 1; i < data.length; i++) {
    stages.add(data[i][stageIdx]);
  }
  
  Logger.log('Found stages: ' + Array.from(stages).join(', '));
}
