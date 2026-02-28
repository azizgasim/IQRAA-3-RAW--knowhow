'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Calendar, Brain, Text, Trash2, Edit } from 'lucide-react';
import { StageIndicator } from './StageIndicator';
import { EmptyState } from './EmptyState';
import { useViewStore } from '@/store/viewStore';
import { ConceptGrid } from './ConceptGrid';
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
import { ProjectSummaryCard } from './ProjectSummaryCard';
import { ProjectEditDialog } from './ProjectEditDialog';
import { ProjectDetailsSkeleton } from './ProjectDetailsSkeleton';
import { ToastAction } from './toast';

export function ProjectDetails() {
  const { selectedProject, deleteProject, isLoadingProjects } = useProjectStore();
  const { activeLens } = useViewStore();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (isLoadingProjects) {
    return <ProjectDetailsSkeleton />;
  }

  if (!selectedProject) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a project to view details.
      </div>
    );
  }

  const handleDelete = () => {
    const { undo } = deleteProject(selectedProject.id);
    toast({
      title: "Project Deleted",
      description: `Project \"${selectedProject.title}\" has been deleted.`,
      action: <ToastAction altText="Undo" onClick={undo}>Undo</ToastAction>,
    });
  };

  const formattedDate = new Date(selectedProject.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const filteredConcepts = selectedProject.concepts.filter(concept => {
    if (activeLens === 'relationship' || activeLens === 'impact' || activeLens === 'sequence' || activeLens === 'structure' || activeLens === 'scope' || activeLens === 'interpretive') {
      return true;
    }
    return true;
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <h3 className="text-3xl font-bold text-foreground">{selectedProject.title}</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    and all its associated concepts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-1">
            <StageIndicator stage={selectedProject.stage} />
          </div>
          <div className="flex items-center space-x-1">
            <Brain className="h-4 w-4" />
            <span className="text-sm">{selectedProject.concepts.length} Concepts</span>
          </div>
        </div>
        
        <ProjectSummaryCard project={selectedProject} />

        <div className="mt-8 space-y-4">
          <h4 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <Text className="h-5 w-5" />
            <span>Concepts (Lens: {activeLens.charAt(0).toUpperCase() + activeLens.slice(1)})</span>
          </h4>
          {filteredConcepts.length === 0 ? (
            <EmptyState title="No Concepts Yet" description="Start analyzing text to add concepts to this project." />
          ) : (
            <ConceptGrid concepts={filteredConcepts} />
          )}
        </div>
      </div>
      {selectedProject && (
        <ProjectEditDialog
          project={selectedProject}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}
