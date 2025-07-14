export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instanciate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "12.2.3 (519615d)"
    }
    public: {
        Tables: {
            booking_forms: {
                Row: {
                    booking_id: string
                    completed_at: string | null
                    completed_by: string | null
                    created_at: string
                    customer_signature: string | null
                    damages: Json | null
                    form_type: string
                    fuel_level: number | null
                    id: string
                    inspector_notes: string | null
                    inspector_signature: string | null
                    mileage_reading: number | null
                    photos: Json | null
                    vehicle_condition: Json | null
                }
                Insert: {
                    booking_id: string
                    completed_at?: string | null
                    completed_by?: string | null
                    created_at?: string
                    customer_signature?: string | null
                    damages?: Json | null
                    form_type: string
                    fuel_level?: number | null
                    id?: string
                    inspector_notes?: string | null
                    inspector_signature?: string | null
                    mileage_reading?: number | null
                    photos?: Json | null
                    vehicle_condition?: Json | null
                }
                Update: {
                    booking_id?: string
                    completed_at?: string | null
                    completed_by?: string | null
                    created_at?: string
                    customer_signature?: string | null
                    damages?: Json | null
                    form_type?: string
                    fuel_level?: number | null
                    id?: string
                    inspector_notes?: string | null
                    inspector_signature?: string | null
                    mileage_reading?: number | null
                    photos?: Json | null
                    vehicle_condition?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "booking_forms_booking_id_fkey"
                        columns: ["booking_id"]
                        isOneToOne: false
                        referencedRelation: "bookings"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "booking_forms_completed_by_fkey"
                        columns: ["completed_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            bookings: {
                Row: {
                    booking_type: string
                    created_at: string
                    created_by: string | null
                    customer_id: string
                    daily_rate: number
                    dropoff_location: string
                    duration_days: number
                    end_date: string
                    end_time: string | null
                    id: string
                    notes: string | null
                    pending_expires_at: string | null
                    pickup_location: string
                    start_date: string
                    start_time: string | null
                    status: Database["public"]["Enums"]["booking_status"]
                    total_amount: number
                    updated_at: string
                    vehicle_id: string
                }
                Insert: {
                    booking_type?: string
                    created_at?: string
                    created_by?: string | null
                    customer_id: string
                    daily_rate: number
                    dropoff_location: string
                    duration_days: number
                    end_date: string
                    end_time?: string | null
                    id?: string
                    notes?: string | null
                    pending_expires_at?: string | null
                    pickup_location: string
                    start_date: string
                    start_time?: string | null
                    status?: Database["public"]["Enums"]["booking_status"]
                    total_amount: number
                    updated_at?: string
                    vehicle_id: string
                }
                Update: {
                    booking_type?: string
                    created_at?: string
                    created_by?: string | null
                    customer_id?: string
                    daily_rate?: number
                    dropoff_location?: string
                    duration_days?: number
                    end_date?: string
                    end_time?: string | null
                    id?: string
                    notes?: string | null
                    pending_expires_at?: string | null
                    pickup_location?: string
                    start_date?: string
                    start_time?: string | null
                    status?: Database["public"]["Enums"]["booking_status"]
                    total_amount?: number
                    updated_at?: string
                    vehicle_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "bookings_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_vehicle_id_fkey"
                        columns: ["vehicle_id"]
                        isOneToOne: false
                        referencedRelation: "vehicles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            contract_templates: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    is_active: boolean
                    is_current_version: boolean
                    name: string
                    template_content: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    is_active?: boolean
                    is_current_version?: boolean
                    name: string
                    template_content: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    is_active?: boolean
                    is_current_version?: boolean
                    name?: string
                    template_content?: string
                    updated_at?: string
                }
                Relationships: []
            }
            contract_template_versions: {
                Row: {
                    id: string
                    template_id: string
                    content: string
                    created_at: string
                    is_current_version: boolean
                    title: string
                    description: string
                }
                Insert: {
                    id?: string
                    template_id: string
                    content: string
                    created_at?: string
                    is_current_version?: boolean
                    title: string
                    description: string
                }
                Update: {
                    id?: string
                    template_id?: string
                    content?: string
                    created_at?: string
                    is_current_version?: boolean
                    title?: string
                    description?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "contract_template_versions_template_id_fkey"
                        columns: ["template_id"]
                        isOneToOne: false
                        referencedRelation: "contract_templates"
                        referencedColumns: ["id"]
                    }
                ]
            }
            customer_documents: {
                Row: {
                    created_at: string
                    customer_id: string
                    document_name: string
                    document_type: string
                    file_size: number | null
                    file_url: string
                    id: string
                    mime_type: string | null
                    uploaded_by: string | null
                }
                Insert: {
                    created_at?: string
                    customer_id: string
                    document_name: string
                    document_type: string
                    file_size?: number | null
                    file_url: string
                    id?: string
                    mime_type?: string | null
                    uploaded_by?: string | null
                }
                Update: {
                    created_at?: string
                    customer_id?: string
                    document_name?: string
                    document_type?: string
                    file_size?: number | null
                    file_url?: string
                    id?: string
                    mime_type?: string | null
                    uploaded_by?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "customer_documents_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "customer_documents_uploaded_by_fkey"
                        columns: ["uploaded_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            customers: {
                Row: {
                    created_at: string
                    date_of_birth: string | null
                    email: string | null
                    id: string
                    license_expiry: string
                    license_number: string
                    license_status: string
                    name: string
                    notes: string | null
                    phone: string
                    profile_id: string | null
                    status: string
                    total_bookings: number
                    total_spent: number
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    date_of_birth?: string | null
                    email?: string | null
                    id?: string
                    license_expiry: string
                    license_number: string
                    license_status?: string
                    name: string
                    notes?: string | null
                    phone: string
                    profile_id?: string | null
                    status?: string
                    total_bookings?: number
                    total_spent?: number
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    date_of_birth?: string | null
                    email?: string | null
                    id?: string
                    license_expiry?: string
                    license_number?: string
                    license_status?: string
                    name?: string
                    notes?: string | null
                    phone?: string
                    profile_id?: string | null
                    status?: string
                    total_bookings?: number
                    total_spent?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "customers_profile_id_fkey"
                        columns: ["profile_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            locations: {
                Row: {
                    address: string
                    created_at: string
                    id: string
                    name: string
                    status: string
                    updated_at: string
                }
                Insert: {
                    address: string
                    created_at?: string
                    id?: string
                    name: string
                    status?: string
                    updated_at?: string
                }
                Update: {
                    address?: string
                    created_at?: string
                    id?: string
                    name?: string
                    status?: string
                    updated_at?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    created_at: string
                    email: string
                    first_name: string | null
                    id: string
                    is_suspended: boolean
                    last_name: string | null
                    role: Database["public"]["Enums"]["app_role"]
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    email: string
                    first_name?: string | null
                    id: string
                    is_suspended?: boolean
                    last_name?: string | null
                    role?: Database["public"]["Enums"]["app_role"]
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    email?: string
                    first_name?: string | null
                    id?: string
                    is_suspended?: boolean
                    last_name?: string | null
                    role?: Database["public"]["Enums"]["app_role"]
                    updated_at?: string
                }
                Relationships: []
            }
            system_settings: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    setting_key: string
                    setting_value: Json
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    setting_key: string
                    setting_value: Json
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    setting_key?: string
                    setting_value?: Json
                    updated_at?: string
                }
                Relationships: []
            }
            vehicle_categories: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                    updated_at?: string
                }
                Relationships: []
            }
            vehicle_images: {
                Row: {
                    created_at: string
                    display_order: number
                    id: string
                    image_url: string
                    is_default: boolean
                    vehicle_id: string
                }
                Insert: {
                    created_at?: string
                    display_order?: number
                    id?: string
                    image_url: string
                    is_default?: boolean
                    vehicle_id: string
                }
                Update: {
                    created_at?: string
                    display_order?: number
                    id?: string
                    image_url?: string
                    is_default?: boolean
                    vehicle_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "vehicle_images_vehicle_id_fkey"
                        columns: ["vehicle_id"]
                        isOneToOne: false
                        referencedRelation: "vehicles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            vehicles: {
                Row: {
                    brand: string
                    category_id: string | null
                    color: string
                    created_at: string
                    description: string | null
                    fuel_type: Database["public"]["Enums"]["fuel_type"]
                    id: string
                    license_plate: string
                    location: string
                    mileage: number
                    model: string
                    price: number
                    seats: number
                    status: Database["public"]["Enums"]["vehicle_status"]
                    transmission: Database["public"]["Enums"]["transmission_type"]
                    updated_at: string
                    year: number
                }
                Insert: {
                    brand: string
                    category_id?: string | null
                    color: string
                    created_at?: string
                    description?: string | null
                    fuel_type?: Database["public"]["Enums"]["fuel_type"]
                    id?: string
                    license_plate: string
                    location: string
                    mileage?: number
                    model: string
                    price: number
                    seats: number
                    status?: Database["public"]["Enums"]["vehicle_status"]
                    transmission?: Database["public"]["Enums"]["transmission_type"]
                    updated_at?: string
                    year: number
                }
                Update: {
                    brand?: string
                    category_id?: string | null
                    color?: string
                    created_at?: string
                    description?: string | null
                    fuel_type?: Database["public"]["Enums"]["fuel_type"]
                    id?: string
                    license_plate?: string
                    location?: string
                    mileage?: number
                    model?: string
                    price?: number
                    seats?: number
                    status?: Database["public"]["Enums"]["vehicle_status"]
                    transmission?: Database["public"]["Enums"]["transmission_type"]
                    updated_at?: string
                    year?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "vehicles_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "vehicle_categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            calculate_booking_total: {
                Args: { p_daily_rate: number; p_start_date: string; p_end_date: string }
                Returns: number
            }
            cancel_expired_pending_bookings: {
                Args: Record<PropertyKey, never>
                Returns: undefined
            }
            check_vehicle_availability: {
                Args: {
                    p_vehicle_id: string
                    p_start_date: string
                    p_end_date: string
                    p_exclude_booking_id?: string
                }
                Returns: boolean
            }
            generate_contract_number: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            has_role: {
                Args: {
                    _user_id: string
                    _role: Database["public"]["Enums"]["app_role"]
                }
                Returns: boolean
            }
            restore_contract_version: {
                Args: {
                    template_id: string
                    version_id: string
                }
                Returns: undefined
            }
            create_new_template_version: {
                Args: {
                    template_id: string
                    new_name: string
                    new_description: string | null
                    new_content: string
                    new_is_active: boolean
                }
                Returns: {
                    id: string
                    name: string
                    description: string | null
                    template_content: string
                    is_active: boolean
                    is_current_version: boolean
                    created_at: string
                    updated_at: string
                }[]
            }
        }
        Enums: {
            app_role: "customer" | "admin"
            booking_status:
                | "pending"
                | "confirmed"
                | "active"
                | "completed"
                | "canceled"
            fuel_type: "gasoline" | "diesel" | "electric" | "hybrid"
            transmission_type: "manual" | "automatic"
            vehicle_status: "active" | "rented" | "maintenance" | "inactive"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
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
    DefaultSchemaTableNameOrOptions extends | keyof DefaultSchema["Tables"]
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
    DefaultSchemaTableNameOrOptions extends | keyof DefaultSchema["Tables"]
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
    DefaultSchemaEnumNameOrOptions extends | keyof DefaultSchema["Enums"]
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
    PublicCompositeTypeNameOrOptions extends | keyof DefaultSchema["CompositeTypes"]
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
            app_role: ["customer", "admin"],
            booking_status: [
                "pending",
                "confirmed",
                "active",
                "completed",
                "canceled",
            ],
            fuel_type: ["gasoline", "diesel", "electric", "hybrid"],
            transmission_type: ["manual", "automatic"],
            vehicle_status: ["active", "rented", "maintenance", "inactive"],
        },
    },
} as const
