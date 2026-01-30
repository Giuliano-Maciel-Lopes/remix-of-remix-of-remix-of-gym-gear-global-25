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
      catalog_items: {
        Row: {
          category: Database["public"]["Enums"]["equipment_category"]
          created_at: string
          description: string | null
          hs_code: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          ncm_code: string | null
          sku: string
          unit_cbm: number
          unit_weight_kg: number
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["equipment_category"]
          created_at?: string
          description?: string | null
          hs_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          ncm_code?: string | null
          sku: string
          unit_cbm?: number
          unit_weight_kg?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["equipment_category"]
          created_at?: string
          description?: string | null
          hs_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          ncm_code?: string | null
          sku?: string
          unit_cbm?: number
          unit_weight_kg?: number
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          country: string
          created_at: string
          default_currency: Database["public"]["Enums"]["currency_type"]
          id: string
          is_active: boolean
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          default_currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          default_currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_lines: {
        Row: {
          catalog_item_id: string
          chosen_supplier_id: string
          created_at: string
          id: string
          notes: string | null
          override_price_fob_usd: number | null
          qty: number
          quote_id: string
          updated_at: string
        }
        Insert: {
          catalog_item_id: string
          chosen_supplier_id: string
          created_at?: string
          id?: string
          notes?: string | null
          override_price_fob_usd?: number | null
          qty?: number
          quote_id: string
          updated_at?: string
        }
        Update: {
          catalog_item_id?: string
          chosen_supplier_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          override_price_fob_usd?: number | null
          qty?: number
          quote_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_lines_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_lines_chosen_supplier_id_fkey"
            columns: ["chosen_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_lines_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          container_qty_override: number | null
          container_type: Database["public"]["Enums"]["container_type"]
          created_at: string
          created_by: string | null
          destination_country: Database["public"]["Enums"]["destination_country"]
          fixed_costs_usd: number
          freight_per_container_usd: number
          id: string
          insurance_rate: number
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          container_qty_override?: number | null
          container_type?: Database["public"]["Enums"]["container_type"]
          created_at?: string
          created_by?: string | null
          destination_country?: Database["public"]["Enums"]["destination_country"]
          fixed_costs_usd?: number
          freight_per_container_usd?: number
          id?: string
          insurance_rate?: number
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          container_qty_override?: number | null
          container_type?: Database["public"]["Enums"]["container_type"]
          created_at?: string
          created_by?: string | null
          destination_country?: Database["public"]["Enums"]["destination_country"]
          fixed_costs_usd?: number
          freight_per_container_usd?: number
          id?: string
          insurance_rate?: number
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sku_mapping: {
        Row: {
          catalog_item_id: string | null
          created_at: string
          id: string
          notes: string | null
          supplier_id: string
          supplier_model_code: string
          updated_at: string
        }
        Insert: {
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          supplier_id: string
          supplier_model_code: string
          updated_at?: string
        }
        Update: {
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          supplier_id?: string
          supplier_model_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sku_mapping_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sku_mapping_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_prices: {
        Row: {
          catalog_item_id: string
          created_at: string
          currency_original: Database["public"]["Enums"]["currency_type"]
          id: string
          moq: number | null
          price_fob_usd: number
          price_original: number
          supplier_id: string
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          catalog_item_id: string
          created_at?: string
          currency_original?: Database["public"]["Enums"]["currency_type"]
          id?: string
          moq?: number | null
          price_fob_usd: number
          price_original: number
          supplier_id: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          catalog_item_id?: string
          created_at?: string
          currency_original?: Database["public"]["Enums"]["currency_type"]
          id?: string
          moq?: number | null
          price_fob_usd?: number
          price_original?: number
          supplier_id?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_prices_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_prices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          country: string
          created_at: string
          default_currency: Database["public"]["Enums"]["currency_type"]
          id: string
          incoterm_default: Database["public"]["Enums"]["incoterm_type"]
          is_active: boolean
          lead_time_days: number
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          default_currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          incoterm_default?: Database["public"]["Enums"]["incoterm_type"]
          is_active?: boolean
          lead_time_days?: number
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          default_currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          incoterm_default?: Database["public"]["Enums"]["incoterm_type"]
          is_active?: boolean
          lead_time_days?: number
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      container_type: "20FT" | "40FT" | "40HC"
      currency_type: "USD" | "CNY" | "EUR" | "BRL" | "ARS"
      destination_country: "US" | "AR" | "BR"
      equipment_category:
        | "Cardio"
        | "Strength"
        | "Free Weights"
        | "Benches"
        | "Accessories"
        | "Functional"
      incoterm_type: "FOB" | "CIF" | "EXW" | "DDP"
      quote_status: "draft" | "pending" | "approved" | "ordered" | "cancelled"
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
      app_role: ["admin", "user"],
      container_type: ["20FT", "40FT", "40HC"],
      currency_type: ["USD", "CNY", "EUR", "BRL", "ARS"],
      destination_country: ["US", "AR", "BR"],
      equipment_category: [
        "Cardio",
        "Strength",
        "Free Weights",
        "Benches",
        "Accessories",
        "Functional",
      ],
      incoterm_type: ["FOB", "CIF", "EXW", "DDP"],
      quote_status: ["draft", "pending", "approved", "ordered", "cancelled"],
    },
  },
} as const
