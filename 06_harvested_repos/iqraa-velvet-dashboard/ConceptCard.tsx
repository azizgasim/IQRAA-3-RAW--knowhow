'use client';

import { Concept } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageSquareText, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConceptCardProps {
  concept: Concept;
  className?: string;
}

const conceptTypeConfig = {
  idea: {
    icon: Lightbulb,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  quote: {
    icon: MessageSquareText,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  question: {
    icon: HelpCircle,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  insight: {
    icon: Sparkles,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
};

export function ConceptCard({ concept, className }: ConceptCardProps) {
  const config = conceptTypeConfig[concept.type];
  const Icon = config.icon;

  return (
    <Card className={cn("hover:shadow-lg transition-shadow cursor-pointer", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg", config.bgColor)}>
            <Icon className={cn("h-4 w-4", config.color)} />
          </div>
          <Badge variant="outline" className="capitalize">
            {concept.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground line-clamp-3">{concept.content}</p>
        {concept.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {concept.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
