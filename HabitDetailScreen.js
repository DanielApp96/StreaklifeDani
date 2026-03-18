// src/screens/HabitDetailScreen.js
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '../context/HabitContext';
import { Colors, Spacing, Radius, Shadow } from '../theme';
import {
  getCurrentStreak, getLongestStreak,
  getCompletionRate, getLast7Days, isCompletedToday
} from '../utils/streakUtils';

export default function HabitDetailScreen({ route, navigation }) {
  const { habitId } = route.params;
  const { habits, toggleHabitToday } = useHabits();
  const habit = habits.find(h => h.id === habitId);

  if (!habit) {
    navigation.goBack();
    return null;
  }

  const color = habit.colorHex;
  const streak = getCurrentStreak(habit);
  const longest = getLongestStreak(habit);
  const rate7 = getCompletionRate(habit, 7);
  const rate30 = getCompletionRate(habit, 30);
  const last7 = getLast7Days(habit);
  const completed = isCompletedToday(habit);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('EditHabit', { habit })}>
          <Text style={styles.edit}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: color + '18' }]}>
          <View style={[styles.emojiBox, { backgroundColor: color + '30' }]}>
            <Text style={styles.emoji}>{habit.emoji}</Text>
          </View>
          <Text style={styles.habitName}>{habit.name}</Text>
          {streak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: color }]}>
              <Text style={styles.streakBadgeText}>🔥 {streak} day streak</Text>
            </View>
          )}
        </View>

        {/* Today toggle */}
        <TouchableOpacity
          style={[
            styles.todayBtn,
            { backgroundColor: completed ? color : Colors.surface, borderColor: completed ? color : Colors.divider }
          ]}
          onPress={() => toggleHabitToday(habit.id)}
          activeOpacity={0.8}
        >
          <Text style={[styles.todayBtnText, { color: completed ? '#fff' : Colors.textPrimary }]}>
            {completed ? '✓  Completed Today' : 'Mark as Done Today'}
          </Text>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard label="Current Streak" value={streak} unit="days" color={color} />
          <StatCard label="Longest Streak" value={longest} unit="days" color={color} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Last 7 Days" value={`${rate7}%`} unit="done" color={color} />
          <StatCard label="Last 30 Days" value={`${rate30}%`} unit="done" color={color} />
        </View>

        {/* 7-day mini calendar */}
        <Text style={styles.sectionLabel}>LAST 7 DAYS</Text>
        <View style={styles.weekRow}>
          {last7.map(({ date, completed: c, label }) => (
            <View key={date} style={styles.dayCol}>
              <View style={[
                styles.dayDot,
                { backgroundColor: c ? color : Colors.divider }
              ]}>
                {c && <Text style={styles.dayCheck}>✓</Text>}
              </View>
              <Text style={styles.dayLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Total completions */}
        <View style={styles.totalCard}>
          <Text style={styles.totalNum}>{habit.completedDates?.length || 0}</Text>
          <Text style={styles.totalLabel}>Total completions</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, unit, color }) {
  return (
    <View style={[styles.statCard, Shadow.small]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  back: { fontSize: 16, color: Colors.textSecondary },
  edit: { fontSize: 16, color: Colors.accent, fontWeight: '600' },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
  },
  emojiBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: { fontSize: 40 },
  habitName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  streakBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakBadgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  todayBtn: {
    marginHorizontal: Spacing.lg,
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  todayBtnText: { fontSize: 16, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '800' },
  statUnit: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  dayCol: { alignItems: 'center', gap: 6 },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCheck: { color: '#fff', fontWeight: '700' },
  dayLabel: { fontSize: 11, color: Colors.textSecondary },
  totalCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: 'center',
    ...Shadow.small,
  },
  totalNum: { fontSize: 40, fontWeight: '800', color: Colors.textPrimary },
  totalLabel: { color: Colors.textSecondary, marginTop: 4 },
});
