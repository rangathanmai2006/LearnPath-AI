import React from 'react';
import { Search, Compass, MessageSquareCode, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Choose a Learning Goal',
    description: 'Enter a subject, skill level, and goal to shape the roadmap around what you want to learn.',
    highlight: 'Your Goal'
  },
  {
    number: '02',
    icon: Compass,
    title: 'Create a Structured Roadmap',
    description: 'LearnPath creates an ordered set of topics, learning objectives, and time estimates from curated templates and subject-specific stages.',
    highlight: 'Clear Next Steps'
  },
  {
    number: '03',
    icon: MessageSquareCode,
    title: 'Ask the AI Tutor',
    description: 'When Gemini is configured, ask questions and follow up in context. Request an analogy, formula, or code example when it helps.',
    highlight: 'Contextual Help'
  },
  {
    number: '04',
    icon: Award,
    title: 'Practice and Track Progress',
    description: 'Take a topic quiz, review explanations, complete roadmap topics, and see your saved scores and planner activity in progress pages.',
    highlight: 'Saved Progress'
  }
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 relative bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400 bg-indigo-950/70 px-3 py-1 rounded-full border border-indigo-800/40">
            Step-by-Step Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How <span className="text-gradient">LearnPath AI</span> Supports Your Learning
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            A continuous feedback loop that replaces one-size-fits-all videos with individualized, intelligent coaching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600/30 via-indigo-600/40 to-violet-600/30 -translate-y-12 z-0" />

          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div
                key={idx}
                className="relative z-10 flex flex-col bg-navy-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/25">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-700 font-mono">
                    {step.number}
                  </span>
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                  {step.highlight}
                </span>

                <h3 className="text-lg font-bold text-white mb-3">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Callout box */}
        <div className="mt-16 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all text-sm group"
          >
            <span>Experience your first personalized roadmap</span>
            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
