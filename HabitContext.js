// src/context/HabitContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { saveHabits, loadHabits } from '../utils/storage';
import { toggleToday } from '../utils/streakUtils';

const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadHabits();
      setHabits(stored);
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (updated) => {
    setHabits(updated);
    await saveHabits(updated);
  }, []);

  const addHabit = useCallback(async (habit) => {
    const updated = [...habits, habit];
    await persist(updated);
  }, [habits, persist]);

  const updateHabit = useCallback(async (habit) => {
    const updated = habits.map(h => h.id === habit.id ? habit : h);
    await persist(updated);
  }, [habits, persist]);

  const deleteHabit = useCallback(async (id) => {
    const updated = habits.filter(h => h.id !== id);
    await persist(updated);
  }, [habits, persist]);

  const toggleHabitToday = useCallback(async (id) => {
    const updated = habits.map(h =>
      h.id === id ? toggleToday(h) : h
    );
    await persist(updated);
  }, [habits, persist]);

  return (
    <HabitContext.Provider value={{
      habits,
      loading,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabitToday,
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
