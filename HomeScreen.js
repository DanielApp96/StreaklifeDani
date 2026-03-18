// src/screens/HomeScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '../context/HabitContext';
import HabitCard from '../components/HabitCard';
import { Colors, Spacing } from '../theme';
import { isCompletedToday } from '../utils/streakUtils';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

export default function HomeScreen({ navigation }) {
  const { habits, toggleHabitToday, deleteHabit, loading } = useHabits();
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const dayName = DAYS[now.getDay()];
  const dateStr = `${MONTHS[now.getMonth()]} ${now.getDate()}`;

  const completedToday = habits.filter(isCompletedToday).length;
  const total = habits.length;
  const progress = total === 0 ? 0 : completedToday / total;
  const allDone = total > 0 && completedToday === total;

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleLongPress = (habit) => {
    Alert.alert(
      `"${habit.name}"`,
      'What would you like to do?',
      [
        { text: 'Edit', onPress: () => navigation.navigate('EditHabit', { habit }) },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Delete habit?', 'All streak data will be lost.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id) }
            ]
          );
        }},
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dayName}>{dayName}</Text>
            <Text style={styles.dateStr}>{dateStr}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: allDone ? Colors.success : Colors.primary }]}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>
              {allDone ? 'All done! 🎉' : total === 0 ? 'Add your first habit!' : "Let's go!"}
            </Text>
            {total > 0 && (
              <Text style={styles.progressCount}>{completedToday} / {total}</Text>
            )}
          </View>
          {total > 0 && (
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
          )}
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>TODAY'S HABITS</Text>

        {/* Habit list */}
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>Tap + to add your first habit</Text>
          </View>
        ) : (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabitToday(habit.id)}
              onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
              onLongPress={() => handleLongPress(habit)}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHabit')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  dayName: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  dateStr: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.accentSoft,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 20,
    padding: 20,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  progressLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  progressCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: { color: '#fff', fontSize: 30, lineHeight: 34 },
});
