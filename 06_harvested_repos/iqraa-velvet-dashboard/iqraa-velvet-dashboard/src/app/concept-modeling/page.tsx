'use client';

import { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { Concept } from '@/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableConceptCard } from '@/components/ui/SortableConceptCard';

export function ConceptModelingView() {
  const { selectedProject } = useProjectStore();
  const [concepts, setConcepts] = useState<Concept[]>([]);

  useEffect(() => {
    if (selectedProject) {
      setConcepts(selectedProject.concepts);
    }
  }, [selectedProject]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setConcepts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  if (!selectedProject) {
    return (
      <EmptyState
        title="No Project Selected"
        description="Please select a project from the sidebar to view its concepts for modeling."
      />
    );
  }

  if (concepts.length === 0) {
    return (
      <EmptyState
        title="No Concepts to Model"
        description="This project currently has no concepts. Use the analyzer to add some."
      />
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Concept Modeling for "{selectedProject.title}"
      </h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={concepts}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concepts.map((concept) => (
              <SortableConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
