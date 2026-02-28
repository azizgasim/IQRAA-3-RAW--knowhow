'use client';

import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { ConceptCard } from './ConceptCard';
import { Concept } from '@/types';
import { useProjectStore } from '@/store/projectStore';
import { useSourceStore } from '@/store/sourceStore';
import { useToast } from './use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AnalyzeConceptForm() {
  const [content, setContent] = useState('');
  const [analyzedConcept, setAnalyzedConcept] = useState<Concept | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>(undefined);
  const { selectedProject, addConceptToProject } = useProjectStore();
  const { sources } = useSourceStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project to analyze concepts.",
        variant: "destructive",
      });
      return;
    }

    if (content) {
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/agents/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, type: 'text' }),
        });
        const concept = await response.json();
        setAnalyzedConcept(concept);
        addConceptToProject(selectedProject.id, concept, selectedSourceId);
        setContent('');
        setSelectedSourceId(undefined);
        toast({
          title: "Concept Analyzed!",
          description: "The concept has been added to your selected project.",
        });
      } catch (error) {
        console.error("Failed to analyze concept:", error);
        toast({
          title: "Analysis Failed",
          description: "There was an error analyzing the concept. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="concept-content">Analyze Content</Label>
          <Input
            id="concept-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter text to analyze"
            disabled={isAnalyzing || !selectedProject}
          />
        </div>
        <div>
          <Label htmlFor="source-select">Link to Source (Optional)</Label>
          <Select onValueChange={setSelectedSourceId} value={selectedSourceId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {sources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.title} ({source.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isAnalyzing || !selectedProject}>
          {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Analyze
        </Button>
        {!selectedProject && (
            <p className="text-sm text-muted-foreground">Please select a project first.</p>
        )}
      </form>
      {analyzedConcept && <ConceptCard concept={analyzedConcept} />}
    </div>
  );
}
