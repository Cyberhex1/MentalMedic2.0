const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the specific broken block
code = code.replace(/if \(authUser\) \{ {10}\}/g, '');
code = code.replace(/if \(authUser\) \{\n\s*updated\.forEach\(\(t\) =>\s*\}/g, '');

fs.writeFileSync('src/App.tsx', code);
