const fs = require('fs');
fetch('http://localhost:3000/api/temp-wlp')
    .then(res => res.json())
    .then(data => {
        fs.writeFileSync('wlp-headers.json', JSON.stringify(data.data[0], null, 2));
        console.log("Headers saved");
    });
