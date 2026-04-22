const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } 
        catch(e) { resolve(body); }
      });
    }).on('error', reject);
  });
}

fetchJson('https://script.google.com/macros/s/AKfycbxNaz2wRNSk9CrsFzPpnE1NVBYXZQbq_RzxatSaOMI-fteIh6BBbdz6PJ4FZmPEMc9n/exec?action=debug_mapping')
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
