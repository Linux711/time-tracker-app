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
import { Activity, Session } from '../types';

export const HomeScreen: React.FC = () => {
  const { activeTimer, isRunning, elapsedTime, startTimer, stopTimer } = useTimer();
  const { activities, addActivity } = useActivities();
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
      // Filter out sessions that are still running (no endTime)
      const completedSessions = sessions.filter(session => session.endTime);
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

  const renderSessionItem = ({ item }: { item: Session }) => {
    const activity = activities.find(a => a.id === item.activityId);
    return (
      <View style={styles.sessionItem}>
        <View style={styles.sessionLeft}>
          <View style={[styles.activityDot, { backgroundColor: activity?.color || colors.colors.primary }]} />
          <View>
            <Text style={styles.sessionName}>{activity?.name || 'Unknown Activity'}</Text>
            <Text style={styles.sessionTime}>
              {format(new Date(item.startTime), 'h:mm a')} - {item.endTime ? format(new Date(item.endTime), 'h:mm a') : 'Running'}
            </Text>
          </View>
        </View>
        <Text style={styles.sessionDuration}>{formatDuration(item.duration)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Active Timer Display */}
      {isRunning && activeTimer && (
        <View style={styles.timerSection}>
          <TimerDisplay
            elapsedTime={elapsedTime}
            onStop={handleStopTimer}
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
            numColumns={2}
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

      {/* Today's Completed Activities */}
      <View style={styles.completedSection}>
        <Text style={styles.sectionTitle}>Today's Sessions</Text>
        {todaySessions.length === 0 ? (
          <Text style={styles.emptyText}>No completed sessions today</Text>
        ) : (
          <FlatList
            data={todaySessions}
            renderItem={renderSessionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.sessionsList}
          />
        )}
      </View>

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
    backgroundColor: colors.colors.cardBackground,
    margin: 16,
    borderRadius: 12,
    padding: 16,
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
  completedSection: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.colors.textLight,
    fontSize: 16,
    marginTop: 20,
  },
  sessionsList: {
    paddingBottom: 20,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.colors.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.colors.text,
  },
  sessionTime: {
    fontSize: 12,
    color: colors.colors.textLight,
    marginTop: 2,
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.colors.primary,
  },
});

export default HomeScreen;
