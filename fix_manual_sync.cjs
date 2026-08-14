const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/await syncAllWithFirestore\(authUser\.uid, userProfile, todos, symptomLogs, notes, sessionLogs, battery\);/g, `await saveAppSnapshot(authUser.uid, { userProfile, todos, symptomLogs, notes, sessionLogs, battery });`);

// Also fix empty blocks that got left over
code = code.replace(/if \(authUser\) \{ {10}\}/g, '');
code = code.replace(/if \(authUser\) \{\s*\}/g, '');

fs.writeFileSync('src/App.tsx', code);
