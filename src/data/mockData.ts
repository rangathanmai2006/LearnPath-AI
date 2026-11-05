import {
  StudentProfile,
  Course,
  TopicItem,
  ChatMessage,
  SkillProficiency,
  StudyTask,
  ActivityDataPoint,
  UserPreferences
} from '../types';

export const mockStudentProfile: StudentProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  level: 4,
  xp: 3450,
  targetGoal: 'AI Engineer & Full-Stack Specialist',
  streakDays: 14,
  dailyGoalMinutes: 45,
  dailyGoalCompletedMinutes: 32,
};

export const mockActivityData: ActivityDataPoint[] = [
  { day: 'Mon', hours: 1.2, topics: 3, score: 85 },
  { day: 'Tue', hours: 2.1, topics: 4, score: 92 },
  { day: 'Wed', hours: 0.8, topics: 2, score: 78 },
  { day: 'Thu', hours: 1.8, topics: 4, score: 88 },
  { day: 'Fri', hours: 2.5, topics: 5, score: 95 },
  { day: 'Sat', hours: 3.2, topics: 6, score: 94 },
  { day: 'Sun', hours: 1.5, topics: 3, score: 90 },
];

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Neural Networks & Deep Learning Foundations',
    category: 'Artificial Intelligence',
    level: 'Intermediate',
    progress: 68,
    totalTopics: 18,
    completedTopics: 12,
    currentTopic: 'Backpropagation & Gradient Descent Optimizers',
    thumbnailGradient: 'from-blue-600 via-indigo-600 to-violet-700',
    description: 'Master multilayer perceptrons, activation functions, regularization, and momentum optimization from mathematical intuition to PyTorch implementation.',
    lastStudied: 'Today at 08:30 AM',
    estimatedHoursLeft: 6.5,
    tags: ['Deep Learning', 'PyTorch', 'Math']
  },
  {
    id: 'course-2',
    title: 'Distributed Systems & Microservices Architecture',
    category: 'System Design',
    level: 'Advanced',
    progress: 42,
    totalTopics: 14,
    completedTopics: 6,
    currentTopic: 'CAP Theorem & Eventual Consistency Patterns',
    thumbnailGradient: 'from-violet-600 via-purple-600 to-indigo-800',
    description: 'Learn consensus algorithms (Raft), idempotency, partitioned messaging, and fault-tolerant cloud patterns.',
    lastStudied: 'Yesterday',
    estimatedHoursLeft: 11,
    tags: ['Architecture', 'Consensus', 'Cloud']
  },
  {
    id: 'course-3',
    title: 'Modern TypeScript & Frontend Architecture',
    category: 'Web Engineering',
    level: 'Intermediate',
    progress: 85,
    totalTopics: 20,
    completedTopics: 17,
    currentTopic: 'Conditional Types & Template Literal Type Magic',
    thumbnailGradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    description: 'Write type-safe, maintainable enterprise software with discriminated unions, utility types, and clean patterns.',
    lastStudied: '2 days ago',
    estimatedHoursLeft: 3,
    tags: ['TypeScript', 'Design Patterns']
  },
  {
    id: 'course-4',
    title: 'Algorithmic Problem Solving & Data Structures',
    category: 'Computer Science',
    level: 'Advanced',
    progress: 25,
    totalTopics: 24,
    completedTopics: 6,
    currentTopic: 'Dynamic Programming: Memoization vs Tabulation',
    thumbnailGradient: 'from-indigo-600 via-violet-700 to-pink-600',
    description: 'Demystify recursive state graphs, DAG shortest paths, segment trees, and asymptotic runtime optimizations.',
    lastStudied: '4 days ago',
    estimatedHoursLeft: 18,
    tags: ['Algorithms', 'Data Structures']
  }
];

export const mockTopics: TopicItem[] = [
  { id: 'top-1', courseId: 'course-1', title: 'Perceptron Math & Decision Boundaries', status: 'completed', masteryPercentage: 98, durationMinutes: 25, difficulty: 'Easy' },
  { id: 'top-2', courseId: 'course-1', title: 'Non-linear Activation Functions (ReLU, GELU, Swish)', status: 'completed', masteryPercentage: 94, durationMinutes: 30, difficulty: 'Easy' },
  { id: 'top-3', courseId: 'course-1', title: 'Cost Functions & Cross-Entropy Loss Derivation', status: 'completed', masteryPercentage: 88, durationMinutes: 40, difficulty: 'Medium' },
  { id: 'top-4', courseId: 'course-1', title: 'Backpropagation & Chain Rule Calculus', status: 'in-progress', masteryPercentage: 62, durationMinutes: 50, difficulty: 'Hard' },
  { id: 'top-5', courseId: 'course-1', title: 'Adaptive Optimizers (Adam, RMSProp, AdamW)', status: 'locked', masteryPercentage: 0, durationMinutes: 45, difficulty: 'Hard' },
  { id: 'top-6', courseId: 'course-1', title: 'Batch Normalization & Weight Initialization', status: 'locked', masteryPercentage: 0, durationMinutes: 35, difficulty: 'Medium' },
];

export const mockInitialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: "Hello Alex! I'm your LearnPath AI Tutor. I noticed you're exploring Backpropagation & Optimizers today. What would you like to clarify or test your understanding on?",
    timestamp: '09:15 AM',
    suggestedFollowUps: [
      'Why does Adam converge faster than standard SGD?',
      'How does the chain rule propagate gradients across hidden layers?',
      'Give me an intuitive analogy for the vanishing gradient problem.',
      'Test me with a quick diagnostic question!'
    ]
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'How does the chain rule propagate gradients across hidden layers in backprop?',
    timestamp: '09:16 AM'
  },
  {
    id: 'msg-3',
    sender: 'ai',
    text: 'Great question! Think of a deep neural network as a series of composite functions: y = f_3(f_2(f_1(x))). To determine how a tiny nudge in the first layer\'s weights affects the final prediction error, we multiply the local rates of change along the path backward.',
    timestamp: '09:16 AM',
    formula: '∂L/∂w_1 = (∂L/∂y) · (∂y/∂h_2) · (∂h_2/∂h_1) · (∂h_1/∂w_1)',
    codeSnippet: '# Minimal PyTorch backward demonstration\nimport torch\n\nw = torch.tensor([2.0], requires_grad=True)\nx = torch.tensor([3.0])\ny = (w * x) ** 2  # y = (2 * 3)^2 = 36\ny.backward()      # dy/dw = 2 * (w * x) * x = 2 * 6 * 3 = 36\nprint(w.grad)     # Outputs: tensor([36.])',
    suggestedFollowUps: [
      'What happens if the local derivatives are smaller than 1?',
      'Can you show me how ReLU prevents gradient vanishing?',
      'Let’s solve a numerical mini-exercise together.'
    ]
  }
];

export const mockSkills: SkillProficiency[] = [
  { subject: 'Multivariate Calculus & Gradients', mastery: 64, benchmark: 75, category: 'weak', remedyAction: 'Review partial derivatives & Hessian intuition in Module 2' },
  { subject: 'Loss Function Formulations', mastery: 92, benchmark: 80, category: 'strong', remedyAction: 'Mastery achieved! Ready for custom penalty terms' },
  { subject: 'Optimizer Dynamics (Adam/SGD)', mastery: 72, benchmark: 70, category: 'moderate', remedyAction: 'Solve 2 interactive momentum scenarios' },
  { subject: 'Distributed Consensus & CAP', mastery: 58, benchmark: 75, category: 'weak', remedyAction: 'Practice Raft election states and split-brain recovery' },
  { subject: 'TypeScript Generics & Unions', mastery: 95, benchmark: 85, category: 'strong', remedyAction: 'Solid mastery! Continue onto conditional types' },
  { subject: 'Dynamic Programming Recurrences', mastery: 52, benchmark: 70, category: 'weak', remedyAction: 'Focus on 1D memoization templates before 2D grids' },
];

export const mockStudyTasks: StudyTask[] = [
  {
    id: 'task-1',
    title: 'Complete Backpropagation Diagnostic Exercise',
    courseName: 'Neural Networks & Deep Learning',
    durationMinutes: 25,
    timeSlot: '10:00 AM - 10:25 AM',
    dueDate: 'Today',
    priority: 'high',
    completed: true,
    category: 'Quiz'
  },
  {
    id: 'task-2',
    title: 'Read & Annotate Raft Consensus Paper Summary',
    courseName: 'Distributed Systems',
    durationMinutes: 30,
    timeSlot: '02:00 PM - 02:30 PM',
    dueDate: 'Today',
    priority: 'medium',
    completed: false,
    category: 'Theory'
  },
  {
    id: 'task-3',
    title: 'Implement Custom Learning Rate Scheduler in PyTorch',
    courseName: 'Neural Networks & Deep Learning',
    durationMinutes: 40,
    timeSlot: '04:30 PM - 05:10 PM',
    dueDate: 'Today',
    priority: 'high',
    completed: false,
    category: 'Coding'
  },
  {
    id: 'task-4',
    title: 'Review Spaced Repetition Flashcards (15 items)',
    courseName: 'General Memory Bank',
    durationMinutes: 15,
    timeSlot: '07:30 PM - 07:45 PM',
    dueDate: 'Today',
    priority: 'medium',
    completed: false,
    category: 'Revision'
  },
  {
    id: 'task-5',
    title: 'Solve Coin Change & Knapsack DP Recurrences',
    courseName: 'Algorithmic Problem Solving',
    durationMinutes: 45,
    timeSlot: 'Tomorrow 10:00 AM',
    dueDate: 'Tomorrow',
    priority: 'high',
    completed: false,
    category: 'Coding'
  },
  {
    id: 'task-6',
    title: 'System Design Mock: Distributed Rate Limiter',
    courseName: 'Distributed Systems',
    durationMinutes: 60,
    timeSlot: 'Tomorrow 03:00 PM',
    dueDate: 'Tomorrow',
    priority: 'medium',
    completed: false,
    category: 'Theory'
  }
];

export const mockUserPreferences: UserPreferences = {
  dailyStudyTarget: 45,
  learningPace: 'balanced',
  difficultyPreference: 'adaptive',
  emailNotifications: true,
  streakReminders: true,
  weeklyReports: true,
  soundEffects: false,
  language: 'English (US)',
  timezone: 'UTC-05:00 (Eastern Time)',
};
