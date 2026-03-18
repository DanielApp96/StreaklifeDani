// src/utils/streakUtils.js

const dateOnly = (dateStr) => dateStr.split('T')[0];
const todayStr = () => new Date().toISOString().split('T')[0];
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const isCompletedToday = (habit) => {
  const today = todayStr();
  return (habit.completedDates || []).some(d => dateOnly(d) === today);
};

export const getCurrentStreak = (habit) => {
  const dates = [...new Set((habit.completedDates || []).map(d => dateOnly(d)))];
  if (dates.length === 0) return 0;

  dates.sort((a, b) => b.localeCompare(a)); // newest first

  const today = todayStr();
  const yesterday = yesterdayStr();

  // Streak must include today or yesterday to be active
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 0;
  let expected = dates[0];

  for (const date of dates) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split('T')[0];
    } else {
      break;
    }
  }
  return streak;
};

export const getLongestStreak = (habit) => {
  const dates = [...new Set((habit.completedDates || []).map(d => dateOnly(d)))];
  if (dates.length === 0) return 0;

  dates.sort((a, b) => a.localeCompare(b)); // oldest first

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
};

export const getCompletionRate = (habit, days = 7) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const count = (habit.completedDates || []).filter(
    d => dateOnly(d) >= cutoffStr
  ).length;

  return Math.round((count / days) * 100);
};

export const getLast7Days = (habit) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const completed = (habit.completedDates || []).some(
      cd => dateOnly(cd) === dateStr
    );
    days.push({
      date: dateStr,
      completed,
      label: d.toLocaleDateString('en', { weekday: 'narrow' }),
    });
  }
  return days;
};

export const toggleToday = (habit) => {
  const today = todayStr();
  const completedDates = [...(habit.completedDates || [])];
  const idx = completedDates.findIndex(d => dateOnly(d) === today);

  if (idx >= 0) {
    completedDates.splice(idx, 1);
  } else {
    completedDates.push(today);
  }

  return { ...habit, completedDates };
};
