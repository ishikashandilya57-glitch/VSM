const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/TaskUpdatePageEnhanced.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace template literals with string concatenation for the specific broken blocks
// Block 1 (Line 1124)
content = content.replace(
    /className=\{\`text-xs p-2 rounded border flex items-center justify-between \$\{\n([\s\S]*?)\n\s+[\}`]+>/,
    'className={"text-xs p-2 rounded border flex items-center justify-between " + (\n$1\n                             )}>'
);

// Block 2 (Line 1613)
content = content.replace(
    /className=\{\`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 \$\{\n([\s\S]*?)\n\s+[\}`]+\}/,
    'className={"px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 " + (\n$1\n                    )}'
);

// Block 3 (Line 1813)
content = content.replace(
    /className=\{\`group relative text-\[11px\] font-bold leading-tight px-3 py-2\.5 rounded-xl border flex flex-col gap-1 transition-all hover:shadow-md \$\{\n([\s\S]*?)\n\s+[\}`]+\}/,
    'className={"group relative text-[11px] font-bold leading-tight px-3 py-2.5 rounded-xl border flex flex-col gap-1 transition-all hover:shadow-md " + (\n$1\n                                   )}'
);

// Block 4 (Line 1824)
content = content.replace(
    /className=\{\`p-1\.5 rounded-lg shrink-0 \$\{\n([\s\S]*?)\n\s+[\}`]+>/,
    'className={"p-1.5 rounded-lg shrink-0 " + (\n$1\n                                        )}>'
);

// Block 5 (Line 1841)
content = content.replace(
    /className=\{\`shrink-0 px-2 py-1 rounded-lg text-\[10px\] font-black border tracking-tighter whitespace-nowrap \$\{\n([\s\S]*?)\n\s+[\}`]+>/,
    'className={"shrink-0 px-2 py-1 rounded-lg text-[10px] font-black border tracking-tighter whitespace-nowrap " + (\n$1\n                                        )}>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Transformed template literals to string concatenation in TaskUpdatePageEnhanced.tsx');
