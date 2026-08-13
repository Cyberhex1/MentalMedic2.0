import React, { useState } from 'react';
import { FileText, Plus, Pin, Trash2, X, Sparkles, Check, Send } from 'lucide-react';
import { NoteItem } from '../types';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  onAddNote: (note: Omit<NoteItem, 'id' | 'timestamp' | 'date'>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<'general' | 'somatic' | 'office' | 'task' | 'gentle_reminders'>('general');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddNote({
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      category,
      pinned: false,
    });

    setTitle('');
    setContent('');
  };

  const filteredNotes = notes.filter((n) => filterCategory === 'all' || n.category === filterCategory);
  const sortedNotes = [...filteredNotes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-end z-50 animate-fadeIn">
      <div className="bg-white border-l border-pink-100 max-w-md w-full h-full p-6 flex flex-col shadow-2xl shadow-pink-500/10 space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Focus & Somatic Notes</h2>
              <p className="text-[11px] text-slate-400">Low-arousal micro scratchpad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note Input Form */}
        <form onSubmit={handleCreate} className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title (e.g. Brain dump)..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500 font-semibold"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] text-slate-700 font-medium focus:outline-none focus:border-pink-500 cursor-pointer"
            >
              <option value="general">General</option>
              <option value="gentle_reminders">Gentle Reminders 🌸</option>
              <option value="somatic">Somatic</option>
              <option value="office">Office</option>
              <option value="task">Tasks</option>
            </select>
          </div>

          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a gentle note or task details..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-pink-500 resize-none font-sans"
          />

          <button
            type="submit"
            disabled={!content.trim()}
            className="w-full py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Save Micro Note</span>
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold scrollbar-none">
          {['all', 'gentle_reminders', 'general', 'somatic', 'office', 'task'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat === 'gentle_reminders' ? 'Gentle Reminds 🌸' : cat}
            </button>
          ))}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {sortedNotes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No notes saved yet in this category. Write a quick brain dump above!
            </div>
          ) : (
            sortedNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3.5 rounded-2xl border transition-all relative group ${
                  note.pinned
                    ? 'bg-pink-50/80 border-pink-200 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-pink-100 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        note.category === 'gentle_reminders'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : note.category === 'somatic'
                          ? 'bg-rose-100 text-rose-700'
                          : note.category === 'office'
                          ? 'bg-blue-100 text-blue-700'
                          : note.category === 'task'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {note.category === 'gentle_reminders' ? 'Gentle Remind 🌸' : note.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">{note.title}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTogglePin(note.id)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        note.pinned ? 'text-pink-600 bg-pink-100' : 'text-slate-300 hover:text-slate-600'
                      }`}
                      title={note.pinned ? 'Unpin Note' : 'Pin Note'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed mt-2">{note.content}</p>

                <div className="text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100 flex justify-between">
                  <span>{note.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
