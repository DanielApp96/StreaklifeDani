// App.js
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HabitProvider } from './src/context/HabitContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HabitProvider>
        <AppNavigator />
      </HabitProvider>
    </GestureHandlerRootView>
  );
}
