'use client';

import { Toggle } from '@/components/ui/toggle';
import { Link, Atom, Layers, Network, Search, Lightbulb } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useViewStore } from '@/store/viewStore';

const lensIcons = {
  relationship: Link,
  impact: Atom,
  sequence: Layers,
  structure: Network,
  scope: Search,
  interpretive: Lightbulb, // Assuming an interpretive lens will be added later based on docs
};

type ActiveLensType = keyof typeof lensIcons;

export function LensBar() {
  const { activeLens, setActiveLens } = useViewStore();
  const lenses: ActiveLensType[] = ["relationship", "impact", "sequence", "structure", "scope"];

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <span className="text-muted-foreground">Lenses:</span>
        {lenses.map((lens) => {
          const Icon = lensIcons[lens];
          return (
            <Tooltip key={lens}>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={activeLens === lens}
                  onPressedChange={() => setActiveLens(lens)}
                  variant="outline"
                  aria-label={`Toggle ${lens} lens`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {lens.charAt(0).toUpperCase() + lens.slice(1)}
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>{lens.charAt(0).toUpperCase() + lens.slice(1)} Lens</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
