import { NextResponse } from 'next/server';
import { Project } from '@/types';

// A simple in-memory store for projects (simulating a database)
let projects: Project[] = [
  {
    id: '1',
    title: 'Project Alpha',
    stage: 'literature',
    concepts: [
      {
        id: 'concept-1',
        content: 'This is an initial concept for Project Alpha.',
        type: 'idea',
        tags: ['initial', 'setup'],
      },
    ],
    createdAt: new Date(),
  },
];

export async function GET() {
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { title, stage } = await request.json();
  const newProject: Project = {
    id: (projects.length + 1).toString(),
    title,
    stage,
    concepts: [], 
    createdAt: new Date(),
  };
  projects.push(newProject);
  return NextResponse.json(newProject, { status: 201 });
}

// We also need to add PUT, DELETE methods here if we want the mock API to fully support CRUD
// For now, the Zustand store handles the updates and deletes client-side.
