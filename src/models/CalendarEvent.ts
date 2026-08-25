export type CalendarEventSource = 'task' | 'reminder' | 'routine' | 'meal' | 'workout' | 'finance' | 'goal' | 'water' | 'weight';

export interface CalendarEventView {
  id: string;
  source: CalendarEventSource;
  sourceId: string;
  title: string;
  
  // Stored in ISO strings
  startDateTime?: string; 
  endDateTime?: string;
  
  // Additional info
  category?: string;
  status?: string; 
  notes?: string;
  color?: string;
  
  // Useful for quick UI checks
  isCompleted?: boolean;
}

