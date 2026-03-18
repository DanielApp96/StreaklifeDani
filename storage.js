// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_KEY = '@streaklife_habits';

export const saveHabits = async (habits) => {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits:', e);
  }
};

export const loadHabits = async () => {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load habits:', e);
    return [];
  }
};
