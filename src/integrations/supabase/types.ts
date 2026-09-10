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
      bookings: {
        Row: {
          amount_paid: number
          barber_slug: string
          client_id: string | null
          commission_rate: number
          created_at: string
          date_iso: string
          deposit_rate: number
          id: string
          name: string
          pay_method: string | null
          pay_type: string
          refunded: number
          service_id: string
          status: string
          time: string
          tip: number
          total: number
        }
        Insert: {
          amount_paid?: number
          barber_slug: string
          client_id?: string | null
          commission_rate?: number
          created_at?: string
          date_iso: string
          deposit_rate?: number
          id?: string
          name: string
          pay_method?: string | null
          pay_type?: string
          refunded?: number
          service_id: string
          status?: string
          time: string
          tip?: number
          total?: number
        }
        Update: {
          amount_paid?: number
          barber_slug?: string
          client_id?: string | null
          commission_rate?: number
          created_at?: string
          date_iso?: string
          deposit_rate?: number
          id?: string
          name?: string
          pay_method?: string | null
          pay_type?: string
          refunded?: number
          service_id?: string
          status?: string
          time?: string
          tip?: number
          total?: number
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          created_at: string
          data: Json
          handle: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          handle: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          handle?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          barber_slug: string
          client_id: string
          created_at: string
          id: string
        }
        Insert: {
          barber_slug: string
          client_id: string
          created_at?: string
          id?: string
        }
        Update: {
          barber_slug?: string
          client_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          link?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          announcement: string
          bookings_open: boolean
          commission_rate: number
          created_at: string
          default_deposit_rate: number
          id: string
          pay_card: boolean
          pay_cash: boolean
          pay_cashapp: boolean
          pay_zelle: boolean
          support_email: string
          updated_at: string
        }
        Insert: {
          announcement?: string
          bookings_open?: boolean
          commission_rate?: number
          created_at?: string
          default_deposit_rate?: number
          id?: string
          pay_card?: boolean
          pay_cash?: boolean
          pay_cashapp?: boolean
          pay_zelle?: boolean
          support_email?: string
          updated_at?: string
        }
        Update: {
          announcement?: string
          bookings_open?: boolean
          commission_rate?: number
          created_at?: string
          default_deposit_rate?: number
          id?: string
          pay_card?: boolean
          pay_cash?: boolean
          pay_cashapp?: boolean
          pay_zelle?: boolean
          support_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      pro_pages: {
        Row: {
          created_at: string
          data: Json
          deposit_rate: number
          handle: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          deposit_rate?: number
          handle: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          deposit_rate?: number
          handle?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          free_access: boolean
          id: string
          plan: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          free_access?: boolean
          id: string
          plan?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          free_access?: boolean
          id?: string
          plan?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          barber_slug: string
          booking_id: string | null
          client_id: string
          comment: string
          created_at: string
          id: string
          rating: number
          reply: string
          reply_at: string | null
          service_name: string
        }
        Insert: {
          author_name?: string
          barber_slug: string
          booking_id?: string | null
          client_id: string
          comment?: string
          created_at?: string
          id?: string
          rating: number
          reply?: string
          reply_at?: string | null
          service_name?: string
        }
        Update: {
          author_name?: string
          barber_slug?: string
          booking_id?: string | null
          client_id?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          reply?: string
          reply_at?: string | null
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          barber_slug: string
          client_id: string | null
          created_at: string
          date_iso: string
          id: string
          time: string
        }
        Insert: {
          barber_slug: string
          client_id?: string | null
          created_at?: string
          date_iso: string
          id?: string
          time: string
        }
        Update: {
          barber_slug?: string
          client_id?: string | null
          created_at?: string
          date_iso?: string
          id?: string
          time?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_pro_page: {
        Args: { _slug: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator" | "support"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user", "moderator", "support"],
    },
  },
} as const
