
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ConceptCard } from './ConceptCard';
import { Concept } from '@/types';

interface SortableConceptCardProps {
  concept: Concept;
}

export function SortableConceptCard({ concept }: SortableConceptCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: concept.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ConceptCard concept={concept} />
    </div>
  );
}
