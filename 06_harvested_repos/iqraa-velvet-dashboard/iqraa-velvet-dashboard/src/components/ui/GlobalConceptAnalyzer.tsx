
'use client';

import { AnalyzeConceptForm } from './AnalyzeConceptForm';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from './button';
import { BrainCircuit } from 'lucide-react';

export function GlobalConceptAnalyzer() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <BrainCircuit className="mr-2 h-4 w-4" />
          Analyze Concept
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <AnalyzeConceptForm />
      </PopoverContent>
    </Popover>
  );
}
