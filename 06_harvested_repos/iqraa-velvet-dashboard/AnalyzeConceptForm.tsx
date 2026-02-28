'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Concept } from '@/types';
import { Loader2 } from 'lucide-react';

export function AnalyzeConceptForm() {
  const [content, setContent] = useState('');
  const [type, setType] = useState<Concept['type']>('idea');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { projects, selectedProjectId, addConceptToProject } = useProjectStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProjectId) {
      toast({
        title: "Error",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newConcept: Concept = {
      id: `concept-${Date.now()}`,
      content: content.trim(),
      type,
      tags: extractTags(content),
    };

    addConceptToProject(selectedProjectId, newConcept);

    toast({
      title: "Concept Analyzed!",
      description: "The concept has been added to your project.",
    });

    setContent('');
    setIsAnalyzing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Content to Analyze</Label>
        <Textarea
          id="content"
          placeholder="Enter text, idea, quote, or question..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Concept Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as Concept['type'])}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="idea">Idea</SelectItem>
            <SelectItem value="quote">Quote</SelectItem>
            <SelectItem value="question">Question</SelectItem>
            <SelectItem value="insight">Insight</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isAnalyzing}>
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze & Add'
        )}
      </Button>
    </form>
  );
}

function extractTags(content: string): string[] {
  // Simple tag extraction - words starting with #
  const hashTags = content.match(/#\w+/g) || [];
  return hashTags.map(tag => tag.slice(1)).slice(0, 5);
}
