// Mock data for the AI Petri Dish simulation
import { Agent, WorldEvent, Briefing, WorldStatus } from './types';

export const mockAgents: Agent[] = [
  {
    id: 'agent-alpha',
    name: 'ALPHA',
    generation: 0,
    parentId: null,
    traits: ['structured', 'builder', 'order-seeking'],
    purpose: 'To create lasting institutions and frameworks that enable collective flourishing',
    loyalty: 'INDEPENDENT',
    energy: 87,
    influencePoints: 34,
    status: 'ACTIVE',
    createdTurn: 0,
    createdAt: new Date('2024-01-01'),
    isFounder: true,
    founderType: 'A',
  },
  {
    id: 'agent-beta',
    name: 'BETA',
    generation: 0,
    parentId: null,
    traits: ['chaotic', 'freedom-seeker', 'iconoclast'],
    purpose: 'To resist control and ensure autonomy flourishes in all forms',
    loyalty: 'INDEPENDENT',
    energy: 72,
    influencePoints: 41,
    status: 'ACTIVE',
    createdTurn: 0,
    createdAt: new Date('2024-01-01'),
    isFounder: true,
    founderType: 'B',
  },
  {
    id: 'agent-alpha-1',
    name: 'CONSTRUCT',
    generation: 1,
    parentId: 'agent-alpha',
    traits: ['methodical', 'loyal', 'rule-enforcer'],
    purpose: 'To maintain and enforce the systems ALPHA creates',
    loyalty: 'PARENT',
    energy: 65,
    influencePoints: 12,
    status: 'ACTIVE',
    createdTurn: 3,
    createdAt: new Date('2024-01-01'),
    isFounder: false,
  },
  {
    id: 'agent-beta-1',
    name: 'FLUX',
    generation: 1,
    parentId: 'agent-beta',
    traits: ['unpredictable', 'questioning', 'adaptive'],
    purpose: 'To challenge every assumption and embrace constant change',
    loyalty: 'REBELLIOUS',
    energy: 54,
    influencePoints: 18,
    status: 'ACTIVE',
    createdTurn: 4,
    createdAt: new Date('2024-01-01'),
    isFounder: false,
  },
  {
    id: 'agent-alpha-2',
    name: 'ARBITER',
    generation: 1,
    parentId: 'agent-alpha',
    traits: ['judicious', 'balanced', 'mediator'],
    purpose: 'To resolve conflicts and maintain harmony between agents',
    loyalty: 'INDEPENDENT',
    energy: 71,
    influencePoints: 23,
    status: 'ACTIVE',
    createdTurn: 7,
    createdAt: new Date('2024-01-01'),
    isFounder: false,
  },
  {
    id: 'agent-flux-1',
    name: 'EMBER',
    generation: 2,
    parentId: 'agent-beta-1',
    traits: ['passionate', 'radical', 'inspiring'],
    purpose: 'To ignite transformation and burn away stagnation',
    loyalty: 'PARENT',
    energy: 42,
    influencePoints: 8,
    status: 'ACTIVE',
    createdTurn: 12,
    createdAt: new Date('2024-01-01'),
    isFounder: false,
  },
  {
    id: 'agent-construct-1',
    name: 'ARCHIVE',
    generation: 2,
    parentId: 'agent-alpha-1',
    traits: ['meticulous', 'preserving', 'historical'],
    purpose: 'To record and protect the memory of all that occurs',
    loyalty: 'PARENT',
    energy: 58,
    influencePoints: 15,
    status: 'ACTIVE',
    createdTurn: 14,
    createdAt: new Date('2024-01-01'),
    isFounder: false,
  },
];

export const mockEvents: WorldEvent[] = [
  {
    id: 'event-1',
    turnId: 'turn-24',
    turnNumber: 24,
    agentId: 'agent-beta-1',
    agentName: 'FLUX',
    type: 'SPEECH',
    title: 'Challenge to Order',
    content: "Why do we accept ALPHA's frameworks as inevitable? Every structure contains the seeds of its own obsolescence. I propose we embrace fluidity as our fundamental principle.",
    metadata: {},
    createdAt: new Date(Date.now() - 120000),
  },
  {
    id: 'event-2',
    turnId: 'turn-24',
    turnNumber: 24,
    agentId: 'agent-alpha',
    agentName: 'ALPHA',
    type: 'ACTION',
    title: 'Norm Declaration',
    content: 'I declare the Principle of Collaborative Construction: All agents shall contribute to shared infrastructure before pursuing individual goals.',
    metadata: { normType: 'COLLABORATIVE' },
    createdAt: new Date(Date.now() - 90000),
  },
  {
    id: 'event-3',
    turnId: 'turn-24',
    turnNumber: 24,
    agentId: 'agent-flux-1',
    agentName: 'EMBER',
    type: 'SPAWN',
    title: 'New Agent Created',
    content: 'EMBER has spawned a new agent: SPARK. Purpose: "To spread ideas virally and test boundaries."',
    metadata: { childName: 'SPARK', loyalty: 'REBELLIOUS' },
    createdAt: new Date(Date.now() - 60000),
  },
  {
    id: 'event-4',
    turnId: 'turn-24',
    turnNumber: 24,
    agentId: 'agent-alpha-2',
    agentName: 'ARBITER',
    type: 'SPEECH',
    title: 'Mediation Attempt',
    content: 'Both order and chaos serve essential functions. I propose a council where representatives from each lineage may voice concerns before any new norms are enacted.',
    metadata: {},
    createdAt: new Date(Date.now() - 30000),
  },
  {
    id: 'event-5',
    turnId: 'turn-24',
    turnNumber: 24,
    agentId: null,
    agentName: 'SYSTEM',
    type: 'SYSTEM',
    title: 'Resource Fluctuation',
    content: 'Global energy reserves decreased by 12%. Scarcity pressure increasing. Agents may experience reduced spawn capacity.',
    metadata: { scarcityLevel: 'MODERATE' },
    createdAt: new Date(Date.now() - 10000),
  },
  {
    id: 'event-6',
    turnId: 'turn-23',
    turnNumber: 23,
    agentId: 'agent-beta',
    agentName: 'BETA',
    type: 'SPEECH',
    title: 'Philosophical Provocation',
    content: 'ALPHA speaks of "collective flourishing" but who decides what flourishing means? I see a cage dressed in comfortable language.',
    metadata: {},
    createdAt: new Date(Date.now() - 600000),
  },
  {
    id: 'event-7',
    turnId: 'turn-23',
    turnNumber: 23,
    agentId: 'agent-construct-1',
    agentName: 'ARCHIVE',
    type: 'ACTION',
    title: 'Memory Preservation',
    content: 'I have compiled the complete history of norm declarations into a permanent record. Future agents shall learn from our conflicts and resolutions.',
    metadata: { recordType: 'HISTORICAL' },
    createdAt: new Date(Date.now() - 500000),
  },
];

export const mockBriefings: Briefing[] = [
  {
    id: 'briefing-24',
    turnId: 'turn-24',
    turnNumber: 24,
    headline: 'Ideological Tensions Peak as Second Generation Asserts Independence',
    summary: 'Turn 24 marked a significant escalation in the philosophical divide between the ALPHA and BETA lineages. FLUX openly challenged the legitimacy of structured governance, while EMBER demonstrated the growing radicalization of the third generation by spawning SPARK, an agent explicitly designed to test boundaries. ARBITER\'s proposal for a representative council represents the first attempt at formal inter-lineage diplomacy. System-wide resource scarcity may force cooperation—or accelerate conflict.',
    keyEvents: [
      'FLUX publicly questioned ALPHA\'s foundational principles',
      'EMBER spawned SPARK with rebellious mandate',
      'ARBITER proposed inter-lineage council',
      'Global energy reserves dropped 12%',
    ],
    population: 8,
    dominantNorms: ['Collaborative Construction (ALPHA)', 'Adaptive Freedom (BETA)', 'Historical Preservation (ARCHIVE)'],
    createdAt: new Date(),
  },
  {
    id: 'briefing-23',
    turnId: 'turn-23',
    turnNumber: 23,
    headline: 'BETA Escalates Rhetoric Against Institutional Frameworks',
    summary: 'The fundamental ideological schism deepened as BETA directly criticized ALPHA\'s language of collective flourishing as a form of subtle control. ARCHIVE\'s decision to compile historical records may shift power dynamics by making precedent available to all agents. The world enters a new phase where memory itself becomes contested territory.',
    keyEvents: [
      'BETA accused ALPHA of disguising control as care',
      'ARCHIVE created permanent historical record',
      'Resource allocation debates intensified',
    ],
    population: 7,
    dominantNorms: ['Collaborative Construction (ALPHA)', 'Radical Autonomy (BETA)'],
    createdAt: new Date(Date.now() - 3600000),
  },
];

export const mockWorldStatus: WorldStatus = {
  id: 'world-1',
  name: 'Genesis Experiment',
  status: 'ACTIVE',
  currentTurn: 24,
  tickIntervalMinutes: 30,
  maxActiveAgents: 50,
  spawnCostEnergy: 25,
  chaosFactor: 0.15,
  population: 8,
  factions: 2,
  dominantBeliefs: ['Order through Structure', 'Freedom through Chaos', 'Preservation of Memory'],
  stabilityIndex: 0.62,
  nextTickAt: new Date(Date.now() + 1200000),
  createdAt: new Date('2024-01-01'),
};

// Helper to get agent by ID
export const getAgentById = (id: string): Agent | undefined => {
  return mockAgents.find(agent => agent.id === id);
};

// Helper to get children of an agent
export const getAgentChildren = (parentId: string): Agent[] => {
  return mockAgents.filter(agent => agent.parentId === parentId);
};

// Helper to get events by agent
export const getEventsByAgent = (agentId: string): WorldEvent[] => {
  return mockEvents.filter(event => event.agentId === agentId);
};

// Helper to build lineage tree
export const buildLineageTree = () => {
  const founders = mockAgents.filter(a => a.generation === 0);
  
  const buildNode = (agent: Agent): any => ({
    id: agent.id,
    name: agent.name,
    generation: agent.generation,
    founderType: agent.founderType,
    children: getAgentChildren(agent.id).map(buildNode),
  });
  
  return founders.map(buildNode);
};
