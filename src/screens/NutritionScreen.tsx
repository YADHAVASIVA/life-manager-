import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { AppCard } from '@/components/common/AppCard';
import { Colors, Spacing, TextStyles, Radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNutritionStore, useWaterStore, useWeightStore, useWorkoutStore, useStreakStore } from '@/store';
import { format, parse, isAfter, differenceInMinutes } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Modal } from '@/components/common/Modal';
import { Food, MealPlan } from '@/models/Nutrition';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PrimaryCTA } from '@/components/common/PrimaryCTA';

export function NutritionScreen() {
  const navigation = useNavigation();
  const { mealPlans, foods, entries, completions, settings, logEntry, markMealCompleted, unmarkMealCompleted } = useNutritionStore();
  const { logs: waterLogs, todayTargetML } = useWaterStore();
  const { logs: weightLogs } = useWeightStore();
  const { history: workoutHistory } = useWorkoutStore();
  const { markCompleted, removeTodayCompletion } = useStreakStore();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  // Modal states
  const [activeMeal, setActiveMeal] = useState<MealPlan | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Daily Filtering
  const todayEntries = entries.filter(e => e.date === todayStr);
  const todayCompletions = completions.filter(c => c.date === todayStr);

  const activePlans = mealPlans.filter(m => m.enabled);
  const mealsCompleted = todayCompletions.length;
  const isDayCompleted = activePlans.length > 0 && mealsCompleted >= activePlans.length;

  // Macros
  const totalCalories = Math.round(todayEntries.reduce((acc, e) => acc + (e.calories ? e.calories * e.quantity : 0), 0));
  const totalProtein = Math.round(todayEntries.reduce((acc, e) => acc + (e.protein ? e.protein * e.quantity : 0), 0));

  // External data
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : 46;
  const todayWater = waterLogs.filter(l => l.timestamp.startsWith(todayStr)).reduce((acc, l) => acc + l.amountML, 0);
  const isWorkoutCompleted = workoutHistory.some(h => h.date === todayStr && h.status === 'completed');

  // Next meal
  const nextMeal = useMemo(() => {
    const upcoming = activePlans.filter(p => !todayCompletions.some(c => c.mealId === p.id)).map(p => {
      const pTime = parse(p.time, 'hh:mm a', now);
      return { ...p, pTime };
    }).sort((a, b) => a.pTime.getTime() - b.pTime.getTime());
    
    return upcoming.find(u => isAfter(u.pTime, now)) || upcoming[0] || null;
  }, [activePlans, todayCompletions, now]);

  const handleToggleMeal = (mealId: string) => {
    const isComp = todayCompletions.some(c => c.mealId === mealId);
    if (isComp) {
      unmarkMealCompleted(mealId, todayStr);
      removeTodayCompletion('nutrition'); // Fallback regression
    } else {
      markMealCompleted(mealId, todayStr);
      if (mealsCompleted + 1 >= activePlans.length) {
        markCompleted('nutrition');
      }
    }
  };

  const handleAddFood = (food: Food) => {
    if (!activeMeal) return;
    logEntry({
      foodId: food.id,
      foodName: food.name,
      mealId: activeMeal.id,
      quantity: 1,
      servingSize: food.servingSize,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
    setShowSearch(false);
    setActiveMeal(null);
  };

  const filteredFoods = foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NUTRITION</Text>
        <Text style={styles.headerSubtitle}>Fuel your day. Build consistency.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <AppCard style={styles.heroCard}>
            <Text style={styles.heroOverline}>TODAY</Text>
            <View style={styles.heroRow}>
              <View style={styles.heroCol}>
                <Text style={styles.heroValue}>{mealsCompleted} / {activePlans.length}</Text>
                <Text style={styles.heroLabel}>Meals</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroCol}>
                <Text style={styles.heroValue}>{totalProtein > 0 ? `${totalProtein}g` : '—'}</Text>
                <Text style={styles.heroLabel}>Protein</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroCol}>
                <Text style={styles.heroValue}>{totalCalories > 0 ? `${totalCalories}` : '—'}</Text>
                <Text style={styles.heroLabel}>kcal</Text>
              </View>
            </View>
            
            <View style={styles.heroProgressWrap}>
              <ProgressBar progress={activePlans.length ? mealsCompleted / activePlans.length : 0} color={isDayCompleted ? Colors.success : Colors.nutrition} style={{ height: 6 }} />
              <Text style={[styles.heroProgressText, isDayCompleted && { color: Colors.success }]}>
                {isDayCompleted ? '✓ DAY COMPLETE' : `${mealsCompleted} of ${activePlans.length} meals completed`}
              </Text>
            </View>
          </AppCard>
        </Animated.View>

        {/* NEXT UP */}
        {nextMeal && (
          <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
            <Text style={styles.sectionTitle}>NEXT UP</Text>
            <AppCard style={styles.nextMealCard}>
              <View style={styles.nextMealHeader}>
                <Text style={styles.nextMealTime}>{nextMeal.time}</Text>
                <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.nutrition} />
              </View>
              <Text style={styles.nextMealName}>{nextMeal.name}</Text>
            </AppCard>
          </Animated.View>
        )}

        {/* MEAL PLAN */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>DAILY MEAL PLAN</Text>
          {activePlans.map((meal) => {
            const isCompleted = todayCompletions.some(c => c.mealId === meal.id);
            const mealEntries = todayEntries.filter(e => e.mealId === meal.id);
            const mealCals = Math.round(mealEntries.reduce((acc, e) => acc + (e.calories ? e.calories * e.quantity : 0), 0));
            const mealPro = Math.round(mealEntries.reduce((acc, e) => acc + (e.protein ? e.protein * e.quantity : 0), 0));

            return (
              <AppCard key={meal.id} style={[styles.mealCard, isCompleted && styles.mealCardCompleted]}>
                <View style={styles.mealHeader}>
                  <View>
                    <Text style={[styles.mealTime, isCompleted && { color: Colors.success }]}>{meal.time}</Text>
                    <Text style={styles.mealName}>{meal.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleToggleMeal(meal.id)} style={[styles.checkBtn, isCompleted && styles.checkBtnActive]}>
                    <MaterialCommunityIcons name={isCompleted ? "check" : "check"} size={20} color={isCompleted ? Colors.background : Colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {mealEntries.length > 0 && (
                  <View style={styles.mealFoods}>
                    {mealEntries.map(e => (
                      <View key={e.id} style={styles.foodRow}>
                        <Text style={styles.foodName}>{e.quantity}× {e.foodName}</Text>
                        <Text style={styles.foodMeta}>{e.calories ? `${e.calories * e.quantity} kcal` : ''}</Text>
                      </View>
                    ))}
                    <View style={styles.mealTotals}>
                      {mealPro > 0 && <Text style={styles.mealTotalText}>Protein: {mealPro}g</Text>}
                      {mealCals > 0 && <Text style={styles.mealTotalText}>Calories: {mealCals} kcal</Text>}
                    </View>
                  </View>
                )}

                <TouchableOpacity style={styles.addFoodBtn} onPress={() => { setActiveMeal(meal); setShowSearch(true); }}>
                  <MaterialCommunityIcons name="plus" size={16} color={Colors.nutrition} />
                  <Text style={styles.addFoodText}>Add Food</Text>
                </TouchableOpacity>
              </AppCard>
            );
          })}
        </Animated.View>

        {/* WEIGHT GAIN TRACKER */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
          <Text style={styles.sectionTitle}>WEIGHT-GAIN PLAN</Text>
          <AppCard style={styles.weightCard}>
            <View style={styles.weightRow}>
              <View>
                <Text style={styles.weightLabel}>Current</Text>
                <Text style={styles.weightValue}>{currentWeight.toFixed(1)} kg</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.weightLabel}>Target</Text>
                <Text style={styles.weightValue}>65–70 kg</Text>
              </View>
            </View>
            <ProgressBar progress={Math.max(0, (currentWeight - 46) / (65 - 46))} color={Colors.nutrition} style={{ height: 4, marginTop: Spacing.md }} />
            <Text style={styles.weightMsg}>Consistency supports your goal.</Text>
          </AppCard>
        </Animated.View>

        {/* TODAY SUMMARY */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S SUMMARY</Text>
          <AppCard style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="water" size={20} color={Colors.water} />
              <Text style={styles.summaryText}>Water: {(todayWater/1000).toFixed(1)} / {(todayTargetML/1000).toFixed(1)} L</Text>
            </View>
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="dumbbell" size={20} color={Colors.workout} />
              <Text style={styles.summaryText}>Gym: {isWorkoutCompleted ? 'Completed' : 'Pending'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="food-apple" size={20} color={Colors.nutrition} />
              <Text style={styles.summaryText}>Meals: {mealsCompleted} / {activePlans.length}</Text>
            </View>
          </AppCard>
        </Animated.View>

      </ScrollView>

      {/* SEARCH MODAL */}
      <Modal visible={showSearch} onClose={() => { setShowSearch(false); setActiveMeal(null); }} title={`Add to ${activeMeal?.name}`}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search food library..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
        <ScrollView style={{ maxHeight: 400 }}>
          {filteredFoods.map(food => (
            <TouchableOpacity key={food.id} style={styles.searchRow} onPress={() => handleAddFood(food)}>
              <View>
                <Text style={styles.searchFoodName}>{food.name}</Text>
                <Text style={styles.searchFoodMeta}>{food.servingSize} • {food.calories} kcal</Text>
              </View>
              <MaterialCommunityIcons name="plus-circle-outline" size={24} color={Colors.nutrition} />
            </TouchableOpacity>
          ))}
          {filteredFoods.length === 0 && (
            <Text style={styles.emptyText}>No food found. Create custom food in settings.</Text>
          )}
        </ScrollView>
      </Modal>

    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { ...TextStyles.h1, color: Colors.textPrimary },
  headerSubtitle: { ...TextStyles.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { marginTop: Spacing.xl },
  sectionTitle: { ...TextStyles.overline, color: Colors.textMuted, marginBottom: Spacing.sm, letterSpacing: 1.5, marginLeft: Spacing.sm },
  heroCard: { padding: Spacing.lg, backgroundColor: Colors.surfaceHighlight },
  heroOverline: { ...TextStyles.overline, color: Colors.nutrition, marginBottom: Spacing.md },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroCol: { alignItems: 'center', flex: 1 },
  heroValue: { ...TextStyles.h2, color: Colors.textPrimary },
  heroLabel: { ...TextStyles.caption, color: Colors.textSecondary, marginTop: 2 },
  heroDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  heroProgressWrap: { marginTop: Spacing.lg },
  heroProgressText: { ...TextStyles.tiny, color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center' },
  nextMealCard: { padding: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.nutrition },
  nextMealHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  nextMealTime: { ...TextStyles.caption, color: Colors.textSecondary },
  nextMealName: { ...TextStyles.h3, color: Colors.textPrimary },
  mealCard: { padding: Spacing.lg, marginBottom: Spacing.md },
  mealCardCompleted: { borderColor: Colors.success, borderWidth: 1 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealTime: { ...TextStyles.caption, color: Colors.nutrition, marginBottom: 2 },
  mealName: { ...TextStyles.h3, color: Colors.textPrimary },
  checkBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkBtnActive: { backgroundColor: Colors.success, borderColor: Colors.success },
  mealFoods: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  foodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  foodName: { ...TextStyles.body, color: Colors.textPrimary },
  foodMeta: { ...TextStyles.caption, color: Colors.textSecondary },
  mealTotals: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  mealTotalText: { ...TextStyles.tiny, color: Colors.textMuted },
  addFoodBtn: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  addFoodText: { ...TextStyles.label, color: Colors.nutrition, marginLeft: 4 },
  weightCard: { padding: Spacing.lg },
  weightRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weightLabel: { ...TextStyles.caption, color: Colors.textSecondary },
  weightValue: { ...TextStyles.h2, color: Colors.textPrimary },
  weightMsg: { ...TextStyles.caption, color: Colors.textMuted, marginTop: Spacing.sm, textAlign: 'center' },
  summaryCard: { padding: Spacing.lg, gap: Spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summaryText: { ...TextStyles.body, color: Colors.textPrimary },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, paddingHorizontal: Spacing.md, borderRadius: Radius.sm, height: 44, marginBottom: Spacing.md },
  searchInput: { flex: 1, color: Colors.textPrimary, marginLeft: Spacing.sm },
  searchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchFoodName: { ...TextStyles.body, color: Colors.textPrimary },
  searchFoodMeta: { ...TextStyles.caption, color: Colors.textSecondary, marginTop: 2 },
  emptyText: { ...TextStyles.body, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl }
});
