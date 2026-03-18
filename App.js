// StreakLife — Single File Version for Expo Snack
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Pressable, TextInput, Alert, StatusBar, Platform,
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── THEME ───────────────────────────────────────────────
const Colors = {
  background: '#F8F7F4',
  surface: '#FFFFFF',
  primary: '#1A1A1A',
  accent: '#FF6B35',
  accentSoft: '#FFF0EB',
  textPrimary: '#1A1A1A',
  textSecondary: '#8A8A8A',
  divider: '#EEEEEE',
  success: '#4CAF76',
};

const HabitColors = [
  '#FF6B35','#4CAF76','#5B8AF0','#A855F7',
  '#F59E0B','#EF4444','#06B6D4','#EC4899','#84CC16','#6B7280',
];

const HabitEmojis = [
  '🏃','💧','📚','🧘','🍎','💤','🏋️','🎯',
  '✍️','🎨','🧹','💊','🚴','🌿','☕','🎵',
  '🧠','💪','🌅','🛁','🥗','📖','⭐','🔥',
];

// ─── STREAK UTILS ────────────────────────────────────────
const dateOnly = (d) => d.split('T')[0];
const todayStr = () => new Date().toISOString().split('T')[0];
const yesterdayStr = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const isCompletedToday = (habit) =>
  (habit.completedDates || []).some(d => dateOnly(d) === todayStr());

const getCurrentStreak = (habit) => {
  const dates = [...new Set((habit.completedDates || []).map(d => dateOnly(d)))];
  if (!dates.length) return 0;
  dates.sort((a, b) => b.localeCompare(a));
  if (dates[0] !== todayStr() && dates[0] !== yesterdayStr()) return 0;
  let streak = 0, expected = dates[0];
  for (const date of dates) {
    if (date === expected) {
      streak++;
      const d = new Date(expected); d.setDate(d.getDate() - 1);
      expected = d.toISOString().split('T')[0];
    } else break;
  }
  return streak;
};

const getLongestStreak = (habit) => {
  const dates = [...new Set((habit.completedDates || []).map(d => dateOnly(d)))];
  if (!dates.length) return 0;
  dates.sort((a, b) => a.localeCompare(b));
  let longest = 1, current = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]) - new Date(dates[i-1])) / 86400000;
    if (diff === 1) { current++; if (current > longest) longest = current; }
    else current = 1;
  }
  return longest;
};

const getLast7Days = (habit) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      completed: (habit.completedDates || []).some(cd => dateOnly(cd) === dateStr),
      label: d.toLocaleDateString('en', { weekday: 'narrow' }),
    });
  }
  return days;
};

const toggleToday = (habit) => {
  const today = todayStr();
  const completedDates = [...(habit.completedDates || [])];
  const idx = completedDates.findIndex(d => dateOnly(d) === today);
  if (idx >= 0) completedDates.splice(idx, 1);
  else completedDates.push(today);
  return { ...habit, completedDates };
};

const getCompletionRate = (habit, days = 7) => {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const count = (habit.completedDates || []).filter(d => dateOnly(d) >= cutoffStr).length;
  return Math.round((count / days) * 100);
};

// ─── STORAGE ─────────────────────────────────────────────
const HABITS_KEY = '@streaklife_habits';
const saveHabits = async (habits) => {
  try { await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits)); } catch(e) {}
};
const loadHabits = async () => {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch(e) { return []; }
};

// ─── CONTEXT ─────────────────────────────────────────────
const HabitContext = createContext();

const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits().then(h => { setHabits(h); setLoading(false); });
  }, []);

  const persist = useCallback(async (updated) => {
    setHabits(updated);
    await saveHabits(updated);
  }, []);

  const addHabit = async (habit) => persist([...habits, habit]);
  const updateHabit = async (habit) => persist(habits.map(h => h.id === habit.id ? habit : h));
  const deleteHabit = async (id) => persist(habits.filter(h => h.id !== id));
  const toggleHabitToday = async (id) => persist(habits.map(h => h.id === id ? toggleToday(h) : h));

  return (
    <HabitContext.Provider value={{ habits, loading, addHabit, updateHabit, deleteHabit, toggleHabitToday }}>
      {children}
    </HabitContext.Provider>
  );
};

const useHabits = () => useContext(HabitContext);

// ─── SIMPLE UUID ─────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// ─── HABIT CARD ──────────────────────────────────────────
const HabitCard = ({ habit, onToggle, onPress, onLongPress }) => {
  const completed = isCompletedToday(habit);
  const streak = getCurrentStreak(habit);
  const color = habit.colorHex;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        cardStyles.card,
        completed && { backgroundColor: color + '12', borderColor: color + '55' },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <View style={[cardStyles.emojiBox, { backgroundColor: color + '22' }]}>
        <Text style={cardStyles.emoji}>{habit.emoji}</Text>
      </View>
      <View style={cardStyles.info}>
        <Text style={[cardStyles.name, completed && { color: Colors.textSecondary }]}>
          {habit.name}
        </Text>
        <Text style={[cardStyles.streak, { color: streak > 0 ? Colors.accent : Colors.textSecondary }]}>
          {streak > 0 ? `🔥 ${streak} day streak` : 'Start today!'}
        </Text>
      </View>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
        <View style={[
          cardStyles.check,
          completed ? { backgroundColor: color, borderColor: color } : { borderColor: Colors.divider }
        ]}>
          {completed && <Text style={cardStyles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    </Pressable>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20, marginVertical: 6,
    borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: Colors.divider,
  },
  emojiBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26 },
  info: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  streak: { fontSize: 13, fontWeight: '500' },
  check: { width: 34, height: 34, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

// ─── HOME SCREEN ─────────────────────────────────────────
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const HomeScreen = ({ navigation }) => {
  const { habits, loading, toggleHabitToday, deleteHabit } = useHabits();
  const now = new Date();
  const completedToday = habits.filter(isCompletedToday).length;
  const total = habits.length;
  const progress = total === 0 ? 0 : completedToday / total;
  const allDone = total > 0 && completedToday === total;

  const handleLongPress = (habit) => {
    Alert.alert(`"${habit.name}"`, 'What would you like to do?', [
      { text: 'Edit', onPress: () => navigation('EditHabit', { habit }) },
      { text: 'Delete', style: 'destructive', onPress: () =>
        Alert.alert('Delete?', 'All data will be lost.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id) }
        ])
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={homeStyles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={homeStyles.header}>
          <View>
            <Text style={homeStyles.dayName}>{DAYS[now.getDay()]}</Text>
            <Text style={homeStyles.dateStr}>{MONTHS[now.getMonth()]} {now.getDate()}</Text>
          </View>
        </View>

        <View style={[homeStyles.progressCard, { backgroundColor: allDone ? Colors.success : Colors.primary }]}>
          <View style={homeStyles.progressTop}>
            <Text style={homeStyles.progressLabel}>
              {allDone ? 'All done! 🎉' : total === 0 ? 'Add your first habit!' : "Let's go!"}
            </Text>
            {total > 0 && <Text style={homeStyles.progressCount}>{completedToday} / {total}</Text>}
          </View>
          {total > 0 && (
            <View style={homeStyles.barBg}>
              <View style={[homeStyles.barFill, { width: `${progress * 100}%` }]} />
            </View>
          )}
        </View>

        <Text style={homeStyles.sectionLabel}>TODAY'S HABITS</Text>

        {loading ? (
          <Text style={homeStyles.emptyText}>Loading...</Text>
        ) : habits.length === 0 ? (
          <View style={homeStyles.emptyState}>
            <Text style={{ fontSize: 56 }}>🌱</Text>
            <Text style={homeStyles.emptyTitle}>No habits yet</Text>
            <Text style={homeStyles.emptyText}>Tap + to add your first habit</Text>
          </View>
        ) : (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabitToday(habit.id)}
              onPress={() => navigation('HabitDetail', { habitId: habit.id })}
              onLongPress={() => handleLongPress(habit)}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={homeStyles.fab} onPress={() => navigation('AddHabit', {})} activeOpacity={0.85}>
        <Text style={homeStyles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const homeStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingTop: 52 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  dayName: { fontSize: 30, fontWeight: '700', color: Colors.textPrimary },
  dateStr: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  progressCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 20, padding: 20 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  progressLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
  progressCount: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
  barBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3 },
  barFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.8, marginHorizontal: 24, marginTop: 24, marginBottom: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
  fab: { position: 'absolute', bottom: 32, right: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabIcon: { color: '#fff', fontSize: 30, lineHeight: 34 },
});

// ─── ADD HABIT SCREEN ────────────────────────────────────
const AddHabitScreen = ({ navigation, route }) => {
  const existingHabit = route?.habit;
  const isEdit = !!existingHabit;
  const { addHabit, updateHabit } = useHabits();
  const [name, setName] = useState(existingHabit?.name || '');
  const [emoji, setEmoji] = useState(existingHabit?.emoji || '⭐');
  const [color, setColor] = useState(existingHabit?.colorHex || HabitColors[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Oops', 'Please enter a habit name!'); return; }
    setSaving(true);
    if (isEdit) {
      await updateHabit({ ...existingHabit, name: name.trim(), emoji, colorHex: color });
    } else {
      await addHabit({ id: genId(), name: name.trim(), emoji, colorHex: color, completedDates: [], createdAt: new Date().toISOString() });
    }
    navigation('Home', {});
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={addStyles.safe}>
        <View style={addStyles.navbar}>
          <TouchableOpacity onPress={() => navigation('Home', {})}>
            <Text style={addStyles.navCancel}>← Back</Text>
          </TouchableOpacity>
          <Text style={addStyles.navTitle}>{isEdit ? 'Edit Habit' : 'New Habit'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[addStyles.navSave, saving && { opacity: 0.5 }]}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={addStyles.previewRow}>
            <View style={[addStyles.previewBox, { backgroundColor: color + '22' }]}>
              <Text style={{ fontSize: 40 }}>{emoji}</Text>
            </View>
            <Text style={[addStyles.previewName, { color: name ? Colors.textPrimary : Colors.textSecondary }]}>
              {name || 'Habit name'}
            </Text>
          </View>

          <Text style={addStyles.label}>HABIT NAME</Text>
          <TextInput
            style={addStyles.input}
            placeholder="e.g. Drink 2L of water"
            placeholderTextColor={Colors.textSecondary}
            value={name} onChangeText={setName} maxLength={40} autoFocus={!isEdit}
          />

          <Text style={addStyles.label}>ICON</Text>
          <View style={addStyles.emojiGrid}>
            {HabitEmojis.map(e => (
              <TouchableOpacity key={e}
                style={[addStyles.emojiBtn, emoji === e && { backgroundColor: color + '22', borderColor: color, borderWidth: 2 }]}
                onPress={() => setEmoji(e)}>
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={addStyles.label}>COLOR</Text>
          <View style={addStyles.colorRow}>
            {HabitColors.map(c => (
              <TouchableOpacity key={c}
                style={[addStyles.colorDot, { backgroundColor: c }, color === c && addStyles.colorSelected]}
                onPress={() => setColor(c)}>
                {color === c && <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[addStyles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            <Text style={addStyles.saveBtnText}>{isEdit ? 'Update Habit' : 'Create Habit'}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const addStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingTop: 52 },
  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  navCancel: { fontSize: 16, color: Colors.textSecondary },
  navTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  navSave: { fontSize: 16, fontWeight: '700', color: Colors.accent },
  previewRow: { alignItems: 'center', paddingVertical: 28, gap: 12 },
  previewBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 20, fontWeight: '600' },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, color: Colors.textSecondary, marginHorizontal: 24, marginBottom: 10, marginTop: 20 },
  input: { marginHorizontal: 24, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.divider, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: Colors.textPrimary },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 10 },
  emojiBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.divider },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 12 },
  colorDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  colorSelected: { borderWidth: 3, borderColor: Colors.primary },
  saveBtn: { marginHorizontal: 24, marginTop: 28, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

// ─── DETAIL SCREEN ───────────────────────────────────────
const HabitDetailScreen = ({ navigation, route }) => {
  const { habitId } = route;
  const { habits, toggleHabitToday } = useHabits();
  const habit = habits.find(h => h.id === habitId);
  if (!habit) { navigation('Home', {}); return null; }

  const color = habit.colorHex;
  const streak = getCurrentStreak(habit);
  const longest = getLongestStreak(habit);
  const last7 = getLast7Days(habit);
  const completed = isCompletedToday(habit);

  return (
    <View style={detailStyles.safe}>
      <View style={detailStyles.header}>
        <TouchableOpacity onPress={() => navigation('Home', {})}>
          <Text style={detailStyles.back}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation('EditHabit', { habit })}>
          <Text style={detailStyles.edit}>Edit</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[detailStyles.hero, { backgroundColor: color + '18' }]}>
          <View style={[detailStyles.emojiBox, { backgroundColor: color + '30' }]}>
            <Text style={{ fontSize: 40 }}>{habit.emoji}</Text>
          </View>
          <Text style={detailStyles.habitName}>{habit.name}</Text>
          {streak > 0 && (
            <View style={[detailStyles.badge, { backgroundColor: color }]}>
              <Text style={detailStyles.badgeText}>🔥 {streak} day streak</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[detailStyles.todayBtn, { backgroundColor: completed ? color : Colors.surface, borderColor: completed ? color : Colors.divider }]}
          onPress={() => toggleHabitToday(habit.id)}
        >
          <Text style={[detailStyles.todayBtnText, { color: completed ? '#fff' : Colors.textPrimary }]}>
            {completed ? '✓  Completed Today' : 'Mark as Done Today'}
          </Text>
        </TouchableOpacity>

        <View style={detailStyles.statsRow}>
          {[
            { label: 'Current Streak', value: streak, unit: 'days' },
            { label: 'Longest Streak', value: longest, unit: 'days' },
          ].map(s => (
            <View key={s.label} style={detailStyles.statCard}>
              <Text style={[detailStyles.statValue, { color }]}>{s.value}</Text>
              <Text style={detailStyles.statUnit}>{s.unit}</Text>
              <Text style={detailStyles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={detailStyles.sectionLabel}>LAST 7 DAYS</Text>
        <View style={detailStyles.weekRow}>
          {last7.map(({ date, completed: c, label }) => (
            <View key={date} style={detailStyles.dayCol}>
              <View style={[detailStyles.dayDot, { backgroundColor: c ? color : Colors.divider }]}>
                {c && <Text style={{ color: '#fff', fontWeight: '700' }}>✓</Text>}
              </View>
              <Text style={detailStyles.dayLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={detailStyles.totalCard}>
          <Text style={detailStyles.totalNum}>{habit.completedDates?.length || 0}</Text>
          <Text style={detailStyles.totalLabel}>Total completions</Text>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const detailStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingTop: 52 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  back: { fontSize: 16, color: Colors.textSecondary },
  edit: { fontSize: 16, color: Colors.accent, fontWeight: '600' },
  hero: { alignItems: 'center', paddingVertical: 32, marginHorizontal: 20, borderRadius: 20, marginBottom: 16 },
  emojiBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  habitName: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  todayBtn: { marginHorizontal: 20, paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, marginBottom: 16 },
  todayBtnText: { fontSize: 16, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800' },
  statUnit: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, color: Colors.textSecondary, marginHorizontal: 24, marginTop: 8, marginBottom: 12 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 16 },
  dayCol: { alignItems: 'center', gap: 6 },
  dayDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dayLabel: { fontSize: 11, color: Colors.textSecondary },
  totalCard: { marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: 16, padding: 20, alignItems: 'center' },
  totalNum: { fontSize: 40, fontWeight: '800', color: Colors.textPrimary },
  totalLabel: { color: Colors.textSecondary, marginTop: 4 },
});

// ─── MAIN APP ────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState({});

  const navigate = (screenName, newParams) => {
    setScreen(screenName);
    setParams(newParams || {});
  };

  return (
    <HabitProvider>
      {screen === 'Home' && <HomeScreen navigation={navigate} route={params} />}
      {screen === 'AddHabit' && <AddHabitScreen navigation={navigate} route={params} />}
      {screen === 'EditHabit' && <AddHabitScreen navigation={navigate} route={params} />}
      {screen === 'HabitDetail' && <HabitDetailScreen navigation={navigate} route={params} />}
    </HabitProvider>
  );
}
