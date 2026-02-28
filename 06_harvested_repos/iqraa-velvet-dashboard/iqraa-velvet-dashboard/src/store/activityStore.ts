
import { create } from 'zustand';

export type ActivityType = 
  | 'project_created' 
  | 'project_updated'
  | 'project_deleted' 
  | 'concept_analyzed'
  | 'concept_updated'
  | 'concept_deleted'
  | 'source_created'
  | 'source_updated'
  | 'source_deleted';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
}

interface ActivityState {
  activities: ActivityItem[];
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [
    {
      id: 'a1',
      type: 'project_created',
      description: 'Project "Velvet Dashboard" was created.',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    },
    {
      id: 'a2',
      type: 'concept_analyzed',
      description: 'Concept "Initial idea for Iqraa" was analyzed.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
  ],
  addActivity: (activity) =>
    set((state) => ({
      activities: [
        { ...activity, id: `act-${Date.now()}`, timestamp: new Date() },
        ...state.activities,
      ].slice(0, 10), // Keep only the last 10 activities
    })),
}));
