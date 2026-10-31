
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {

  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "audit_events": {
                  Row: {
                    "action": string,"actor_id": string,"after_data": Json | null,"before_data": Json | null,"congregation_id": string | null,"entity": string,"entity_id": string,"id": string,"occurred_at": string,"reason": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id": string,"after_data"?: Json | null,"before_data"?: Json | null,"congregation_id"?: string | null,"entity": string,"entity_id": string,"id"?: string,"occurred_at"?: string,"reason"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string,"after_data"?: Json | null,"before_data"?: Json | null,"congregation_id"?: string | null,"entity"?: string,"entity_id"?: string,"id"?: string,"occurred_at"?: string,"reason"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_events_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"congregations": {
                  Row: {
                    "active": boolean,"city": string,"created_at": string,"id": string,"is_headquarters": boolean,"leader_name": string | null,"name": string,"organization_level": Database["public"]['Enums']["congregation_level"],"organization_type": string,"parent_id": string | null,"state": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"city": string,"created_at"?: string,"id"?: string,"is_headquarters"?: boolean,"leader_name"?: string | null,"name": string,"organization_level"?: Database["public"]['Enums']["congregation_level"],"organization_type"?: string,"parent_id"?: string | null,"state"?: string | null
                  }
                  Update: {
                    "active"?: boolean,"city"?: string,"created_at"?: string,"id"?: string,"is_headquarters"?: boolean,"leader_name"?: string | null,"name"?: string,"organization_level"?: Database["public"]['Enums']["congregation_level"],"organization_type"?: string,"parent_id"?: string | null,"state"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "congregations_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"documents": {
                  Row: {
                    "congregation_id": string,"content_type": string,"created_at": string,"entity_id": string,"entity_type": Database["public"]['Enums']["document_entity"],"file_name": string,"id": string,"storage_path": string,"uploaded_by": string
                  }
                  ComputedFields: never
                  Insert: {
                    "congregation_id": string,"content_type": string,"created_at"?: string,"entity_id": string,"entity_type": Database["public"]['Enums']["document_entity"],"file_name": string,"id"?: string,"storage_path": string,"uploaded_by": string
                  }
                  Update: {
                    "congregation_id"?: string,"content_type"?: string,"created_at"?: string,"entity_id"?: string,"entity_type"?: Database["public"]['Enums']["document_entity"],"file_name"?: string,"id"?: string,"storage_path"?: string,"uploaded_by"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "documents_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"entries": {
                  Row: {
                    "amount_cents": number,"category": string,"congregation_id": string,"created_at": string,"id": string,"is_internal_transfer": boolean,"occurred_on": string,"origin": string,"payment_method": string,"purpose": string | null,"receipt_id": string | null,"recorded_by": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"category": string,"congregation_id": string,"created_at"?: string,"id"?: string,"is_internal_transfer"?: boolean,"occurred_on": string,"origin": string,"payment_method": string,"purpose"?: string | null,"receipt_id"?: string | null,"recorded_by": string
                  }
                  Update: {
                    "amount_cents"?: number,"category"?: string,"congregation_id"?: string,"created_at"?: string,"id"?: string,"is_internal_transfer"?: boolean,"occurred_on"?: string,"origin"?: string,"payment_method"?: string,"purpose"?: string | null,"receipt_id"?: string | null,"recorded_by"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "entries_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"expenses": {
                  Row: {
                    "amount_cents": number,"approved_at": string | null,"approved_by": string | null,"category": string,"congregation_id": string,"cost_center": string | null,"created_at": string,"description": string,"id": string,"is_internal_transfer": boolean,"occurred_on": string,"payment_method": string,"purpose": string | null,"receipt_id": string | null,"recorded_by": string,"status": Database["public"]['Enums']["expense_status"],"vendor": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"approved_at"?: string | null,"approved_by"?: string | null,"category": string,"congregation_id": string,"cost_center"?: string | null,"created_at"?: string,"description": string,"id"?: string,"is_internal_transfer"?: boolean,"occurred_on": string,"payment_method": string,"purpose"?: string | null,"receipt_id"?: string | null,"recorded_by": string,"status"?: Database["public"]['Enums']["expense_status"],"vendor"?: string | null
                  }
                  Update: {
                    "amount_cents"?: number,"approved_at"?: string | null,"approved_by"?: string | null,"category"?: string,"congregation_id"?: string,"cost_center"?: string | null,"created_at"?: string,"description"?: string,"id"?: string,"is_internal_transfer"?: boolean,"occurred_on"?: string,"payment_method"?: string,"purpose"?: string | null,"receipt_id"?: string | null,"recorded_by"?: string,"status"?: Database["public"]['Enums']["expense_status"],"vendor"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "expenses_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"financial_adjustments": {
                  Row: {
                    "amount_cents": number,"congregation_id": string,"created_at": string,"created_by": string,"entity_id": string,"entity_type": string,"id": string,"idempotency_key": string,"reason": string,"reference_period": string,"status": Database["public"]['Enums']["correction_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"congregation_id": string,"created_at"?: string,"created_by": string,"entity_id": string,"entity_type": string,"id"?: string,"idempotency_key": string,"reason": string,"reference_period": string,"status"?: Database["public"]['Enums']["correction_status"]
                  }
                  Update: {
                    "amount_cents"?: number,"congregation_id"?: string,"created_at"?: string,"created_by"?: string,"entity_id"?: string,"entity_type"?: string,"id"?: string,"idempotency_key"?: string,"reason"?: string,"reference_period"?: string,"status"?: Database["public"]['Enums']["correction_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "financial_adjustments_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"financial_reversals": {
                  Row: {
                    "amount_cents": number,"congregation_id": string,"created_at": string,"created_by": string,"entity_id": string,"entity_type": string,"id": string,"idempotency_key": string,"reason": string,"reference_period": string,"status": Database["public"]['Enums']["correction_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"congregation_id": string,"created_at"?: string,"created_by": string,"entity_id": string,"entity_type": string,"id"?: string,"idempotency_key": string,"reason": string,"reference_period": string,"status"?: Database["public"]['Enums']["correction_status"]
                  }
                  Update: {
                    "amount_cents"?: number,"congregation_id"?: string,"created_at"?: string,"created_by"?: string,"entity_id"?: string,"entity_type"?: string,"id"?: string,"idempotency_key"?: string,"reason"?: string,"reference_period"?: string,"status"?: Database["public"]['Enums']["correction_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "financial_reversals_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"headquarters_transfers": {
                  Row: {
                    "amount_received_cents": number | null,"amount_sent_cents": number | null,"approved_by": string | null,"created_at": string,"destination_name": string,"id": string,"occurred_on": string | null,"origin_congregation_id": string,"reason": string,"receipt_id": string | null,"reference_period": string,"requested_by": string,"status": Database["public"]['Enums']["transfer_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_received_cents"?: number | null,"amount_sent_cents"?: number | null,"approved_by"?: string | null,"created_at"?: string,"destination_name": string,"id"?: string,"occurred_on"?: string | null,"origin_congregation_id": string,"reason": string,"receipt_id"?: string | null,"reference_period": string,"requested_by": string,"status"?: Database["public"]['Enums']["transfer_status"]
                  }
                  Update: {
                    "amount_received_cents"?: number | null,"amount_sent_cents"?: number | null,"approved_by"?: string | null,"created_at"?: string,"destination_name"?: string,"id"?: string,"occurred_on"?: string | null,"origin_congregation_id"?: string,"reason"?: string,"receipt_id"?: string | null,"reference_period"?: string,"requested_by"?: string,"status"?: Database["public"]['Enums']["transfer_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "headquarters_transfers_origin_congregation_id_fkey"
      columns: ["origin_congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"khatam_licenses": {
                  Row: {
                    "congregation_id": string,"expires_at": string,"seats_total": number
                  }
                  ComputedFields: never
                  Insert: {
                    "congregation_id": string,"expires_at": string,"seats_total": number
                  }
                  Update: {
                    "congregation_id"?: string,"expires_at"?: string,"seats_total"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "khatam_licenses_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: true
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"membership_permission_overrides": {
                  Row: {
                    "audit_read": boolean,"closing_submit": boolean,"congregation_id": string,"financial_approve": boolean,"financial_read": boolean,"financial_write": boolean,"hierarchy_financial_read": boolean,"hierarchy_view": boolean,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "audit_read"?: boolean,"closing_submit"?: boolean,"congregation_id": string,"financial_approve"?: boolean,"financial_read"?: boolean,"financial_write"?: boolean,"hierarchy_financial_read"?: boolean,"hierarchy_view"?: boolean,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "audit_read"?: boolean,"closing_submit"?: boolean,"congregation_id"?: string,"financial_approve"?: boolean,"financial_read"?: boolean,"financial_write"?: boolean,"hierarchy_financial_read"?: boolean,"hierarchy_view"?: boolean,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "membership_permission_overrides_user_id_congregation_id_fkey"
      columns: ["user_id","congregation_id"]
isOneToOne: true
      referencedRelation: "memberships"
      referencedColumns: ["user_id","congregation_id"]
    }
                  ]
                },"memberships": {
                  Row: {
                    "congregation_id": string,"created_at": string,"role": Database["public"]['Enums']["app_role"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "congregation_id": string,"created_at"?: string,"role": Database["public"]['Enums']["app_role"],"user_id": string
                  }
                  Update: {
                    "congregation_id"?: string,"created_at"?: string,"role"?: Database["public"]['Enums']["app_role"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "memberships_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"monthly_closings": {
                  Row: {
                    "adjustments_cents": number,"approved_by": string | null,"closed_at": string | null,"congregation_id": string,"id": string,"opening_balance_cents": number,"reference_period": string,"status": Database["public"]['Enums']["closing_status"],"submitted_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "adjustments_cents"?: number,"approved_by"?: string | null,"closed_at"?: string | null,"congregation_id": string,"id"?: string,"opening_balance_cents"?: number,"reference_period": string,"status"?: Database["public"]['Enums']["closing_status"],"submitted_by"?: string | null
                  }
                  Update: {
                    "adjustments_cents"?: number,"approved_by"?: string | null,"closed_at"?: string | null,"congregation_id"?: string,"id"?: string,"opening_balance_cents"?: number,"reference_period"?: string,"status"?: Database["public"]['Enums']["closing_status"],"submitted_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "monthly_closings_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"period_reopening_requests": {
                  Row: {
                    "approved_at": string | null,"approved_by": string | null,"congregation_id": string,"id": string,"reason": string,"reference_period": string,"requested_at": string,"requested_by": string,"status": Database["public"]['Enums']["reopening_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "approved_at"?: string | null,"approved_by"?: string | null,"congregation_id": string,"id"?: string,"reason": string,"reference_period": string,"requested_at"?: string,"requested_by": string,"status"?: Database["public"]['Enums']["reopening_status"]
                  }
                  Update: {
                    "approved_at"?: string | null,"approved_by"?: string | null,"congregation_id"?: string,"id"?: string,"reason"?: string,"reference_period"?: string,"requested_at"?: string,"requested_by"?: string,"status"?: Database["public"]['Enums']["reopening_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "period_reopening_requests_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"physical_cash_movements": {
                  Row: {
                    "amount_cents": number,"cash_period_id": string,"created_at": string,"created_by": string,"id": string,"idempotency_key": string,"movement_type": Database["public"]['Enums']["cash_movement_type"],"reason": string,"source_entity_id": string | null,"source_entity_type": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"cash_period_id": string,"created_at"?: string,"created_by": string,"id"?: string,"idempotency_key": string,"movement_type": Database["public"]['Enums']["cash_movement_type"],"reason": string,"source_entity_id"?: string | null,"source_entity_type"?: string | null
                  }
                  Update: {
                    "amount_cents"?: number,"cash_period_id"?: string,"created_at"?: string,"created_by"?: string,"id"?: string,"idempotency_key"?: string,"movement_type"?: Database["public"]['Enums']["cash_movement_type"],"reason"?: string,"source_entity_id"?: string | null,"source_entity_type"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "physical_cash_movements_cash_period_id_fkey"
      columns: ["cash_period_id"]
isOneToOne: false
      referencedRelation: "physical_cash_periods"
      referencedColumns: ["id"]
    }
                  ]
                },"physical_cash_periods": {
                  Row: {
                    "cash_register_id": string,"closed_at": string | null,"closed_by": string | null,"counted_at": string | null,"counted_balance_cents": number | null,"counted_by": string | null,"created_at": string,"created_by": string,"divergence_reason": string | null,"id": string,"opening_balance_cents": number,"reference_period": string,"status": Database["public"]['Enums']["cash_period_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "cash_register_id": string,"closed_at"?: string | null,"closed_by"?: string | null,"counted_at"?: string | null,"counted_balance_cents"?: number | null,"counted_by"?: string | null,"created_at"?: string,"created_by": string,"divergence_reason"?: string | null,"id"?: string,"opening_balance_cents": number,"reference_period": string,"status"?: Database["public"]['Enums']["cash_period_status"]
                  }
                  Update: {
                    "cash_register_id"?: string,"closed_at"?: string | null,"closed_by"?: string | null,"counted_at"?: string | null,"counted_balance_cents"?: number | null,"counted_by"?: string | null,"created_at"?: string,"created_by"?: string,"divergence_reason"?: string | null,"id"?: string,"opening_balance_cents"?: number,"reference_period"?: string,"status"?: Database["public"]['Enums']["cash_period_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "physical_cash_periods_cash_register_id_fkey"
      columns: ["cash_register_id"]
isOneToOne: false
      referencedRelation: "physical_cash_registers"
      referencedColumns: ["id"]
    }
                  ]
                },"physical_cash_registers": {
                  Row: {
                    "active": boolean,"congregation_id": string,"created_at": string,"created_by": string,"id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"congregation_id": string,"created_at"?: string,"created_by": string,"id"?: string,"name": string
                  }
                  Update: {
                    "active"?: boolean,"congregation_id"?: string,"created_at"?: string,"created_by"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "physical_cash_registers_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "congregation_monthly_entry_categories": {
                  Row: {
                    "amount_cents": number | null,"category": string,"congregation_id": string,"reference_period": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "entries_congregation_id_fkey"
      columns: ["congregation_id"]
isOneToOne: false
      referencedRelation: "congregations"
      referencedColumns: ["id"]
    }
                  ]
                },"congregation_monthly_summary": {
                  Row: {
                    "adjustments": number | null,"closing_balance": number | null,"closing_status": Database["public"]['Enums']["closing_status"] | null,"congregation_id": string | null,"entries": number | null,"expenses": number | null,"opening_balance": number | null,"reference_period": string | null,"transfers": number | null
                  }
                  ComputedFields: never
                  Relationships: [

                  ]
                }
          }
          Functions: {
            "admin_create_congregation":
{ Args: { "p_actor_id": string,"p_city": string,"p_is_headquarters": boolean,"p_name": string,"p_organization_type": string,"p_parent_id"?: string,"p_state": string }; Returns: {
              "active": boolean,
"city": string,
"created_at": string,
"id": string,
"is_headquarters": boolean,
"leader_name": string | null,
"name": string,
"organization_level": Database["public"]['Enums']["congregation_level"],
"organization_type": string,
"parent_id": string | null,
"state": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "congregations"
        isOneToOne: true
        isSetofReturn: false
      } } |
{ Args: { "p_actor_id": string,"p_city": string,"p_is_headquarters": boolean,"p_name": string,"p_organization_level": Database["public"]['Enums']["congregation_level"],"p_organization_type": string,"p_parent_id": string,"p_state": string }; Returns: {
              "active": boolean,
"city": string,
"created_at": string,
"id": string,
"is_headquarters": boolean,
"leader_name": string | null,
"name": string,
"organization_level": Database["public"]['Enums']["congregation_level"],
"organization_type": string,
"parent_id": string | null,
"state": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "congregations"
        isOneToOne: true
        isSetofReturn: false
      } },
"admin_replace_user_access":
{ Args: { "p_actor_id": string,"p_assignments": Json,"p_user_id": string }; Returns: undefined
                           },
"approve_expense":
{ Args: { "p_expense_id": string }; Returns: {
              "amount_cents": number,
"approved_at": string | null,
"approved_by": string | null,
"category": string,
"congregation_id": string,
"cost_center": string | null,
"created_at": string,
"description": string,
"id": string,
"is_internal_transfer": boolean,
"occurred_on": string,
"payment_method": string,
"purpose": string | null,
"receipt_id": string | null,
"recorded_by": string,
"status": Database["public"]['Enums']["expense_status"],
"vendor": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "expenses"
        isOneToOne: true
        isSetofReturn: false
      } },
"approve_period_reopening":
{ Args: { "p_request_id": string }; Returns: {
              "approved_at": string | null,
"approved_by": string | null,
"congregation_id": string,
"id": string,
"reason": string,
"reference_period": string,
"requested_at": string,
"requested_by": string,
"status": Database["public"]['Enums']["reopening_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "period_reopening_requests"
        isOneToOne: true
        isSetofReturn: false
      } },
"approve_transfer":
{ Args: { "p_transfer_id": string }; Returns: {
              "amount_received_cents": number | null,
"amount_sent_cents": number | null,
"approved_by": string | null,
"created_at": string,
"destination_name": string,
"id": string,
"occurred_on": string | null,
"origin_congregation_id": string,
"reason": string,
"receipt_id": string | null,
"reference_period": string,
"requested_by": string,
"status": Database["public"]['Enums']["transfer_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "headquarters_transfers"
        isOneToOne: true
        isSetofReturn: false
      } },
"close_cash_period":
{ Args: { "p_cash_period_id": string }; Returns: {
              "cash_register_id": string,
"closed_at": string | null,
"closed_by": string | null,
"counted_at": string | null,
"counted_balance_cents": number | null,
"counted_by": string | null,
"created_at": string,
"created_by": string,
"divergence_reason": string | null,
"id": string,
"opening_balance_cents": number,
"reference_period": string,
"status": Database["public"]['Enums']["cash_period_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "physical_cash_periods"
        isOneToOne: true
        isSetofReturn: false
      } },
"close_monthly_period":
{ Args: { "p_congregation_id": string,"p_reference_period": string }; Returns: {
              "adjustments_cents": number,
"approved_by": string | null,
"closed_at": string | null,
"congregation_id": string,
"id": string,
"opening_balance_cents": number,
"reference_period": string,
"status": Database["public"]['Enums']["closing_status"],
"submitted_by": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "monthly_closings"
        isOneToOne: true
        isSetofReturn: false
      } },
"confirm_transfer":
{ Args: { "p_amount_received_cents": number,"p_transfer_id": string }; Returns: {
              "amount_received_cents": number | null,
"amount_sent_cents": number | null,
"approved_by": string | null,
"created_at": string,
"destination_name": string,
"id": string,
"occurred_on": string | null,
"origin_congregation_id": string,
"reason": string,
"receipt_id": string | null,
"reference_period": string,
"requested_by": string,
"status": Database["public"]['Enums']["transfer_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "headquarters_transfers"
        isOneToOne: true
        isSetofReturn: false
      } },
"count_cash":
{ Args: { "p_cash_period_id": string,"p_counted_balance_cents": number,"p_divergence_reason"?: string }; Returns: {
              "cash_register_id": string,
"closed_at": string | null,
"closed_by": string | null,
"counted_at": string | null,
"counted_balance_cents": number | null,
"counted_by": string | null,
"created_at": string,
"created_by": string,
"divergence_reason": string | null,
"id": string,
"opening_balance_cents": number,
"reference_period": string,
"status": Database["public"]['Enums']["cash_period_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "physical_cash_periods"
        isOneToOne: true
        isSetofReturn: false
      } },
"create_cash_register":
{ Args: { "p_congregation_id": string,"p_name": string }; Returns: {
              "active": boolean,
"congregation_id": string,
"created_at": string,
"created_by": string,
"id": string,
"name": string
            }
                          SetofOptions: {
        from: "*"
        to: "physical_cash_registers"
        isOneToOne: true
        isSetofReturn: false
      } },
"create_entry":
{ Args: { "p_amount_cents": number,"p_category": string,"p_congregation_id": string,"p_is_internal_transfer"?: boolean,"p_occurred_on": string,"p_origin": string,"p_payment_method": string,"p_purpose"?: string }; Returns: {
              "amount_cents": number,
"category": string,
"congregation_id": string,
"created_at": string,
"id": string,
"is_internal_transfer": boolean,
"occurred_on": string,
"origin": string,
"payment_method": string,
"purpose": string | null,
"receipt_id": string | null,
"recorded_by": string
            }
                          SetofOptions: {
        from: "*"
        to: "entries"
        isOneToOne: true
        isSetofReturn: false
      } },
"create_expense":
{ Args: { "p_amount_cents": number,"p_category": string,"p_congregation_id": string,"p_cost_center"?: string,"p_description": string,"p_is_internal_transfer"?: boolean,"p_occurred_on": string,"p_payment_method"?: string,"p_purpose"?: string,"p_vendor"?: string }; Returns: {
              "amount_cents": number,
"approved_at": string | null,
"approved_by": string | null,
"category": string,
"congregation_id": string,
"cost_center": string | null,
"created_at": string,
"description": string,
"id": string,
"is_internal_transfer": boolean,
"occurred_on": string,
"payment_method": string,
"purpose": string | null,
"receipt_id": string | null,
"recorded_by": string,
"status": Database["public"]['Enums']["expense_status"],
"vendor": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "expenses"
        isOneToOne: true
        isSetofReturn: false
      } },
"create_financial_adjustment":
{ Args: { "p_amount_cents": number,"p_congregation_id": string,"p_entity_id": string,"p_entity_type": string,"p_idempotency_key": string,"p_reason": string }; Returns: {
              "amount_cents": number,
"congregation_id": string,
"created_at": string,
"created_by": string,
"entity_id": string,
"entity_type": string,
"id": string,
"idempotency_key": string,
"reason": string,
"reference_period": string,
"status": Database["public"]['Enums']["correction_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "financial_adjustments"
        isOneToOne: true
        isSetofReturn: false
      } },
"create_financial_reversal":
{ Args: { "p_congregation_id": string,"p_entity_id": string,"p_entity_type": string,"p_idempotency_key": string,"p_reason": string }; Returns: {
              "amount_cents": number,
"congregation_id": string,
"created_at": string,
"created_by": string,
"entity_id": string,
"entity_type": string,
"id": string,
"idempotency_key": string,
"reason": string,
"reference_period": string,
"status": Database["public"]['Enums']["correction_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "financial_reversals"
        isOneToOne: true
        isSetofReturn: false
      } },
"get_hierarchical_financial_metrics":
{ Args: { "p_end_date": string,"p_mode": string,"p_start_date": string,"p_unit_id": string,"p_user_id": string }; Returns: Json
                           },
"has_congregation_permission":
{ Args: { "target_congregation": string,"target_permission": string }; Returns: boolean
                           },
"has_congregation_role":
{ Args: { "allowed_roles": (Database["public"]['Enums']["app_role"])[],"target_congregation": string }; Returns: boolean
                           },
"is_congregation_member":
{ Args: { "target_congregation": string }; Returns: boolean
                           },
"open_cash_period":
{ Args: { "p_cash_register_id": string,"p_opening_balance_cents": number,"p_reference_period": string }; Returns: {
              "cash_register_id": string,
"closed_at": string | null,
"closed_by": string | null,
"counted_at": string | null,
"counted_balance_cents": number | null,
"counted_by": string | null,
"created_at": string,
"created_by": string,
"divergence_reason": string | null,
"id": string,
"opening_balance_cents": number,
"reference_period": string,
"status": Database["public"]['Enums']["cash_period_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "physical_cash_periods"
        isOneToOne: true
        isSetofReturn: false
      } },
"period_is_closed":
{ Args: { "target_congregation": string,"target_period": string }; Returns: boolean
                           },
"record_cash_movement":
{ Args: { "p_amount_cents": number,"p_cash_period_id": string,"p_idempotency_key": string,"p_movement_type": Database["public"]['Enums']["cash_movement_type"],"p_reason": string }; Returns: {
              "amount_cents": number,
"cash_period_id": string,
"created_at": string,
"created_by": string,
"id": string,
"idempotency_key": string,
"movement_type": Database["public"]['Enums']["cash_movement_type"],
"reason": string,
"source_entity_id": string | null,
"source_entity_type": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "physical_cash_movements"
        isOneToOne: true
        isSetofReturn: false
      } },
"request_period_reopening":
{ Args: { "p_congregation_id": string,"p_reason": string,"p_reference_period": string }; Returns: {
              "approved_at": string | null,
"approved_by": string | null,
"congregation_id": string,
"id": string,
"reason": string,
"reference_period": string,
"requested_at": string,
"requested_by": string,
"status": Database["public"]['Enums']["reopening_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "period_reopening_requests"
        isOneToOne: true
        isSetofReturn: false
      } },
"request_transfer":
{ Args: { "p_amount_sent_cents": number,"p_destination_name": string,"p_occurred_on"?: string,"p_origin_congregation_id": string,"p_reason": string,"p_reference_period": string }; Returns: {
              "amount_received_cents": number | null,
"amount_sent_cents": number | null,
"approved_by": string | null,
"created_at": string,
"destination_name": string,
"id": string,
"occurred_on": string | null,
"origin_congregation_id": string,
"reason": string,
"receipt_id": string | null,
"reference_period": string,
"requested_by": string,
"status": Database["public"]['Enums']["transfer_status"]
            }
                          SetofOptions: {
        from: "*"
        to: "headquarters_transfers"
        isOneToOne: true
        isSetofReturn: false
      } },
"require_authenticated":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"require_open_period":
{ Args: { "target_congregation": string,"target_period": string }; Returns: undefined
                           }
          }
          Enums: {
            "app_role": "central_admin"|"congregation_admin"|"treasurer"|"auditor"|"viewer","cash_movement_type": "cash_in"|"cash_expense"|"withdrawal"|"deposit"|"physical_exit","cash_period_status": "open"|"closed","closing_status": "open"|"submitted"|"approved"|"questioned"|"closed","congregation_level": "national_hq"|"state_hq"|"sub_hq"|"local_congregation","correction_status": "posted"|"reversed","document_entity": "entry"|"expense"|"transfer"|"correction","expense_status": "pending"|"approved"|"rejected"|"reversed","reopening_status": "pending"|"approved"|"rejected","transfer_status": "planned"|"requested"|"approved"|"sent"|"confirmed"|"questioned"|"cancelled"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {

          }
        },"public": {
          Enums: {
            "app_role": ["central_admin", "congregation_admin", "treasurer", "auditor", "viewer"],"cash_movement_type": ["cash_in", "cash_expense", "withdrawal", "deposit", "physical_exit"],"cash_period_status": ["open", "closed"],"closing_status": ["open", "submitted", "approved", "questioned", "closed"],"congregation_level": ["national_hq", "state_hq", "sub_hq", "local_congregation"],"correction_status": ["posted", "reversed"],"document_entity": ["entry", "expense", "transfer", "correction"],"expense_status": ["pending", "approved", "rejected", "reversed"],"reopening_status": ["pending", "approved", "rejected"],"transfer_status": ["planned", "requested", "approved", "sent", "confirmed", "questioned", "cancelled"]
          }
        }
} as const
