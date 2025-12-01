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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      battle_challenges: {
        Row: {
          challenged_id: string
          challenger_id: string
          created_at: string | null
          event_id: string | null
          id: string
          message: string | null
          status: string | null
        }
        Insert: {
          challenged_id: string
          challenger_id: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          message?: string | null
          status?: string | null
        }
        Update: {
          challenged_id?: string
          challenger_id?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          message?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_challenges_challenged_id_fkey"
            columns: ["challenged_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_challenges_challenged_id_fkey"
            columns: ["challenged_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_challenges_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_challenges_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_challenges_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_results: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          reporter_id: string
          result: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          reporter_id: string
          result: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          reporter_id?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_results_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "battle_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_results_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_results_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          category: string | null
          event_id: string
          id: string
          notes: string | null
          profile_id: string
          registered_at: string | null
        }
        Insert: {
          category?: string | null
          event_id: string
          id?: string
          notes?: string | null
          profile_id: string
          registered_at?: string | null
        }
        Update: {
          category?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          profile_id?: string
          registered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string
          created_at: string | null
          description: string | null
          end_date: string | null
          event_date: string
          event_type: string
          flyer_ipfs: string | null
          flyer_url: string | null
          id: string
          is_ikf_qualifier: boolean | null
          kns_minted: boolean | null
          kns_token_id: string | null
          latitude: number | null
          location_name: string
          longitude: number | null
          max_participants: number | null
          name: string
          organizer_id: string
          region: string | null
          registration_link: string | null
          status: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_date: string
          event_type: string
          flyer_ipfs?: string | null
          flyer_url?: string | null
          id?: string
          is_ikf_qualifier?: boolean | null
          kns_minted?: boolean | null
          kns_token_id?: string | null
          latitude?: number | null
          location_name: string
          longitude?: number | null
          max_participants?: number | null
          name: string
          organizer_id: string
          region?: string | null
          registration_link?: string | null
          status?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_type?: string
          flyer_ipfs?: string | null
          flyer_url?: string | null
          id?: string
          is_ikf_qualifier?: boolean | null
          kns_minted?: boolean | null
          kns_token_id?: string | null
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          max_participants?: number | null
          name?: string
          organizer_id?: string
          region?: string | null
          registration_link?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fam_challenges: {
        Row: {
          challenge_text: string
          challenged_fam_id: string
          challenger_fam_id: string
          created_at: string | null
          format: string | null
          id: string
          status: string | null
        }
        Insert: {
          challenge_text: string
          challenged_fam_id: string
          challenger_fam_id: string
          created_at?: string | null
          format?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          challenge_text?: string
          challenged_fam_id?: string
          challenger_fam_id?: string
          created_at?: string | null
          format?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fam_challenges_challenged_fam_id_fkey"
            columns: ["challenged_fam_id"]
            isOneToOne: false
            referencedRelation: "fams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fam_challenges_challenger_fam_id_fkey"
            columns: ["challenger_fam_id"]
            isOneToOne: false
            referencedRelation: "fams"
            referencedColumns: ["id"]
          },
        ]
      }
      fam_members: {
        Row: {
          fam_id: string
          generation: number | null
          id: string
          joined_at: string | null
          mentor_id: string | null
          profile_id: string
        }
        Insert: {
          fam_id: string
          generation?: number | null
          id?: string
          joined_at?: string | null
          mentor_id?: string | null
          profile_id: string
        }
        Update: {
          fam_id?: string
          generation?: number | null
          id?: string
          joined_at?: string | null
          mentor_id?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fam_members_fam_id_fkey"
            columns: ["fam_id"]
            isOneToOne: false
            referencedRelation: "fams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fam_members_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fam_members_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fam_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fam_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fam_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          fam_id: string
          id: string
          media_ipfs: string | null
          media_url: string | null
          post_type: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          fam_id: string
          id?: string
          media_ipfs?: string | null
          media_url?: string | null
          post_type?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          fam_id?: string
          id?: string
          media_ipfs?: string | null
          media_url?: string | null
          post_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fam_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fam_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fam_posts_fam_id_fkey"
            columns: ["fam_id"]
            isOneToOne: false
            referencedRelation: "fams"
            referencedColumns: ["id"]
          },
        ]
      }
      fams: {
        Row: {
          audition_details: string | null
          audition_link: string | null
          big_homie_id: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          id: string
          logo_ipfs: string | null
          logo_url: string | null
          name: string
          recruitment_status:
            | Database["public"]["Enums"]["fam_recruitment_status"]
            | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          audition_details?: string | null
          audition_link?: string | null
          big_homie_id?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          logo_ipfs?: string | null
          logo_url?: string | null
          name: string
          recruitment_status?:
            | Database["public"]["Enums"]["fam_recruitment_status"]
            | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          audition_details?: string | null
          audition_link?: string | null
          big_homie_id?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          logo_ipfs?: string | null
          logo_url?: string | null
          name?: string
          recruitment_status?:
            | Database["public"]["Enums"]["fam_recruitment_status"]
            | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fams_big_homie_id_fkey"
            columns: ["big_homie_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fams_big_homie_id_fkey"
            columns: ["big_homie_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_style_tags: {
        Row: {
          id: string
          profile_id: string
          style_tag_id: string
        }
        Insert: {
          id?: string
          profile_id: string
          style_tag_id: string
        }
        Update: {
          id?: string
          profile_id?: string
          style_tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_style_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_style_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_style_tags_style_tag_id_fkey"
            columns: ["style_tag_id"]
            isOneToOne: false
            referencedRelation: "style_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          banner_ipfs: string | null
          banner_url: string | null
          battle_draws: number | null
          battle_losses: number | null
          battle_wins: number | null
          bio: string | null
          call_out_status: Database["public"]["Enums"]["call_out_status"] | null
          city: string | null
          created_at: string | null
          current_fam_id: string | null
          display_name: string
          id: string
          instagram_handle: string | null
          krump_name: string | null
          phone_verified: boolean | null
          profile_picture_ipfs: string | null
          profile_picture_url: string | null
          rank: Database["public"]["Enums"]["krump_rank"] | null
          updated_at: string | null
          user_id: string
          wallet_address: string
          world_id_nullifier_hash: string | null
          world_id_verified: boolean | null
        }
        Insert: {
          banner_ipfs?: string | null
          banner_url?: string | null
          battle_draws?: number | null
          battle_losses?: number | null
          battle_wins?: number | null
          bio?: string | null
          call_out_status?:
            | Database["public"]["Enums"]["call_out_status"]
            | null
          city?: string | null
          created_at?: string | null
          current_fam_id?: string | null
          display_name: string
          id?: string
          instagram_handle?: string | null
          krump_name?: string | null
          phone_verified?: boolean | null
          profile_picture_ipfs?: string | null
          profile_picture_url?: string | null
          rank?: Database["public"]["Enums"]["krump_rank"] | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
          world_id_nullifier_hash?: string | null
          world_id_verified?: boolean | null
        }
        Update: {
          banner_ipfs?: string | null
          banner_url?: string | null
          battle_draws?: number | null
          battle_losses?: number | null
          battle_wins?: number | null
          bio?: string | null
          call_out_status?:
            | Database["public"]["Enums"]["call_out_status"]
            | null
          city?: string | null
          created_at?: string | null
          current_fam_id?: string | null
          display_name?: string
          id?: string
          instagram_handle?: string | null
          krump_name?: string | null
          phone_verified?: boolean | null
          profile_picture_ipfs?: string | null
          profile_picture_url?: string | null
          rank?: Database["public"]["Enums"]["krump_rank"] | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
          world_id_nullifier_hash?: string | null
          world_id_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_fam_id_fkey"
            columns: ["current_fam_id"]
            isOneToOne: false
            referencedRelation: "fams"
            referencedColumns: ["id"]
          },
        ]
      }
      session_ratings: {
        Row: {
          comments: string | null
          created_at: string | null
          equipment: number | null
          floor_quality: number | null
          id: string
          rater_id: string
          safety: number | null
          session_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          equipment?: number | null
          floor_quality?: number | null
          id?: string
          rater_id: string
          safety?: number | null
          session_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          equipment?: number | null
          floor_quality?: number | null
          id?: string
          rater_id?: string
          safety?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_ratings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_requests: {
        Row: {
          created_at: string | null
          id: string
          requester_id: string
          session_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          requester_id: string
          session_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          requester_id?: string
          session_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          allowed_fam_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          host_id: string
          id: string
          is_fam_only: boolean | null
          kns_minted: boolean | null
          kns_token_id: string | null
          latitude: number
          location_name: string
          longitude: number
          max_participants: number | null
          name: string
          rules: string | null
          session_date: string
          session_type: Database["public"]["Enums"]["session_type"]
        }
        Insert: {
          allowed_fam_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          host_id: string
          id?: string
          is_fam_only?: boolean | null
          kns_minted?: boolean | null
          kns_token_id?: string | null
          latitude: number
          location_name: string
          longitude: number
          max_participants?: number | null
          name: string
          rules?: string | null
          session_date: string
          session_type: Database["public"]["Enums"]["session_type"]
        }
        Update: {
          allowed_fam_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          host_id?: string
          id?: string
          is_fam_only?: boolean | null
          kns_minted?: boolean | null
          kns_token_id?: string | null
          latitude?: number
          location_name?: string
          longitude?: number
          max_participants?: number | null
          name?: string
          rules?: string | null
          session_date?: string
          session_type?: Database["public"]["Enums"]["session_type"]
        }
        Relationships: [
          {
            foreignKeyName: "sessions_allowed_fam_id_fkey"
            columns: ["allowed_fam_id"]
            isOneToOne: false
            referencedRelation: "fams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      style_tags: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          banner_ipfs: string | null
          banner_url: string | null
          battle_draws: number | null
          battle_losses: number | null
          battle_wins: number | null
          bio: string | null
          call_out_status: Database["public"]["Enums"]["call_out_status"] | null
          created_at: string | null
          current_fam_id: string | null
          display_name: string | null
          id: string | null
          krump_name: string | null
          profile_picture_ipfs: string | null
          profile_picture_url: string | null
          rank: Database["public"]["Enums"]["krump_rank"] | null
        }
        Insert: {
          banner_ipfs?: string | null
          banner_url?: string | null
          battle_draws?: number | null
          battle_losses?: number | null
          battle_wins?: number | null
          bio?: string | null
          call_out_status?:
            | Database["public"]["Enums"]["call_out_status"]
            | null
          created_at?: string | null
          current_fam_id?: string | null
          display_name?: string | null
          id?: string | null
          krump_name?: string | null
          profile_picture_ipfs?: string | null
          profile_picture_url?: string | null
          rank?: Database["public"]["Enums"]["krump_rank"] | null
        }
        Update: {
          banner_ipfs?: string | null
          banner_url?: string | null
          battle_draws?: number | null
          battle_losses?: number | null
          battle_wins?: number | null
          bio?: string | null
          call_out_status?:
            | Database["public"]["Enums"]["call_out_status"]
            | null
          created_at?: string | null
          current_fam_id?: string | null
          display_name?: string | null
          id?: string | null
          krump_name?: string | null
          profile_picture_ipfs?: string | null
          profile_picture_url?: string | null
          rank?: Database["public"]["Enums"]["krump_rank"] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_fam_id_fkey"
            columns: ["current_fam_id"]
            isOneToOne: false
            referencedRelation: "fams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      call_out_status: "ready_for_smoke" | "labbin"
      fam_recruitment_status: "closed_circle" | "scouting" | "auditions_open"
      krump_rank: "new_boot" | "young" | "jr" | "sr" | "og"
      session_type: "casual_practice" | "heavy_lab" | "workshop"
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
      call_out_status: ["ready_for_smoke", "labbin"],
      fam_recruitment_status: ["closed_circle", "scouting", "auditions_open"],
      krump_rank: ["new_boot", "young", "jr", "sr", "og"],
      session_type: ["casual_practice", "heavy_lab", "workshop"],
    },
  },
} as const
