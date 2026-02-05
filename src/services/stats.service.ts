import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { StorageService } from './storage.service';
import { Session, DailyStats, ActivityStats } from '../types';

export class StatsService {
  static async getSessionsInRange(startDate: Date, endDate: Date): Promise<Session[]> {
    const allSessions = await StorageService.getSessions();
    return allSessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return isWithinInterval(sessionDate, { start: startDate, end: endDate });
    });
  }

  static async getTodayStats(): Promise<DailyStats> {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const sessions = await this.getSessionsInRange(startOfToday, endOfToday);
    const completedSessions = sessions.filter(session => session.endTime);

    const totalTime = completedSessions.reduce((sum, session) => sum + session.duration, 0);

    // Group by activity
    const activityMap = new Map<string, { time: number; sessions: number }>();
    completedSessions.forEach(session => {
      const existing = activityMap.get(session.activityId) || { time: 0, sessions: 0 };
      activityMap.set(session.activityId, {
        time: existing.time + session.duration,
        sessions: existing.sessions + 1,
      });
    });

    const activities = Array.from(activityMap.entries()).map(([activityId, stats]) => ({
      activityId,
      time: stats.time,
      sessions: stats.sessions,
    }));

    return {
      date: today.toISOString().split('T')[0],
      totalTime,
      sessionsCount: completedSessions.length,
      activities,
    };
  }

  static async getWeekStats(): Promise<DailyStats[]> {
    const today = new Date();
    const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const endOfWeekDate = endOfWeek(today, { weekStartsOn: 1 });

    const sessions = await this.getSessionsInRange(startOfWeekDate, endOfWeekDate);

    // Group sessions by day
    const dayMap = new Map<string, Session[]>();
    sessions.forEach(session => {
      const dayKey = new Date(session.startTime).toISOString().split('T')[0];
      const daySessions = dayMap.get(dayKey) || [];
      daySessions.push(session);
      dayMap.set(dayKey, daySessions);
    });

    const weekStats: DailyStats[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeekDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const daySessions = dayMap.get(dateKey) || [];
      const completedSessions = daySessions.filter(session => session.endTime);

      const totalTime = completedSessions.reduce((sum, session) => sum + session.duration, 0);

      const activityMap = new Map<string, { time: number; sessions: number }>();
      completedSessions.forEach(session => {
        const existing = activityMap.get(session.activityId) || { time: 0, sessions: 0 };
        activityMap.set(session.activityId, {
          time: existing.time + session.duration,
          sessions: existing.sessions + 1,
        });
      });

      const activities = Array.from(activityMap.entries()).map(([activityId, stats]) => ({
        activityId,
        time: stats.time,
        sessions: stats.sessions,
      }));

      weekStats.push({
        date: dateKey,
        totalTime,
        sessionsCount: completedSessions.length,
        activities,
      });
    }

    return weekStats;
  }

  static async getActivityStats(activityId: string): Promise<ActivityStats> {
    const allSessions = await StorageService.getSessions();
    const activitySessions = allSessions.filter(session =>
      session.activityId === activityId && session.endTime
    );

    const totalTime = activitySessions.reduce((sum, session) => sum + session.duration, 0);
    const sessionsCount = activitySessions.length;
    const averageSession = sessionsCount > 0 ? totalTime / sessionsCount : 0;

    const lastSession = activitySessions.length > 0
      ? activitySessions.sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())[0].endTime
      : undefined;

    return {
      activityId,
      totalTime,
      sessionsCount,
      averageSession,
      lastSession,
    };
  }

  static async getAllActivityStats(): Promise<ActivityStats[]> {
    const activities = await StorageService.getActivities();
    const statsPromises = activities.map(activity => this.getActivityStats(activity.id));
    return Promise.all(statsPromises);
  }
}
