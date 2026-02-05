import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storage.service';
import { Activity } from '../types';

// Simple UUID generator for React Native
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const loadedActivities = await StorageService.getActivities();
      // Filter out archived activities for display
      const activeActivities = loadedActivities.filter(activity => !activity.archived);
      setActivities(activeActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addActivity = useCallback(async (name: string, color: string, weeklyGoal?: number) => {
    const newActivity: Activity = {
      id: generateId(),
      name,
      color,
      createdAt: new Date().toISOString(),
      archived: false,
      weeklyGoal,
    };

    await StorageService.addActivity(newActivity);
    setActivities(prev => [...prev, newActivity]);
    return newActivity;
  }, []);

  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>) => {
    try {
      await StorageService.updateActivity(id, updates);
      setActivities(prev =>
        prev.map(activity =>
          activity.id === id ? { ...activity, ...updates } : activity
        )
      );
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }, []);

  const deleteActivity = useCallback(async (id: string) => {
    try {
      await StorageService.deleteActivity(id);
      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }, []);

  const archiveActivity = useCallback(async (id: string) => {
    try {
      await updateActivity(id, { archived: true });
    } catch (error) {
      console.error('Error archiving activity:', error);
      throw error;
    }
  }, []);

  return {
    activities,
    loading,
    addActivity,
    updateActivity,
    deleteActivity,
    archiveActivity,
    refreshActivities: loadActivities,
  };
};
