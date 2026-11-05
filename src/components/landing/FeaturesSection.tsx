import React from 'react';
import { Brain, Target, Compass, Sparkles, LineChart, Layers, ShieldCheck, Clock } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Gemini AI Tutor',
    description: 'Ask follow-up questions and request clear explanations, analogies, formulas, or code. Live responses require a configured Gemini backend.',
    badge: 'AI Tutor'
  },
  {
    icon: Target,
    title: 'Quiz-Based Review',
    description: 'See stronger and weaker quiz topics based on the scores you have actually submitted.',
    badge: 'From Your Results'
  },
  {
    icon: Compass,
    title: 'Structured Learning Pathways',
    description: 'Create a roadmap from your subject, skill level, and goal. Topics unlock in sequence as you complete them.',
    badge: 'Personalized'
  },
  {
    icon: LineChart,
    title: 'Progress Analytics',
    description: 'Review completed modules, submitted quiz scores, roadmap progress, and dated planner-task activity.',
    badge: 'Insights'
  },
  {
    icon: Layers,
    title: 'Clear Concept Breakdowns',
    description: 'The tutor can explain concepts with readable Markdown, formulas, code examples, and analogies when requested.',
    badge: 'Explanations'
  },
  {
    icon: Clock,
    title: 'Study Planner',
    description: 'Create study tasks, set due dates and time estimates, then mark tasks complete to track your plan.',
    badge: 'Productivity'
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 relative bg-navy-950/60 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built For Deeper Understanding</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Designed Like a World-Class <span className="text-gradient">1-on-1 Mentor</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Traditional online courses treat every student identically. LearnPath AI continuously adjusts to how your brain learns best.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                className="group relative bg-navy-900/60 hover:bg-navy-850/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider text-slate-400 bg-slate-800/70 px-2.5 py-1 rounded-md border border-slate-700/40">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2.5 group-hover:text-indigo-200 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore capability</span>
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-purple-950/50 border border-indigo-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Built Around Active Practice</span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl">
            Use structured roadmaps, practice quizzes, progress tracking, and contextual tutor follow-ups in one place.
            </p>
          </div>
          <div className="shrink-0">
            <a
              href="#how-it-works"
              className="px-5 py-2.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-sm transition-colors inline-block"
            >
              See How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
