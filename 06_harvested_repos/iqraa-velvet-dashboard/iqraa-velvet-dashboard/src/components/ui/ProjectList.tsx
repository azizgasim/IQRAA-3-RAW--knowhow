'use client';

import { useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { StageIndicator } from './StageIndicator';
import { cn } from '@/lib/utils';
import { Folder } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectListSkeleton } from './ProjectListSkeleton';

export function ProjectList() {
  const { projects, fetchProjects, selectedProjectId, setSelectedProjectId, isLoadingProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (isLoadingProjects) {
    return <ProjectListSkeleton />;
  }

  if (projects.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No projects found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <Card
          key={project.id}
          className={cn(
            "cursor-pointer transition-colors hover:bg-muted",
            selectedProjectId === project.id && "bg-primary/20 hover:bg-primary/30"
          )}
          onClick={() => setSelectedProjectId(project.id)}
        >
          <CardContent className="flex items-center space-x-2 p-4">
            <Folder className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">{project.title}</CardTitle>
              <StageIndicator stage={project.stage} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
