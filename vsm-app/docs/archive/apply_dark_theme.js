const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replaceMapping = [
    { search: /bg-white/g, replace: 'bg-navy-900 border border-navy-800 shadow-glass-sm' },
    { search: /bg-gray-50/g, replace: 'bg-navy-950' },
    { search: /bg-gray-100/g, replace: 'bg-navy-800' },
    { search: /bg-gray-200/g, replace: 'bg-navy-700' },
    { search: /text-gray-900/g, replace: 'text-white' },
    { search: /text-gray-800/g, replace: 'text-gray-100' },
    { search: /text-gray-700/g, replace: 'text-gray-200' },
    { search: /text-gray-600/g, replace: 'text-gray-300' },
    { search: /text-gray-500/g, replace: 'text-gray-400' },
    { search: /text-slate-900/g, replace: 'text-white' },
    { search: /text-slate-800/g, replace: 'text-gray-100' },
    { search: /text-slate-700/g, replace: 'text-gray-200' },
    { search: /text-slate-600/g, replace: 'text-gray-300' },
    { search: /text-slate-500/g, replace: 'text-gray-400' },
    { search: /border-gray-100/g, replace: 'border-navy-800' },
    { search: /border-gray-200/g, replace: 'border-navy-700' },
    { search: /border-gray-300/g, replace: 'border-navy-600' },
    { search: /border-slate-100/g, replace: 'border-navy-800' },
    { search: /border-slate-200/g, replace: 'border-navy-700' },
    { search: /hover:bg-gray-50/g, replace: 'hover:bg-navy-800' },
    { search: /hover:bg-gray-100/g, replace: 'hover:bg-navy-700' },
    { search: /hover:bg-slate-50/g, replace: 'hover:bg-navy-800' },
    { search: /hover:bg-slate-100/g, replace: 'hover:bg-navy-700' },
    { search: /shadow-sm/g, replace: 'shadow-glass-sm' },
    { search: /shadow-md/g, replace: 'shadow-glass' },
    { search: /shadow-lg/g, replace: 'shadow-glass' },
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;

            replaceMapping.forEach(mapping => {
                content = content.replace(mapping.search, mapping.replace);
            });

            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

processDirectory(directoryPath);
console.log('Theme applied successfully.');
