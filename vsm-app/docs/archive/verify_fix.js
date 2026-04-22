const fetch = require('node-fetch');

async function verifyTargetDates() {
  const factory = 'dbr';
  const ocNo = 'LC/VLT/25/12746';
  const stages = ['File Release', 'CAD / Pattern', 'Fabric Inhouse', 'Pre-Production'];

  for (const stage of stages) {
    const url = `http://localhost:3000/api/${factory}/target-dates?ocNo=${encodeURIComponent(ocNo)}&processStage=${encodeURIComponent(stage)}`;
    try {
      console.log(`Testing Stage: ${stage}`);
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        console.log(`  Dates: Start=${result.data.targetStartDate}, End=${result.data.targetEndDate}`);
      } else {
        console.log(`  Error: ${result.error || result.message}`);
      }
    } catch (error) {
      console.error(`  Fetch Error: ${error.message}`);
    }
    console.log('');
  }
}

verifyTargetDates();
