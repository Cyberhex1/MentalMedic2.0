import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Check,
  Zap,
  Grid,
  Filter,
  Trash2,
  ListTodo,
  Layers,
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  Split,
  Copy,
  SlidersHorizontal,
} from 'lucide-react';
import { TodoItem, FocusBit, EisenhowerCategory, Rule135Category } from '../types';

interface TodoFocusBitsTabProps {
  todos: TodoItem[];
  onAddTodo: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'focusBits'>) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onShatterIntoFocusBits: (todoId: string, bitTitles: string[]) => void;
  onToggleFocusBit: (todoId: string, bitId: string) => void;
  onSendToSprint: (taskTitle: string) => void;
}

export const TodoFocusBitsTab: React.FC<TodoFocusBitsTabProps> = ({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onShatterIntoFocusBits,
  onToggleFocusBit,
  onSendToSprint,
}) => {
  const [activeView, setActiveView] = useState<'all' | 'eisenhower' | 'rule135' | 'frogs' | 'projects'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'work' | 'admin' | 'care' | 'somatic'>('all');
  const [lowAdrenalineOnly, setLowAdrenalineOnly] = useState<boolean>(false);

  const [newTitle, setNewTitle] = useState<string>('');
  const [newProject, setNewProject] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [eisenhower, setEisenhower] = useState<EisenhowerCategory>('urgent_important');
  const [rule135, setRule135] = useState<Rule135Category>('small');
  const [isFrog, setIsFrog] = useState<boolean>(false);
  const [shatterModalTodo, setShatterModalTodo] = useState<TodoItem | null>(null);
  const [customBits, setCustomBits] = useState<string[]>(['', '', '']);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTodo({
      title: newTitle.trim(),
      completed: false,
      priority,
      eisenhower,
      rule135,
      isFrog,
      project: newProject.trim() || undefined,
    });

    setNewTitle('');
    setIsFrog(false);
  };

  const handleDuplicate = (todo: TodoItem) => {
    onAddTodo({
      title: `${todo.title} (Copy)`,
      completed: false,
      priority: todo.priority,
      eisenhower: todo.eisenhower,
      rule135: todo.rule135,
      isFrog: todo.isFrog,
    });
  };

  const handleOpenShatterModal = (todo: TodoItem) => {
    setShatterModalTodo(todo);
    setCustomBits([
      `Open files / docs for ${todo.title}`,
      `Outline key points or first 2 steps`,
      `Finalize and save progress`,
    ]);
  };

  const handleConfirmShatter = () => {
    if (!shatterModalTodo) return;
    const validBits = customBits.filter((b) => b.trim().length > 0);
    if (validBits.length > 0) {
      onShatterIntoFocusBits(shatterModalTodo.id, validBits);
    }
    setShatterModalTodo(null);
  };

  const filteredTodos = todos.filter((todo) => {
    if (activeView === 'frogs' && !todo.isFrog) return false;
    if (lowAdrenalineOnly && todo.rule135 !== 'small') return false;
    return true;
  });

  const renderTodoItem = (todo: TodoItem) => {
    const completedBitsCount = todo.focusBits?.filter((b) => b.completed).length || 0;
    const totalBitsCount = todo.focusBits?.length || 0;
    const bitProgressRatio = totalBitsCount > 0 ? (completedBitsCount / totalBitsCount) * 100 : 0;

    return (
      <div
        key={todo.id}
        className={`p-4 rounded-2xl border transition-all space-y-3 ${
          todo.completed
            ? 'bg-slate-50/60 border-slate-200/80 opacity-70'
            : 'bg-white border-slate-100 hover:border-pink-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => onToggleTodo(todo.id)}
              className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                todo.completed
                  ? 'bg-pink-500 border-pink-500 text-white'
                  : 'border-slate-300 hover:border-pink-500 text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                {todo.isFrog && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                    🐸 FROG
                  </span>
                )}
                {todo.project && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                    {todo.project}
                  </span>
                )}
                <h4
                  className={`text-xs font-bold text-slate-800 truncate ${
                    todo.completed ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {todo.title}
                </h4>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleDuplicate(todo)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Duplicate Task"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleOpenShatterModal(todo)}
              className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
              title="Shatter this big task into zero-dread Focus Bits"
            >
              <Split className="w-3 h-3 text-purple-600" />
              <span className="hidden sm:inline">Shatter to Bits</span>
            </button>

            <button
              onClick={() => onSendToSprint(todo.title)}
              className="px-2.5 py-1 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-pink-500/20"
            >
              <Zap className="w-3 h-3" />
              <span>Sprint</span>
            </button>

            <button
              onClick={() => onDeleteTodo(todo.id)}
              className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Focus Bits List & Progress Bar */}
        {totalBitsCount > 0 && (
          <div className="ml-8 p-3 bg-pink-50/40 border border-pink-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-pink-700">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-500" />
                <span>Focus Bits Progress ({completedBitsCount}/{totalBitsCount}):</span>
              </span>
              <span className="font-mono">{Math.round(bitProgressRatio)}%</span>
            </div>

            <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500 transition-all duration-300"
                style={{ width: `${bitProgressRatio}%` }}
              />
            </div>

            <div className="space-y-1.5 pt-1">
              {todo.focusBits?.map((bit) => (
                <div
                  key={bit.id}
                  onClick={() => onToggleFocusBit(todo.id, bit.id)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      bit.completed
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : 'border-slate-300 bg-white group-hover:border-pink-400 text-transparent'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span
                    className={`text-xs text-slate-700 ${
                      bit.completed ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {bit.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and View Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-pink-500" />
            <span>To-Do & Focus Bits Matrix</span>
          </h3>
          <p className="text-xs text-slate-500">
            Structure tasks with popular tactics or shatter large goals into zero-dread Focus Bits.
          </p>
        </div>

        {/* Tactical Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveView('all')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'all'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Tasks</span>
          </button>

          <button
            onClick={() => setActiveView('eisenhower')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'eisenhower'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Eisenhower Matrix</span>
          </button>

          <button
            onClick={() => setActiveView('rule135')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'rule135'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-3-5 Rule</span>
          </button>

          <button
            onClick={() => setActiveView('frogs')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'frogs'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Eat The Frog</span>
          </button>

          <button
            onClick={() => setActiveView('projects')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'projects'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Projects</span>
          </button>

          {/* Low-Adrenaline Mode Filter */}
          <button
            onClick={() => setLowAdrenalineOnly((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
              lowAdrenalineOnly
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
            title="Filter to show only micro, low-dread Focus Bits"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{lowAdrenalineOnly ? 'Low-Adrenaline: ON' : 'Low-Adrenaline Filter'}</span>
          </button>
        </div>
      </div>

      {/* Add New Task Form */}
      <form onSubmit={handleCreate} className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add new task (e.g. Write quarter report draft)..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500 font-semibold"
          />
          <input
            type="text"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            placeholder="Project (optional)"
            className="w-full sm:w-48 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500 font-semibold"
          />

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Eisenhower:</span>
            <select
              value={eisenhower}
              onChange={(e) => setEisenhower(e.target.value as EisenhowerCategory)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 font-medium cursor-pointer"
            >
              <option value="urgent_important">🔥 Do First (Urgent & Important)</option>
              <option value="not_urgent_important">📅 Schedule (Important, Not Urgent)</option>
              <option value="urgent_not_important">⚡ Delegate/Quick (Urgent, Not Important)</option>
              <option value="not_urgent_not_important">☕ Low Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">1-3-5 Category:</span>
            <select
              value={rule135}
              onChange={(e) => setRule135(e.target.value as Rule135Category)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 font-medium cursor-pointer"
            >
              <option value="big">1 Big Thing</option>
              <option value="medium">3 Medium Tasks</option>
              <option value="small">5 Focus Bits</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
            <input
              type="checkbox"
              checked={isFrog}
              onChange={(e) => setIsFrog(e.target.checked)}
              className="accent-amber-500 cursor-pointer"
            />
            <span>🐸 Mark as "Frog" (Do First)</span>
          </label>
        </div>
      </form>

      {/* Eisenhower Grid View */}
      {activeView === 'eisenhower' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              key: 'urgent_important',
              title: '🔥 Do First (Urgent & Important)',
              color: 'bg-rose-50/70 border-rose-200',
            },
            {
              key: 'not_urgent_important',
              title: '📅 Schedule (Important, Not Urgent)',
              color: 'bg-pink-50/70 border-pink-200',
            },
            {
              key: 'urgent_not_important',
              title: '⚡ Delegate / Micro (Urgent, Low Impact)',
              color: 'bg-amber-50/70 border-amber-200',
            },
            {
              key: 'not_urgent_not_important',
              title: '☕ Somatic Low Bar (Optional)',
              color: 'bg-slate-50/70 border-slate-200',
            },
          ].map((quad) => {
            const quadTodos = todos.filter((t) => t.eisenhower === quad.key);
            return (
              <div key={quad.key} className={`p-4 rounded-2xl border ${quad.color} space-y-3`}>
                <h4 className="text-xs font-bold text-slate-800">{quad.title}</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {quadTodos.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No tasks in this quadrant.</p>
                  ) : (
                    quadTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <span className={`text-xs font-medium text-slate-800 truncate ${todo.completed ? 'line-through text-slate-400' : ''}`}>
                          {todo.title}
                        </span>
                        <button
                          onClick={() => onSendToSprint(todo.title)}
                          className="px-2 py-0.5 bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-[10px] rounded-md shrink-0 cursor-pointer"
                        >
                          Sprint
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1-3-5 Rule View */}
      {activeView === 'rule135' && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              key: 'big',
              title: '🌟 1 Big Goal Target',
              subtitle: 'Focus all initial energy here',
              color: 'bg-pink-50 border-pink-200',
            },
            {
              key: 'medium',
              title: '⚡ 3 Medium Tasks',
              subtitle: 'Secondary priorities',
              color: 'bg-purple-50 border-purple-200',
            },
            {
              key: 'small',
              title: '🧩 5 Micro Focus Bits',
              subtitle: 'Atomic, zero-dread actions',
              color: 'bg-blue-50 border-blue-200',
            },
          ].map((cat) => {
            const catTodos = todos.filter((t) => t.rule135 === cat.key);
            return (
              <div key={cat.key} className={`p-4 rounded-2xl border ${cat.color} space-y-3`}>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{cat.title}</h4>
                  <p className="text-[10px] text-slate-500">{cat.subtitle}</p>
                </div>

                <div className="space-y-2">
                  {catTodos.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No items assigned.</p>
                  ) : (
                    catTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <span className={`text-xs font-medium text-slate-800 truncate ${todo.completed ? 'line-through text-slate-400' : ''}`}>
                          {todo.title}
                        </span>
                        <button
                          onClick={() => onSendToSprint(todo.title)}
                          className="px-2 py-0.5 bg-pink-500 text-white font-bold text-[10px] rounded-md shrink-0 cursor-pointer"
                        >
                          Sprint
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main List View (All or Frogs or Projects) */}
      {(activeView === 'all' || activeView === 'frogs' || activeView === 'projects') && (
        <div className="space-y-6">
          {filteredTodos.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No tasks found matching filter. Create a new task above or toggle filters!
            </div>
          ) : activeView === 'projects' ? (
            // Group by project
            Object.entries(
              filteredTodos.reduce((acc, todo) => {
                const proj = todo.project || 'Uncategorized';
                if (!acc[proj]) acc[proj] = [];
                acc[proj].push(todo);
                return acc;
              }, {} as Record<string, TodoItem[]>)
            ).map(([projectName, projTodos]) => (
              <div key={projectName} className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-500" />
                  {projectName}
                </h4>
                <div className="space-y-3">
                  {(projTodos as TodoItem[]).map((todo) => renderTodoItem(todo))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-3">
              {filteredTodos.map((todo) => renderTodoItem(todo))}
            </div>
          )}
        </div>
      )}

      {/* Shatter into Focus Bits Modal */}
      {shatterModalTodo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-pink-100 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-purple-600">
              <Split className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800">Shatter Task into Focus Bits</h3>
            </div>

            <p className="text-xs text-slate-600">
              Break down <span className="font-bold text-slate-800">"{shatterModalTodo.title}"</span> into 3 zero-dread micro-steps:
            </p>

            <div className="space-y-2">
              {customBits.map((bit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-pink-500">{idx + 1}.</span>
                  <input
                    type="text"
                    value={bit}
                    onChange={(e) => {
                      const next = [...customBits];
                      next[idx] = e.target.value;
                      setCustomBits(next);
                    }}
                    placeholder={`Focus Bit ${idx + 1}...`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShatterModalTodo(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShatter}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white cursor-pointer shadow-md shadow-pink-500/20"
              >
                Confirm Focus Bits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
