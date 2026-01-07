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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          cover_image_url: string | null
          full_name: string | null
          id: string
          location: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          cover_image_url?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          cover_image_url?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_links: {
        Row: {
          created_at: string
          id: string
          kind: "website" | "linkedin" | "instagram" | "twitter"
          profile_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: "website" | "linkedin" | "instagram" | "twitter"
          profile_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: "website" | "linkedin" | "instagram" | "twitter"
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_links_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profile_skills: {
        Row: {
          created_at: string
          favorite: boolean
          icon_name: string
          id: string
          name: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          favorite?: boolean
          icon_name: string
          id?: string
          name: string
          profile_id: string
        }
        Update: {
          created_at?: string
          favorite?: boolean
          icon_name?: string
          id?: string
          name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      video_progress: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          last_watched_at: string
          user_id: string
          video_id: string
          watched_seconds: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          last_watched_at?: string
          user_id: string
          video_id: string
          watched_seconds?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          last_watched_at?: string
          user_id?: string
          video_id?: string
          watched_seconds?: number
        }
        Relationships: []
      }
      contents: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'video' | 'course' | 'event' | 'extra'
          category: string | null
          thumbnail_url: string | null
          video_url: string | null
          duration_seconds: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'video' | 'course' | 'event' | 'extra'
          category?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          duration_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'video' | 'course' | 'event' | 'extra'
          category?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          duration_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          id: string
          user_id: string
          content_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_content_id_fkey"
            columns: ["content_id"]
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      content_progress: {
        Row: {
          id: string
          user_id: string
          content_id: string
          watched_seconds: number
          is_completed: boolean
          last_watched_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          watched_seconds?: number
          is_completed?: boolean
          last_watched_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          watched_seconds?: number
          is_completed?: boolean
          last_watched_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_progress_content_id_fkey"
            columns: ["content_id"]
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      levels: {
        Row: {
          id: string
          sequence_number: number
          name: string
          description: string | null
          icon: string
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sequence_number: number
          name: string
          description?: string | null
          icon: string
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sequence_number?: number
          name?: string
          description?: string | null
          icon?: string
          is_published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          level_id: string
          sequence_number: number
          title: string
          description: string | null
          task_type: 'setup' | 'deadline' | 'content' | 'quiz' | 'milestone'
          content_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          level_id: string
          sequence_number: number
          title: string
          description?: string | null
          task_type: 'setup' | 'deadline' | 'content' | 'quiz' | 'milestone'
          content_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          level_id?: string
          sequence_number?: number
          title?: string
          description?: string | null
          task_type?: 'setup' | 'deadline' | 'content' | 'quiz' | 'milestone'
          content_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_level_id_fkey"
            columns: ["level_id"]
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_content_id_fkey"
            columns: ["content_id"]
            referencedRelation: "contents"
            referencedColumns: ["id"]
          }
        ]
      }
      user_level_progress: {
        Row: {
          id: string
          user_id: string
          level_id: string
          status: 'locked' | 'active' | 'completed'
          unlocked_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          level_id: string
          status?: 'locked' | 'active' | 'completed'
          unlocked_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          level_id?: string
          status?: 'locked' | 'active' | 'completed'
          unlocked_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_level_progress_level_id_fkey"
            columns: ["level_id"]
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_level_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_task_progress: {
        Row: {
          id: string
          user_id: string
          task_id: string
          status: 'pending' | 'completed'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          status?: 'pending' | 'completed'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          status?: 'pending' | 'completed'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_task_progress_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_task_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
