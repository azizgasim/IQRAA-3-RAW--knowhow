
import { cn } from '@/lib/utils';
import { Lightbulb, Book, GitFork, FilePen, Microscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StageIndicatorProps {
  stage: "spark" | "literature" | "deep-dive" | "writing" | "review";
}

const stageConfig = {
  spark: {
    icon: Lightbulb,
    color: "bg-yellow-500/20 text-yellow-300",
  },
  literature: {
    icon: Book,
    color: "bg-blue-500/20 text-blue-300",
  },
  "deep-dive": {
    icon: Microscope,
    color: "bg-purple-500/20 text-purple-300",
  },
  writing: {
    icon: FilePen,
    color: "bg-green-500/20 text-green-300",
  },
  review: {
    icon: GitFork,
    color: "bg-red-500/20 text-red-300",
  },
};

export function StageIndicator({ stage }: StageIndicatorProps) {
  const config = stageConfig[stage];
  if (!config) return null;

  const Icon = config.icon;
  return (
    <Badge className={cn("flex items-center space-x-1 text-xs font-semibold uppercase", config.color)}>
      <Icon className="h-3 w-3" />
      <span>{stage.replace('-', ' ')}</span>
    </Badge>
  );
}
