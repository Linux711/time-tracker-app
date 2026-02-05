import { useState, useEffect, useCallback } from 'react';
import { TimerService } from '../services/timer.service';
import { Activity, ActiveTimer } from '../types';

export const useTimer = () => {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    loadActiveTimer();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && activeTimer) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(activeTimer.startTime).getTime();
        const elapsed = Math.floor((now - start) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, activeTimer]);

  const loadActiveTimer = useCallback(async () => {
    try {
      const timer = await TimerService.getActiveTimer();
      setActiveTimer(timer);
      setIsRunning(!!timer);
    } catch (error) {
      console.error('Error loading active timer:', error);
    }
  }, []);

  const startTimer = useCallback(async (activity: Activity) => {
    try {
      const timer = await TimerService.startTimer(activity);
      setActiveTimer(timer);
      setIsRunning(true);
      return timer;
    } catch (error) {
      console.error('Error starting timer:', error);
      throw error;
    }
  }, []);

  const stopTimer = useCallback(async () => {
    try {
      const session = await TimerService.stopTimer();
      setActiveTimer(null);
      setIsRunning(false);
      setElapsedTime(0);
      return session;
    } catch (error) {
      console.error('Error stopping timer:', error);
      throw error;
    }
  }, []);

  const switchActivity = useCallback(async (activity: Activity) => {
    try {
      const timer = await TimerService.switchActivity(activity);
      setActiveTimer(timer);
      setIsRunning(true);
      return timer;
    } catch (error) {
      console.error('Error switching activity:', error);
      throw error;
    }
  }, []);

  return {
    activeTimer,
    isRunning,
    elapsedTime,
    startTimer,
    stopTimer,
    switchActivity,
  };
};
