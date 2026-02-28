
export interface Project {
  id: string;
  title: string;
  stage: "spark" | "literature" | "deep-dive" | "writing" | "review";
  concepts: Concept[];
  createdAt: Date;
}

export interface Concept {
  id: string;
  content: string;
  type: "idea" | "quote" | "question" | "insight";
  sourceId?: string;
  tags: string[];
}

export interface Source {
  id: string;
  title: string;
  type: "book" | "article" | "website" | "manuscript";
  author?: string;
  url?: string;
}

export interface Lens {
  id: string;
  type: "relationship" | "impact" | "sequence" | "structure" | "scope";
  transform: (data: any) => any; // Implementation later
}
