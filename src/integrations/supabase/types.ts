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
      anomalies: {
        Row: {
          anomaly_type: string
          budget_id: string | null
          combined_score: number
          contract_id: string | null
          created_at: string | null
          description: string
          id: string
          investigated: boolean | null
          investigation_notes: string | null
          ml_score: number
          payment_id: string | null
          rule_score: number
          severity: Database["public"]["Enums"]["anomaly_severity"] | null
          updated_at: string | null
        }
        Insert: {
          anomaly_type: string
          budget_id?: string | null
          combined_score: number
          contract_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          investigated?: boolean | null
          investigation_notes?: string | null
          ml_score: number
          payment_id?: string | null
          rule_score: number
          severity?: Database["public"]["Enums"]["anomaly_severity"] | null
          updated_at?: string | null
        }
        Update: {
          anomaly_type?: string
          budget_id?: string | null
          combined_score?: number
          contract_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          investigated?: boolean | null
          investigation_notes?: string | null
          ml_score?: number
          payment_id?: string | null
          rule_score?: number
          severity?: Database["public"]["Enums"]["anomaly_severity"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anomalies_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["budget_id"]
          },
          {
            foreignKeyName: "anomalies_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "anomalies_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      block_anchors: {
        Row: {
          block_number: number | null
          created_at: string | null
          current_hash: string
          id: string
          prev_hash: string
          record_hash: string
          record_id: string
          record_type: string
          transaction_hash: string | null
        }
        Insert: {
          block_number?: number | null
          created_at?: string | null
          current_hash: string
          id?: string
          prev_hash: string
          record_hash: string
          record_id: string
          record_type: string
          transaction_hash?: string | null
        }
        Update: {
          block_number?: number | null
          created_at?: string | null
          current_hash?: string
          id?: string
          prev_hash?: string
          record_hash?: string
          record_id?: string
          record_type?: string
          transaction_hash?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          activity: string | null
          actual_expenditure: number | null
          allocated_amount: number | null
          budget_id: string
          created_at: string | null
          district: string | null
          fiscal_year: string
          funding_source: string | null
          ministry: string | null
          programme: string | null
          revised_amount: number | null
          sector_id: string | null
          subprogramme: string | null
          updated_at: string | null
        }
        Insert: {
          activity?: string | null
          actual_expenditure?: number | null
          allocated_amount?: number | null
          budget_id?: string
          created_at?: string | null
          district?: string | null
          fiscal_year: string
          funding_source?: string | null
          ministry?: string | null
          programme?: string | null
          revised_amount?: number | null
          sector_id?: string | null
          subprogramme?: string | null
          updated_at?: string | null
        }
        Update: {
          activity?: string | null
          actual_expenditure?: number | null
          allocated_amount?: number | null
          budget_id?: string
          created_at?: string | null
          district?: string | null
          fiscal_year?: string
          funding_source?: string | null
          ministry?: string | null
          programme?: string | null
          revised_amount?: number | null
          sector_id?: string | null
          subprogramme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          id: string
          message_type: string
          metadata: Json | null
          report_id: string
          timestamp: string | null
        }
        Insert: {
          content: string
          id?: string
          message_type: string
          metadata?: Json | null
          report_id: string
          timestamp?: string | null
        }
        Update: {
          content?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          report_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          conversation_data: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          session_token: string | null
          updated_at: string | null
          user_ip: string | null
        }
        Insert: {
          conversation_data?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_token?: string | null
          updated_at?: string | null
          user_ip?: string | null
        }
        Update: {
          conversation_data?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_token?: string | null
          updated_at?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          award_date: string | null
          contract_actual_end_date: string | null
          contract_id: string
          contract_start_date: string | null
          contract_status: string | null
          contract_target_end_date: string | null
          contract_value: number | null
          created_at: string | null
          district: string | null
          performance_rating: number | null
          project_id: string | null
          tender_id: string | null
          updated_at: string | null
          vendor_id: string | null
          vendor_name: string | null
        }
        Insert: {
          award_date?: string | null
          contract_actual_end_date?: string | null
          contract_id?: string
          contract_start_date?: string | null
          contract_status?: string | null
          contract_target_end_date?: string | null
          contract_value?: number | null
          created_at?: string | null
          district?: string | null
          performance_rating?: number | null
          project_id?: string | null
          tender_id?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_name?: string | null
        }
        Update: {
          award_date?: string | null
          contract_actual_end_date?: string | null
          contract_id?: string
          contract_start_date?: string | null
          contract_status?: string | null
          contract_target_end_date?: string | null
          contract_value?: number | null
          created_at?: string | null
          district?: string | null
          performance_rating?: number | null
          project_id?: string | null
          tender_id?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "contracts_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["tender_id"]
          },
          {
            foreignKeyName: "contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      involved_entities: {
        Row: {
          additional_info: Json | null
          created_at: string | null
          id: string
          name: string
          report_id: string
          role: string | null
          type: string
        }
        Insert: {
          additional_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
          report_id: string
          role?: string | null
          type: string
        }
        Update: {
          additional_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          report_id?: string
          role?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "involved_entities_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_paid: number | null
          balance_remaining: number | null
          contract_id: string | null
          created_at: string | null
          district: string | null
          flag_reason: string | null
          payment_date: string | null
          payment_id: string
          payment_reference: string | null
          payment_type: string | null
          project_id: string | null
          review_status: string | null
          risk_score: number | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          balance_remaining?: number | null
          contract_id?: string | null
          created_at?: string | null
          district?: string | null
          flag_reason?: string | null
          payment_date?: string | null
          payment_id?: string
          payment_reference?: string | null
          payment_type?: string | null
          project_id?: string | null
          review_status?: string | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          balance_remaining?: number | null
          contract_id?: string | null
          created_at?: string | null
          district?: string | null
          flag_reason?: string | null
          payment_date?: string | null
          payment_id?: string
          payment_reference?: string | null
          payment_type?: string | null
          project_id?: string | null
          review_status?: string | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      projects: {
        Row: {
          achieved_output: string | null
          activity_description: string | null
          audit_findings_score: number | null
          budget_adherence_score: number | null
          budget_id: string | null
          created_at: string | null
          district: string | null
          monitoring_report: string | null
          output_achievement_score: number | null
          overall_quality_score: number | null
          planned_output: string | null
          procurement_compliance_score: number | null
          project_actual_end_date: string | null
          project_id: string
          project_start_date: string | null
          project_target_end_date: string | null
          status: string | null
          timeliness_score: number | null
          updated_at: string | null
        }
        Insert: {
          achieved_output?: string | null
          activity_description?: string | null
          audit_findings_score?: number | null
          budget_adherence_score?: number | null
          budget_id?: string | null
          created_at?: string | null
          district?: string | null
          monitoring_report?: string | null
          output_achievement_score?: number | null
          overall_quality_score?: number | null
          planned_output?: string | null
          procurement_compliance_score?: number | null
          project_actual_end_date?: string | null
          project_id?: string
          project_start_date?: string | null
          project_target_end_date?: string | null
          status?: string | null
          timeliness_score?: number | null
          updated_at?: string | null
        }
        Update: {
          achieved_output?: string | null
          activity_description?: string | null
          audit_findings_score?: number | null
          budget_adherence_score?: number | null
          budget_id?: string | null
          created_at?: string | null
          district?: string | null
          monitoring_report?: string | null
          output_achievement_score?: number | null
          overall_quality_score?: number | null
          planned_output?: string | null
          procurement_compliance_score?: number | null
          project_actual_end_date?: string | null
          project_id?: string
          project_start_date?: string | null
          project_target_end_date?: string | null
          status?: string | null
          timeliness_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["budget_id"]
          },
        ]
      }
      report_attributes: {
        Row: {
          attribute_key: string
          attribute_value: string
          created_at: string | null
          id: string
          report_id: string
        }
        Insert: {
          attribute_key: string
          attribute_value: string
          created_at?: string | null
          id?: string
          report_id: string
        }
        Update: {
          attribute_key?: string
          attribute_value?: string
          created_at?: string | null
          id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_attributes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_evidence: {
        Row: {
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          report_id: string
          storage_path: string
          uploaded_at: string | null
        }
        Insert: {
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          report_id: string
          storage_path: string
          uploaded_at?: string | null
        }
        Update: {
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          report_id?: string
          storage_path?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_evidence_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          assigned_auditor: string | null
          auditor_notes: string | null
          contact_info: Json | null
          created_at: string | null
          detailed_description: string | null
          estimated_amount_range: string | null
          follow_up_allowed: boolean | null
          id: string
          priority_level: number | null
          public_id: string
          source_of_info: string
          status: Database["public"]["Enums"]["report_status"] | null
          summary: string
          updated_at: string | null
        }
        Insert: {
          assigned_auditor?: string | null
          auditor_notes?: string | null
          contact_info?: Json | null
          created_at?: string | null
          detailed_description?: string | null
          estimated_amount_range?: string | null
          follow_up_allowed?: boolean | null
          id?: string
          priority_level?: number | null
          public_id?: string
          source_of_info: string
          status?: Database["public"]["Enums"]["report_status"] | null
          summary: string
          updated_at?: string | null
        }
        Update: {
          assigned_auditor?: string | null
          auditor_notes?: string | null
          contact_info?: Json | null
          created_at?: string | null
          detailed_description?: string | null
          estimated_amount_range?: string | null
          follow_up_allowed?: boolean | null
          id?: string
          priority_level?: number | null
          public_id?: string
          source_of_info?: string
          status?: Database["public"]["Enums"]["report_status"] | null
          summary?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_assigned_auditor_fkey"
            columns: ["assigned_auditor"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tenders: {
        Row: {
          award_date: string | null
          created_at: string | null
          district: string | null
          estimated_value: number | null
          procurement_method: string | null
          project_id: string | null
          tender_close_date: string | null
          tender_description: string | null
          tender_id: string
          tender_issue_date: string | null
          tender_status: string | null
          tender_title: string | null
          updated_at: string | null
        }
        Insert: {
          award_date?: string | null
          created_at?: string | null
          district?: string | null
          estimated_value?: number | null
          procurement_method?: string | null
          project_id?: string | null
          tender_close_date?: string | null
          tender_description?: string | null
          tender_id?: string
          tender_issue_date?: string | null
          tender_status?: string | null
          tender_title?: string | null
          updated_at?: string | null
        }
        Update: {
          award_date?: string | null
          created_at?: string | null
          district?: string | null
          estimated_value?: number | null
          procurement_method?: string | null
          project_id?: string | null
          tender_close_date?: string | null
          tender_description?: string | null
          tender_id?: string
          tender_issue_date?: string | null
          tender_status?: string | null
          tender_title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Insert: {
          created_at?: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          username?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          contact_info: Json | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      setup_demo_user: {
        Args: {
          user_email: string
          user_id: string
          user_role: string
          user_username: string
        }
        Returns: undefined
      }
    }
    Enums: {
      anomaly_severity: "low" | "medium" | "high" | "critical"
      report_status: "new" | "investigating" | "resolved" | "dismissed"
      user_role: "auditor" | "procurement"
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
      anomaly_severity: ["low", "medium", "high", "critical"],
      report_status: ["new", "investigating", "resolved", "dismissed"],
      user_role: ["auditor", "procurement"],
    },
  },
} as const
