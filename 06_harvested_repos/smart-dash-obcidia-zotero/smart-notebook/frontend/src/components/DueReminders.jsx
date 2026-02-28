/**
 * DueReminders - التذكيرات المستحقة
 */

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function DueReminders({ reminders }) {
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: api.completeReminder,
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders']);
      toast.success('تم إكمال التذكير');
    },
    onError: () => {
      toast.error('حدث خطأ');
    },
  });

  if (!reminders || reminders.length === 0) {
    return null;
  }

  return (
    <div className="card border-r-4 border-r-yellow-500">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
          <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
            تذكيرات مستحقة
          </h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            {reminders.length} {reminders.length === 1 ? 'تذكير' : 'تذكيرات'} تحتاج انتباهك
          </p>
        </div>
      </div>

      {/* Reminders List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white">{reminder.content}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                مستحق: {new Date(reminder.due_date).toLocaleDateString('ar-SA')}
              </p>
            </div>
            <button
              onClick={() => completeMutation.mutate(reminder.id)}
              disabled={completeMutation.isPending}
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
              title="إكمال"
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
