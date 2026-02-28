'use client';

import { Bell, CheckCircle2, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { useActivityStore, ActivityType } from '@/store/activityStore';
import { formatDistanceToNow } from 'date-fns';

const activityIcons: Record<ActivityType, React.ElementType> = {
  project_created: PlusCircle,
  project_updated: Edit,
  project_deleted: Trash2,
  concept_analyzed: CheckCircle2,
  concept_updated: Edit,
  concept_deleted: Trash2,
  source_created: PlusCircle,
  source_updated: Edit,
  source_deleted: Trash2,
};

export function RecentActivityFeed() {
  const { activities } = useActivityStore();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map(activity => {
          const Icon = activityIcons[activity.type] || Bell;
          return (
            <div key={activity.id} className="flex items-start space-x-2">
              <Icon className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
