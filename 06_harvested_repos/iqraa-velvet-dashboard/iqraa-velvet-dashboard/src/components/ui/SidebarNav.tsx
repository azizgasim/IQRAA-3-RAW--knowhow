'use client';

import { Button } from './button';
import { Settings, Lightbulb, TrendingUp, Share2, FolderOpen, Search, Book, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useViewStore } from '@/store/viewStore';

interface SidebarNavProps {
  className?: string;
}

const navItems = [
  {
    title: "Projects",
    icon: FolderOpen,
    view: "projects",
  },
  {
    title: "Concept Exploration",
    icon: Search,
    view: "concept-exploration",
  },
  {
    title: "Primary Processing",
    icon: Settings,
    view: "primary-processing",
  },
  {
    title: "Sources",
    icon: Book,
    view: "sources",
  },
  {
    title: "Concept Modeling",
    icon: Lightbulb,
    view: "concept-modeling",
  },
  {
    title: "Decision Execution",
    icon: TrendingUp,
    view: "decision-execution",
  },
  {
    title: "Interaction Expansion",
    icon: Share2,
    view: "interaction-expansion",
  },
  {
    title: "Settings",
    icon: SlidersHorizontal,
    view: "settings",
  },
];

export function SidebarNav({ className }: SidebarNavProps) {
  const { activeView, setActiveView } = useViewStore();

  return (
    <nav className={cn("flex flex-col space-y-2", className)}>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Button
            key={index}
            variant={activeView === item.view ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView(item.view as any)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        );
      })}
    </nav>
  );
}

