'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Concept } from "@/types";
import { Lightbulb, MessageSquareText, HelpCircle, Sparkles, GripVertical, MoreVertical, Copy, Share2 } from 'lucide-react';
import { ConceptDetailDialog } from './ConceptDetailDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from './button';
import { useToast } from './use-toast';

interface ConceptCardProps {
  concept: Concept;
}

const conceptTypeIcons = {
  idea: Lightbulb,
  quote: MessageSquareText,
  question: HelpCircle,
  insight: Sparkles,
};

export function ConceptCard({ concept }: ConceptCardProps) {
  const Icon = conceptTypeIcons[concept.type];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddToAnotherProject = () => {
    toast({
      title: "Action: Add to Another Project",
      description: `(Mock) Concept \"${concept.content.substring(0, 20)}...\" would be added.`,
    });
  };

  const handleShareConcept = () => {
    toast({
      title: "Action: Share Concept",
      description: `(Mock) Concept \"${concept.content.substring(0, 20)}...\" would be shared.`,
    });
  };

  const handleCopyConcept = () => {
    navigator.clipboard.writeText(concept.content);
    toast({
      title: "Concept Copied",
      description: "Concept content copied to clipboard.",
    });
  };

  return (
    <>
      <Card className="bg-card text-card-foreground cursor-pointer hover:shadow-lg transition-shadow flex items-center group">
        <div className="px-2 h-full flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 py-4" onClick={() => setIsDialogOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              <span>{concept.type.charAt(0).toUpperCase() + concept.type.slice(1)}</span>
            </CardTitle>
            {concept.tags && concept.tags.length > 0 && (
              <div className="flex space-x-1">
                {concept.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{concept.content}</p>
          </CardContent>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyConcept}>
              <Copy className="mr-2 h-4 w-4" /> Copy Content
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareConcept}>
              <Share2 className="mr-2 h-4 w-4" /> Share Concept
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAddToAnotherProject}>
              Add to another Project (Mock)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
      <ConceptDetailDialog concept={concept} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
