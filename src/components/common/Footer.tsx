import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 border-t border-slate-800/80 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-violet flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                LearnPath <span className="text-gradient">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              An intelligent, adaptive learning companion designed to help you master any subject with personalized AI instruction.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors">Adaptive AI Tutor</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">Dynamic Roadmaps</a>
              </li>
              <li>
                <a href="#methodology" className="hover:text-white transition-colors">Skill Gap Diagnostic</a>
              </li>
              <li>
                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                  Start Free Trial
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-500 cursor-not-allowed">Documentation (Coming Soon)</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Learning Science Guide</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Community Forum</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">System Status</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal & Privacy</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer">Terms of Service</span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer">Student Data Ethics</span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer">Cookie Preferences</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LearnPath AI. Built for next-generation learners.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for personalized education
          </p>
        </div>
      </div>
    </footer>
  );
};
