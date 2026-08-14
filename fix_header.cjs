const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Add auth props
code = code.replace(/interface HeaderProps \{/, `interface HeaderProps {\n  isSnapshotLoaded: boolean;\n  isAuthenticated: boolean;\n  onOpenLogin: () => void;`);

// Add props to component destructuring
code = code.replace(/export const Header: React\.FC<HeaderProps> = \(\{/, `export const Header: React.FC<HeaderProps> = ({\n  isSnapshotLoaded,\n  isAuthenticated,\n  onOpenLogin,`);

// Add Sync button to Action Triggers
const actionTriggersRegex = /\{"\/\* Action Triggers \*\/"\}/;
code = code.replace(/\{\/\* Action Triggers \*\/\}/, `{/* Action Triggers */}
        <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
          <button
            onClick={onOpenLogin}
            className={\`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border \${
              isAuthenticated 
                ? (isSnapshotLoaded ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300')
                : 'bg-indigo-50 text-indigo-700 border-indigo-300'
            }\`}
            title="Cloud Sync Status"
          >
            <Settings className={\`w-3.5 h-3.5 \${isAuthenticated && !isSnapshotLoaded ? 'animate-spin' : ''}\`} />
            <span className="hidden sm:inline">
              {isAuthenticated ? (isSnapshotLoaded ? 'Synced' : 'Syncing...') : 'Sign in to Sync'}
            </span>
          </button>
        </div>`);

fs.writeFileSync('src/components/Header.tsx', code);
