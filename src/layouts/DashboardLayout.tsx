import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  LineChart,
  CalendarDays,
  Settings,
  Sparkles,
  Menu,
  X,
  LogOut,
  Flame,
  Award,
  Bell,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Learning', path: '/learning', icon: BookOpen },
    { label: 'AI Tutor', path: '/tutor', icon: Bot, badge: 'Live AI' },
    { label: 'My Progress', path: '/progress', icon: LineChart },
    { label: 'Study Planner', path: '/planner', icon: CalendarDays },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentName = user?.name || 'Student';
  const studentLevel = user?.level || 1;
  const studentStreak = user?.streak_days || 1;
  const studentXP = user?.xp || 150;
  const initials = studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-brand-violet/30 selection:text-white">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-navy-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-violet flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-base">
            LearnPath <span className="text-gradient">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{studentStreak}d</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-navy-900/95 border-r border-slate-800/80 z-50 flex flex-col justify-between transition-transform duration-300 backdrop-blur-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Platform Info */}
          <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-800/80">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue via-indigo-600 to-brand-violet flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1">
                  LearnPath <span className="text-gradient font-black">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Student Portal</span>
              </div>
            </Link>
          </div>

          {/* User Quick Status Banner */}
          <div className="mb-6 p-3 rounded-xl bg-navy-950/70 border border-slate-800/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                {initials}
              </div>
              <div className="flex flex-col truncate max-w-[110px]">
                <span className="text-xs font-semibold text-slate-200 truncate">{studentName}</span>
                <span className="text-[10px] text-indigo-400 font-medium">Lvl {studentLevel} Scholar</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md text-[11px] font-bold border border-amber-500/20 shrink-0">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{studentStreak}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Main Menu
            </span>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-violet-600/20 text-white border border-indigo-500/40 shadow-sm shadow-indigo-950'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-indigo-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick link to Landing Page */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <Link
              to="/"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
            >
              <span>View Landing Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-navy-950/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors border border-rose-500/10 hover:border-rose-500/30"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </span>
            <span className="text-[10px] text-slate-500">Exit App</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar for desktop */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-navy-900/40 border-b border-slate-800/70 backdrop-blur-md">
          <div className="flex items-center gap-3 w-80">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topics, modules, exercises..."
                className="w-full bg-navy-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* XP Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>{studentXP} XP</span>
            </div>

            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{studentStreak} Day Streak</span>
            </div>

            {/* Notifications */}
            <button
              className="p-2 rounded-lg bg-navy-950/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-brand-violet absolute top-1.5 right-1.5" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </div>
  );
};
