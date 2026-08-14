const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\/\/ Subscribe to Firestore data when user is authenticated[\s\S]*?\}, \[googleUser\?.uid\]\);/m;
const replacement = `// Load initial snapshot
  useEffect(() => {
    if (!authUser) {
      setIsSnapshotLoaded(false);
      return;
    }
    const unsub = subscribeAppSnapshot(authUser.uid, (snapshot) => {
      if (snapshot) {
        if (snapshot.userProfile) setUserProfile({ ...DEFAULT_PROFILE, ...snapshot.userProfile });
        if (snapshot.todos) setTodos(snapshot.todos);
        if (snapshot.symptomLogs) setSymptomLogs(snapshot.symptomLogs);
        if (snapshot.notes) setNotes(snapshot.notes);
        if (snapshot.sessionLogs) setSessionLogs(snapshot.sessionLogs);
        if (typeof snapshot.battery === 'number') setBattery(snapshot.battery);
      }
      setIsSnapshotLoaded(true);
    });
    return () => unsub();
  }, [authUser]);

  // Save snapshot continuously when state changes, debounced
  useEffect(() => {
    if (!authUser || !isSnapshotLoaded) return;
    const timeout = setTimeout(() => {
      saveAppSnapshot(authUser.uid, {
        userProfile,
        todos,
        symptomLogs,
        notes,
        sessionLogs,
        battery
      });
    }, 1000); // 1 second debounce
    return () => clearTimeout(timeout);
  }, [authUser, isSnapshotLoaded, userProfile, todos, symptomLogs, notes, sessionLogs, battery]);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
