const fs = require('fs');
fetch('http://localhost:3000/api/temp-wlp')
    .then(res => res.json())
    .then(data => {
        fs.writeFileSync('wlp-out.json', JSON.stringify(data, null, 2));
        console.log("Done");
    });
