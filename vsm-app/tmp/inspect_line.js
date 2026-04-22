const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/TaskUpdatePageEnhanced.tsx');
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split(/\r?\n/);

let line1129 = lines[1128];
console.log(`Line 1129: "${line1129}"`);
for (let i = 0; i < line1129.length; i++) {
    console.log(`${i}: ${line1129[i]} (${line1129.charCodeAt(i)})`);
}
