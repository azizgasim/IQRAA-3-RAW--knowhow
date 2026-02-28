/**
 * MomentumCard - بطاقة مؤشر الزخم البحثي
 */

import React from 'react';
import { Flame, TrendingUp, TrendingDown, Minus, Award, Zap } from 'lucide-react';

export default function MomentumCard({ momentum }) {
  if (!momentum) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  const trendConfig = {
    rising: {
      icon: TrendingUp,
      label: 'في صعود',
      bgClass: 'from-green-500 to-emerald-600',
      iconColor: 'text-green-200',
    },
    stable: {
      icon: Minus,
      label: 'مستقر',
      bgClass: 'from-yellow-500 to-orange-500',
      iconColor: 'text-yellow-200',
    },
    declining: {
      icon: TrendingDown,
      label: 'في انخفاض',
      bgClass: 'from-red-500 to-rose-600',
      iconColor: 'text-red-200',
    },
  };

  const config = trendConfig[momentum.trend] || trendConfig.stable;
  const TrendIcon = config.icon;

  return (
    <div className={`rounded-xl p-6 text-white bg-gradient-to-br ${config.bgClass} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6" />
          <span className="font-semibold text-lg">الزخم البحثي</span>
        </div>
        <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
          <TrendIcon className={`h-4 w-4 ${config.iconColor}`} />
          <span className="text-sm">{config.label}</span>
        </div>
      </div>

      {/* Score */}
      <div className="mb-4">
        <div className="text-5xl font-bold mb-1">
          {momentum.current_score}
          <span className="text-lg font-normal opacity-80 mr-2">نقطة</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            {momentum.streak_days >= 7 ? (
              <Award className="h-4 w-4 text-yellow-300" />
            ) : (
              <Zap className="h-4 w-4 opacity-70" />
            )}
            <span className="text-sm opacity-80">التتابع</span>
          </div>
          <div className="text-xl font-bold">{momentum.streak_days} يوم</div>
        </div>

        {/* Total Notes */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-sm opacity-80 mb-1">الملاحظات</div>
          <div className="text-xl font-bold">{momentum.total_notes}</div>
        </div>
      </div>

      {/* Achievement Badge */}
      {momentum.streak_days >= 7 && (
        <div className="mt-4 bg-yellow-400/20 rounded-lg p-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-300" />
          <span className="text-sm">أسبوع من العمل المتواصل!</span>
        </div>
      )}
    </div>
  );
}
