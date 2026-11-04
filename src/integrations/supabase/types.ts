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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          id: string
          message: string
          recipients: number
          sent_by: string | null
          target_country: string | null
          target_role: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          recipients?: number
          sent_by?: string | null
          target_country?: string | null
          target_role?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          recipients?: number
          sent_by?: string | null
          target_country?: string | null
          target_role?: string | null
          title?: string
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          callee_role: string
          caller_id: string
          caller_role: string
          created_at: string
          id: string
          order_id: string
        }
        Insert: {
          callee_role: string
          caller_id: string
          caller_role: string
          created_at?: string
          id?: string
          order_id: string
        }
        Update: {
          callee_role?: string
          caller_id?: string
          caller_role?: string
          created_at?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          body: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          thread_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          counterpart_id: string | null
          created_at: string
          customer_id: string
          id: string
          kind: string
          last_message_at: string
          order_id: string | null
          updated_at: string
        }
        Insert: {
          counterpart_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          kind: string
          last_message_at?: string
          order_id?: string | null
          updated_at?: string
        }
        Update: {
          counterpart_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          kind?: string
          last_message_at?: string
          order_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_counterpart_id_fkey"
            columns: ["counterpart_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country: string
          created_at: string
          delivery_fee_override: number | null
          enabled: boolean
          id: string
          lat: number
          lng: number
          name: string
          sort: number
        }
        Insert: {
          country: string
          created_at?: string
          delivery_fee_override?: number | null
          enabled?: boolean
          id?: string
          lat?: number
          lng?: number
          name: string
          sort?: number
        }
        Update: {
          country?: string
          created_at?: string
          delivery_fee_override?: number | null
          enabled?: boolean
          id?: string
          lat?: number
          lng?: number
          name?: string
          sort?: number
        }
        Relationships: []
      }
      country_pricing: {
        Row: {
          commission_pct: number
          country: string
          currency: string
          delivery_fee: number
          driver_payout_fixed: number
          driver_payout_pct: number
          enabled: boolean
          min_order: number
          package_base_fee: number
          package_min_fee: number
          package_per_km: number
          service_fee: number
          updated_at: string
        }
        Insert: {
          commission_pct?: number
          country: string
          currency: string
          delivery_fee?: number
          driver_payout_fixed?: number
          driver_payout_pct?: number
          enabled?: boolean
          min_order?: number
          package_base_fee?: number
          package_min_fee?: number
          package_per_km?: number
          service_fee?: number
          updated_at?: string
        }
        Update: {
          commission_pct?: number
          country?: string
          currency?: string
          delivery_fee?: number
          driver_payout_fixed?: number
          driver_payout_pct?: number
          enabled?: boolean
          min_order?: number
          package_base_fee?: number
          package_min_fee?: number
          package_per_km?: number
          service_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      driver_cash_payouts: {
        Row: {
          amount: number
          currency: string
          driver_id: string
          id: string
          paid_at: string
          paid_by: string
          reference: string
          request_id: string
        }
        Insert: {
          amount: number
          currency: string
          driver_id: string
          id?: string
          paid_at?: string
          paid_by: string
          reference: string
          request_id: string
        }
        Update: {
          amount?: number
          currency?: string
          driver_id?: string
          id?: string
          paid_at?: string
          paid_by?: string
          reference?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_cash_payouts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          created_at: string
          doc_type: string
          driver_id: string
          expires_on: string | null
          file_path: string
          id: string
          review_note: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doc_type: string
          driver_id: string
          expires_on?: string | null
          file_path: string
          id?: string
          review_note?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          driver_id?: string
          expires_on?: string | null
          file_path?: string
          id?: string
          review_note?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_locations: {
        Row: {
          driver_id: string
          lat: number
          lng: number
          updated_at: string
        }
        Insert: {
          driver_id: string
          lat: number
          lng: number
          updated_at?: string
        }
        Update: {
          driver_id?: string
          lat?: number
          lng?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          country: string | null
          created_at: string
          docs_status: string
          existing_customer: boolean
          id: string
          plate: string | null
          status: string
          submitted_at: string | null
          terms_accepted_at: string | null
          vehicle_model: string | null
          vehicle_type: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          docs_status?: string
          existing_customer?: boolean
          id: string
          plate?: string | null
          status?: string
          submitted_at?: string | null
          terms_accepted_at?: string | null
          vehicle_model?: string | null
          vehicle_type?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          docs_status?: string
          existing_customer?: boolean
          id?: string
          plate?: string | null
          status?: string
          submitted_at?: string | null
          terms_accepted_at?: string | null
          vehicle_model?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available: boolean
          category: string
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          restaurant_id: string
        }
        Insert: {
          available?: boolean
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          restaurant_id: string
        }
        Update: {
          available?: boolean
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          related_order_id: string | null
          sound: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          related_order_id?: string | null
          sound?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          related_order_id?: string | null
          sound?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_admin_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          order_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          order_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_admin_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_contacts: {
        Row: {
          created_at: string
          order_id: string
          recipient_phone: string | null
        }
        Insert: {
          created_at?: string
          order_id: string
          recipient_phone?: string | null
        }
        Update: {
          created_at?: string
          order_id?: string
          recipient_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_contacts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_disputes: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          kind: string
          order_id: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          kind?: string
          order_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          kind?: string
          order_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          order_id: string
          price?: number
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          address: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          cash_settled_at: string | null
          cash_settled_by: string | null
          country: string | null
          created_at: string
          currency: string
          customer_id: string
          delivered_at: string | null
          delivery_fee: number
          dest_lat: number | null
          dest_lng: number | null
          discount: number
          driver_id: string | null
          driver_payout: number
          eta_minutes: number
          id: string
          kind: string
          note: string | null
          package_note: string | null
          payment_method: string
          payment_reference: string | null
          payment_status: string
          picked_up_at: string | null
          pickup_address: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          preparing_at: string | null
          promo_code: string | null
          ready_at: string | null
          refund_amount: number
          refund_status: string | null
          restaurant_id: string | null
          service_fee: number
          status: string
          subtotal: number
          total: number
        }
        Insert: {
          accepted_at?: string | null
          address?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cash_settled_at?: string | null
          cash_settled_by?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          customer_id: string
          delivered_at?: string | null
          delivery_fee?: number
          dest_lat?: number | null
          dest_lng?: number | null
          discount?: number
          driver_id?: string | null
          driver_payout?: number
          eta_minutes?: number
          id?: string
          kind?: string
          note?: string | null
          package_note?: string | null
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          picked_up_at?: string | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          preparing_at?: string | null
          promo_code?: string | null
          ready_at?: string | null
          refund_amount?: number
          refund_status?: string | null
          restaurant_id?: string | null
          service_fee?: number
          status?: string
          subtotal?: number
          total?: number
        }
        Update: {
          accepted_at?: string | null
          address?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cash_settled_at?: string | null
          cash_settled_by?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          delivered_at?: string | null
          delivery_fee?: number
          dest_lat?: number | null
          dest_lng?: number | null
          discount?: number
          driver_id?: string | null
          driver_payout?: number
          eta_minutes?: number
          id?: string
          kind?: string
          note?: string | null
          package_note?: string | null
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          picked_up_at?: string | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          preparing_at?: string | null
          promo_code?: string | null
          ready_at?: string | null
          refund_amount?: number
          refund_status?: string | null
          restaurant_id?: string | null
          service_fee?: number
          status?: string
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          id: number
          late_threshold_minutes: number
          maintenance_message: string
          maintenance_mode: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          late_threshold_minutes?: number
          maintenance_message?: string
          maintenance_mode?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          late_threshold_minutes?: number
          maintenance_message?: string
          maintenance_mode?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      prime_memberships: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          approval_status: string
          avatar_url: string | null
          country: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          language: string | null
          phone: string | null
          preferred_mode: string | null
          suspension_reason: string | null
        }
        Insert: {
          account_status?: string
          approval_status?: string
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          phone?: string | null
          preferred_mode?: string | null
          suspension_reason?: string | null
        }
        Update: {
          account_status?: string
          approval_status?: string
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          preferred_mode?: string | null
          suspension_reason?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          amount: number
          code: string
          country: string | null
          created_at: string
          discount_type: string
          expires_at: string | null
          id: string
          min_order: number
          per_user_limit: number | null
          usage_limit: number | null
          uses: number
        }
        Insert: {
          active?: boolean
          amount: number
          code: string
          country?: string | null
          created_at?: string
          discount_type?: string
          expires_at?: string | null
          id?: string
          min_order?: number
          per_user_limit?: number | null
          usage_limit?: number | null
          uses?: number
        }
        Update: {
          active?: boolean
          amount?: number
          code?: string
          country?: string | null
          created_at?: string
          discount_type?: string
          expires_at?: string | null
          id?: string
          min_order?: number
          per_user_limit?: number | null
          usage_limit?: number | null
          uses?: number
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string | null
          promo_id: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          promo_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          promo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_redemptions_promo_id_fkey"
            columns: ["promo_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address_line: string | null
          city: string | null
          commission_rate: number | null
          country: string | null
          created_at: string
          cuisine: string | null
          delivery_fee: number
          eta_minutes: number
          featured: boolean
          id: string
          is_open: boolean
          logo_url: string | null
          min_order: number
          name: string
          owner_id: string
          postal_code: string | null
          rating: number
          status: string
          tags: string[]
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          commission_rate?: number | null
          country?: string | null
          created_at?: string
          cuisine?: string | null
          delivery_fee?: number
          eta_minutes?: number
          featured?: boolean
          id?: string
          is_open?: boolean
          logo_url?: string | null
          min_order?: number
          name: string
          owner_id: string
          postal_code?: string | null
          rating?: number
          status?: string
          tags?: string[]
        }
        Update: {
          address_line?: string | null
          city?: string | null
          commission_rate?: number | null
          country?: string | null
          created_at?: string
          cuisine?: string | null
          delivery_fee?: number
          eta_minutes?: number
          featured?: boolean
          id?: string
          is_open?: boolean
          logo_url?: string | null
          min_order?: number
          name?: string
          owner_id?: string
          postal_code?: string | null
          rating?: number
          status?: string
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          driver_id: string | null
          driver_rating: number | null
          id: string
          order_id: string
          restaurant_id: string
          restaurant_rating: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          driver_id?: string | null
          driver_rating?: number | null
          id?: string
          order_id: string
          restaurant_id: string
          restaurant_rating: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          driver_id?: string | null
          driver_rating?: number | null
          id?: string
          order_id?: string
          restaurant_id?: string
          restaurant_rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_add_note: {
        Args: { _body: string; _order: string }
        Returns: undefined
      }
      admin_broadcast: {
        Args: {
          _country?: string
          _message: string
          _role?: string
          _title: string
        }
        Returns: number
      }
      admin_cancel_order: {
        Args: { _order: string; _reason: string }
        Returns: undefined
      }
      admin_cash_payout_summary: { Args: never; Returns: Json }
      admin_flag_order: {
        Args: { _note: string; _order: string }
        Returns: undefined
      }
      admin_force_status: {
        Args: { _order: string; _reason: string; _status: string }
        Returns: undefined
      }
      admin_list_reviews: {
        Args: never
        Returns: {
          comment: string
          created_at: string
          customer_id: string
          driver_rating: number
          id: string
          restaurant_id: string
          restaurant_rating: number
        }[]
      }
      admin_reassign_driver: {
        Args: { _driver: string; _order: string }
        Returns: undefined
      }
      admin_record_driver_cash_payout: {
        Args: {
          _amount: number
          _currency: string
          _driver: string
          _reference: string
          _request: string
        }
        Returns: string
      }
      admin_refund_order: {
        Args: { _amount: number; _order: string; _reason: string }
        Returns: string
      }
      admin_remove_review: {
        Args: { _id: string; _reason: string }
        Returns: undefined
      }
      admin_resolve_dispute: {
        Args: { _id: string; _note: string }
        Returns: undefined
      }
      admin_set_account_status: {
        Args: { _reason: string; _status: string; _user: string }
        Returns: undefined
      }
      admin_set_prime: {
        Args: { _active: boolean; _months?: number; _user: string }
        Returns: undefined
      }
      admin_set_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"]; _user: string }
        Returns: undefined
      }
      anonymize_account: { Args: { _user_id: string }; Returns: undefined }
      call_availability: { Args: { _order: string }; Returns: Json }
      can_access_chat_thread: { Args: { _thread_id: string }; Returns: boolean }
      can_view_chat_file: { Args: { _object_name: string }; Returns: boolean }
      driver_settle_cash: { Args: { _order: string }; Returns: undefined }
      get_call_number: {
        Args: { _order: string; _target: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_driver: { Args: { _id: string }; Returns: boolean }
      open_chat_thread: {
        Args: { _kind: string; _order_id?: string }
        Returns: string
      }
      preview_promo: {
        Args: { _code: string; _country?: string; _subtotal: number }
        Returns: number
      }
      public_restaurants: {
        Args: never
        Returns: {
          city: string
          cuisine: string
          delivery_fee: number
          eta_minutes: number
          featured: boolean
          id: string
          is_open: boolean
          logo_url: string
          name: string
          rating: number
        }[]
      }
      purge_old_call_logs: { Args: never; Returns: undefined }
      start_driver_application: { Args: never; Returns: undefined }
      submit_driver_application: {
        Args: { _accept_terms: boolean }
        Returns: undefined
      }
      switch_account_mode: { Args: { _mode: string }; Returns: undefined }
    }
    Enums: {
      app_role: "customer" | "vendor" | "driver" | "admin" | "support_agent"
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
      app_role: ["customer", "vendor", "driver", "admin", "support_agent"],
    },
  },
} as const
