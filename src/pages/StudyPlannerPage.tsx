import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  BookOpen,
  Code,
  FileText,
  RotateCw,
  Loader2,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';

interface StudyTask {
  id: number;
  title: string;
  course_name: string;
  duration_minutes: number;
  time_slot: string;
  due_date: string;
  priority: string;
  completed: boolean;
  category: string;
}

export const StudyPlannerPage: React.FC = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Today' | 'Tomorrow'>('Today');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('Neural Networks & Deep Learning');
  const [newDuration, setNewDuration] = useState('30');
  const [newCategory, setNewCategory] = useState<'Theory' | 'Coding' | 'Quiz' | 'Revision'>('Theory');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const fetchTasks = async () => {
    setIsLoading(true);
    setTaskError(null);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.warn('Could not fetch study tasks:', err);
      setTasks([]);
      setTaskError('Study planner tasks could not be loaded. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/toggle`);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'The task could not be updated. Please try again.');
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation();
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'The task could not be deleted. Please try again.');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const payload = {
      title: newTitle.trim(),
      course_name: newCourse.trim(),
      duration_minutes: parseInt(newDuration, 10) || 30,
      time_slot: 'Flexible',
      due_date: activeFilter === 'Tomorrow' ? 'Tomorrow' : 'Today',
      priority: newPriority,
      category: newCategory,
    };

    try {
      const res = await api.post('/tasks', payload);
      setTasks((prev) => [res.data, ...prev]);
      setNewTitle('');
      setIsAddingTask(false);
    } catch (err: any) {
      alert('Failed to save study task: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filteredTasks =
    activeFilter === 'All'
      ? tasks
      : tasks.filter((t) => t.due_date === activeFilter);

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const totalPlannedMinutes = tasks.reduce((acc, t) => acc + (t.duration_minutes || 0), 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coding': return <Code className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Quiz': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Revision': return <RotateCw className="w-3.5 h-3.5 text-amber-400" />;
      default: return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {taskError && (
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-sm text-rose-200">
          <span>{taskError}</span>
          <button type="button" onClick={fetchTasks} className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-xs font-semibold">Try again</button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-brand-blue" />
            <span>AI Adaptive Study Planner</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Optimized study blocks saved in SQLite and synchronized across your daily schedule.
          </p>
        </div>

        <button
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Block</span>
        </button>
      </div>

      {/* Progress Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-5 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Task Completion Rate
              </span>
              <span className="text-xs font-bold text-white">
                {completedCount} of {tasks.length} tasks completed
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Completing tasks updates your XP and records active retention in your personal database.
          </p>
        </div>

        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Planned Focus Time</span>
            <Clock className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-bold text-white">{(totalPlannedMinutes / 60).toFixed(1)} hrs</span>
            <span className="text-xs text-slate-400 block mt-1">{tasks.length} study tasks scheduled</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Synced with SQLite backend</span>
        </div>
      </div>

      {/* New Task Inline Form */}
      {isAddingTask && (
        <form
          onSubmit={handleAddTask}
          className="bg-navy-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Add New Study Task</h3>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-medium text-slate-300">Task Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Derive Softmax Cross-Entropy gradient on paper"
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Subject / Course</label>
              <input
                type="text"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Duration (minutes)</label>
              <select
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="15">15 mins</option>
                <option value="25">25 mins (Pomodoro)</option>
                <option value="30">30 mins</option>
                <option value="45">45 mins</option>
                <option value="60">60 mins</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Category:</span>
              {(['Theory', 'Coding', 'Quiz', 'Revision'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    newCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-md"
            >
              Save to Database
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {(['Today', 'Tomorrow', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-navy-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredTasks.length} study tasks
        </span>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTaskCompletion(task.id)}
              className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                task.completed
                  ? 'bg-navy-950/40 border-slate-800/50 opacity-60'
                  : 'bg-navy-900/70 border-slate-800/80 hover:border-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskCompletion(task.id);
                  }}
                  className="shrink-0 text-slate-400 hover:text-indigo-400"
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                <div>
                  <h4 className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-400" />
                      {task.course_name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.duration_minutes} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                  {getCategoryIcon(task.category)}
                  <span>{task.category}</span>
                </span>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    task.priority === 'high'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.priority}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleDeleteTask(e, task.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-navy-900/40 border border-slate-800 rounded-2xl p-6">
          <CalendarDays className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-xs">No tasks scheduled for {activeFilter}. Click "Add Study Block" to schedule one.</p>
        </div>
      )}
    </div>
  );
};
