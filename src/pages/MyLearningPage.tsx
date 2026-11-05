import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Lock,
  ChevronRight,
  Plus,
  Loader2,
  Award,
  HelpCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';

interface TopicItem {
  id: number;
  learning_path_id: number;
  title: string;
  order: number;
  status: string;
  duration_minutes: number;
  difficulty: string;
  summary: string;
  description?: string;
  learning_objectives?: string;
  mastery_score: number;
}

interface LearningPath {
  id: number;
  title: string;
  subject: string;
  level: string;
  progress: number;
  total_topics: number;
  completed_topics: number;
  description: string;
  topics: TopicItem[];
}

interface QuizQuestion {
  id: number;
  topic_name: string;
  question: string;
  options: string[];
  is_ai_generated: boolean;
}

interface QuizResult {
  score: number;
  total_questions: number;
  percentage: number;
  xp_earned: number;
  results: Array<{
    question_id: number;
    question: string;
    selected_index: number;
    correct_index: number;
    is_correct: boolean;
    explanation: string;
  }>;
}

export const MyLearningPage: React.FC = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePathId, setActivePathId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pathError, setPathError] = useState<string | null>(null);

  // New Roadmap Generation Modal State
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string>('');
  const [newLevel, setNewLevel] = useState<string>('Beginner');
  const [newGoal, setNewGoal] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState<boolean>(false);
  const [quizTopic, setQuizTopic] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizSubmitting, setQuizSubmitting] = useState<boolean>(false);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const fetchPaths = async () => {
    setIsLoading(true);
    setPathError(null);
    try {
      const res = await api.get('/paths');
      const nextPaths: LearningPath[] = Array.isArray(res.data) ? res.data : [];
      setPaths(nextPaths);
      setActivePathId((prev) => (nextPaths.some((p) => p.id === prev) ? prev : nextPaths[0]?.id ?? null));
    } catch (err) {
      console.warn('Could not fetch learning paths:', err);
      setPaths([]);
      setActivePathId(null);
      setPathError('Learning paths could not be loaded. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const handleGeneratePath = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveSubject = newSubject.trim() || newGoal.trim();
    const effectiveGoal = newGoal.trim() || newSubject.trim();

    if (!effectiveSubject && !effectiveGoal) {
      setGenerateError('Please enter a learning goal or target subject to generate your roadmap.');
      return;
    }

    setGenerateError(null);
    setPathError(null);
    setIsGenerating(true);
    try {
      const res = await api.post('/paths/generate', {
        subject: effectiveSubject,
        level: newLevel,
        goal: effectiveGoal,
        custom_goal: effectiveGoal,
      });
      setPaths((prev) => {
        const updated = [res.data, ...prev.filter((p) => p.id !== res.data.id)];
        return updated;
      });
      setSelectedCategory('All');
      setActivePathId(res.data.id);
      setNewSubject('');
      setNewGoal('');
      setShowGenerateModal(false);
      setTimeout(() => {
        document.getElementById('active-roadmap-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setGenerateError(err.response?.data?.detail || 'The roadmap could not be saved. Check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTopicStatus = async (topicId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'in-progress' : 'completed';
    const targetPath = paths.find((p) => p.topics?.some((t) => t.id === topicId)) || activePath;
    const targetPathId = targetPath?.id;

    // 1. Instant optimistic state update
    setPaths((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== targetPathId) return p;
        const updatedTopics = p.topics.map((t) =>
          t.id === topicId ? { ...t, status: nextStatus } : t
        );
        const completedCount = updatedTopics.filter((t) => t.status === 'completed').length;
        const totalCount = p.total_topics || updatedTopics.length || 1;
        const progressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100));
        return {
          ...p,
          topics: updatedTopics,
          completed_topics: completedCount,
          progress: progressPercent,
        };
      });
      return updated;
    });

    // 2. Persist to SQLite backend database
    try {
      const res = await api.patch(`/paths/topics/${topicId}/status`, { status: nextStatus });
      if (res.data) {
        setPaths((prev) => {
          const updated = prev.map((p) => {
            if (p.id !== targetPathId) return p;
            const updatedTopics = p.topics.map((t) =>
              t.id === topicId ? { ...t, ...res.data, status: res.data.status } : t
            );
            const completedCount =
              res.data.path_completed_topics ?? updatedTopics.filter((t) => t.status === 'completed').length;
            const totalCount = res.data.path_total_topics ?? p.total_topics ?? updatedTopics.length;
            const progressPercent =
              res.data.path_progress ?? Math.min(100, Math.round((completedCount / totalCount) * 100));
            return {
              ...p,
              topics: updatedTopics,
              completed_topics: completedCount,
              progress: progressPercent,
            };
          });
          return updated;
        });
      }
    } catch (err: any) {
      console.warn('Topic update failed:', err);
      await fetchPaths();
      alert(err.response?.data?.detail || 'This topic could not be updated. Check your connection and try again.');
    }
  };

  const handleStartQuiz = async (topicTitle: string) => {
    setQuizTopic(topicTitle);
    setQuizResult(null);
    setSelectedAnswers({});
    setQuizQuestions([]);
    setCurrentQuizIndex(0);
    setQuizError(null);
    setQuizLoading(true);
    setQuizModalOpen(true);

    try {
      const res = await api.get(`/quizzes/questions?topic=${encodeURIComponent(topicTitle)}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setQuizQuestions(res.data);
      } else {
        throw new Error('No questions returned from API');
      }
    } catch (err: any) {
      console.warn('Could not load quiz questions:', err);
      setQuizError(err.response?.data?.detail || 'Quiz questions could not be loaded. Check your connection and try again.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(selectedAnswers).length !== quizQuestions.length) {
      alert('Please answer every question before submitting.');
      return;
    }

    setQuizSubmitting(true);
    try {
      const payload = {
        topic_name: quizTopic,
        answers: Object.entries(selectedAnswers).map(([qId, ansIndex]) => ({
          question_id: parseInt(qId, 10),
          selected_index: ansIndex,
        })),
      };
      const res = await api.post('/quizzes/submit', payload);
      setQuizResult(res.data);
    } catch (err: any) {
      console.error('Quiz submission failed:', err);
      setQuizError(err.response?.data?.detail || 'Your answers could not be submitted. They are still shown here; retry when the service is available.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const categories = ['All', 'Artificial Intelligence', 'System Design', 'Web Development', 'Computer Science'];

  const filteredPaths =
    selectedCategory === 'All'
      ? paths
      : paths.filter((p) => p.subject.toLowerCase().includes(selectedCategory.toLowerCase()));

  const activePath = paths.find((p) => p.id === activePathId) || paths[0];
  const currentQuizQuestion = quizQuestions[currentQuizIndex];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {pathError && (
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-sm text-rose-200">
          <span>{pathError}</span>
          <button type="button" onClick={fetchPaths} className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-xs font-semibold">Try again</button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-blue" />
            <span>Personalized Learning Pathways</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic, customizable roadmaps saved in your database and tailored to your career milestones.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Roadmap</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-500 mr-1 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-navy-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : filteredPaths.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPaths.map((path) => {
            const isSelected = path.id === activePathId;
            return (
              <div
                key={path.id}
                onClick={() => setActivePathId(path.id)}
                className={`cursor-pointer rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-navy-900/90 border-indigo-500/60 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                    : 'bg-navy-900/50 hover:bg-navy-900/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-800/40">
                      {path.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{path.level}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">{path.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{path.description}</p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Mastery Progress</span>
                      <span className="text-indigo-400 font-bold">{path.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {path.completed_topics}/{path.total_topics} topics completed
                  </span>

                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <span>{isSelected ? 'Selected' : 'View Syllabus'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-navy-900/40 border border-slate-800 rounded-2xl p-6">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No pathways found for this filter.</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Generate Roadmap
          </button>
        </div>
      )}

      {/* Active Path Topics Detailed View */}
      {activePath && (
        <div id="active-roadmap-view" className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curriculum Modules ({activePath.level})</span>
              </div>
              <h2 className="text-xl font-bold text-white">{activePath.title}</h2>

              {/* Real-time Roadmap Progress Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
                <div className="w-full sm:w-72 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${activePath.progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-300">
                  <span className="text-emerald-400 font-bold">{activePath.progress}%</span> Completed ({activePath.completed_topics || 0} of {activePath.total_topics || activePath.topics?.length || 0} modules)
                </span>
              </div>
            </div>

            <button
              onClick={() => handleStartQuiz(activePath.subject)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 hover:bg-emerald-900/40 transition-colors self-start sm:self-auto shrink-0"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Test Knowledge (Take Quiz)</span>
            </button>
          </div>

          <div className="space-y-4">
            {activePath.topics && activePath.topics.length > 0 ? (
              activePath.topics.map((topic, index) => {
                const isCompleted = topic.status === 'completed';
                const isInProgress = topic.status === 'in-progress';

                return (
                  <div
                    key={topic.id}
                    className={`p-5 rounded-xl border flex flex-col gap-3.5 transition-all ${
                      isInProgress
                        ? 'bg-indigo-950/30 border-indigo-500/40 shadow-sm'
                        : isCompleted
                        ? 'bg-navy-950/60 border-slate-800/80'
                        : 'bg-navy-950/30 border-slate-800/40 opacity-90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleTopicStatus(topic.id, topic.status)}
                          className="mt-0.5 transition-transform active:scale-95 shrink-0"
                          title={isCompleted ? 'Mark as In-Progress' : 'Mark as Completed'}
                        >
                          {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 border border-emerald-500/30">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : isInProgress ? (
                            <div className="w-8 h-8 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center hover:bg-brand-blue/30 border border-brand-blue/30">
                              <Play className="w-4 h-4 fill-brand-blue" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center hover:text-slate-300 border border-slate-700/60">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>

                        <div className="space-y-2 flex-1">
                          {/* Module Header & Topic Name */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono text-indigo-400 font-bold bg-indigo-950/80 border border-indigo-800/50 px-2 py-0.5 rounded">
                              Module 0{index + 1}
                            </span>
                            <h4 className={`text-base font-bold ${isInProgress ? 'text-indigo-200' : 'text-white'}`}>
                              {topic.title}
                            </h4>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {topic.description || topic.summary}
                          </p>

                          {/* Learning Objectives */}
                          {topic.learning_objectives && (
                            <div className="pt-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                                Learning Objectives:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {topic.learning_objectives.split(';').map((obj, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-navy-900/90 text-slate-200 border border-indigo-900/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                                  >
                                    <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                                    <span>{obj.trim()}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Metadata: Estimated Duration and Status */}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                            <span className="flex items-center gap-1 text-slate-400 font-medium">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Estimated: {topic.duration_minutes} min</span>
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">Difficulty: {topic.difficulty}</span>
                            <span className="text-slate-600">•</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                                isCompleted
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                                  : isInProgress
                                  ? 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              Status: {isCompleted ? 'Completed' : isInProgress ? 'In-Progress' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex sm:flex-col items-center gap-2 shrink-0 self-end sm:self-start">
                        <button
                          onClick={() => handleToggleTopicStatus(topic.id, topic.status)}
                          className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                            isCompleted
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/50'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                          }`}
                        >
                          {isCompleted ? 'Completed ✓' : 'Mark Done'}
                        </button>
                        <button
                          onClick={() => handleStartQuiz(topic.title)}
                          className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Quiz</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">No topics registered for this path.</p>
            )}
          </div>
        </div>
      )}

      {/* Generate New Pathway Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Generate Learning Roadmap</h3>
              </div>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGenerateError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generateError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{generateError}</span>
              </div>
            )}

            <form onSubmit={handleGeneratePath} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Subject or Technology
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => {
                    setNewSubject(e.target.value);
                    if (generateError) setGenerateError(null);
                  }}
                  placeholder="e.g. Python, Machine Learning, React, System Design..."
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Target Skill Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                        newLevel === lvl
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-navy-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Learning Goal
                </label>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => {
                    setNewGoal(e.target.value);
                    if (generateError) setGenerateError(null);
                  }}
                  placeholder="e.g. Learn Python for AI and Machine Learning"
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                The platform builds a structured roadmap from subject templates, assigns estimated durations, lists learning objectives, and saves the roadmap to your account.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateModal(false);
                    setGenerateError(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || (!newSubject.trim() && !newGoal.trim())}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating Roadmap...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Roadmap</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Topic Assessment
                </span>
                <h3 className="text-lg font-bold text-white">{quizTopic}</h3>
              </div>
              <button
                onClick={() => setQuizModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quizResult ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-extrabold text-white">
                      Score: {quizResult.score} / {quizResult.total_questions} ({quizResult.percentage}%)
                    </h4>
                    <p className="text-xs text-emerald-300">
                      +{quizResult.xp_earned} XP awarded to your student profile!
                    </p>
                  </div>
                  <span className="text-2xl font-black text-emerald-400">{quizResult.percentage}%</span>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {quizResult.results.map((res, i) => (
                    <div
                      key={res.question_id}
                      className={`p-4 rounded-xl border ${
                        res.is_correct
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <p className="text-xs font-semibold text-white mb-2">
                        {i + 1}. {res.question}
                      </p>
                      <p className="text-xs text-slate-300 mb-1">
                        <strong>Explanation:</strong> {res.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setQuizModalOpen(false)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                  >
                    Done & Return to Curriculum
                  </button>
                </div>
              </div>
            ) : quizQuestions.length > 0 && currentQuizQuestion ? (
              <div className="space-y-5">
                {quizError && <p role="alert" className="text-xs text-rose-300">{quizError}</p>}
                <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400">Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                    <span className="text-[10px] text-slate-500">
                      {currentQuizQuestion.is_ai_generated ? 'AI-Generated Question' : 'Practice Question'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">{currentQuizQuestion.question}</p>
                  <div className="space-y-2">
                    {currentQuizQuestion.options.map((opt, optIndex) => {
                      const isSelected = selectedAnswers[currentQuizQuestion.id] === optIndex;
                      return (
                        <button
                          key={optIndex}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedAnswers((prev) => ({ ...prev, [currentQuizQuestion.id]: optIndex }))}
                          className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          <span className="text-[10px] font-mono opacity-60">[{String.fromCharCode(65 + optIndex)}]</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800 gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentQuizIndex((index) => Math.max(0, index - 1))}
                    disabled={currentQuizIndex === 0 || quizSubmitting}
                    className="px-4 py-2 rounded-lg text-xs text-slate-300 border border-slate-700 disabled:opacity-40"
                  >Previous</button>
                  <span className="text-xs text-slate-400">{Object.keys(selectedAnswers).length} of {quizQuestions.length} answered</span>
                  {currentQuizIndex < quizQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuizIndex((index) => index + 1)}
                      disabled={selectedAnswers[currentQuizQuestion.id] === undefined}
                      className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40"
                    >Next question</button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={quizSubmitting || Object.keys(selectedAnswers).length !== quizQuestions.length}
                      className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 disabled:opacity-40 flex items-center gap-2"
                    >
                      {quizSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Evaluating...</> : <>Submit Quiz<CheckCircle2 className="w-4 h-4" /></>}
                    </button>
                  )}
                </div>
              </div>
            ) : quizLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading topic questions...</p>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <HelpCircle className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="text-sm font-semibold text-white">{quizError ? 'Quiz unavailable' : 'No questions found for this module yet.'}</p>
                <p className="text-xs text-slate-400">{quizError || 'The question bank has no questions for this module yet.'}</p>
                <button
                  onClick={() => handleStartQuiz(quizTopic)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
                >
                  Generate Practice Questions
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
