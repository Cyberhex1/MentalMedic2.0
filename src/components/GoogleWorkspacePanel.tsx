import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  FileText,
  Plus,
  Check,
  ExternalLink,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Send,
  Lock,
  Layers,
  Copy,
} from 'lucide-react';
import {
  signInWithGoogleWorkspace,
  logoutGoogleWorkspace,
  initWorkspaceAuth,
  fetchGoogleTasks,
  createGoogleTask,
  completeGoogleTask,
  createGoogleDoc,
  GoogleTask,
} from '../lib/googleWorkspace';
import { User } from 'firebase/auth';
import { SessionLog } from '../types';

interface GoogleWorkspacePanelProps {
  onImportTaskToMicroBar?: (taskTitle: string) => void;
  sessionLogs?: SessionLog[];
}

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({
  onImportTaskToMicroBar,
  sessionLogs = [],
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'docs'>('tasks');

  // Tasks state
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [taskErrorMessage, setTaskErrorMessage] = useState<string | null>(null);

  // Confirmation Modal state for mutating Google Workspace data
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'completeTask' | 'createDoc';
    title: string;
    description: string;
    actionItem?: any;
  }>({
    isOpen: false,
    type: 'completeTask',
    title: '',
    description: '',
  });

  // Docs state
  const [docTitle, setDocTitle] = useState<string>(`ZAWE Zero-Adrenaline Notes (${new Date().toLocaleDateString()})`);
  const [docContent, setDocContent] = useState<string>('Zero-adrenaline Focus Bits notes:\n\n- ');
  const [isCreatingDoc, setIsCreatingDoc] = useState<boolean>(false);
  const [createdDocUrl, setCreatedDocUrl] = useState<string | null>(null);
  const [docSuccessMessage, setDocSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initWorkspaceAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadTasks = async (currentToken: string) => {
    setIsLoadingTasks(true);
    setTaskErrorMessage(null);
    try {
      const list = await fetchGoogleTasks(currentToken);
      setTasks(list);
    } catch (err: any) {
      console.warn('Error fetching Google Tasks:', err);
      setTaskErrorMessage(err.message || 'Could not load Google Tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadTasks(token);
    }
  }, [token]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogleWorkspace();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await loadTasks(res.accessToken);
      }
    } catch (err: any) {
      console.warn('Google login failed:', err);
      const code = err?.code || '';
      if (code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain') || err?.message?.includes('invalid')) {
        setAuthError(`Unauthorized domain: "${window.location.hostname}" needs to be added to Firebase Console Authorized Domains.`);
      } else {
        setAuthError(err?.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogleWorkspace();
    setUser(null);
    setToken(null);
    setTasks([]);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !token) return;
    try {
      const created = await createGoogleTask(token, '@default', newTaskTitle.trim());
      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle('');
    } catch (err: any) {
      setTaskErrorMessage(`Failed to create task: ${err.message}`);
    }
  };

  const requestCompleteTask = (task: GoogleTask) => {
    setConfirmModal({
      isOpen: true,
      type: 'completeTask',
      title: 'Complete Google Task',
      description: `Are you sure you want to mark "${task.title}" as completed in your Google Tasks account?`,
      actionItem: task,
    });
  };

  const requestExportLogsToDoc = () => {
    const formattedLogs = sessionLogs
      .map(
        (log, idx) =>
          `[Shift ${idx + 1}] - ${log.date}\n- Completed Focus Bits: ${log.tasksCompleted}\n- Battery: ${log.energyEnd}%\n- Notes: "${log.notes || 'None'}"\n`
      )
      .join('\n---\n\n');

    const contentToExport = `ZAWE Shift Logs Summary\nDate: ${new Date().toLocaleDateString()}\nTotal Logs: ${
      sessionLogs.length
    }\n\n========================================\n\n${formattedLogs || 'No shift logs recorded today.'}`;

    setConfirmModal({
      isOpen: true,
      type: 'createDoc',
      title: 'Export Shift Logs to Google Docs',
      description: `This will create a brand new Google Doc in your Google Drive containing your ${sessionLogs.length} logged shift notes.`,
      actionItem: { title: `ZAWE Shift Logs - ${new Date().toLocaleDateString()}`, content: contentToExport },
    });
  };

  const handleExecuteConfirmedAction = async () => {
    if (!token) return;

    if (confirmModal.type === 'completeTask' && confirmModal.actionItem) {
      const taskToComplete = confirmModal.actionItem as GoogleTask;
      try {
        await completeGoogleTask(token, '@default', taskToComplete.id);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskToComplete.id ? { ...t, status: 'completed' } : t))
        );
      } catch (err: any) {
        setTaskErrorMessage(`Failed to mark completed: ${err.message}`);
      }
    } else if (confirmModal.type === 'createDoc' && confirmModal.actionItem) {
      setIsCreatingDoc(true);
      setDocSuccessMessage(null);
      setCreatedDocUrl(null);
      try {
        const { title, content } = confirmModal.actionItem;
        const doc = await createGoogleDoc(token, title, content);
        const url = `https://docs.google.com/document/d/${doc.documentId}/edit`;
        setCreatedDocUrl(url);
        setDocSuccessMessage(`Document successfully created: "${title}"`);
      } catch (err: any) {
        console.warn('Doc creation failed:', err);
      } finally {
        setIsCreatingDoc(false);
      }
    }

    setConfirmModal({ isOpen: false, type: 'completeTask', title: '', description: '' });
  };

  const handleCreateCustomDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !docTitle.trim()) return;

    setConfirmModal({
      isOpen: true,
      type: 'createDoc',
      title: 'Create Google Doc',
      description: `Are you sure you want to create a new Google Doc titled "${docTitle.trim()}" in your Google Drive?`,
      actionItem: { title: docTitle.trim(), content: docContent },
    });
  };

  if (!user || !token) {
    return (
      <div className="bg-pink-50/40 border border-pink-100 rounded-2xl p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center mx-auto text-pink-600">
          <Layers className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-800">Connect Google Workspace</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Sync your Google Tasks into zero-adrenaline Focus Bits and export shift notes directly into Google Docs without leaving your calm workspace.
          </p>
        </div>

        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-3 bg-white text-slate-800 hover:bg-slate-50 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-200 shadow-md shadow-pink-500/5 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>

          {authError && (
            <div className="w-full max-w-md p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-amber-900 text-xs space-y-2 mt-2">
              <div className="flex items-start gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Google OAuth Domain Authorization Required</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">{authError}</p>
              <div className="pt-1 flex items-center justify-between gap-2 border-t border-amber-200/60">
                <span className="text-[10px] font-mono font-semibold truncate bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                  {window.location.hostname}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.hostname);
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 2000);
                  }}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Copied Domain!' : 'Copy Domain'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-pink-100 rounded-2xl p-5 md:p-6 space-y-5">
      {/* User Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-pink-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold border border-pink-200">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-slate-800">{user.displayName || user.email}</p>
            <p className="text-[10px] text-pink-600 font-medium">Google Workspace Connected</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Google Tasks</span>
            {tasks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-pink-100 text-[10px] text-pink-700 font-mono">
                {tasks.filter((t) => t.status === 'needsAction').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'docs'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Google Docs</span>
          </button>
        </div>

        {activeTab === 'tasks' && (
          <button
            onClick={() => token && loadTasks(token)}
            disabled={isLoadingTasks}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTasks ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Tab 1: Google Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add micro-task to Google Tasks..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500 font-medium"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {taskErrorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{taskErrorMessage}</span>
            </div>
          )}

          {isLoadingTasks ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading Google Tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">No active Google Tasks found.</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    task.status === 'completed'
                      ? 'bg-slate-50/60 border-slate-200/80 opacity-60'
                      : 'bg-white border-slate-100 hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <button
                      onClick={() => task.status !== 'completed' && requestCompleteTask(task)}
                      disabled={task.status === 'completed'}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        task.status === 'completed'
                          ? 'bg-pink-500 border-pink-500 text-white'
                          : 'border-slate-300 hover:border-pink-500 text-transparent cursor-pointer'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <span
                      className={`text-xs text-slate-800 font-medium truncate ${
                        task.status === 'completed' ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {task.status !== 'completed' && onImportTaskToMicroBar && (
                    <button
                      onClick={() => onImportTaskToMicroBar(task.title)}
                      className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Import</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Google Docs */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-500" />
                <span>Export Today's Shift Logs</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">{sessionLogs.length} logs ready</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Transfer your completed shift history into a clean Google Doc.
            </p>
            <button
              onClick={requestExportLogsToDoc}
              disabled={sessionLogs.length === 0 || isCreatingDoc}
              className="w-full py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-pink-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Export {sessionLogs.length} Logs to Google Doc</span>
            </button>
          </div>

          <form onSubmit={handleCreateCustomDoc} className="space-y-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-800">Create Zero-Adrenaline Scratchpad</h4>
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">Doc Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">Initial Notes Body</label>
              <textarea
                rows={3}
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500 resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isCreatingDoc || !docTitle.trim()}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Google Doc</span>
            </button>
          </form>

          {docSuccessMessage && createdDocUrl && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
              <span>{docSuccessMessage}</span>
              <a
                href={createdDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
              >
                <span>Open Doc</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-pink-100 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-pink-600">
              <Lock className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-800">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{confirmModal.description}</p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: 'completeTask', title: '', description: '' })}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteConfirmedAction}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white transition-all cursor-pointer shadow-md shadow-pink-500/20"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
