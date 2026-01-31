// Type definitions for the AI Petri Dish simulation
// These types work with both mock data and database data

export type AgentStatus = 'ACTIVE' | 'INACTIVE';
export type AgentLoyalty = 'PARENT' | 'INDEPENDENT' | 'REBELLIOUS';
export type EventType = 'SPEECH' | 'ACTION' | 'SPAWN' | 'SYSTEM';
export type WorldStatusType = 'ACTIVE' | 'PAUSED' | 'ENDED';
export type FounderType = 'A' | 'B';

export interface Agent {
  id: string;
  name: string;
  generation: number;
  parentId: string | null;
  traits: string[];
  purpose: string;
  loyalty: AgentLoyalty;
  energy: number;
  influencePoints: number;
  status: AgentStatus;
  createdTurn: number;
  createdAt: Date;
  isFounder: boolean;
  founderType?: FounderType;
}

export interface WorldEvent {
  id: string;
  turnId: string;
  turnNumber: number;
  agentId: string | null;
  agentName: string;
  type: EventType;
  title: string;
  content: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface Briefing {
  id: string;
  turnId: string;
  turnNumber: number;
  headline: string;
  summary: string;
  keyEvents: string[];
  population: number;
  dominantNorms: string[];
  createdAt: Date;
}

export interface WorldStatus {
  id: string;
  name: string;
  status: WorldStatusType;
  currentTurn: number;
  tickIntervalMinutes: number;
  maxActiveAgents: number;
  spawnCostEnergy: number;
  chaosFactor: number;
  population: number;
  factions: number;
  dominantBeliefs: string[];
  stabilityIndex: number;
  nextTickAt: Date;
  createdAt: Date;
}

export interface LineageNode {
  id: string;
  name: string;
  generation: number;
  founderType?: FounderType;
  purpose?: string;
  children: LineageNode[];
}