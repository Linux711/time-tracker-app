import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { formatSeconds } from '../utils/timeFormatters';
import colors from '../constants/colors';

interface TimerDisplayProps {
  elapsedTime: number;
  onStop: () => void;
  style?: any;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  elapsedTime,
  onStop,
  style,
}) => {
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Create a pulsing effect based on elapsed time
  const pulseOpacity = 0.3 + 0.2 * Math.sin(elapsedTime * 0.1);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.timerContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle (static for now, could be animated) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.7} // Show some progress
            strokeLinecap="round"
            opacity={pulseOpacity}
          />
        </Svg>

        <View style={styles.timerTextContainer}>
          <Text style={styles.timerText}>{formatSeconds(elapsedTime)}</Text>
          <Text style={styles.timerLabel}>Active</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.stopButton} onPress={onStop}>
        <Text style={styles.stopButtonText}>Stop Timer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.colors.primary,
    marginBottom: 4,
  },
  timerLabel: {
    fontSize: 14,
    color: colors.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stopButton: {
    marginTop: 20,
    backgroundColor: colors.colors.error,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  stopButtonText: {
    color: colors.colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimerDisplay;
