// src/screens/AddHabitScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import { useHabits } from '../context/HabitContext';
import { Colors, HabitColors, HabitEmojis, Spacing, Radius } from '../theme';

export default function AddHabitScreen({ navigation, route }) {
  // Support edit mode via route.params.habit
  const existingHabit = route?.params?.habit;
  const isEdit = !!existingHabit;

  const { addHabit, updateHabit } = useHabits();

  const [name, setName] = useState(existingHabit?.name || '');
  const [emoji, setEmoji] = useState(existingHabit?.emoji || '⭐');
  const [color, setColor] = useState(existingHabit?.colorHex || HabitColors[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Oops', 'Please enter a habit name!');
      return;
    }
    setSaving(true);

    if (isEdit) {
      await updateHabit({ ...existingHabit, name: name.trim(), emoji, colorHex: color });
    } else {
      await addHabit({
        id: uuid.v4(),
        name: name.trim(),
        emoji,
        colorHex: color,
        completedDates: [],
        createdAt: new Date().toISOString(),
      });
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Nav bar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.navCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{isEdit ? 'Edit Habit' : 'New Habit'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[styles.navSave, saving && { opacity: 0.5 }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Preview */}
          <View style={styles.previewRow}>
            <View style={[styles.previewBox, { backgroundColor: color + '22' }]}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
            </View>
            <Text style={[styles.previewName, { color: name ? Colors.textPrimary : Colors.textSecondary }]}>
              {name || 'Habit name'}
            </Text>
          </View>

          {/* Name input */}
          <Text style={styles.label}>HABIT NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Drink 2L of water"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={40}
            autoFocus={!isEdit}
          />

          {/* Emoji picker */}
          <Text style={styles.label}>ICON</Text>
          <View style={styles.emojiGrid}>
            {HabitEmojis.map(e => (
              <TouchableOpacity
                key={e}
                style={[
                  styles.emojiBtn,
                  emoji === e && {
                    backgroundColor: color + '22',
                    borderColor: color,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => setEmoji(e)}
              >
                <Text style={styles.emojiItem}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Color picker */}
          <Text style={styles.label}>COLOR</Text>
          <View style={styles.colorRow}>
            {HabitColors.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  color === c && styles.colorSelected,
                ]}
                onPress={() => setColor(c)}
              >
                {color === c && <Text style={styles.colorCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {isEdit ? 'Update Habit' : 'Create Habit'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  navCancel: { fontSize: 16, color: Colors.textSecondary },
  navTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  navSave: { fontSize: 16, fontWeight: '700', color: Colors.accent },
  scroll: { flex: 1 },
  previewRow: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: 12,
  },
  previewBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: { fontSize: 40 },
  previewName: { fontSize: 20, fontWeight: '600' },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.lg,
    marginBottom: 10,
    marginTop: Spacing.lg,
  },
  input: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: 10,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  emojiItem: { fontSize: 22 },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  colorCheck: { color: '#fff', fontWeight: '700', fontSize: 16 },
  saveBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
