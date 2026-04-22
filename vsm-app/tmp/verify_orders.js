const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects up to one level
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    const url = 'https://script.google.com/macros/s/AKfycbxNaz2wRNSk9CrsFzPpnE1NVBYXZQbq_RzxatSaOMI-fteIh6BBbdz6PJ4FZmPEMc9n/exec?action=getIntegratedData';
    const result = await fetchJson(url);
    if(result.success) {
       const uniqueOcs = new Set(result.data.map(i => i.ocNo).filter(Boolean));
       console.log('--- RESULT ---');
       console.log('Total Rows Returned:', result.data.length);
       console.log('Unique OC Count from API:', uniqueOcs.size);
    } else {
       console.log('API Error:', result);
    }
  } catch(e) {
    console.log('Error catching JSON:', e);
  }
}

run();
