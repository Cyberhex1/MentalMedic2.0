const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import for Maximize/Minimize icon
code = code.replace(/import \{ \n  Clock,/, `import { \n  Maximize, \n  Minimize, \n  Clock,`);

// Add isZenMode state
code = code.replace(/const \[isSettingsOpen, setIsSettingsOpen\] = useState<boolean>\(false\);/, `const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);\n  const [isZenMode, setIsZenMode] = useState<boolean>(false);`);

// Modify the main content block
const mainRegex = /<main className="bg-white\/80 dark:bg-slate-900\/90 border border-pink-100 dark:border-slate-800 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-pink-500\/5 min-w-0 max-w-full overflow-hidden">/;
const replacement = `<main className={
          isZenMode 
            ? "fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 md:p-16 overflow-y-auto flex flex-col"
            : "bg-white/80 dark:bg-slate-900/90 border border-pink-100 dark:border-slate-800 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-pink-500/5 min-w-0 max-w-full overflow-hidden relative"
        }>
          
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className={\`absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer \${isZenMode ? 'fixed top-6 right-6 z-50 bg-white/50 backdrop-blur shadow-sm border border-slate-200' : ''}\`}
            title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode (Focus)"}
          >
            {isZenMode ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5 text-slate-300 hover:text-slate-600" />}
          </button>
          
          <div className={isZenMode ? "max-w-4xl w-full mx-auto flex-1 mt-8" : ""}>
`;

code = code.replace(mainRegex, replacement);

// Close the wrapper div we added for Zen Mode content
code = code.replace(/\{activeTab === 'medical' && \(\n            <MedicalSymptomsTab\n              symptomLogs=\{symptomLogs\}\n              onAddLog=\{handleAddSymptomLog\}\n              onDeleteLog=\{handleDeleteSymptomLog\}\n            \/>\n          \)\}/, `{activeTab === 'medical' && (
            <MedicalSymptomsTab
              symptomLogs={symptomLogs}
              onAddLog={handleAddSymptomLog}
              onDeleteLog={handleDeleteSymptomLog}
            />
          )}
          </div>`);

// Hide the other UI elements when in Zen Mode
code = code.replace(/<div className="max-w-4xl w-full min-w-0 space-y-5 sm:space-y-6">/, `<div className="max-w-4xl w-full min-w-0 space-y-5 sm:space-y-6">
        
        {!isZenMode && (
          <>`);

code = code.replace(/<\/nav>\n        <\/div>/, `</nav>
        </div>
        </>
        )}`);


fs.writeFileSync('src/App.tsx', code);
