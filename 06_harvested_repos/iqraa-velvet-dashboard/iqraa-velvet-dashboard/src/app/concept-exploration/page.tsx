'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { useViewStore } from '@/store/viewStore';
import { applyLensTransform } from '@/lib/lens-utils';
import { Input } from '@/components/ui/input';
import { ConceptGrid } from '@/components/ui/ConceptGrid';
import { Concept } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSourceStore } from '@/store/sourceStore';

export function ConceptExplorationView() {
  const { selectedProject } = useProjectStore();
  const { activeLens } = useViewStore();
  const { sources } = useSourceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string | undefined>(undefined);

  if (!selectedProject) {
    return (
      <EmptyState
        title="No Project Selected"
        description="Please select a project from the sidebar to explore its concepts."
      />
    );
  }

  if (selectedProject.concepts.length === 0) {
    return (
      <EmptyState
        title="No Concepts to Explore"
        description="This project currently has no concepts. Use the analyzer to add some."
      />
    );
  }
  
  let conceptsToTransform = selectedProject.concepts;

  // Apply source filter before lens transformation
  if (selectedSourceFilter) {
    conceptsToTransform = conceptsToTransform.filter(concept => concept.sourceId === selectedSourceFilter);
  }

  const transformedData = applyLensTransform(conceptsToTransform, activeLens);

  const filteredData = Array.isArray(transformedData) ? transformedData.filter(concept =>
    concept.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) : transformedData;

  const renderContent = () => {
    if (activeLens === 'structure' && typeof filteredData === 'object' && !Array.isArray(filteredData)) {
      return (
        <Accordion type="multiple" className="w-full space-y-4">
          {Object.entries(filteredData).map(([type, concepts]) => (
            <AccordionItem key={type} value={type}>
              <AccordionTrigger className="text-lg font-semibold capitalize">{type}s</AccordionTrigger>
              <AccordionContent>
                <ConceptGrid concepts={concepts as Concept[]} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }

    if (Array.isArray(filteredData)) {
      return (
        <ConceptGrid concepts={filteredData as Concept[]} />
      );
    }
    
    return null;
  };


  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Concept Exploration for "{selectedProject.title}" (Lens: {activeLens})
      </h2>
      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="Search concepts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select onValueChange={setSelectedSourceFilter} value={selectedSourceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sources</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {renderContent()}
    </div>
  );
}
