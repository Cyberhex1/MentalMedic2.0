import React from 'react';
import { X, Calendar, Download, Trash2, Award, Zap } from 'lucide-react';
import { SessionLog } from '../types';

interface SessionLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SessionLog[];
  onClearLogs: () => void;
}

export const SessionLogsModal: React.FC<SessionLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  const totalBitsAllTime = logs.reduce((acc, curr) => acc + curr.tasksCompleted, 0);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zawe_shift_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-pink-100 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-pink-500/10 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            <h2 className="text-base font-bold text-slate-800">Historical Shift Logs</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Top Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-100 text-center">
              <span className="text-xs text-slate-500 block font-medium">Shifts Logged</span>
              <span className="text-xl font-black text-slate-800 font-mono">{logs.length}</span>
            </div>
            <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-100 text-center">
              <span className="text-xs text-slate-500 block font-medium">Total Focus Bits</span>
              <span className="text-xl font-black text-pink-600 font-mono">{totalBitsAllTime}</span>
            </div>
            <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-100 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 block font-medium">Protocol</span>
              <span className="text-xs font-extrabold text-emerald-600 block mt-1">Zero-Adrenaline</span>
            </div>
          </div>

          {/* Logs List */}
          {logs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-400">No shift logs saved yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50/60 border border-slate-100 hover:border-pink-200 rounded-2xl p-4 text-xs space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-bold text-slate-800">{log.date}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-mono font-bold text-[10px]">
                      Rating: {log.effortRating.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-700 font-medium">
                    <span className="flex items-center gap-1 text-pink-600 font-bold">
                      <Award className="w-3.5 h-3.5" />
                      {log.tasksCompleted} Focus Bits
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      {log.energyEnd}% Battery
                    </span>
                  </div>

                  {log.notes && (
                    <p className="text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Logs</span>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={logs.length === 0}
            className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-md shadow-pink-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
