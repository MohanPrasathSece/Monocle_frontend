import { WorkThread, WorkItem, WorkInsight, PriorityRecommendation, CognitiveLoadState, DailyStats } from './types';

// Helper to create dates relative to now
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export const mockWorkItems: WorkItem[] = [
  {
    id: 'item-1',
    type: 'email',
    title: 'Q4 Budget Review - Action Required',
    source: 'sarah.chen@company.com',
    timestamp: hoursAgo(2),
    preview: 'Please review the attached budget proposal before our meeting tomorrow...',
    isRead: false,
  },
  {
    id: 'item-2',
    type: 'calendar',
    title: 'Product Strategy Sync',
    source: 'Google Calendar',
    timestamp: hoursAgo(1),
    preview: 'Weekly sync with product team - Conference Room B',
  },
  {
    id: 'item-3',
    type: 'document',
    title: 'Product Roadmap 2024.docx',
    source: 'Google Drive',
    timestamp: hoursAgo(4),
    preview: 'Last edited by you',
  },
  {
    id: 'item-4',
    type: 'message',
    title: 'Quick question about the API',
    source: 'Slack - #engineering',
    timestamp: hoursAgo(0.5),
    preview: '@you Can you review the PR when you get a chance?',
    isRead: false,
  },
  {
    id: 'item-5',
    type: 'task',
    title: 'Finalize onboarding flow designs',
    source: 'Linear',
    timestamp: daysAgo(1),
    preview: 'Due in 2 days',
  },
];

export const mockWorkThreads: WorkThread[] = [
  {
    id: 'thread-1',
    title: 'Q4 Budget Planning',
    description: 'Annual budget review and allocation for engineering team',
    items: mockWorkItems.filter(i => i.id === 'item-1'),
    priority: 'high',
    deadline: daysFromNow(2),
    lastActivity: hoursAgo(2),
    progress: 35,
    relatedPeople: ['Sarah Chen', 'Mike Johnson', 'Lisa Park'],
    tags: ['Finance', 'Planning'],
  },
  {
    id: 'thread-2',
    title: 'Product Roadmap 2024',
    description: 'Strategic planning and feature prioritization',
    items: mockWorkItems.filter(i => ['item-2', 'item-3'].includes(i.id)),
    priority: 'high',
    deadline: daysFromNow(5),
    lastActivity: hoursAgo(1),
    progress: 60,
    relatedPeople: ['Alex Kim', 'Jordan Taylor'],
    tags: ['Product', 'Strategy'],
  },
  {
    id: 'thread-3',
    title: 'API Integration Project',
    description: 'Third-party API integration for new features',
    items: mockWorkItems.filter(i => i.id === 'item-4'),
    priority: 'medium',
    deadline: daysFromNow(7),
    lastActivity: hoursAgo(0.5),
    progress: 45,
    relatedPeople: ['Chris Wong', 'Sam Rivera'],
    tags: ['Engineering', 'Integration'],
  },
  {
    id: 'thread-4',
    title: 'User Onboarding Redesign',
    description: 'Improving first-time user experience',
    items: mockWorkItems.filter(i => i.id === 'item-5'),
    priority: 'medium',
    deadline: daysFromNow(2),
    lastActivity: daysAgo(1),
    progress: 70,
    isIgnored: true,
    relatedPeople: ['Emma Davis'],
    tags: ['Design', 'UX'],
  },
  {
    id: 'thread-5',
    title: 'Team Weekly Sync',
    description: 'Regular team coordination and updates',
    items: [],
    priority: 'low',
    lastActivity: daysAgo(2),
    progress: 100,
    relatedPeople: ['Team'],
    tags: ['Meetings'],
  },
];

export const mockPriorityRecommendations: PriorityRecommendation[] = [
  {
    threadId: 'thread-1',
    thread: mockWorkThreads[0],
    score: 92,
    reasoning: {
      title: 'Urgent deadline approaching',
      description: 'Budget review is due in 2 days and requires your input before the finance meeting.',
      factors: [
        { label: 'Deadline proximity', weight: 'high', description: 'Due in 48 hours' },
        { label: 'Stakeholder waiting', weight: 'high', description: 'Sarah Chen is waiting for your review' },
        { label: 'Low progress', weight: 'medium', description: 'Only 35% complete' },
      ],
    },
  },
  {
    threadId: 'thread-4',
    thread: mockWorkThreads[3],
    score: 78,
    reasoning: {
      title: 'At risk of missing deadline',
      description: 'This work has been inactive but has an approaching deadline.',
      factors: [
        { label: 'Ignored work', weight: 'high', description: 'No activity in 24 hours' },
        { label: 'Deadline proximity', weight: 'medium', description: 'Due in 2 days' },
        { label: 'High progress', weight: 'low', description: '70% complete - close to finish' },
      ],
    },
  },
  {
    threadId: 'thread-2',
    thread: mockWorkThreads[1],
    score: 65,
    reasoning: {
      title: 'Strategic importance',
      description: 'Product roadmap affects multiple teams and upcoming sprints.',
      factors: [
        { label: 'Cross-team impact', weight: 'high', description: 'Affects 3 teams' },
        { label: 'Active discussion', weight: 'medium', description: 'Meeting scheduled today' },
        { label: 'Moderate progress', weight: 'low', description: '60% complete' },
      ],
    },
  },
];

export const mockInsights: WorkInsight[] = [
  {
    id: 'insight-1',
    type: 'ignored-work',
    title: 'Onboarding redesign needs attention',
    description: 'This work thread has a deadline in 2 days but no activity in the past 24 hours.',
    severity: 'warning',
    relatedThreads: ['thread-4'],
    actionSuggestion: 'Consider blocking 2 hours today to complete the remaining designs.',
    detectedAt: hoursAgo(1),
  },
  {
    id: 'insight-2',
    type: 'attention-leak',
    title: 'Frequent context switching detected',
    description: 'You switched between 5 different work threads in the past hour.',
    severity: 'info',
    actionSuggestion: 'Try focusing on one thread for the next 45 minutes.',
    detectedAt: hoursAgo(0.5),
  },
  {
    id: 'insight-3',
    type: 'deadline-risk',
    title: 'Budget review at risk',
    description: 'With current progress rate, you may not complete the budget review before the deadline.',
    severity: 'critical',
    relatedThreads: ['thread-1'],
    actionSuggestion: 'Block 3 hours of focus time today to address this.',
    detectedAt: hoursAgo(0.25),
  },
];

export const mockCognitiveLoad: CognitiveLoadState = {
  level: 'medium',
  score: 58,
  factors: {
    activeThreads: 4,
    switchingFrequency: 5,
    workDuration: 4.5,
    pendingDeadlines: 2,
  },
};

export const mockDailyStats: DailyStats[] = [
  { date: daysAgo(6), focusTime: 180, contextSwitches: 12, completedTasks: 5, activeThreads: 3 },
  { date: daysAgo(5), focusTime: 210, contextSwitches: 8, completedTasks: 7, activeThreads: 4 },
  { date: daysAgo(4), focusTime: 150, contextSwitches: 15, completedTasks: 3, activeThreads: 5 },
  { date: daysAgo(3), focusTime: 240, contextSwitches: 6, completedTasks: 8, activeThreads: 3 },
  { date: daysAgo(2), focusTime: 120, contextSwitches: 18, completedTasks: 2, activeThreads: 6 },
  { date: daysAgo(1), focusTime: 195, contextSwitches: 10, completedTasks: 6, activeThreads: 4 },
  { date: new Date(), focusTime: 90, contextSwitches: 5, completedTasks: 2, activeThreads: 4 },
];

export const mockUser = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@company.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
};
