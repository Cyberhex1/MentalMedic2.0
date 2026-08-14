const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace imports
code = code.replace(/import \{\n  saveUserProfileToFirestore,[\s\S]*?checkHasCloudProfile,\n\} from '\.\/lib\/firebase';/m, `import {
  auth,
  saveAppSnapshot,
  subscribeAppSnapshot,
  AppSnapshot
} from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';`);

// Remove google workspace auth import
code = code.replace(/import \{ initWorkspaceAuth, logoutGoogleWorkspace \} from '\.\/lib\/googleWorkspace';\n/g, '');

// Update googleUser to authUser
code = code.replace(/const \[googleUser, setGoogleUser\] = useState<User \| null>\(null\);/g, `const [authUser, setAuthUser] = useState<User | null>(null);
  const [isSnapshotLoaded, setIsSnapshotLoaded] = useState(false);`);

// Replace auth initialization
code = code.replace(/  \/\/ Initialize Auth state listener\n  useEffect\(\(\) => \{\n    const unsubscribe = initWorkspaceAuth\(\n      \(user\) => setGoogleUser\(user\),\n      \(\) => setGoogleUser\(null\)\n    \);\n    return \(\) => unsubscribe\(\);\n  \}, \[\]\);/s, `  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);`);

fs.writeFileSync('src/App.tsx', code);
