import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Modal } from '@/components/common/Modal';
import { InputField } from '@/components/common/InputField';
import { PrimaryCTA } from '@/components/common/PrimaryCTA';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { Task, TaskPriority, TaskCategory, RepeatFrequency } from '@/models/Task';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TaskEditorModalProps {
  visible: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (task: Partial<Task>) => void;
  onDelete?: (id: string) => void;
}

export function TaskEditorModal({ visible, onClose, task, onSave, onDelete }: TaskEditorModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState<Date | null>(null);
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [repeat, setRepeat] = useState<RepeatFrequency>('none');
  const [reminder, setReminder] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (task) {
        setTitle(task.title);
        setNotes(task.notes || '');
        setDate(parse(task.date, 'yyyy-MM-dd', new Date()));
        setTime(task.time ? parse(task.time, 'HH:mm', new Date()) : null);
        setCategory(task.category);
        setPriority(task.priority);
        setRepeat(task.repeat);
        setReminder(task.reminder);
      } else {
        setTitle('');
        setNotes('');
        setDate(new Date());
        setTime(null);
        setCategory('personal');
        setPriority('medium');
        setRepeat('none');
        setReminder(false);
      }
    }
  }, [visible, task]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      notes: notes.trim() || undefined,
      date: format(date, 'yyyy-MM-dd'),
      time: time ? format(time, 'HH:mm') : undefined,
      category,
      priority,
      repeat,
      reminder,
    });
    onClose();
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
    <Modal
      visible={visible}
      onClose={onClose}
      title={task ? 'Edit Task' : 'New Task'}
      tall
    >
      <View style={styles.formGroup}>
        <Text style={styles.label}>What do you need to do?</Text>
        <InputField
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Read 10 pages"
          autoFocus={!task}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.formGroupHalf}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
            <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
            <Text style={styles.pickerText}>{format(date, 'MMM d, yyyy')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroupHalf}>
          <Text style={styles.label}>Time (Optional)</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={time ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.pickerText, !time && styles.pickerTextMuted]}>
              {time ? format(time, 'h:mm a') : 'No Time'}
            </Text>
            {time && (
              <TouchableOpacity onPress={() => setTime(null)}>
                <MaterialCommunityIcons name="close" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        {renderChips(
          [
            { label: 'Personal', value: 'personal' },
            { label: 'Routine', value: 'routine' },
            { label: 'College', value: 'college' },
            { label: 'Study', value: 'study' },
            { label: 'Coding', value: 'coding' },
            { label: 'Project', value: 'project' },
            { label: 'Gym', value: 'gym' },
            { label: 'Finance', value: 'finance' },
          ],
          category,
          setCategory
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Priority</Text>
        {renderChips(
          [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Urgent', value: 'critical' },
          ],
          priority,
          setPriority
        )}
      </View>

      <View style={styles.formGroup}>
        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => setReminder(!reminder)}
          activeOpacity={0.8}
        >
          <View style={styles.switchRowLeft}>
            <MaterialCommunityIcons name={reminder ? "bell-ring" : "bell-off-outline"} size={22} color={reminder ? Colors.primary : Colors.textMuted} />
            <Text style={styles.switchLabel}>Reminder Notification</Text>
          </View>
          <View style={[styles.switchTrack, reminder && styles.switchTrackActive]}>
            <View style={[styles.switchThumb, reminder && styles.switchThumbActive]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <InputField
          value={notes}
          onChangeText={setNotes}
          placeholder="Add details..."
          multiline
        />
      </View>

      <View style={styles.footer}>
        {task && onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => { onDelete(task.id); onClose(); }}>
            <MaterialCommunityIcons name="trash-can-outline" size={24} color={Colors.danger} />
          </TouchableOpacity>
        )}
        <PrimaryCTA label={task ? 'Save Changes' : 'Create Task'} onPress={handleSave} style={styles.saveBtn} />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selected) => {
            setShowDatePicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          display="default"
          onChange={(event, selected) => {
            setShowTimePicker(false);
            if (selected) setTime(selected);
          }}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: Spacing.xl,
  },
  formGroupHalf: {
    flex: 1,
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  label: {
    ...TextStyles.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  pickerText: {
    ...TextStyles.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  pickerTextMuted: {
    color: Colors.textMuted,
  },
  chipScroll: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.screenPaddingH,
    paddingHorizontal: Spacing.screenPaddingH,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  chipText: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    ...TextStyles.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: Colors.primary,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
  }
});
