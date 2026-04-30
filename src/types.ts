export type DayStatus = 'over' | 'hit' | 'under';
export type DaysMap = Record<string, DayStatus>;

export interface SyncState {
  status: 'synced' | 'syncing' | 'error';
  error?: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface UserProfile {
  startWeight: number;
  startDate: string;
  targetCalories: number;
  weightEntries: WeightEntry[];
}
