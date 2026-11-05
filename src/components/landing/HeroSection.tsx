import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Brain, CheckCircle2, TrendingUp, Compass, Zap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-blue/20 via-brand-violet/20 to-purple-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-inner backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">AI Tutor and Learning Tools</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-semibold text-gradient flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-violet" /> Next-Gen AI Learning
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Master Any Subject With Your <span className="text-gradient">Personal AI Teacher</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
            Set a learning goal, follow a structured subject roadmap, practice with quizzes, and ask the Gemini AI Tutor for help when it is configured.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all text-base"
            >
              <span>Log In to Dashboard</span>
            </Link>
          </div>

          {/* Micro social proof / guarantees */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Subject-based roadmaps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Gemini Tutor when configured</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive App Preview Mockup */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-2xl p-1 bg-gradient-to-b from-slate-700/60 via-slate-800/30 to-transparent shadow-2xl shadow-indigo-950/50">
            <div className="rounded-[15px] bg-navy-900/95 border border-slate-800 p-4 sm:p-6 backdrop-blur-xl">
              {/* Window Controls & Title */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-medium text-slate-400 hidden sm:inline">
                    Product Preview • Example Content
                  </span>
                </div>
                <Link
                  to="/tutor"
                  className="flex items-center gap-2 text-xs text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 px-3 py-1 rounded-full border border-indigo-500/40 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Launch Interactive AI Tutor →</span>
                </Link>
              </div>

              {/* Mock Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
                {/* Left: AI Tutor Dialogue */}
                <div className="lg:col-span-7 bg-navy-950/70 rounded-xl p-4 border border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <Brain className="w-4 h-4 text-indigo-400" />
                      Example Tutor Response
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Sample Conversation</span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-300 border border-slate-700/40">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">You asked:</span>
                      "Why does gradient descent sometimes get stuck, and how does momentum solve it?"
                    </div>

                    <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/80 rounded-lg p-3.5 text-xs text-slate-200 border border-indigo-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" />
                        LearnPath AI Tutor:
                      </div>
                      <p className="leading-relaxed">
                        Think of a ball rolling down a hilly terrain. Standard gradient descent looks strictly at the slope beneath its feet. If it hits a shallow plateau or saddle point, it stalls.
                      </p>
                      <div className="p-2.5 rounded bg-navy-900/80 border border-slate-800 font-mono text-[11px] text-indigo-200">
                        v_t = γ · v_(t-1) + η · ∇θ J(θ)
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Momentum accumulates past velocity, allowing the optimizer to push right through local oscillations!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Real-time Mastery & Roadmap */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Mastery Card */}
                  <div className="bg-navy-950/70 rounded-xl p-4 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Concept Mastery</span>
                      <span className="text-emerald-400 font-bold">88% Proficient</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2.5 rounded-full w-[88%]" />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                      <span>Weak: Partial Derivatives</span>
                        <span className="text-indigo-400 font-medium">Quiz Review</span>
                    </div>
                  </div>

                  {/* Example planner preview */}
                  <div className="bg-navy-950/70 rounded-xl p-4 border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-violet-400" />
                        Next Learning Steps
                      </span>
                        <span className="text-slate-500 text-[10px]">Example plan</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30 flex items-center justify-between text-xs">
                        <span className="text-slate-300">1. Complete the next topic</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">Ready</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30 flex items-center justify-between text-xs">
                        <span className="text-slate-300">2. Take a practice quiz</span>
                        <span className="text-[10px] text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/40">Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Streak Card */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-200">Sample: 14-Day Study Streak</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400">+150 XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
