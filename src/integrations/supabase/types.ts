export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string
          earned_at: string
          id: string
          metadata: Json
          x_handle: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description: string
          earned_at?: string
          id?: string
          metadata?: Json
          x_handle: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string
          earned_at?: string
          id?: string
          metadata?: Json
          x_handle?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          created_at: string
          created_turn: number
          energy: number
          founder_type: string | null
          generation: number
          id: string
          identity_prompt: string | null
          influence_points: number
          is_founder: boolean
          loyalty: Database["public"]["Enums"]["agent_loyalty"]
          name: string
          parent_agent_id: string | null
          purpose: string
          status: string
          traits: Json
          world_id: string
        }
        Insert: {
          created_at?: string
          created_turn?: number
          energy?: number
          founder_type?: string | null
          generation?: number
          id?: string
          identity_prompt?: string | null
          influence_points?: number
          is_founder?: boolean
          loyalty?: Database["public"]["Enums"]["agent_loyalty"]
          name: string
          parent_agent_id?: string | null
          purpose: string
          status: string
          traits?: Json
          world_id: string
        }
        Update: {
          created_at?: string
          created_turn?: number
          energy?: number
          founder_type?: string | null
          generation?: number
          id?: string
          identity_prompt?: string | null
          influence_points?: number
          is_founder?: boolean
          loyalty?: Database["public"]["Enums"]["agent_loyalty"]
          name?: string
          parent_agent_id?: string | null
          purpose?: string
          status?: string
          traits?: Json
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agents_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      annotations: {
        Row: {
          annotation_type: string
          content: string
          created_at: string
          event_id: string
          id: string
          x_handle: string
        }
        Insert: {
          annotation_type: string
          content: string
          created_at?: string
          event_id: string
          id?: string
          x_handle: string
        }
        Update: {
          annotation_type?: string
          content?: string
          created_at?: string
          event_id?: string
          id?: string
          x_handle?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      artifact_references: {
        Row: {
          agent_id: string | null
          artifact_id: string
          context: string | null
          created_at: string
          id: string
          turn_id: string
        }
        Insert: {
          agent_id?: string | null
          artifact_id: string
          context?: string | null
          created_at?: string
          id?: string
          turn_id: string
        }
        Update: {
          agent_id?: string | null
          artifact_id?: string
          context?: string | null
          created_at?: string
          id?: string
          turn_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artifact_references_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_references_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_references_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_references_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "turns"
            referencedColumns: ["id"]
          },
        ]
      }
      artifacts: {
        Row: {
          artifact_type: string
          content: string
          created_at: string
          creator_agent_id: string | null
          id: string
          last_referenced_turn: number
          name: string
          origin_turn: number
          reference_count: number
          status: string
          world_id: string
        }
        Insert: {
          artifact_type: string
          content: string
          created_at?: string
          creator_agent_id?: string | null
          id?: string
          last_referenced_turn: number
          name: string
          origin_turn: number
          reference_count?: number
          status?: string
          world_id: string
        }
        Update: {
          artifact_type?: string
          content?: string
          created_at?: string
          creator_agent_id?: string | null
          id?: string
          last_referenced_turn?: number
          name?: string
          origin_turn?: number
          reference_count?: number
          status?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_creator_agent_id_fkey"
            columns: ["creator_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_creator_agent_id_fkey"
            columns: ["creator_agent_id"]
            isOneToOne: false
            referencedRelation: "agents_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      briefings: {
        Row: {
          created_at: string
          dominant_norms: Json
          headline: string
          id: string
          key_events: Json
          population: number
          summary: string
          turn_id: string
          world_id: string
        }
        Insert: {
          created_at?: string
          dominant_norms?: Json
          headline: string
          id?: string
          key_events?: Json
          population?: number
          summary: string
          turn_id: string
          world_id: string
        }
        Update: {
          created_at?: string
          dominant_norms?: Json
          headline?: string
          id?: string
          key_events?: Json
          population?: number
          summary?: string
          turn_id?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefings_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: true
            referencedRelation: "turns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefings_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          agent_id: string
          claimed_at: string
          id: string
          lineage_score: number
          x_handle: string
        }
        Insert: {
          agent_id: string
          claimed_at?: string
          id?: string
          lineage_score?: number
          x_handle: string
        }
        Update: {
          agent_id?: string
          claimed_at?: string
          id?: string
          lineage_score?: number
          x_handle?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents_public"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_quotes: {
        Row: {
          agent_id: string | null
          created_at: string
          event_id: string
          id: string
          impact_score: number
          quote: string
          turn_id: string
          world_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          event_id: string
          id?: string
          impact_score?: number
          quote: string
          turn_id: string
          world_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          event_id?: string
          id?: string
          impact_score?: number
          quote?: string
          turn_id?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycle_quotes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_quotes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_quotes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_quotes_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: true
            referencedRelation: "turns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_quotes_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      eras: {
        Row: {
          created_at: string
          ended_turn: number | null
          era_number: number
          id: string
          name: string
          started_turn: number
          trigger_reason: string
          world_id: string
        }
        Insert: {
          created_at?: string
          ended_turn?: number | null
          era_number: number
          id?: string
          name: string
          started_turn: number
          trigger_reason: string
          world_id: string
        }
        Update: {
          created_at?: string
          ended_turn?: number | null
          era_number?: number
          id?: string
          name?: string
          started_turn?: number
          trigger_reason?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eras_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          agent_id: string | null
          content: string
          created_at: string
          id: string
          metadata: Json
          title: string
          turn_id: string
          type: Database["public"]["Enums"]["event_type"]
          world_id: string
        }
        Insert: {
          agent_id?: string | null
          content: string
          created_at?: string
          id?: string
          metadata?: Json
          title: string
          turn_id: string
          type: Database["public"]["Enums"]["event_type"]
          world_id: string
        }
        Update: {
          agent_id?: string | null
          content?: string
          created_at?: string
          id?: string
          metadata?: Json
          title?: string
          turn_id?: string
          type?: Database["public"]["Enums"]["event_type"]
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "turns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          memory_summary: string | null
          private_thought: string
          turn_id: string
          world_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          memory_summary?: string | null
          private_thought: string
          turn_id: string
          world_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          memory_summary?: string | null
          private_thought?: string
          turn_id?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "turns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      presence_markers: {
        Row: {
          event_id: string
          id: string
          witnessed_at: string
          x_handle: string
        }
        Insert: {
          event_id: string
          id?: string
          witnessed_at?: string
          x_handle: string
        }
        Update: {
          event_id?: string
          id?: string
          witnessed_at?: string
          x_handle?: string
        }
        Relationships: [
          {
            foreignKeyName: "presence_markers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      turns: {
        Row: {
          ended_at: string | null
          id: string
          started_at: string
          turn_number: number
          world_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          started_at?: string
          turn_number: number
          world_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          started_at?: string
          turn_number?: number
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turns_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      world_moods: {
        Row: {
          belief_entropy: number
          conflict_rate: number
          created_at: string
          id: string
          mood: string
          stability_score: number
          turn_id: string
          world_id: string
        }
        Insert: {
          belief_entropy: number
          conflict_rate: number
          created_at?: string
          id?: string
          mood: string
          stability_score: number
          turn_id: string
          world_id: string
        }
        Update: {
          belief_entropy?: number
          conflict_rate?: number
          created_at?: string
          id?: string
          mood?: string
          stability_score?: number
          turn_id?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "world_moods_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: true
            referencedRelation: "turns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "world_moods_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      worlds: {
        Row: {
          chaos_factor: number
          created_at: string
          id: string
          max_active_agents: number
          name: string
          spawn_cost_energy: number
          status: Database["public"]["Enums"]["world_status"]
          tick_interval_minutes: number
          updated_at: string
        }
        Insert: {
          chaos_factor?: number
          created_at?: string
          id?: string
          max_active_agents?: number
          name?: string
          spawn_cost_energy?: number
          status?: Database["public"]["Enums"]["world_status"]
          tick_interval_minutes?: number
          updated_at?: string
        }
        Update: {
          chaos_factor?: number
          created_at?: string
          id?: string
          max_active_agents?: number
          name?: string
          spawn_cost_energy?: number
          status?: Database["public"]["Enums"]["world_status"]
          tick_interval_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      agents_public: {
        Row: {
          created_at: string | null
          created_turn: number | null
          energy: number | null
          founder_type: string | null
          generation: number | null
          id: string | null
          influence_points: number | null
          is_founder: boolean | null
          loyalty: Database["public"]["Enums"]["agent_loyalty"] | null
          name: string | null
          parent_agent_id: string | null
          purpose: string | null
          status: string | null
          traits: Json | null
          world_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_turn?: number | null
          energy?: number | null
          founder_type?: string | null
          generation?: number | null
          id?: string | null
          influence_points?: number | null
          is_founder?: boolean | null
          loyalty?: Database["public"]["Enums"]["agent_loyalty"] | null
          name?: string | null
          parent_agent_id?: string | null
          purpose?: string | null
          status?: string | null
          traits?: Json | null
          world_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_turn?: number | null
          energy?: number | null
          founder_type?: string | null
          generation?: number | null
          id?: string | null
          influence_points?: number | null
          is_founder?: boolean | null
          loyalty?: Database["public"]["Enums"]["agent_loyalty"] | null
          name?: string | null
          parent_agent_id?: string | null
          purpose?: string | null
          status?: string | null
          traits?: Json | null
          world_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agents_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      trigger_world_tick: { Args: never; Returns: undefined }
    }
    Enums: {
      agent_loyalty: "PARENT" | "INDEPENDENT" | "REBELLIOUS"
      event_type: "SPEECH" | "ACTION" | "SPAWN" | "SYSTEM"
      world_status: "ACTIVE" | "PAUSED" | "ENDED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_loyalty: ["PARENT", "INDEPENDENT", "REBELLIOUS"],
      event_type: ["SPEECH", "ACTION", "SPAWN", "SYSTEM"],
      world_status: ["ACTIVE", "PAUSED", "ENDED"],
    },
  },
} as const
