import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Brain,
  ArrowRight,
  Loader2,
  RefreshCw,
  BookOpen,
  HelpCircle,
  Clock,
  Compass,
  CheckSquare
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface CompletedModule {
  id: number;
  title: string;
  course_name: string;
  subject: string;
  duration_minutes: number;
  difficulty: string;
  mastery_score: number;
}

interface EnrolledPath {
  id: number;
  title: string;
  subject: string;
  level: string;
  progress: number;
  completed_topics: number;
  total_topics: number;
}

interface QuizHistoryItem {
  id: number;
  topic_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
}

interface AnalyticsData {
  total_study_hours: number;
  mastery_index: number;
  accuracy_percentage: number;
  weekly_activity: Array<{ day: string; hours: number; topics: number; score: number | null }>;
  strong_topics: Array<{ subject: string; mastery: number; remedyAction: string }>;
  weak_topics: Array<{ subject: string; mastery: number; benchmark?: number; remedyAction: string }>;
  completed_modules?: CompletedModule[];
  enrolled_paths?: EnrolledPath[];
  total_completed_lessons?: number;
}

export const MyProgressPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [analyticsRes, historyRes] = await Promise.allSettled([
        api.get('/analytics'),
        api.get('/quizzes/history')
      ]);

      if (analyticsRes.status === 'fulfilled') {
        setData(analyticsRes.value.data);
      } else {
        throw analyticsRes.reason;
      }

      if (historyRes.status === 'fulfilled') {
        setQuizHistory(historyRes.value.data || []);
      }
    } catch (err) {
      console.warn('Analytics request failed:', err);
      setData(null);
      setFetchError('Progress data could not be loaded. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Aggregating quiz attempts and progress metrics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 rounded-2xl bg-navy-900 border border-slate-800 text-center space-y-4">
        <p role="alert" className="text-sm text-slate-300">{fetchError || 'Progress data is unavailable.'}</p>
        <button onClick={fetchAnalytics} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">Try again</button>
      </div>
    );
  }

  const enrolledPaths = data?.enrolled_paths || [];
  const completedModules = data?.completed_modules || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <LineChartIcon className="w-6 h-6 text-brand-blue" />
            <span>Learning Analytics & Cognitive Progress</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time diagnostics calculated directly from your quiz performance and lesson completions in SQLite.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-800 text-slate-300 hover:text-white text-xs self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Learning Progress Index</span>
            <Brain className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{data?.mastery_index}</span>
            <span className="text-xs text-emerald-400 font-semibold">Calculated in DB</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            A simple progress estimate based on completed modules and recorded quiz accuracy.
          </p>
        </div>

        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Quiz Assessment Accuracy</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{data?.accuracy_percentage}%</span>
            <span className="text-xs text-slate-400">cumulative average</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Accuracy across all submitted multiple-choice practice checks.
          </p>
        </div>

        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Study Time</span>
            <Award className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{data?.total_study_hours} hrs</span>
            <span className="text-xs text-violet-400 font-semibold">{data?.total_completed_lessons || completedModules.length} Modules</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Estimated from planned lesson and task durations; session time is not timer-tracked.
          </p>
        </div>
      </div>

      {/* Enrolled Pathways & Real-Time Progress */}
      <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Enrolled Learning Pathways & Real-Time Progress</h3>
              <p className="text-xs text-slate-400">Saved roadmaps and completion percentages stored in SQLite</p>
            </div>
          </div>
          <Link
            to="/learning"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View Roadmaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {enrolledPaths.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No learning pathways found in your account. Generate a roadmap on the My Learning page.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledPaths.map((path) => (
              <div
                key={path.id}
                className="p-4 rounded-xl bg-navy-950/60 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{path.title}</h4>
                    <span className="text-xs text-slate-400">{path.subject}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-700/40 shrink-0">
                    {path.level}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">
                      {path.completed_topics} of {path.total_topics} modules finished
                    </span>
                    <span className="font-bold text-indigo-400">{path.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(2, path.progress)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Syllabus Modules & Quiz Assessment History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Syllabus Modules */}
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Completed Syllabus Modules</h3>
                <p className="text-xs text-slate-400">Verified module completions from SQLite database</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/30">
              {completedModules.length} Completed
            </span>
          </div>

          {completedModules.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              No modules marked completed yet. Open My Learning and click "Mark Done" on any topic!
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {completedModules.map((mod) => (
                <div
                  key={mod.id}
                  className="p-3.5 rounded-xl bg-navy-950/60 border border-emerald-900/30 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <h4 className="text-xs font-semibold text-white truncate">{mod.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 pl-6">
                      <span className="truncate">{mod.course_name}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {mod.duration_minutes}m
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-900/50 text-emerald-300 border border-emerald-700/40 shrink-0">
                    {mod.mastery_score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Assessment History */}
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Recent Quiz Assessment History</h3>
                <p className="text-xs text-slate-400">Scores, accuracy, and attempt records saved in SQLite</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-violet-400 bg-violet-950/60 px-2.5 py-1 rounded-full border border-violet-800/30">
              {quizHistory.length} Attempts
            </span>
          </div>

          {quizHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              No quiz attempts recorded yet. Click "Quiz" on any module in My Learning to test your skills!
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {quizHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-navy-950/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{item.topic_name}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Score: {item.score} / {item.total_questions}</span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold border shrink-0 ${
                      item.percentage >= 80
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50'
                        : item.percentage >= 60
                        ? 'bg-amber-950/80 text-amber-400 border-amber-700/50'
                        : 'bg-rose-950/80 text-rose-400 border-rose-700/50'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Hours Bar Chart */}
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Planner Time Completed (Hours)</h3>
              <p className="text-xs text-slate-400">Duration of planner tasks completed on each date</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weekly_activity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Mastery & Accuracy Trend */}
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Recorded Quiz Accuracy</h3>
              <p className="text-xs text-slate-400">Daily average from submitted quiz attempts</p>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">{data?.accuracy_percentage}% avg</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weekly_activity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColorProg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
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
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreColorProg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strong & Weak Topics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Strong Concepts</h3>
                <p className="text-xs text-slate-400">Quiz topics with average scores of 75% or higher</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/30">
              {data?.strong_topics.length} Mastered
            </span>
          </div>

          <div className="space-y-3">
            {data?.strong_topics.map((topic, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-navy-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{topic.subject}</span>
                  <span className="font-bold text-emerald-400">{topic.mastery}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full"
                    style={{ width: `${topic.mastery}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">{topic.remedyAction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics with Remedial Plan */}
        <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Diagnostic Weak Areas</h3>
                <p className="text-xs text-slate-400">Identified from quiz errors for targeted review</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/30">
              {data?.weak_topics.length} Targeted
            </span>
          </div>

          <div className="space-y-3">
            {data?.weak_topics.map((topic, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-navy-950/60 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{topic.subject}</span>
                  <span className="font-bold text-amber-400">{topic.mastery}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{ width: `${topic.mastery}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-400">{topic.remedyAction}</p>
                  <Link
                    to="/tutor"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold shrink-0 flex items-center gap-1 ml-2"
                  >
                    <span>Remediate</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
