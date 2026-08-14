const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
code = code.replace(/import \{ SettingsModal \} from '\.\/components\/SettingsModal';/, `import { SettingsModal } from './components/SettingsModal';\nimport { LoginModal } from './components/LoginModal';`);

// Add state for login modal
code = code.replace(/const \[isSettingsOpen, setIsSettingsOpen\] = useState<boolean>\(false\);/, `const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);\n  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);`);

// Update Header props
code = code.replace(/<Header\s+battery=\{battery\}/, `<Header
          isSnapshotLoaded={isSnapshotLoaded}
          isAuthenticated={!!authUser}
          onOpenLogin={() => setIsLoginOpen(true)}
          battery={battery}`);

// Render LoginModal
code = code.replace(/<SettingsModal/, `<LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
        />
        <SettingsModal`);

// Fix the SettingsModal onGoogleLogout to onSignOut because we changed it
code = code.replace(/onGoogleLogout=\{async \(\) => \{[\s\S]*?\}\}/, `onGoogleLogout={async () => {
            await signOut(auth);
            handleClearAllData();
            triggerToast('Signed out & Local Data Cleared');
          }}`);

fs.writeFileSync('src/App.tsx', code);
