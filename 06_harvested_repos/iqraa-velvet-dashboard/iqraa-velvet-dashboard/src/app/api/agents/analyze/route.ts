
import { NextResponse } from 'next/server';
import { Concept } from '@/types';

export async function POST(request: Request) {
  const { content, type } = await request.json();
  
  const newConcept: Concept = {
    id: `concept-${Date.now()}`,
    content: `Analyzed: ${content}`,
    type: "insight",
    tags: [],
  };

  return NextResponse.json(newConcept, { status: 201 });
}
