'use client';

import { Concept } from '@/types';
import { ConceptCard } from './ConceptCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableConceptCard } from './SortableConceptCard';
import { useState, useEffect } from 'react';

interface ConceptGridProps {
  concepts: Concept[];
}

export function ConceptGrid({ concepts: initialConcepts }: ConceptGridProps) {
  const [concepts, setConcepts] = useState(initialConcepts);

  useEffect(() => {
    setConcepts(initialConcepts);
  }, [initialConcepts]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setConcepts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={concepts.map(c => c.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {concepts.map((concept) => (
            <SortableConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
