'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProjectStore } from '@/store/projectStore';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export function DecisionExecutionView() {
  const [problemInput, setProblemInput] = useState('');
  const [isGeneratingDecision, setIsGeneratingDecision] = useState(false);
  const [mockRecommendation, setMockRecommendation] = useState<string | null>(null);
  const { selectedProject } = useProjectStore();
  const { toast } = useToast();

  const handleGenerateDecision = async () => {
    if (!selectedProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project to generate decisions.",
        variant: "destructive",
      });
      return;
    }

    if (!problemInput.trim()) {
      toast({
        title: "Empty Problem",
        description: "Please describe a problem to get a recommendation.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDecision(true);
    setMockRecommendation(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    try {
      // In a real scenario, this would involve sending `problemInput` and `selectedProject.concepts` to an AI agent
      const recommendation = `Based on the ${selectedProject.concepts.length} concepts in "${selectedProject.title}", the recommendation for "${problemInput.substring(0, 50)}..." is to focus on emergent patterns and cross-reference diverse sources to identify actionable insights. Consider the impact lens for prioritization.`;
      setMockRecommendation(recommendation);
      toast({
        title: "Decision Generated!",
        description: "A mock recommendation has been generated.",
      });
    } catch (error) {
      console.error("Failed to generate decision:", error);
      toast({
        title: "Decision Generation Failed",
        description: "There was an error generating the decision. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDecision(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Decision Execution</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="problem-input">Describe Your Problem/Question</Label>
          <Textarea
            id="problem-input"
            value={problemInput}
            onChange={(e) => setProblemInput(e.target.value)}
            placeholder="E.g., 'What are the key factors influencing climate change in urban areas?'"
            rows={8}
            disabled={isGeneratingDecision || !selectedProject}
            className="mt-1"
          />
        </div>
        <Button
          onClick={handleGenerateDecision}
          disabled={isGeneratingDecision || !selectedProject || !problemInput.trim()}
        >
          {isGeneratingDecision && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Decision (Mock)
        </Button>
        {!selectedProject && (
            <p className="text-sm text-muted-foreground">Please select a project first to generate decisions.</p>
        )}
      </div>

      {mockRecommendation && (
        <div className="space-y-4 rounded-lg border p-4 bg-card">
          <h3 className="text-lg font-semibold text-foreground">Recommendation:</h3>
          <p className="text-sm text-muted-foreground">{mockRecommendation}</p>
        </div>
      )}

      {!selectedProject && (
        <EmptyState
          title="No Active Project"
          description="Select or create a project to start generating decisions."
        />
      )}
    </div>
  );
}
