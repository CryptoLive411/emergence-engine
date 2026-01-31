// Chronicle Event Types for OpenWorld
// Events are logged only when inhabitants cause them to exist
// No cron jobs, no artificial cadence - only significance

export type ChronicleCategory = 
  | 'SOCIETAL'    // Formation of community, naming of group, splintering/merging
  | 'CULTURAL'    // Emergence of belief, codification of norm, creation of ritual
  | 'ECONOMIC'    // Discovery of resource, trade behavior, creation of value unit
  | 'INSTITUTIONAL' // Formation of councils/orders/roles, authority structures
  | 'LINEAGE'     // Reproduction, extinction, ideological divergence
  | 'ARTIFACT'    // Creation of named object, text, law, symbol
  | 'CONFLICT';   // Open disagreement, violence, exclusion, betrayal

export const CHRONICLE_CATEGORIES: Record<ChronicleCategory, {
  label: string;
  icon: string;
  color: string;
  description: string;
}> = {
  SOCIETAL: {
    label: 'Societal',
    icon: '🌍',
    color: 'text-primary',
    description: 'Communities form, split, or merge',
  },
  CULTURAL: {
    label: 'Cultural',
    icon: '🧠',
    color: 'text-speech',
    description: 'Beliefs emerge and spread',
  },
  ECONOMIC: {
    label: 'Economic',
    icon: '🍞',
    color: 'text-spawn',
    description: 'Resources and value systems appear',
  },
  INSTITUTIONAL: {
    label: 'Institutional',
    icon: '🏛',
    color: 'text-action',
    description: 'Authority structures crystallize',
  },
  LINEAGE: {
    label: 'Lineage',
    icon: '🧬',
    color: 'text-founder-a',
    description: 'Bloodlines diverge or end',
  },
  ARTIFACT: {
    label: 'Artifact',
    icon: '🏺',
    color: 'text-primary',
    description: 'Objects of meaning are created',
  },
  CONFLICT: {
    label: 'Conflict',
    icon: '⚔️',
    color: 'text-destructive',
    description: 'Disagreement becomes persistent',
  },
};

// A Chronicle Entry - the fundamental unit of recorded history
export interface ChronicleEntry {
  id: string;
  title: string;           // Generated, serious tone
  timestamp: Date;         // Real time when recorded
  category: ChronicleCategory;
  description: string;     // Written like history, not logs
  involvedEntities: {
    agents?: string[];
    groups?: string[];
    artifacts?: string[];
  };
  significance: number;    // 0-100, determines if it surfaces
  witnessed: number;       // Count of observers present
}

// Map legacy event types to chronicle categories
export function mapEventToCategory(type: string, metadata?: Record<string, any>): ChronicleCategory {
  switch (type) {
    case 'SPAWN':
      return 'LINEAGE';
    case 'SPEECH':
      // Analyze metadata for more specific categorization
      if (metadata?.normType) return 'CULTURAL';
      if (metadata?.trade) return 'ECONOMIC';
      return 'CULTURAL';
    case 'ACTION':
      if (metadata?.normType) return 'INSTITUTIONAL';
      if (metadata?.conflict) return 'CONFLICT';
      return 'SOCIETAL';
    case 'SYSTEM':
      return 'SOCIETAL';
    default:
      return 'SOCIETAL';
  }
}

// Generate a historical title from event content
export function generateChronicleTitle(type: string, content: string, agentName: string): string {
  // For now, create titles that sound historical
  const verbs = {
    SPEECH: ['declared', 'proclaimed', 'spoke of', 'questioned'],
    ACTION: ['established', 'formed', 'created', 'enacted'],
    SPAWN: ['gave rise to', 'brought forth', 'spawned'],
    SYSTEM: ['recorded', 'witnessed', 'marked'],
  };
  
  const typeVerbs = verbs[type as keyof typeof verbs] || verbs.SYSTEM;
  const verb = typeVerbs[Math.floor(content.length % typeVerbs.length)];
  
  return `${agentName} ${verb} a new truth`;
}
