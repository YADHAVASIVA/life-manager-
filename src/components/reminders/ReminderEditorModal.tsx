import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Modal } from '@/components/common/Modal';
import { InputField } from '@/components/common/InputField';
import { PrimaryCTA } from '@/components/common/PrimaryCTA';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { Reminder, ReminderCategory, ReminderFrequency } from '@/models/Reminder';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ReminderEditorModalProps {
  visible: boolean;
  onClose: () => void;
  reminder?: Reminder | null;
  onSave: (reminder: Partial<Reminder>) => void;
  onDelete?: (id: string) => void;
}

export function ReminderEditorModal({ visible, onClose, reminder, onSave, onDelete }: ReminderEditorModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('personal');
  const [frequency, setFrequency] = useState<ReminderFrequency>('once');
  const [time, setTime] = useState<Date>(new Date());
  const [date, setDate] = useState<Date>(new Date());
  const [sound, setSound] = useState<'default' | 'silent'>('default');
  const [vibration, setVibration] = useState(true);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (reminder) {
        setTitle(reminder.title);
        setNotes(reminder.notes || '');
        setCategory(reminder.category || 'other');
        setFrequency(reminder.frequency);
        setTime(parse(reminder.time, 'HH:mm', new Date()));
        setDate(reminder.date ? parse(reminder.date, 'yyyy-MM-dd', new Date()) : new Date());
        setSound(reminder.sound || 'default');
        setVibration(reminder.vibration !== false);
      } else {
        setTitle('');
        setNotes('');
        setCategory('personal');
        setFrequency('once');
        setTime(new Date());
        setDate(new Date());
        setSound('default');
        setVibration(true);
      }
    }
  }, [visible, reminder]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      frequency,
      time: format(time, 'HH:mm'),
      date: frequency === 'once' ? format(date, 'yyyy-MM-dd') : undefined,
      sound,
      vibration,
      enabled: true,
    });
    onClose();
  };

  const confirmDelete = () => {
    if (!reminder || !onDelete) return;
    Alert.alert(
      'Delete this reminder?',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { onDelete(reminder.id); onClose(); } }
      ]
    );
  };

  const renderChips = (
    options: { label: string; value: string }[],
    selectedValue: string,
    onSelect: (val: any) => void
  ) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.chip, selectedValue === opt.value && styles.chipActive]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[styles.chipText, selectedValue === opt.value && styles.chipTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <Modal visible={visible} onClose={onClose} title={reminder ? 'Edit Reminder' : 'New Reminder'} tall>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <InputField value={title} onChangeText={setTitle} placeholder="e.g. Drink Water" autoFocus={!reminder} />
      </View>

      <View style={styles.row}>
        <View style={styles.formGroupHalf}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.primary} />
            <Text style={styles.pickerText}>{format(time, 'h:mm a')}</Text>
          </TouchableOpacity>
        </View>

        {frequency === 'once' && (
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
              <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
              <Text style={styles.pickerText}>{format(date, 'MMM d')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Repeat</Text>
        {renderChips(
          [
            { label: 'One-time', value: 'once' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekdays', value: 'weekdays' },
            { label: 'Weekends', value: 'weekends' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ],
          frequency,
          setFrequency
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        {renderChips(
          [
            { label: 'Personal', value: 'personal' },
            { label: 'Routine', value: 'routine' },
            { label: 'Water', value: 'water' },
            { label: 'Gym', value: 'gym' },
            { label: 'Nutrition', value: 'nutrition' },
            { label: 'Study', value: 'study' },
            { label: 'College', value: 'college' },
            { label: 'Finance', value: 'finance' },
            { label: 'SIP', value: 'sip' },
            { label: 'Sleep', value: 'sleep' },
          ],
          category,
          setCategory
        )}
      </View>

      <View style={styles.formGroup}>
        <TouchableOpacity style={styles.switchRow} onPress={() => setSound(sound === 'default' ? 'silent' : 'default')} activeOpacity={0.8}>
          <View style={styles.switchRowLeft}>
            <MaterialCommunityIcons name={sound === 'default' ? "volume-high" : "volume-off"} size={22} color={sound === 'default' ? Colors.primary : Colors.textMuted} />
            <Text style={styles.switchLabel}>Sound Enabled</Text>
          </View>
          <View style={[styles.switchTrack, sound === 'default' && styles.switchTrackActive]}>
            <View style={[styles.switchThumb, sound === 'default' && styles.switchThumbActive]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <TouchableOpacity style={styles.switchRow} onPress={() => setVibration(!vibration)} activeOpacity={0.8}>
          <View style={styles.switchRowLeft}>
            <MaterialCommunityIcons name={vibration ? "vibrate" : "cellphone-off"} size={22} color={vibration ? Colors.primary : Colors.textMuted} />
            <Text style={styles.switchLabel}>Vibration</Text>
          </View>
          <View style={[styles.switchTrack, vibration && styles.switchTrackActive]}>
            <View style={[styles.switchThumb, vibration && styles.switchThumbActive]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <InputField value={notes} onChangeText={setNotes} placeholder="Add details..." multiline />
      </View>

      <View style={styles.footer}>
        {reminder && onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={24} color={Colors.danger} />
          </TouchableOpacity>
        )}
        <PrimaryCTA label={reminder ? 'Save Changes' : 'Create Reminder'} onPress={handleSave} style={styles.saveBtn} />
      </View>

      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(e, s) => { setShowDatePicker(false); if (s) setDate(s); }} />
      )}
      {showTimePicker && (
        <DateTimePicker value={time} mode="time" display="default" onChange={(e, s) => { setShowTimePicker(false); if (s) setTime(s); }} />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  formGroup: { marginBottom: Spacing.xl },
  formGroupHalf: { flex: 1, marginBottom: Spacing.xl },
  row: { flexDirection: 'row', gap: Spacing.md },
  label: { ...TextStyles.label, color: Colors.textSecondary, marginBottom: Spacing.sm },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48 },
  pickerText: { ...TextStyles.body, color: Colors.textPrimary, marginLeft: Spacing.sm, flex: 1 },
  chipScroll: { flexDirection: 'row', marginHorizontal: -Spacing.screenPaddingH, paddingHorizontal: Spacing.screenPaddingH },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm },
  chipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  chipText: { ...TextStyles.bodySmall, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  switchRowLeft: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { ...TextStyles.body, color: Colors.textPrimary, marginLeft: Spacing.sm },
  switchTrack: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.border, padding: 2, justifyContent: 'center' },
  switchTrackActive: { backgroundColor: Colors.primary },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.surfaceElevated, elevation: 2 },
  switchThumbActive: { transform: [{ translateX: 20 }] },
  footer: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxl },
  deleteBtn: { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.danger, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { flex: 1 }
});
