import { format, parseISO, isSameDay, isBefore, isAfter, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, parse } from 'date-fns';
import { CalendarEventView, CalendarEventSource } from '../models/CalendarEvent';
import { Colors } from '../constants/theme';

// Type definitions for the stores' raw data needed by these utils
export interface CalendarStores {
  tasks: any[];
  reminders: any[];
  routineBlocks: any[];
  mealPlans: any[];
  mealEntries: any[];
  workouts: any[];
  transactions: any[];
  topPriorityId?: string | null;
}

/**
 * Normalizes HH:mm into a full ISO string for the given target date string (YYYY-MM-DD)
 */
function applyTimeToDate(dateStr: string, timeStr: string): string {
  try {
    const baseDate = parseISO(dateStr);
    const parsedTime = parse(timeStr, 'HH:mm', baseDate);
    return parsedTime.toISOString();
  } catch (e) {
    return parseISO(dateStr).toISOString();
  }
}

/**
 * Extracts events for a single day based on raw store data
 */
export function getDayEvents(dateStr: string, stores: CalendarStores): CalendarEventView[] {
  const events: CalendarEventView[] = [];
  const targetDate = parseISO(dateStr);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isToday = dateStr === todayStr;

  // 1. Tasks
  stores.tasks.forEach(t => {
    let matchesDate = false;
    if (t.deadline) {
      matchesDate = t.deadline.startsWith(dateStr);
    } else if (isToday && !t.completed) {
      matchesDate = true;
    }
    
    if (matchesDate) {
      events.push({
        id: `task-${t.id}`,
        source: 'task',
        sourceId: t.id,
        title: t.title,
        startDateTime: t.deadline ? t.deadline : undefined,
        status: t.completed ? 'Completed' : 'Pending',
        isCompleted: t.completed,
        color: t.id === stores.topPriorityId ? Colors.danger : Colors.primary,
        notes: t.id === stores.topPriorityId ? 'Top Priority' : undefined,
      });
    }
  });

  // 2. Reminders (recurring daily for now)
  stores.reminders.forEach(r => {
    if (r.enabled && r.time) {
      events.push({
        id: `reminder-${r.id}`,
        source: 'reminder',
        sourceId: r.id,
        title: r.title,
        startDateTime: applyTimeToDate(dateStr, r.time),
        status: 'Scheduled',
        isCompleted: false,
        color: Colors.textSecondary,
      });
    }
  });

  // 3. Routine
  stores.routineBlocks.forEach(r => {
    if (r.enabled && r.startTime) {
      events.push({
        id: `routine-${r.id}`,
        source: 'routine',
        sourceId: r.id,
        title: r.title,
        startDateTime: applyTimeToDate(dateStr, r.startTime),
        endDateTime: r.endTime ? applyTimeToDate(dateStr, r.endTime) : undefined,
        status: 'Routine',
        isCompleted: false,
        color: Colors.schedule,
      });
    }
  });

  // 4. Meals
  stores.mealPlans.forEach(m => {
    if (m.enabled && m.targetTime) {
      const logged = stores.mealEntries.find(h => h.mealId === m.id && h.timestamp.startsWith(dateStr));
      events.push({
        id: `meal-${m.id}`,
        source: 'meal',
        sourceId: m.id,
        title: m.name,
        startDateTime: applyTimeToDate(dateStr, m.targetTime),
        status: logged ? 'Logged' : 'Pending',
        isCompleted: !!logged,
        color: Colors.nutrition,
      });
    }
  });

  // 5. Workouts
  stores.workouts.forEach(w => {
    if ((w.startedAt || '').startsWith(dateStr)) {
      events.push({
        id: `workout-${w.id}`,
        source: 'workout',
        sourceId: w.id,
        title: w.name || 'Workout',
        startDateTime: w.startedAt,
        endDateTime: w.endedAt,
        status: w.endedAt ? 'Completed' : 'Active',
        isCompleted: !!w.endedAt,
        color: Colors.workout,
      });
    }
  });

  // Sort chronological, missing time goes to top
  return events.sort((a, b) => {
    if (!a.startDateTime) return -1;
    if (!b.startDateTime) return 1;
    return a.startDateTime.localeCompare(b.startDateTime);
  });
}

/**
 * Detects overlapping events based on start and end time
 */
export function detectConflicts(events: CalendarEventView[]): CalendarEventView[] {
  const conflicts: CalendarEventView[] = [];
  const timedEvents = events.filter(e => e.startDateTime && e.endDateTime).sort((a, b) => a.startDateTime!.localeCompare(b.startDateTime!));
  
  for (let i = 0; i < timedEvents.length - 1; i++) {
    const current = timedEvents[i];
    const next = timedEvents[i + 1];
    if (next.startDateTime! < current.endDateTime!) {
      if (!conflicts.includes(current)) conflicts.push(current);
      if (!conflicts.includes(next)) conflicts.push(next);
    }
  }
  return conflicts;
}

export function getOverdueEvents(stores: CalendarStores): CalendarEventView[] {
  const overdue: CalendarEventView[] = [];
  const now = new Date().toISOString();
  
  stores.tasks.forEach(t => {
    if (!t.completed && t.deadline && t.deadline < now) {
      overdue.push({
        id: `task-${t.id}`,
        source: 'task',
        sourceId: t.id,
        title: t.title,
        startDateTime: t.deadline,
        status: 'Overdue',
        isCompleted: false,
        color: Colors.danger,
      });
    }
  });
  
  return overdue;
}

export function getNextEvent(events: CalendarEventView[]): CalendarEventView | null {
  const now = new Date().toISOString();
  const pending = events.filter(e => !e.isCompleted && e.startDateTime && e.startDateTime > now);
  if (pending.length > 0) {
    return pending[0];
  }
  return events.find(e => !e.isCompleted && !e.startDateTime) || null;
}
