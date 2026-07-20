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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bls_lebensmittel: {
        Row: {
          bls_code: string
          bls_version: string
          carbs_g_100g: number | null
          fat_g_100g: number | null
          fiber_g_100g: number | null
          imported_at: string
          kcal_100g: number | null
          naehrwerte: Json | null
          name_de: string
          name_en: string | null
          protein_g_100g: number | null
          sugar_g_100g: number | null
        }
        Insert: {
          bls_code: string
          bls_version?: string
          carbs_g_100g?: number | null
          fat_g_100g?: number | null
          fiber_g_100g?: number | null
          imported_at?: string
          kcal_100g?: number | null
          naehrwerte?: Json | null
          name_de: string
          name_en?: string | null
          protein_g_100g?: number | null
          sugar_g_100g?: number | null
        }
        Update: {
          bls_code?: string
          bls_version?: string
          carbs_g_100g?: number | null
          fat_g_100g?: number | null
          fiber_g_100g?: number | null
          imported_at?: string
          kcal_100g?: number | null
          naehrwerte?: Json | null
          name_de?: string
          name_en?: string | null
          protein_g_100g?: number | null
          sugar_g_100g?: number | null
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string | null
          redeemed_at: string | null
          redeemed_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Relationships: []
      }
      invite_redemption_attempts: {
        Row: {
          attempted_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          attempted_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_analyses: {
        Row: {
          analysis_typ: string | null
          beilage_data: Json | null
          created_at: string
          data_sources: Json | null
          id: string
          improvement: Json | null
          macros_after: Json | null
          macros_before: Json | null
          meal_id: string
          refined_ingredients: Json | null
          satiety_scores_after: Json | null
          satiety_scores_before: Json | null
        }
        Insert: {
          analysis_typ?: string | null
          beilage_data?: Json | null
          created_at?: string
          data_sources?: Json | null
          id?: string
          improvement?: Json | null
          macros_after?: Json | null
          macros_before?: Json | null
          meal_id: string
          refined_ingredients?: Json | null
          satiety_scores_after?: Json | null
          satiety_scores_before?: Json | null
        }
        Update: {
          analysis_typ?: string | null
          beilage_data?: Json | null
          created_at?: string
          data_sources?: Json | null
          id?: string
          improvement?: Json | null
          macros_after?: Json | null
          macros_before?: Json | null
          meal_id?: string
          refined_ingredients?: Json | null
          satiety_scores_after?: Json | null
          satiety_scores_before?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_analyses_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_conversations: {
        Row: {
          assumptions: Json | null
          claude_messages: Json
          created_at: string
          current_round: number
          id: string
          meal_id: string
          status: string
        }
        Insert: {
          assumptions?: Json | null
          claude_messages?: Json
          created_at?: string
          current_round?: number
          id?: string
          meal_id: string
          status?: string
        }
        Update: {
          assumptions?: Json | null
          claude_messages?: Json
          created_at?: string
          current_round?: number
          id?: string
          meal_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_conversations_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string
          free_text: string | null
          id: string
          photo_fullsize_path: string | null
          photo_thumbnail_path: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          free_text?: string | null
          id?: string
          photo_fullsize_path?: string | null
          photo_thumbnail_path?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          free_text?: string | null
          id?: string
          photo_fullsize_path?: string | null
          photo_thumbnail_path?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          invite_code_redeemed_at: string | null
          name: string | null
          photo_scans_remaining: number
          photo_scans_today_count: number
          photo_scans_today_date: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          trial_ends_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          invite_code_redeemed_at?: string | null
          name?: string | null
          photo_scans_remaining?: number
          photo_scans_today_count?: number
          photo_scans_today_date?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          invite_code_redeemed_at?: string | null
          name?: string | null
          photo_scans_remaining?: number
          photo_scans_today_count?: number
          photo_scans_today_date?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          amount: number
          id: string
          macros_per_100g: Json | null
          name: string
          recipe_id: string
          sort_order: number
          unit: string
        }
        Insert: {
          amount: number
          id?: string
          macros_per_100g?: Json | null
          name: string
          recipe_id: string
          sort_order?: number
          unit: string
        }
        Update: {
          amount?: number
          id?: string
          macros_per_100g?: Json | null
          name?: string
          recipe_id?: string
          sort_order?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time_minutes: number
          created_at: string
          cuisine_tags: string[]
          focal_point: Json | null
          id: string
          image_path: string | null
          ingredient_tags: string[]
          instructions: string
          is_guest_visible: boolean
          macros_per_serving: Json | null
          recipe_typ: string | null
          saettigungs_matrix: Json | null
          servings: number
          title: string
          total_time_minutes: number
          updated_at: string
        }
        Insert: {
          cook_time_minutes: number
          created_at?: string
          cuisine_tags?: string[]
          focal_point?: Json | null
          id?: string
          image_path?: string | null
          ingredient_tags?: string[]
          instructions: string
          is_guest_visible?: boolean
          macros_per_serving?: Json | null
          recipe_typ?: string | null
          saettigungs_matrix?: Json | null
          servings: number
          title: string
          total_time_minutes: number
          updated_at?: string
        }
        Update: {
          cook_time_minutes?: number
          created_at?: string
          cuisine_tags?: string[]
          focal_point?: Json | null
          id?: string
          image_path?: string | null
          ingredient_tags?: string[]
          instructions?: string
          is_guest_visible?: boolean
          macros_per_serving?: Json | null
          recipe_typ?: string | null
          saettigungs_matrix?: Json | null
          servings?: number
          title?: string
          total_time_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_photo_scan: { Args: never; Returns: number }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
