export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  isExternal?: boolean;
}

export interface StudentProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  targetGoal: string;
  streakDays: number;
  dailyGoalMinutes: number;
  dailyGoalCompletedMinutes: number;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle: string;
  icon: string;
  color: string;
}

export interface ActivityDataPoint {
  day: string;
  hours: number;
  topics: number;
  score: number;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  totalTopics: number;
  completedTopics: number;
  currentTopic: string;
  thumbnailGradient: string;
  description: string;
  lastStudied: string;
  estimatedHoursLeft: number;
  tags: string[];
}

export interface TopicItem {
  id: string;
  title: string;
  courseId: string;
  status: 'completed' | 'in-progress' | 'locked';
  masteryPercentage: number;
  durationMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  formula?: string;
  codeSnippet?: string;
  suggestedFollowUps?: string[];
}

export interface SkillProficiency {
  subject: string;
  mastery: number; // 0-100
  benchmark: number;
  category: 'strong' | 'moderate' | 'weak';
  remedyAction?: string;
}

export interface StudyTask {
  id: string;
  title: string;
  courseName: string;
  durationMinutes: number;
  timeSlot: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category: 'Quiz' | 'Theory' | 'Coding' | 'Revision';
}

export interface UserPreferences {
  dailyStudyTarget: number;
  learningPace: 'relaxed' | 'balanced' | 'intensive';
  difficultyPreference: 'adaptive' | 'challenging' | 'foundational';
  emailNotifications: boolean;
  streakReminders: boolean;
  weeklyReports: boolean;
  soundEffects: boolean;
  language: string;
  timezone: string;
}
