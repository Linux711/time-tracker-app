import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import { useTimer } from '../hooks/useTimer';
import { useActivities } from '../hooks/useActivities';
import { StatsService } from '../services/stats.service';
import { formatSeconds, formatDuration } from '../utils/timeFormatters';
import colors from '../constants/colors';
import TimerDisplay from '../components/TimerDisplay';
import AddActivityModal from '../components/AddActivityModal';
import TodaysSessionsDrawer from '../components/TodaysSessionsDrawer';
import { Activity, Session } from '../types';

export const HomeScreen: React.FC = () => {
  const { activeTimer, isRunning, elapsedTime, startTimer, stopTimer } = useTimer();
  const { activities, addActivity, deleteActivity } = useActivities();
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadTodaySessions();
  }, []);

  const loadTodaySessions = async () => {
    try {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const sessions = await StatsService.getSessionsInRange(startOfToday, endOfToday);
      // Filter out sessions that are still running (no endTime) and sessions shorter than 1 minute
      const completedSessions = sessions.filter(session => session.endTime && session.duration >= 60);
      setTodaySessions(completedSessions);
    } catch (error) {
      console.error('Error loading today sessions:', error);
    }
  };

  const handleStartTimer = async (activity: Activity) => {
    try {
      await startTimer(activity);
    } catch (error) {
      Alert.alert('Error', 'Failed to start timer');
    }
  };

  const handleStopTimer = async () => {
    try {
      await stopTimer();
      // Reload today's sessions to include the newly completed session
      loadTodaySessions();
    } catch (error) {
      Alert.alert('Error', 'Failed to stop timer');
    }
  };

  const handleAddActivity = () => {
    setShowAddModal(true);
  };

  const handleAddActivitySubmit = async (name: string, color: string, weeklyGoal?: number) => {
    try {
      await addActivity(name, color, weeklyGoal);
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add activity');
    }
  };

  const renderActivityCard = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={[styles.activityCard, { backgroundColor: item.color }]}
      onPress={() => handleStartTimer(item)}
    >
      <Text style={styles.activityName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleDeleteActivity = async (activityId: string, activityName: string) => {
    try {
      await deleteActivity(activityId);
      loadTodaySessions();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete activity');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Active Timer Display */}
      {isRunning && activeTimer && (
        <View style={styles.timerSection}>
          <TimerDisplay
            elapsedTime={elapsedTime}
            onStop={handleStopTimer}
            onDelete={handleDeleteActivity}
            activityName={activities.find(a => a.id === activeTimer.activityId)?.name}
            activityId={activeTimer.activityId}
            style={styles.timerDisplay}
          />
        </View>
      )}

      {/* Quick Start Section */}
      {!isRunning && (
        <View style={styles.quickStartSection}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <FlatList
            data={activities}
            renderItem={renderActivityCard}
            keyExtractor={(item) => item.id}
            numColumns={1}
            contentContainerStyle={styles.activityGrid}
            ListFooterComponent={
              <TouchableOpacity style={styles.addActivityCard} onPress={handleAddActivity}>
                <Text style={styles.addActivityIcon}>+</Text>
                <Text style={styles.addActivityText}>Add Activity</Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}

      {/* Today's Sessions Drawer */}
      <TodaysSessionsDrawer
        sessions={todaySessions}
        activities={activities}
      />

      <AddActivityModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddActivitySubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.colors.background,
  },
  timerSection: {
    flex: 1,
    backgroundColor: colors.colors.cardBackground,
  },
  timerDisplay: {
    alignSelf: 'center',
  },
  quickStartSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.colors.text,
    marginBottom: 16,
  },
  activityGrid: {
    paddingBottom: 20,
  },
  activityCard: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.colors.textDark,
    textAlign: 'center',
  },
  addActivityCard: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    backgroundColor: colors.colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.colors.border,
    borderStyle: 'dashed',
  },
  addActivityIcon: {
    fontSize: 32,
    color: colors.colors.textLight,
    marginBottom: 4,
  },
  addActivityText: {
    fontSize: 14,
    color: colors.colors.textLight,
    textAlign: 'center',
  },
});

export default HomeScreen;
