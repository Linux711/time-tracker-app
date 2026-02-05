import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, Session, ActiveTimer } from '../types';

const ACTIVITIES_KEY = '@activities';
const SESSIONS_KEY = '@sessions';
const ACTIVE_TIMER_KEY = '@active_timer';

export class StorageService {
  // Activities
  static async getActivities(): Promise<Activity[]> {
    try {
      const data = await AsyncStorage.getItem(ACTIVITIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }

  static async addActivity(activity: Activity): Promise<void> {
    try {
      const activities = await this.getActivities();
      activities.push(activity);
      await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  }

  static async updateActivity(id: string, updates: Partial<Activity>): Promise<void> {
    try {
      const activities = await this.getActivities();
      const index = activities.findIndex(activity => activity.id === id);
      if (index !== -1) {
        activities[index] = { ...activities[index], ...updates };
        await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  static async deleteActivity(id: string): Promise<void> {
    try {
      const activities = await this.getActivities();
      const filteredActivities = activities.filter(activity => activity.id !== id);
      await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filteredActivities));
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  // Sessions
  static async getSessions(): Promise<Session[]> {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  static async addSession(session: Session): Promise<void> {
    try {
      const sessions = await this.getSessions();
      sessions.push(session);
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  }

  static async updateSession(id: string, updates: Partial<Session>): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const index = sessions.findIndex(session => session.id === id);
      if (index !== -1) {
        sessions[index] = { ...sessions[index], ...updates };
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  // Active Timer
  static async getActiveTimer(): Promise<ActiveTimer | null> {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_TIMER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting active timer:', error);
      return null;
    }
  }

  static async setActiveTimer(timer: ActiveTimer | null): Promise<void> {
    try {
      if (timer) {
        await AsyncStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(timer));
      } else {
        await AsyncStorage.removeItem(ACTIVE_TIMER_KEY);
      }
    } catch (error) {
      console.error('Error setting active timer:', error);
      throw error;
    }
  }

  // Clear all data (for development/testing)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([ACTIVITIES_KEY, SESSIONS_KEY, ACTIVE_TIMER_KEY]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}
