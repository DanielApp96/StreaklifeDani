// src/components/HabitCard.js
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Pressable
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Shadow } from '../theme';
import { isCompletedToday, getCurrentStreak } from '../utils/streakUtils';

export default function HabitCard({ habit, onToggle, onPress, onLongPress }) {
  const completed = isCompletedToday(habit);
  const streak = getCurrentStreak(habit);
  const color = habit.colorHex;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.card,
        completed && { backgroundColor: color + '12', borderColor: color + '44' },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      {/* Emoji box */}
      <View style={[styles.emojiBox, { backgroundColor: color + '20' }]}>
        <Text style={styles.emoji}>{habit.emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, completed && { color: Colors.textSecondary }]}>
          {habit.name}
        </Text>
        <View style={styles.streakRow}>
          {streak > 0 ? (
            <>
              <Text style={styles.fire}>🔥</Text>
              <Text style={[styles.streakText, { color: Colors.accent }]}>
                {streak} day streak
              </Text>
            </>
          ) : (
            <Text style={styles.streakText}>Start today!</Text>
          )}
        </View>
      </View>

      {/* Check button */}
      <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
        <View style={[
          styles.check,
          completed
            ? { backgroundColor: color, borderColor: color }
            : { borderColor: Colors.divider }
        ]}>
          {completed && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    ...Shadow.small,
  },
  emojiBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  fire: {
    fontSize: 12,
  },
  streakText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  check: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
