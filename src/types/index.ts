export interface Activity {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  archived: boolean;
  weeklyGoal?: number;
}

export interface Session {
  id: string;
  activityId: string;
  startTime: string;
  endTime?: string;
  duration: number;
}

export interface ActiveTimer {
  activityId: string;
  startTime: string;
  sessionId: string;
}

export interface DailyStats {
  date: string;
  totalTime: number;
  sessionsCount: number;
  activities: {
    activityId: string;
    time: number;
    sessions: number;
  }[];
}

export interface ActivityStats {
  activityId: string;
  totalTime: number;
  sessionsCount: number;
  averageSession: number;
  lastSession?: string;
  weeklyProgress?: {
    current: number;
    goal: number;
    percentage: number;
  };
}
