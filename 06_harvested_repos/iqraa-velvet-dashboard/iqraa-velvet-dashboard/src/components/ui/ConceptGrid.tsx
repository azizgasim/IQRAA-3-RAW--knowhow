
'use client';

import { Concept } from '@/types';
import { ConceptCard } from './ConceptCard';

interface ConceptGridProps {
  concepts: Concept[];
}

export function ConceptGrid({ concepts }: ConceptGridProps) {
  if (concepts.length === 0) {
    return <p className="text-muted-foreground">No concepts to display.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {concepts.map((concept) => (
        <ConceptCard key={concept.id} concept={concept} />
      ))}
    </div>
  );
}
