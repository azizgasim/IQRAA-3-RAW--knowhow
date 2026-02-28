import { create } from 'zustand';
import { Concept, Project } from '@/types';
import { useActivityStore } from './activityStore';

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  isLoadingProjects: boolean;
  fetchProjects: () => Promise<void>;
  addProject: (newProject: { title: string; stage: Project['stage'] }) => Promise<void>;
  updateProject: (projectId: string, updatedFields: Partial<Omit<Project, 'id' | 'concepts' | 'createdAt'>>) => void;
  deleteProject: (projectId: string) => { undo: () => void };
  setSelectedProjectId: (id: string | null) => void;
  addConceptToProject: (projectId: string, concept: Concept, sourceId?: string) => void;
  updateConceptInProject: (projectId: string, conceptId: string, updatedFields: Partial<Omit<Concept, 'id'>>) => void;
  deleteConceptFromProject: (projectId: string, conceptId: string) => { undo: () => void };
  selectedProject: Project | undefined; // Getter for the selected project
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProjectId: null,
  isLoadingProjects: false,
  fetchProjects: async () => {
    set({ isLoadingProjects: true });
    const response = await fetch('/api/projects');
    const projects = await response.json();
    set({ projects, isLoadingProjects: false });
  },
  addProject: async (newProject) => {
    const addActivity = useActivityStore.getState().addActivity;
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProject),
    });
    const project = await response.json();
    set((state) => ({ projects: [...state.projects, project] }));
    addActivity({
      type: 'project_created',
      description: `Project "${project.title}" was created.`,
    });
  },
  updateProject: (projectId, updatedFields) => {
    const addActivity = useActivityStore.getState().addActivity;
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updatedFields } : p
      ),
    }));
    const updatedProject = get().projects.find(p => p.id === projectId);
    if (updatedProject) {
      addActivity({
        type: 'project_updated',
        description: `Project "${updatedProject.title}" was updated.`,
      });
    }
  },
  deleteProject: (projectId) => {
    const addActivity = useActivityStore.getState().addActivity;
    const originalProjects = get().projects;
    const projectToDelete = originalProjects.find(p => p.id === projectId);
    if (!projectToDelete) return { undo: () => {} };

    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      selectedProjectId: state.selectedProjectId === projectId ? null : state.selectedProjectId,
    }));

    addActivity({
      type: 'project_deleted',
      description: `Project "${projectToDelete.title}" was deleted.`,
    });

    return {
      undo: () => set({ projects: originalProjects }),
    };
  },
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  addConceptToProject: (projectId, concept, sourceId) => {
    const addActivity = useActivityStore.getState().addActivity;
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, concepts: [...p.concepts, { ...concept, sourceId }] } : p
      ),
    }));
    const project = get().projects.find(p => p.id === projectId);
    if (project) {
      addActivity({
        type: 'concept_analyzed',
        description: `Concept "${concept.content.substring(0, 30)}..." added to project "${project.title}".`,
      });
    }
  },
  updateConceptInProject: (projectId, conceptId, updatedFields) => {
    const addActivity = useActivityStore.getState().addActivity;
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, concepts: p.concepts.map((c) => (c.id === conceptId ? { ...c, ...updatedFields } : c)) }
          : p
      ),
    }));
    const project = get().projects.find(p => p.id === projectId);
    const updatedConcept = project?.concepts.find(c => c.id === conceptId);
    if (project && updatedConcept) {
      addActivity({
        type: 'concept_updated',
        description: `Concept "${updatedConcept.content.substring(0, 30)}..." in project "${project.title}" was updated.`,
      });
    }
  },
  deleteConceptFromProject: (projectId, conceptId) => {
    const addActivity = useActivityStore.getState().addActivity;
    const originalProjects = get().projects;
    const project = originalProjects.find(p => p.id === projectId);
    const conceptToDelete = project?.concepts.find(c => c.id === conceptId);
    if (!project || !conceptToDelete) return { undo: () => {} };
    
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, concepts: p.concepts.filter((c) => c.id !== conceptId) }
          : p
      ),
    }));

    addActivity({
      type: 'concept_deleted',
      description: `Concept "${conceptToDelete.content.substring(0, 30)}..." from project "${project.title}" was deleted.`,
    });
    
    return {
      undo: () => set({ projects: originalProjects }),
    };
  },
  get selectedProject() {
    return get().projects.find((p) => p.id === get().selectedProjectId);
  },
}));
