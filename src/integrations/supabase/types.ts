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
      accessory_specs: {
        Row: {
          color: string | null
          compatibility: string | null
          created_at: string
          id: string
          material: string | null
          product_id: string
        }
        Insert: {
          color?: string | null
          compatibility?: string | null
          created_at?: string
          id?: string
          material?: string | null
          product_id: string
        }
        Update: {
          color?: string | null
          compatibility?: string | null
          created_at?: string
          id?: string
          material?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accessory_specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          position: number | null
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          link?: string | null
          position?: number | null
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string | null
          position?: number | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      battery_specs: {
        Row: {
          amperage: number | null
          created_at: string
          height_mm: number | null
          id: string
          length_mm: number | null
          product_id: string
          start_power: number | null
          technology: string | null
          terminal_position: string | null
          width_mm: number | null
        }
        Insert: {
          amperage?: number | null
          created_at?: string
          height_mm?: number | null
          id?: string
          length_mm?: number | null
          product_id: string
          start_power?: number | null
          technology?: string | null
          terminal_position?: string | null
          width_mm?: number | null
        }
        Update: {
          amperage?: number | null
          created_at?: string
          height_mm?: number | null
          id?: string
          length_mm?: number | null
          product_id?: string
          start_power?: number | null
          technology?: string | null
          terminal_position?: string | null
          width_mm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "battery_specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_spec_types: {
        Row: {
          category_id: string
          id: string
          spec_type: string
        }
        Insert: {
          category_id: string
          id?: string
          spec_type: string
        }
        Update: {
          category_id?: string
          id?: string
          spec_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_spec_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: true
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          id: string
          invoice_data: Json
          invoice_number: string
          order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_data: Json
          invoice_number: string
          order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_data?: Json
          invoice_number?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanical_specs: {
        Row: {
          assembly_side: string | null
          condition: string | null
          created_at: string
          id: string
          material: string | null
          product_id: string
          system_type: string | null
        }
        Insert: {
          assembly_side?: string | null
          condition?: string | null
          created_at?: string
          id?: string
          material?: string | null
          product_id: string
          system_type?: string | null
        }
        Update: {
          assembly_side?: string | null
          condition?: string | null
          created_at?: string
          id?: string
          material?: string | null
          product_id?: string
          system_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mechanical_specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      oil_specs: {
        Row: {
          capacity: string | null
          created_at: string
          id: string
          manufacturer_norm: string | null
          oil_type: string | null
          product_id: string
          viscosity: string | null
        }
        Insert: {
          capacity?: string | null
          created_at?: string
          id?: string
          manufacturer_norm?: string | null
          oil_type?: string | null
          product_id: string
          viscosity?: string | null
        }
        Update: {
          capacity?: string | null
          created_at?: string
          id?: string
          manufacturer_norm?: string | null
          oil_type?: string | null
          product_id?: string
          viscosity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oil_specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          phone: string | null
          shipping_address: string | null
          shipping_city: string | null
          status: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          phone?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          status?: string
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      product_vehicles: {
        Row: {
          id: string
          product_id: string
          vehicle_id: string
        }
        Insert: {
          id?: string
          product_id: string
          vehicle_id: string
        }
        Update: {
          id?: string
          product_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_vehicles_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_featured: boolean | null
          is_promo: boolean | null
          name: string
          original_price: number | null
          price: number
          reference: string | null
          slug: string
          stock: number
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          is_promo?: boolean | null
          name: string
          original_price?: number | null
          price: number
          reference?: string | null
          slug: string
          stock?: number
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          is_promo?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          reference?: string | null
          slug?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          phone?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          account_enabled: boolean | null
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          currency: string | null
          id: string
          invoice_address: string | null
          invoice_company_name: string | null
          invoice_email: string | null
          invoice_footer_text: string | null
          invoice_phone: string | null
          invoice_siret: string | null
          logo_url: string | null
          maintenance_end_date: string | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          site_name: string | null
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          account_enabled?: boolean | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          currency?: string | null
          id?: string
          invoice_address?: string | null
          invoice_company_name?: string | null
          invoice_email?: string | null
          invoice_footer_text?: string | null
          invoice_phone?: string | null
          invoice_siret?: string | null
          logo_url?: string | null
          maintenance_end_date?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          site_name?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          account_enabled?: boolean | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          currency?: string | null
          id?: string
          invoice_address?: string | null
          invoice_company_name?: string | null
          invoice_email?: string | null
          invoice_footer_text?: string | null
          invoice_phone?: string | null
          invoice_siret?: string | null
          logo_url?: string | null
          maintenance_end_date?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          site_name?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      tire_specs: {
        Row: {
          created_at: string
          diameter: number | null
          height: number | null
          id: string
          load_index: string | null
          product_id: string
          runflat: boolean | null
          season: string | null
          speed_index: string | null
          width: number | null
        }
        Insert: {
          created_at?: string
          diameter?: number | null
          height?: number | null
          id?: string
          load_index?: string | null
          product_id: string
          runflat?: boolean | null
          season?: string | null
          speed_index?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string
          diameter?: number | null
          height?: number | null
          id?: string
          load_index?: string | null
          product_id?: string
          runflat?: boolean | null
          season?: string | null
          speed_index?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tire_specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          created_at: string
          engine: string | null
          id: string
          model: string
          year: number
        }
        Insert: {
          brand: string
          created_at?: string
          engine?: string | null
          id?: string
          model: string
          year: number
        }
        Update: {
          brand?: string
          created_at?: string
          engine?: string | null
          id?: string
          model?: string
          year?: number
        }
        Relationships: []
      }
      whatsapp_numbers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string | null
          phone_number: string
          position: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          phone_number: string
          position?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          phone_number?: string
          position?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
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
      app_role: ["admin", "user", "moderator"],
    },
  },
} as const
