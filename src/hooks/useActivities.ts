import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../services/storage.service';
import { Activity } from '../types';

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
      id: uuidv4(),
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
