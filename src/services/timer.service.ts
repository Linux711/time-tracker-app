import { StorageService } from './storage.service';
import { Activity, Session, ActiveTimer } from '../types';

// Simple UUID generator for React Native
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export class TimerService {
  static async startTimer(activity: Activity): Promise<ActiveTimer> {
    // Check if there's already an active timer
    const existingTimer = await StorageService.getActiveTimer();
    if (existingTimer) {
      throw new Error('A timer is already running');
    }

    const sessionId = generateId();
    const activeTimer: ActiveTimer = {
      activityId: activity.id,
      startTime: new Date().toISOString(),
      sessionId,
    };

    // Create initial session record
    const session: Session = {
      id: sessionId,
      activityId: activity.id,
      startTime: activeTimer.startTime,
      duration: 0,
    };

    await StorageService.addSession(session);
    await StorageService.setActiveTimer(activeTimer);

    return activeTimer;
  }

  static async stopTimer(): Promise<Session | null> {
    const activeTimer = await StorageService.getActiveTimer();
    if (!activeTimer) {
      return null;
    }

    const endTime = new Date().toISOString();
    const startTime = new Date(activeTimer.startTime);
    const duration = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000);

    // Update the session with end time and duration
    await StorageService.updateSession(activeTimer.sessionId, {
      endTime,
      duration,
    });

    // Clear the active timer
    await StorageService.setActiveTimer(null);

    // Return the completed session
    const sessions = await StorageService.getSessions();
    return sessions.find(session => session.id === activeTimer.sessionId) || null;
  }

  static async switchActivity(newActivity: Activity): Promise<ActiveTimer> {
    // Stop current timer if running
    await this.stopTimer();

    // Start new timer
    return this.startTimer(newActivity);
  }

  static async getActiveTimer(): Promise<ActiveTimer | null> {
    return StorageService.getActiveTimer();
  }

  static async resumeTimer(): Promise<ActiveTimer | null> {
    const activeTimer = await StorageService.getActiveTimer();
    return activeTimer;
  }
}
