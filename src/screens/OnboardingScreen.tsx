import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
} from 'react-native';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { InputField } from '@/components/common/InputField';
import { PrimaryCTA } from '@/components/common/PrimaryCTA';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, setHours, setMinutes, parse } from 'date-fns';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useUserStore, useGoalStore, useRoutineStore, useFinanceStore, useReminderStore } from '@/store';
import { markAppInitialized } from '@/services/storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { GoalCategory } from '@/models/Goal';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

// ─── Constants ──────────────────────────────────────────────────────────────

const GOAL_OPTIONS = [
  { id: 'weight_gain', label: 'Weight Gain', category: 'health' as GoalCategory, icon: 'weight-kilogram', isPrimary: true },
  { id: 'fitness', label: 'Fitness', category: 'fitness' as GoalCategory, icon: 'dumbbell', isPrimary: false },
  { id: 'sleep', label: 'Better Sleep', category: 'health' as GoalCategory, icon: 'sleep', isPrimary: false },
  { id: 'productivity', label: 'Better Productivity', category: 'study' as GoalCategory, icon: 'laptop', isPrimary: false },
  { id: 'money', label: 'Better Money Management', category: 'finance' as GoalCategory, icon: 'cash', isPrimary: false },
];

function createDefaultTime(hours: number, minutes: number) {
  const d = new Date();
  return setMinutes(setHours(d, hours), minutes);
}

// ─── Main Component ────────────────────────────────────────────────────────

export function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const onBackPress = () => {
      if (step > 1) {
        setStep(step - 1);
        return true; // handled
      }
      return false; // let system handle it
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [step]);

  // Store actions
  const updateUser = useUserStore(s => s.updateUser);
  const addGoal = useGoalStore(s => s.addGoal);

  // Step 1 State
  const [age, setAge] = useState('20');
  const [height, setHeight] = useState('178');
  const [weight, setWeight] = useState('46');

  // Step 2 State
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['weight_gain']);
  const [targetWeight, setTargetWeight] = useState('65');

  // Step 3 State
  const [times, setTimes] = useState({
    wakeUp: createDefaultTime(6, 30),
    collegeStart: createDefaultTime(8, 15),
    collegeEnd: createDefaultTime(14, 45),
    gym: createDefaultTime(18, 0),
    sleep: createDefaultTime(23, 0),
  });
  const [activePicker, setActivePicker] = useState<keyof typeof times | null>(null);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!age || !height || !weight) {
        setError('Please fill in all fields.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!targetWeight) {
        setError('Please enter a target weight.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep(step - 1);
    }
  };

  const toggleGoal = (id: string) => {
    if (id === 'weight_gain') return; // Primary goal cannot be toggled off
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter(g => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setActivePicker(null);
    }
    if (selectedDate && activePicker) {
      setTimes(prev => ({ ...prev, [activePicker]: selectedDate }));
    }
  };

  const handleFinish = async () => {
    try {
      // 1. Save User Profile
      await updateUser({
        age: parseInt(age, 10),
        heightCm: parseInt(height, 10),
        weightKg: parseFloat(weight),
        targetWeightKg: parseFloat(targetWeight),
        wakeTime: format(times.wakeUp, 'HH:mm'),
        sleepTime: format(times.sleep, 'HH:mm'),
        collegeStartTime: format(times.collegeStart, 'HH:mm'),
        collegeEndTime: format(times.collegeEnd, 'HH:mm'),
        updatedAt: new Date().toISOString(),
      });

      // 2. Save Goals
      for (const goalId of selectedGoals) {
        const option = GOAL_OPTIONS.find(g => g.id === goalId);
        if (option) {
          await addGoal({
            id: `goal-${Date.now()}-${option.id}`,
            title: option.label,
            category: option.category,
            target: option.isPrimary ? parseFloat(targetWeight) : 100,
            current: option.isPrimary ? parseFloat(weight) : 0,
            unit: option.isPrimary ? 'kg' : '%',
            progress: option.isPrimary ? 0 : 0,
            status: 'active',
            icon: option.icon,
            color: Colors.primary,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // 3. Mark initialized & Navigate
      await markAppInitialized();
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      console.error(err);
      setError('Something went wrong saving your setup.');
    }
  };

  // ─── Render Helpers ───────────────────────────────────────────────────────

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.progressText}>STEP {step} OF 4</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]}
            layout={Layout.springify()}
          />
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <Text style={styles.title}>Let's build your LifeOS</Text>
      <Text style={styles.subtitle}>Start with a few details so we can personalize your experience.</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Age (years)</Text>
        <InputField value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="e.g. 20" />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Height (cm)</Text>
        <InputField value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="e.g. 178" />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Weight (kg)</Text>
        <InputField value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="e.g. 46" />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <Text style={styles.title}>What are you working toward?</Text>
      <Text style={styles.subtitle}>We'll use this to personalize your daily plan.</Text>

      <View style={styles.goalsContainer}>
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <TouchableOpacity
              key={goal.id}
              activeOpacity={0.8}
              onPress={() => toggleGoal(goal.id)}
              style={[styles.goalCard, isSelected && styles.goalCardSelected]}
            >
              <View style={styles.goalCardLeft}>
                <MaterialCommunityIcons
                  name={goal.icon as any}
                  size={24}
                  color={isSelected ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
                  {goal.label}
                </Text>
              </View>
              {isSelected && (
                <MaterialCommunityIcons name="check-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.targetWeightContainer}>
        <Text style={styles.label}>Target Weight (kg)</Text>
        <InputField
          value={targetWeight}
          onChangeText={setTargetWeight}
          keyboardType="decimal-pad"
          placeholder="e.g. 65"
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <Text style={styles.title}>Build your daily rhythm</Text>
      <Text style={styles.subtitle}>We'll use this to create your reminders.</Text>

      <View style={styles.timesContainer}>
        {[
          { key: 'wakeUp', label: 'Wake Up', icon: 'weather-sunset-up' },
          { key: 'collegeStart', label: 'College Start', icon: 'school' },
          { key: 'collegeEnd', label: 'College End', icon: 'school-outline' },
          { key: 'gym', label: 'Gym', icon: 'dumbbell' },
          { key: 'sleep', label: 'Sleep', icon: 'moon-waning-crescent' },
        ].map((item) => (
          <View key={item.key} style={styles.timeRow}>
            <View style={styles.timeRowLeft}>
              <View style={styles.timeIconWrapper}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.textSecondary} />
              </View>
              <Text style={styles.timeLabel}>{item.label}</Text>
            </View>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setActivePicker(item.key as keyof typeof times)}
            >
              <Text style={styles.timeButtonText}>
                {format(times[item.key as keyof typeof times], 'hh:mm a')}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {activePicker && (
        <DateTimePicker
          value={times[activePicker]}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </Animated.View>
  );

  const renderStep4 = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <Text style={styles.title}>Your plan is ready.</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summarySection}>HEALTH</Text>
        <Text style={styles.summaryRow}>Weight: <Text style={styles.summaryValue}>{weight} kg</Text></Text>
        <Text style={styles.summaryRow}>Target: <Text style={styles.summaryValue}>{targetWeight} kg</Text></Text>
        <Text style={styles.summaryRow}>Gym: <Text style={styles.summaryValue}>4-5 days/week</Text></Text>
        <Text style={styles.summaryRow}>Water: <Text style={styles.summaryValue}>2-2.5 L/day</Text></Text>

        <View style={styles.divider} />
        
        <Text style={styles.summarySection}>DAILY LIFE</Text>
        <Text style={styles.summaryRow}>Wake: <Text style={styles.summaryValue}>{format(times.wakeUp, 'hh:mm a')}</Text></Text>
        <Text style={styles.summaryRow}>College: <Text style={styles.summaryValue}>{format(times.collegeStart, 'hh:mm a')} - {format(times.collegeEnd, 'hh:mm a')}</Text></Text>
        <Text style={styles.summaryRow}>Sleep: <Text style={styles.summaryValue}>{format(times.sleep, 'hh:mm a')}</Text></Text>

        <View style={styles.divider} />

        <Text style={styles.summarySection}>MONEY</Text>
        <Text style={styles.summaryRow}>Monthly Budget: <Text style={styles.summaryValue}>₹13,000</Text></Text>
        <Text style={styles.summaryRow}>Rent: <Text style={styles.summaryValue}>₹3,000</Text></Text>
        <Text style={styles.summaryRow}>Gym Food: <Text style={styles.summaryValue}>₹7,250</Text></Text>

        <View style={styles.divider} />

        <Text style={styles.summarySection}>ACCOUNTS</Text>
        <Text style={styles.summaryRow}>Union Bank: <Text style={styles.summaryValue}>SIP</Text></Text>
        <Text style={styles.summaryRow}>SBI: <Text style={styles.summaryValue}>Daily Use</Text></Text>
        <Text style={styles.summaryRow}>Kotak: <Text style={styles.summaryValue}>Savings</Text></Text>
        <Text style={styles.summaryRow}>Credit Card: <Text style={styles.summaryValue}>₹1,800 limit</Text></Text>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </Animated.View>
  );

  return (
    <SafeScreen style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {renderProgressBar()}
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryCTA
            label={step === 4 ? 'BUILD MY LIFEOS' : 'Continue'}
            onPress={step === 4 ? handleFinish : handleNext}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressText: {
    ...TextStyles.overline,
    color: Colors.textSecondary,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    ...TextStyles.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...TextStyles.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...TextStyles.caption,
    color: Colors.danger,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  goalsContainer: {
    marginBottom: Spacing.xl,
  },
  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  goalCardSelected: {
    backgroundColor: Colors.primaryFaint,
    borderColor: Colors.primary,
  },
  goalCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLabel: {
    ...TextStyles.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  goalLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  targetWeightContainer: {
    marginTop: Spacing.sm,
  },
  timesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  timeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIconWrapper: {
    width: 32,
    alignItems: 'center',
  },
  timeLabel: {
    ...TextStyles.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  timeButton: {
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.sm,
  },
  timeButtonText: {
    ...TextStyles.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summarySection: {
    ...TextStyles.overline,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  summaryValue: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 0 : Spacing.lg,
  },
});
