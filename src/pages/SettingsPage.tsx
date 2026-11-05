import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Sliders,
  Bell,
  CheckCircle2,
  Palette,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'learning' | 'preferences' | 'appearance'>('profile');
  const [name, setName] = useState(user?.name || '');
  const email = user?.email || '';
  const [targetGoal, setTargetGoal] = useState(user?.target_goal || '');
  const [dailyTarget, setDailyTarget] = useState(user?.daily_goal_minutes ?? 45);
  const [pace, setPace] = useState('balanced');
  const [difficulty, setDifficulty] = useState('adaptive');
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [streakReminders, setStreakReminders] = useState(true);
  const [language, setLanguage] = useState('English (US)');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/auth/preferences').then(({ data }) => {
      setPace(data.learning_pace);
      setDifficulty(data.difficulty_preference);
      setEmailNotifs(data.email_notifications);
      setStreakReminders(data.streak_reminders);
      setLanguage(data.language);
    }).catch(() => setSaveError('Could not load saved preferences. Check your connection and try again.'));
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setTargetGoal(user.target_goal);
      setDailyTarget(user.daily_goal_minutes);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSavedSuccess(false);
    try {
      const res = await api.put('/auth/me', {
        name: name.trim(),
        target_goal: targetGoal.trim(),
        daily_goal_minutes: dailyTarget
      });
      updateUser(res.data);
      await api.put('/auth/preferences', {
        learning_pace: pace,
        difficulty_preference: difficulty,
        email_notifications: emailNotifs,
        streak_reminders: streakReminders,
        language,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error: any) {
      setSaveError(error.response?.data?.detail || 'Settings could not be saved. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'learning', label: 'Learning Goals', icon: Sliders },
    { id: 'preferences', label: 'Notifications & Language', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ] as const;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-blue" />
          <span>Platform Settings</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your profile and save your learning and notification preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile and learning preferences saved to your account.</span>
        </div>
      )}
      {saveError && <div role="alert" className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200">{saveError}</div>}

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-navy-900/60'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Student Profile Information
            </h2>

            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue via-indigo-600 to-brand-violet flex items-center justify-center font-bold text-xl text-white shadow-lg">
                {name.substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">{name}</h3>
                <p className="text-xs text-slate-400">{email}</p>
                <span className="inline-block text-[10px] font-semibold text-indigo-400 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800/40">
                  Level {user?.level ?? 1} Scholar • {user?.xp ?? 0} XP
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-navy-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Target Career / Specialization
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400">
                  Used by the curriculum synthesizer to select relevant prerequisites and practice problems.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Learning Preferences */}
        {activeTab === 'learning' && (
          <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Learning Preferences
            </h2>

            <p className="text-xs text-slate-400">
              These preferences are saved to your account. They currently do not change tutor responses or roadmap content.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Daily Study Goal (Minutes)
                </label>
                <div className="flex items-center gap-4">
                  {[25, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyTarget(mins)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        dailyTarget === mins
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-navy-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Learning Pace
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'relaxed', title: 'Relaxed', desc: 'A preference for a lighter study pace' },
                    { id: 'balanced', title: 'Balanced', desc: 'A preference for a steady study pace' },
                    { id: 'intensive', title: 'Intensive Sprint', desc: 'A preference for a more focused study pace' },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setPace(p.id as any)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        pace === p.id
                          ? 'bg-indigo-950/40 border-indigo-500 text-white'
                          : 'bg-navy-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-1 text-white">{p.title}</span>
                      <span className="text-[11px] leading-tight block">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Difficulty Calibration Mode
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-navy-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="adaptive">Balanced preference</option>
                  <option value="challenging">Challenging preference</option>
                  <option value="foundational">Foundational preference</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications & Language */}
        {activeTab === 'preferences' && (
          <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Notifications & Localization
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-white">Daily Streak Reminder</h4>
                  <p className="text-xs text-slate-400">Saved as a preference; notification delivery is not configured.</p>
                </div>
                <input
                  type="checkbox"
                  checked={streakReminders}
                  onChange={(e) => setStreakReminders(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-white">Weekly Progress Summary</h4>
                  <p className="text-xs text-slate-400">Saved as a preference; email delivery is not configured.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Platform Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="Spanish (ES)">Spanish (ES)</option>
                  <option value="German (DE)">German (DE)</option>
                  <option value="French (FR)">French (FR)</option>
                  <option value="Japanese (JA)">Japanese (JA)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Appearance */}
        {activeTab === 'appearance' && (
          <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Theme & Visual System
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-indigo-500 bg-navy-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Deep Navy & Violet (Active)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-xs text-slate-400">
                  Premium high-contrast dark theme designed to reduce eye fatigue during extended study sessions.
                </p>
                <div className="flex gap-2 pt-2">
                  <div className="w-6 h-6 rounded bg-[#070b14] border border-slate-700" />
                  <div className="w-6 h-6 rounded bg-[#3b82f6]" />
                  <div className="w-6 h-6 rounded bg-[#8b5cf6]" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 opacity-50 space-y-2 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-400">Cyberpunk Neon (Coming Soon)</span>
                </div>
                <p className="text-xs text-slate-500">
                  High saturation contrast with emerald matrix indicators.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all text-xs sm:text-sm flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSaving ? 'Saving Changes...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
