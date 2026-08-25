/**
 * Task Store
 * Manages tasks and todos. Persists to AsyncStorage.
 */

import { create } from 'zustand';
import { Task } from '@/models/Task';
import { storageGet, storageSet, STORAGE_KEYS } from '@/services/storage';
import { scheduleNotification, cancelNotification } from '@/services/notifications';
import { format, parse, subMinutes, isAfter } from 'date-fns';

interface TaskState {
  tasks: Task[];
  isHydrated: boolean;
  // Actions
  hydrate: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, partial: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  // Selectors (derived, not stored)
  getTasksForDate: (date: Date) => Task[];
  getTodayTasks: () => Task[];
  getPendingTasks: () => Task[];
}

const handleTaskNotification = async (task: Task): Promise<string | undefined> => {
  if (task.notificationId) {
    await cancelNotification(task.notificationId);
  }
  
  if (!task.reminder || task.completed) return undefined;
  
  let triggerTime: Date | null = null;
  if (task.time) {
    const parsed = parse(`${task.date} ${task.time}`, 'yyyy-MM-dd HH:mm', new Date());
    triggerTime = task.reminderMinutesBefore 
      ? subMinutes(parsed, task.reminderMinutesBefore) 
      : parsed;
  } else {
    // If no time is set, schedule for 9 AM on the task date
    triggerTime = parse(`${task.date} 09:00`, 'yyyy-MM-dd HH:mm', new Date());
  }

  if (triggerTime && isAfter(triggerTime, new Date())) {
    const id = await scheduleNotification({
      title: task.title,
      body: `Category: ${task.category.toUpperCase()}`,
      trigger: triggerTime,
      channelId: 'reminders',
      data: { taskId: task.id },
    });
    return id || undefined;
  }
  return undefined;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isHydrated: false,

  hydrate: async () => {
    const stored = await storageGet<Task[]>(STORAGE_KEYS.TASKS);
    set({ tasks: stored ?? [], isHydrated: true });
  },

  addTask: async (task) => {
    const notificationId = await handleTaskNotification(task);
    const newTask = { ...task, notificationId };
    const tasks = [...get().tasks, newTask];
    set({ tasks });
    await storageSet(STORAGE_KEYS.TASKS, tasks);
  },

  updateTask: async (id, partial) => {
    const currentTasks = get().tasks;
    const taskIndex = currentTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    
    const updatedTask = { ...currentTasks[taskIndex], ...partial, updatedAt: new Date().toISOString() };
    const notificationId = await handleTaskNotification(updatedTask);
    updatedTask.notificationId = notificationId;
    
    const tasks = [...currentTasks];
    tasks[taskIndex] = updatedTask;
    
    set({ tasks });
    await storageSet(STORAGE_KEYS.TASKS, tasks);
  },

  removeTask: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (task?.notificationId) {
      await cancelNotification(task.notificationId);
    }
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    await storageSet(STORAGE_KEYS.TASKS, tasks);
  },

  toggleComplete: async (id) => {
    const currentTasks = get().tasks;
    const taskIndex = currentTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const t = currentTasks[taskIndex];
    const completed = !t.completed;
    const updatedTask = {
      ...t,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    const notificationId = await handleTaskNotification(updatedTask);
    updatedTask.notificationId = notificationId;

    const tasks = [...currentTasks];
    tasks[taskIndex] = updatedTask;

    set({ tasks });
    await storageSet(STORAGE_KEYS.TASKS, tasks);
  },

  getTasksForDate: (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return get().tasks.filter((t) => t.date === dateStr);
  },

  getTodayTasks: () => {
    return get().getTasksForDate(new Date());
  },

  getPendingTasks: () => {
    return get().tasks.filter((t) => !t.completed);
  },
}));
