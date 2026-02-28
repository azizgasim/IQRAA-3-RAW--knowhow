'use client';

import { Concept, Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, MessageSquareText, HelpCircle, Sparkles, Brain } from 'lucide-react';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ProjectSummaryCardProps {
  project: Project;
}

const conceptTypeIcons = {
  idea: Lightbulb,
  quote: MessageSquareText,
  question: HelpCircle,
  insight: Sparkles,
};

const conceptTypeColors: Record<Concept['type'], string> = {
  idea: "hsl(var(--accent))", // Soft Gold
  quote: "hsl(var(--primary))", // Deep Olive
  question: "hsl(217 33% 47%)", // A muted blue/gray
  insight: "hsl(0 63% 31%)", // Destructive red for insights (can be changed)
};

export function ProjectSummaryCard({ project }: ProjectSummaryCardProps) {
  const stats = useMemo(() => {
    const total = project.concepts.length;
    const byType = project.concepts.reduce((acc, concept) => {
      acc[concept.type] = (acc[concept.type] || 0) + 1;
      return acc;
    }, {} as Record<Concept['type'], number>);
    const chartData = Object.entries(byType).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: conceptTypeColors[name as Concept['type']] }));
    return { total, byType, chartData };
  }, [project.concepts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>Project Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total Concepts</span>
          <span>{stats.total}</span>
        </div>
        
        {stats.chartData.length > 0 && (
          <div style={{ width: '100%', height: 150 }}>
            <ResponsiveContainer>
              <BarChart data={stats.chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                <Bar dataKey="value" fill={(data) => data.color} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="space-y-2 text-sm text-muted-foreground">
          {Object.entries(stats.byType).map(([type, count]) => {
            const Icon = conceptTypeIcons[type as Concept['type']];
            return (
              <div key={type} className="flex justify-between items-center">
                <span className="flex items-center space-x-1 capitalize">
                  {Icon && <Icon className="h-4 w-4" style={{ color: conceptTypeColors[type as Concept['type']] }} />}
                  <span>{type}s</span>
                </span>
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

