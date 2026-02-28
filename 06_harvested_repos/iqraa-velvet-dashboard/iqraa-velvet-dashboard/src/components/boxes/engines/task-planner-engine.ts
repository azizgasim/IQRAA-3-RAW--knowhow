export function taskPlannerEngine(intent: string, concepts: string[]) {
  const tasks = [];

  if (concepts.length > 0) {
    tasks.push({
      id: "task-1",
      title: `Define core concept: ${concepts[0]}`,
      description: `Identify and elaborate on the primary concept derived from the input related to ${concepts[0]}.`,
      phase: "Conceptualization",
      priority: "high",
    });
  }

  tasks.push({
    id: "task-2",
    title: "Identify supporting concepts.",
    description: "Uncover secondary concepts that directly support or elaborate on the core concept.",
    phase: "Analysis",
    priority: "medium",
  });

  tasks.push({
    id: "task-3",
    title: "Create task graph structure.",
    description: "Map out the interdependencies and logical flow of the identified tasks.",
    phase: "Planning",
    priority: "high",
  });

  tasks.push({
    id: "task-4",
    title: "Set priorities and dependencies.",
    description: "Assign priority levels and define sequential or parallel dependencies for each task.",
    phase: "Refinement",
    priority: "medium",
  });

  return {
    intent,
    steps: tasks, // Changed taskGraph to steps
    summary: `A ${tasks.length}-step plan has been generated based on the intent to '${intent}'.`
  };
}
