const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace googleUser with authUser across the file
code = code.replace(/googleUser\?.uid/g, 'authUser?.uid');
code = code.replace(/googleUser/g, 'authUser');

// Remove save*ToFirestore and delete*FromFirestore calls
code = code.replace(/saveUserProfileToFirestore\([^;]*;/g, '');
code = code.replace(/saveTodoToFirestore\([^;]*;/g, '');
code = code.replace(/deleteTodoFromFirestore\([^;]*;/g, '');
code = code.replace(/saveSymptomToFirestore\([^;]*;/g, '');
code = code.replace(/deleteSymptomFromFirestore\([^;]*;/g, '');
code = code.replace(/saveNoteToFirestore\([^;]*;/g, '');
code = code.replace(/deleteNoteFromFirestore\([^;]*;/g, '');
code = code.replace(/saveSessionLogToFirestore\([^;]*;/g, '');
code = code.replace(/saveUserStateToFirestore\([^;]*;/g, '');

fs.writeFileSync('src/App.tsx', code);
