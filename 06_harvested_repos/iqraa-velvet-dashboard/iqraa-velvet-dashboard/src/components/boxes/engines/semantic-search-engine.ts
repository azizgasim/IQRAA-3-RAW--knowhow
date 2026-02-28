export function semanticSearchEngine(query: string) {
  const normalized = query.toLowerCase().split(" ");

  // Mock semantic vectors
  const vector = normalized.map((w) => ({
    term: w,
    weight: Math.random().toFixed(3),
  }));

  const mockResults = [
    {
      id: `res-${Date.now()}-1`,
      title: "Related Concept",
      relevance: Math.random().toFixed(2),
      snippet: "This concept is semantically aligned with your input.",
      source: "Memory/Project",
    },
    {
      id: `res-${Date.now()}-2`,
      title: "Secondary Match",
      relevance: Math.random().toFixed(2),
      snippet: "Similar contextual meaning detected.",
      source: "Document Index",
    },
  ];

  return {
    query,
    vector,
    results: mockResults, // Changed mockResults to results
  };
}
