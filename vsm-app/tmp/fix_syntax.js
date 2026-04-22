const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/TaskUpdatePageEnhanced.tsx');
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split(/\r?\n/);

function setLine(index, text) {
    console.log(`Line ${index + 1} original: "${lines[index]}"`);
    lines[index] = text;
    console.log(`Line ${index + 1} fixed:    "${lines[index]}"`);
}

// 1-indexed lines to fix:
// 1124 starts className={`... ${
// 1129 should be }`}>
setLine(1128, '                            }`' + '}>');

// 1613 starts className={`... ${
// 1617 should be }`}
setLine(1616, '                    }`' + '}');

// 1813 starts className={`... ${
// 1820 should be }`}
setLine(1819, '                                   }`' + '}');

// 1824 starts className={`... ${
// 1830 should be }`}>
setLine(1829, '                                        }`' + '}>');

// 1841 starts className={`... ${
// 1846 should be }`}>
setLine(1845, '                                        }`' + '}>');

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Fixed syntax errors precisely in TaskUpdatePageEnhanced.tsx');
