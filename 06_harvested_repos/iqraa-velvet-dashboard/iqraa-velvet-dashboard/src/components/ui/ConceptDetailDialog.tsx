'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Concept } from '@/types';
import { Badge } from './badge';
import { Lightbulb, MessageSquareText, HelpCircle, Sparkles, X, Book, Link, User, Trash2, Quote, Edit } from 'lucide-react';
import { useSourceStore } from '@/store/sourceStore';
import { useProjectStore } from '@/store/projectStore';
import { Button } from './button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from './use-toast';
import { Textarea } from './textarea';
import { cn } from '@/lib/utils';
import { ConceptEditDialog } from './ConceptEditDialog';
import { ToastAction } from './toast';

interface ConceptDetailDialogProps {
  concept: Concept;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const conceptTypeIcons = {
  idea: Lightbulb,
  quote: MessageSquareText,
  question: HelpCircle,
  insight: Sparkles,
};

export function ConceptDetailDialog({ concept, open, onOpenChange }: ConceptDetailDialogProps) {
  const Icon = conceptTypeIcons[concept.type];
  const { sources } = useSourceStore();
  const { selectedProject, deleteConceptFromProject } = useProjectStore();
  const relatedSource = concept.sourceId ? sources.find(s => s.id === concept.sourceId) : undefined;
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = () => {
    if (selectedProject) {
      const { undo } = deleteConceptFromProject(selectedProject.id, concept.id);
      onOpenChange(false); // Close the dialog after deletion
      toast({
        title: "Concept Deleted",
        description: "The concept has been deleted from the project.",
        action: <ToastAction altText="Undo" onClick={undo}>Undo</ToastAction>,
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
              <span>{concept.type.charAt(0).toUpperCase() + concept.type.slice(1)} Details</span>
            </DialogTitle>
            <DialogDescription>
              View and edit details for this concept.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <p className="text-sm font-semibold">Content:</p>
              <div className="col-span-3 text-sm text-muted-foreground">
                {concept.type === 'quote' ? (
                  <blockquote className={cn("mt-6 border-l-2 pl-6 italic", "text-accent-foreground")}>
                    <Quote className="inline-block mr-2 h-4 w-4 align-top" />
                    {concept.content}
                  </blockquote>
                ) : (
                  <Textarea value={concept.content} readOnly className="min-h-[100px] resize-none" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-semibold">ID:</p>
              <p className="col-span-3 text-sm text-muted-foreground">{concept.id}</p>
            </div>
            {relatedSource && (
              <div className="space-y-2 mt-4 col-span-4 border-t pt-4">
                <h4 className="text-base font-semibold flex items-center space-x-2">
                  <Book className="h-4 w-4" />
                  <span>Source Details</span>
                </h4>
                <div className="grid grid-cols-4 items-center gap-4 text-sm text-muted-foreground">
                  <p className="font-semibold">Title:</p>
                  <p className="col-span-3">{relatedSource.title}</p>
                  <p className="font-semibold">Type:</p>
                  <p className="col-span-3 capitalize">{relatedSource.type}</p>
                  {relatedSource.author && (
                    <>
                      <p className="font-semibold">Author:</p>
                      <p className="col-span-3 flex items-center space-x-1"><User className="h-3 w-3" /><span>{relatedSource.author}</span></p>
                    </>
                  )}
                  {relatedSource.url && (
                    <>
                      <p className="font-semibold">URL:</p>
                      <p className="col-span-3 flex items-center space-x-1"><Link className="h-3 w-3" /><a href={relatedSource.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{relatedSource.url}</a></p>
                    </>
                  )}
                </div>
              </div>
            )}
            {concept.tags && concept.tags.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-semibold">Tags:</p>
                <div className="col-span-3 flex flex-wrap gap-1">
                  {concept.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Concept
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Concept
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this concept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {selectedProject && (
        <ConceptEditDialog
          concept={concept}
          projectId={selectedProject.id}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}
