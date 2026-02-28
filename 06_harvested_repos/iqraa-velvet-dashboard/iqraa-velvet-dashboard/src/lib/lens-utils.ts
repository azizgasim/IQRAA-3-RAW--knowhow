
import { Concept } from '@/types';
import { useViewStore } from '@/store/viewStore';

type ActiveLensType = ReturnType<typeof useViewStore.getState>['activeLens'];

export const applyLensTransform = (concepts: Concept[], activeLens: ActiveLensType) => {
  let processedConcepts = [...concepts];

  switch (activeLens) {
    case 'impact':
      // Sort alphabetically by content
      processedConcepts.sort((a, b) => a.content.localeCompare(b.content));
      break;
    case 'sequence':
      // Sort by ID (as a proxy for creation time)
      processedConcepts.sort((a, b) => a.id.localeCompare(b.id));
      break;
    case 'structure':
      // Group by type (returns an object, not an array)
      return processedConcepts.reduce((acc, concept) => {
        const key = concept.type;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(concept);
        return acc;
      }, {} as Record<Concept['type'], Concept[]>);
    case 'relationship':
    case 'scope':
    case 'interpretive':
    default:
      // No transformation, return as is
      break;
  }

  return processedConcepts;
};
