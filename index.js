// src/theme/index.js

export const Colors = {
  background: '#F8F7F4',
  surface: '#FFFFFF',
  primary: '#1A1A1A',
  accent: '#FF6B35',
  accentSoft: '#FFF0EB',
  textPrimary: '#1A1A1A',
  textSecondary: '#8A8A8A',
  divider: '#EEEEEE',
  success: '#4CAF76',
  successSoft: '#EDF7F1',
};

export const HabitColors = [
  '#FF6B35', // orange
  '#4CAF76', // green
  '#5B8AF0', // blue
  '#A855F7', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#84CC16', // lime
  '#6B7280', // gray
];

export const HabitEmojis = [
  '🏃', '💧', '📚', '🧘', '🍎', '💤', '🏋️', '🎯',
  '✍️', '🎨', '🧹', '💊', '🚴', '🌿', '☕', '🎵',
  '🧠', '💪', '🌅', '🛁', '🥗', '📖', '⭐', '🔥',
];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
};
