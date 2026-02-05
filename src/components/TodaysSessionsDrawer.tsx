import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { format } from 'date-fns';
import { formatDuration } from '../utils/timeFormatters';
import colors from '../constants/colors';
import { Session, Activity } from '../types';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

interface TodaysSessionsDrawerProps {
  sessions: Session[];
  activities: Activity[];
}

type DrawerState = 'collapsed' | 'half' | 'expanded';

export const TodaysSessionsDrawer: React.FC<TodaysSessionsDrawerProps> = ({
  sessions,
  activities,
}) => {
  // Calculate positions for different states
  const collapsedHeight = 60; // Just the handle
  const halfHeight = Math.min(WINDOW_HEIGHT * 0.4, 200 + (3 * 60)); // Show 3 sessions
  const expandedHeight = Math.min(WINDOW_HEIGHT * 0.8, 200 + (sessions.length * 60)); // Show all

  const [drawerState, setDrawerState] = useState<DrawerState>('collapsed');
  const [currentPosition, setCurrentPosition] = useState(WINDOW_HEIGHT - collapsedHeight);
  const translateY = useRef(new Animated.Value(WINDOW_HEIGHT - collapsedHeight)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const newPosition = currentPosition + gesture.dy;
        const clampedPosition = Math.max(
          WINDOW_HEIGHT - expandedHeight,
          Math.min(WINDOW_HEIGHT - collapsedHeight, newPosition)
        );
        translateY.setValue(clampedPosition);
      },
      onPanResponderRelease: (_, gesture) => {
        const velocity = gesture.vy;
        const currentY = currentPosition;

        // Determine target state based on position and velocity
        let targetState: DrawerState;
        let targetY: number;

        if (velocity > 0.5) {
          // Dragging down - collapse
          targetState = 'collapsed';
          targetY = WINDOW_HEIGHT - collapsedHeight;
        } else if (velocity < -0.5) {
          // Dragging up - expand
          targetState = 'expanded';
          targetY = WINDOW_HEIGHT - expandedHeight;
        } else {
          // Based on position
          const progress = (WINDOW_HEIGHT - currentY) / (expandedHeight - collapsedHeight);
          if (progress < 0.3) {
            targetState = 'collapsed';
            targetY = WINDOW_HEIGHT - collapsedHeight;
          } else if (progress < 0.7) {
            targetState = 'half';
            targetY = WINDOW_HEIGHT - halfHeight;
          } else {
            targetState = 'expanded';
            targetY = WINDOW_HEIGHT - expandedHeight;
          }
        }

        setDrawerState(targetState);
        setCurrentPosition(targetY);
        Animated.spring(translateY, {
          toValue: targetY,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }).start();
      },
    })
  );

  const getVisibleSessions = () => {
    switch (drawerState) {
      case 'collapsed':
        return [];
      case 'half':
        return sessions.slice(0, 3);
      case 'expanded':
        return sessions;
      default:
        return [];
    }
  };

  const renderSessionItem = (session: Session) => {
    const activity = activities.find(a => a.id === session.activityId);
    return (
      <View key={session.id} style={styles.sessionItem}>
        <View style={styles.sessionLeft}>
          <View style={[styles.activityAvatar, { backgroundColor: activity?.color || colors.colors.primary }]} />
          <View>
            <Text style={styles.sessionName}>{activity?.name || 'Unknown Activity'}</Text>
            <Text style={styles.sessionTime}>
              {format(new Date(session.startTime), 'h:mm a')} - {session.endTime ? format(new Date(session.endTime), 'h:mm a') : 'Running'}
            </Text>
          </View>
        </View>
        <Text style={styles.sessionDuration}>{formatDuration(session.duration)}</Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Drag Handle */}
      <View style={styles.handleContainer} {...panResponder.current.panHandlers}>
        <View style={styles.handle} />
        {drawerState === 'collapsed' && sessions.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{sessions.length}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      {drawerState !== 'collapsed' && (
        <View style={styles.content}>
          <Text style={styles.title}>Today's Sessions</Text>

          <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
            {getVisibleSessions().map(renderSessionItem)}
            {drawerState === 'half' && sessions.length > 3 && (
              <Text style={styles.moreText}>+{sessions.length - 3} more sessions</Text>
            )}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.colors.border,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    right: 20,
    top: 8,
    backgroundColor: colors.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.colors.textDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  sessionsList: {
    maxHeight: WINDOW_HEIGHT * 0.6,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.colors.border,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityAvatar: {
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
  moreText: {
    textAlign: 'center',
    color: colors.colors.textLight,
    fontSize: 14,
    paddingVertical: 12,
  },
});

export default TodaysSessionsDrawer;