import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Clock,
  BookCheck,
  TrendingUp,
  ArrowRight,
  Play,
  Bot,
  Compass,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';

interface DashboardStats {
  student_name: string;
  target_goal: string;
  level: number;
  xp: number;
  streak_days: number;
  daily_goal_minutes: number;
  daily_completed_minutes: number;
  total_lessons_completed: number;
  avg_quiz_score: number;
  recent_activities: Array<{ type: string; title: string; description: string; timestamp: string }>;
  recommended_topic: {
    id: number;
    title: string;
    course_name: string;
    duration_minutes: number;
    difficulty: string;
    summary: string;
  } | null;
  active_path: {
    id: number;
    title: string;
    subject: string;
    level: string;
    progress: number;
    total_topics: number;
    completed_topics: number;
    description: string;
  } | null;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<Array<{ day: string; hours: number }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [dashboardRes, analyticsRes] = await Promise.allSettled([api.get('/dashboard'), api.get('/analytics')]);
      if (dashboardRes.status === 'rejected') throw dashboardRes.reason;
      setStats(dashboardRes.value.data);
      setWeeklyActivity(analyticsRes.status === 'fulfilled' ? analyticsRes.value.data.weekly_activity || [] : []);
    } catch (err: any) {
      console.warn('Dashboard request failed:', err);
      setStats(null);
      setFetchError(err.response?.data?.detail || 'Your dashboard could not be loaded. Check that the backend is running and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading your real-time learning metrics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 rounded-2xl bg-navy-900 border border-slate-800 text-center space-y-4">
        <p role="alert" className="text-sm text-slate-300">{fetchError || 'Dashboard data is unavailable.'}</p>
        <button onClick={fetchDashboardData} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">Try again</button>
      </div>
    );
  }

  const currentPath = stats?.active_path;
  const currentGoalMinutes = stats?.daily_goal_minutes ?? 45;
  const currentCompletedMinutes = stats?.daily_completed_minutes ?? 0;
  const goalPercent = Math.min(100, Math.round((currentCompletedMinutes / currentGoalMinutes) * 100));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-indigo-950/80 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-violet/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized AI Learning Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-gradient">{stats?.student_name}</span>!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Target: <strong className="text-white">{stats?.target_goal}</strong>. You have logged <strong className="text-white">{currentCompletedMinutes} of {currentGoalMinutes} minutes</strong> toward today's study target.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/tutor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition-all text-xs sm:text-sm"
            >
              <Bot className="w-4 h-4" />
              <span>Launch AI Tutor</span>
            </Link>
            <Link
              to="/learning"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-xs sm:text-sm"
            >
              <span>View Pathways</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Daily Goal</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {currentCompletedMinutes}
            </span>
            <span className="text-xs text-slate-400">/ {currentGoalMinutes} min</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-indigo-400 mt-2 block">{goalPercent}% achieved today</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Active Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats?.streak_days}</span>
            <span className="text-xs text-slate-400">consecutive days</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-4 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{stats?.xp} Total XP accumulated</span>
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Lessons Mastered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BookCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats?.total_lessons_completed}</span>
            <span className="text-xs text-slate-400">topics in database</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-4 block">
            Level {stats?.level} Scholar Status
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Avg Quiz Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats?.avg_quiz_score}%</span>
            <span className="text-xs text-slate-400">assessment score</span>
          </div>
          <span className="text-[11px] text-violet-400 mt-4 block">
            Average of submitted quiz attempts
          </span>
        </div>
      </div>

      {/* Active Learning Path & Weekly Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Course Card (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Active Learning Pathway
              </span>
              <span className="text-xs text-slate-400">{currentPath ? `${currentPath.level} Level` : 'No active pathway'}</span>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              {currentPath?.title || 'No learning path yet'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {currentPath?.description || 'Generate a roadmap in My Learning to see your next steps here.'}
            </p>

            {/* Recommended Next Step Callout */}
            {stats?.recommended_topic && (
              <div className="p-3.5 rounded-xl bg-navy-950/80 border border-indigo-500/20 mb-6 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
                    Next Recommended Lesson:
                  </span>
                  <span className="text-sm font-medium text-white flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-brand-blue fill-brand-blue" />
                    {stats.recommended_topic.title}
                  </span>
                </div>
                <span className="text-xs text-slate-400 shrink-0">~{stats.recommended_topic.duration_minutes} mins</span>
              </div>
            )}

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Curriculum Progress</span>
                <span className="text-indigo-400 font-bold">{currentPath?.progress || 0}% Completed</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentPath?.progress || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                <span>{currentPath?.completed_topics || 0} of {currentPath?.total_topics || 0} modules finished</span>
                <span>{currentPath ? 'Saved to your account' : 'No active path'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <Link
              to="/learning"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <span>View all modules & roadmaps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/learning"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all"
            >
              <span>Continue Learning</span>
              <Play className="w-3.5 h-3.5 fill-white" />
            </Link>
          </div>
        </div>

        {/* Weekly Activity Chart (5 cols) */}
        <div className="lg:col-span-5 bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
              <h3 className="text-base font-bold text-white">Planner Time Completed</h3>
              <p className="text-xs text-slate-400">Completed task duration by date</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Weekly Trend
              </span>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hourColorDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#f8fafc'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#hourColorDash)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {weeklyActivity.length === 0 && <p className="text-xs text-slate-500 text-center">No dated planner activity is available yet.</p>}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Streak: {stats?.streak_days} days</span>
            <Link to="/progress" className="text-indigo-400 hover:text-indigo-300 font-medium">
              View Analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activities Feed */}
      <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-blue" />
              <span>Recent Learning & Assessment Activities</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live updates recorded in your student database
            </p>
          </div>
          <Link to="/planner" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            View Study Planner
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats?.recent_activities && stats.recent_activities.length > 0 ? (
            stats.recent_activities.slice(0, 3).map((act, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-navy-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    act.type === 'quiz' ? 'text-emerald-400 bg-emerald-500/10' : 'text-indigo-400 bg-indigo-500/10'
                  }`}>
                    {act.type}
                  </span>
                  <span className="text-[10px] text-slate-500">{act.timestamp}</span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{act.title}</h4>
                <p className="text-xs text-slate-400">{act.description}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 col-span-3">No recent activities recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
