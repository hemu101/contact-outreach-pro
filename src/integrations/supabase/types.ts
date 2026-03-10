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
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ads_campaigns: {
        Row: {
          ad_creative: Json | null
          budget: number | null
          clicks: number | null
          cpc: number | null
          created_at: string
          ctr: number | null
          end_date: string | null
          id: string
          impressions: number | null
          name: string
          objective: string | null
          platforms: string[] | null
          reach: number | null
          result_type: string | null
          results: number | null
          spent: number | null
          start_date: string | null
          status: string
          target_audience: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_creative?: Json | null
          budget?: number | null
          clicks?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          name: string
          objective?: string | null
          platforms?: string[] | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_creative?: Json | null
          budget?: number | null
          clicks?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          name?: string
          objective?: string | null
          platforms?: string[] | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_trail: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          action_result: Json | null
          contact_id: string | null
          created_at: string
          error_message: string | null
          id: string
          rule_id: string | null
          status: string | null
          trigger_data: Json | null
          user_id: string
        }
        Insert: {
          action_result?: Json | null
          contact_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          rule_id?: string | null
          status?: string | null
          trigger_data?: Json | null
          user_id: string
        }
        Update: {
          action_result?: Json | null
          contact_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          rule_id?: string | null
          status?: string | null
          trigger_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "company_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_details: {
        Row: {
          billing_address: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          id: string
          phone: string | null
          postal_code: string | null
          state: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_contacts: {
        Row: {
          bounce_type: string | null
          bounced_at: string | null
          campaign_id: string
          clicked_at: string | null
          contact_id: string
          error_message: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
          variant: string | null
        }
        Insert: {
          bounce_type?: string | null
          bounced_at?: string | null
          campaign_id: string
          clicked_at?: string | null
          contact_id: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          variant?: string | null
        }
        Update: {
          bounce_type?: string | null
          bounced_at?: string | null
          campaign_id?: string
          clicked_at?: string | null
          contact_id?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_invitations: {
        Row: {
          brand_user_id: string
          budget_offered: number | null
          campaign_id: string | null
          created_at: string
          creator_id: string | null
          deadline: string | null
          deliverables: Json | null
          id: string
          message: string | null
          responded_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          brand_user_id: string
          budget_offered?: number | null
          campaign_id?: string | null
          created_at?: string
          creator_id?: string | null
          deadline?: string | null
          deliverables?: Json | null
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          brand_user_id?: string
          budget_offered?: number | null
          campaign_id?: string | null
          created_at?: string
          creator_id?: string | null
          deadline?: string | null
          deliverables?: Json | null
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_invitations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ads_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_invitations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_send_logs: {
        Row: {
          campaign_contact_id: string
          campaign_id: string
          created_at: string
          error_code: string | null
          error_message: string | null
          event_type: string
          id: string
          ip_address: string | null
          message_id: string | null
          metadata: Json | null
          provider: string | null
          status: string
          user_agent: string | null
        }
        Insert: {
          campaign_contact_id: string
          campaign_id: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          message_id?: string | null
          metadata?: Json | null
          provider?: string | null
          status: string
          user_agent?: string | null
        }
        Update: {
          campaign_contact_id?: string
          campaign_id?: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          message_id?: string | null
          metadata?: Json | null
          provider?: string | null
          status?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_send_logs_campaign_contact_id_fkey"
            columns: ["campaign_contact_id"]
            isOneToOne: false
            referencedRelation: "campaign_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_send_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_send_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_templates: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          name: string
          sequence_data: Json | null
          steps: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          name: string
          sequence_data?: Json | null
          steps?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          name?: string
          sequence_data?: Json | null
          steps?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          ab_testing_enabled: boolean | null
          click_count: number | null
          completed_at: string | null
          created_at: string
          id: string
          name: string
          open_count: number | null
          optimal_send_hour: number | null
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: string | null
          template_id: string | null
          total_contacts: number | null
          updated_at: string
          use_recipient_timezone: boolean | null
          user_id: string
          variant_a_clicks: number | null
          variant_a_content: string | null
          variant_a_opens: number | null
          variant_a_sent: number | null
          variant_a_subject: string | null
          variant_b_clicks: number | null
          variant_b_content: string | null
          variant_b_opens: number | null
          variant_b_sent: number | null
          variant_b_subject: string | null
        }
        Insert: {
          ab_testing_enabled?: boolean | null
          click_count?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          name: string
          open_count?: number | null
          optimal_send_hour?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          total_contacts?: number | null
          updated_at?: string
          use_recipient_timezone?: boolean | null
          user_id: string
          variant_a_clicks?: number | null
          variant_a_content?: string | null
          variant_a_opens?: number | null
          variant_a_sent?: number | null
          variant_a_subject?: string | null
          variant_b_clicks?: number | null
          variant_b_content?: string | null
          variant_b_opens?: number | null
          variant_b_sent?: number | null
          variant_b_subject?: string | null
        }
        Update: {
          ab_testing_enabled?: boolean | null
          click_count?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string
          open_count?: number | null
          optimal_send_hour?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          total_contacts?: number | null
          updated_at?: string
          use_recipient_timezone?: boolean | null
          user_id?: string
          variant_a_clicks?: number | null
          variant_a_content?: string | null
          variant_a_opens?: number | null
          variant_a_sent?: number | null
          variant_a_subject?: string | null
          variant_b_clicks?: number | null
          variant_b_content?: string | null
          variant_b_opens?: number | null
          variant_b_sent?: number | null
          variant_b_subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_contracts: {
        Row: {
          brand_signature: string | null
          brand_signed_at: string | null
          brand_user_id: string
          cancellation_terms: string | null
          created_at: string
          creator_id: string | null
          creator_signature: string | null
          creator_signed_at: string | null
          deliverables: Json | null
          description: string | null
          end_date: string | null
          exclusivity_clause: string | null
          expires_at: string | null
          id: string
          invitation_id: string | null
          payment_amount: number | null
          payment_currency: string | null
          payment_terms: string | null
          start_date: string | null
          status: string | null
          terms: string
          title: string
          updated_at: string
          usage_rights: string | null
        }
        Insert: {
          brand_signature?: string | null
          brand_signed_at?: string | null
          brand_user_id: string
          cancellation_terms?: string | null
          created_at?: string
          creator_id?: string | null
          creator_signature?: string | null
          creator_signed_at?: string | null
          deliverables?: Json | null
          description?: string | null
          end_date?: string | null
          exclusivity_clause?: string | null
          expires_at?: string | null
          id?: string
          invitation_id?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_terms?: string | null
          start_date?: string | null
          status?: string | null
          terms: string
          title: string
          updated_at?: string
          usage_rights?: string | null
        }
        Update: {
          brand_signature?: string | null
          brand_signed_at?: string | null
          brand_user_id?: string
          cancellation_terms?: string | null
          created_at?: string
          creator_id?: string | null
          creator_signature?: string | null
          creator_signed_at?: string | null
          deliverables?: Json | null
          description?: string | null
          end_date?: string | null
          exclusivity_clause?: string | null
          expires_at?: string | null
          id?: string
          invitation_id?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_terms?: string | null
          start_date?: string | null
          status?: string | null
          terms?: string
          title?: string
          updated_at?: string
          usage_rights?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_contracts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_contracts_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "campaign_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          ad_library_proof: string | null
          annual_revenue: string | null
          average_er: string | null
          company_address: string | null
          company_city: string | null
          company_country: string | null
          company_linkedin_url: string | null
          company_name_for_emails: string | null
          company_phone: string | null
          company_state: string | null
          created_at: string
          d2c_presence: string | null
          description: string | null
          e_commerce_presence: string | null
          email: string | null
          employee_count: number | null
          engagement_score: string | null
          extra_data: Json | null
          extracted_from: string | null
          facebook_url: string | null
          firmographic_score: string | null
          founded: string | null
          hashtags: string | null
          headquarters: string | null
          id: string
          ig_bio: string | null
          ig_followers_count: string | null
          ig_username: string | null
          industry: string | null
          instagram_url: string | null
          integrated_video_urls: string | null
          integrated_videos: string | null
          keywords: string | null
          latest_funding: string | null
          latest_funding_amount: string | null
          linkedin_url: string | null
          logo_url: string | null
          mentions: string | null
          metadata: Json | null
          name: string
          number_of_retail_locations: string | null
          phone: string | null
          phone_from_website: string | null
          pinterest_url: string | null
          segmentation: string | null
          short_description: string | null
          size: string | null
          social_media_presence: string | null
          specialties: string[] | null
          subsidiary_of: string | null
          technologies: string | null
          total_collaborations: string | null
          total_funding: string | null
          total_post_in_3_months: string | null
          twitter_url: string | null
          ugc_example: string | null
          updated_at: string
          user_id: string
          website: string | null
          website_status: string | null
          worked_with_creators: string | null
        }
        Insert: {
          ad_library_proof?: string | null
          annual_revenue?: string | null
          average_er?: string | null
          company_address?: string | null
          company_city?: string | null
          company_country?: string | null
          company_linkedin_url?: string | null
          company_name_for_emails?: string | null
          company_phone?: string | null
          company_state?: string | null
          created_at?: string
          d2c_presence?: string | null
          description?: string | null
          e_commerce_presence?: string | null
          email?: string | null
          employee_count?: number | null
          engagement_score?: string | null
          extra_data?: Json | null
          extracted_from?: string | null
          facebook_url?: string | null
          firmographic_score?: string | null
          founded?: string | null
          hashtags?: string | null
          headquarters?: string | null
          id?: string
          ig_bio?: string | null
          ig_followers_count?: string | null
          ig_username?: string | null
          industry?: string | null
          instagram_url?: string | null
          integrated_video_urls?: string | null
          integrated_videos?: string | null
          keywords?: string | null
          latest_funding?: string | null
          latest_funding_amount?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          mentions?: string | null
          metadata?: Json | null
          name: string
          number_of_retail_locations?: string | null
          phone?: string | null
          phone_from_website?: string | null
          pinterest_url?: string | null
          segmentation?: string | null
          short_description?: string | null
          size?: string | null
          social_media_presence?: string | null
          specialties?: string[] | null
          subsidiary_of?: string | null
          technologies?: string | null
          total_collaborations?: string | null
          total_funding?: string | null
          total_post_in_3_months?: string | null
          twitter_url?: string | null
          ugc_example?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          website_status?: string | null
          worked_with_creators?: string | null
        }
        Update: {
          ad_library_proof?: string | null
          annual_revenue?: string | null
          average_er?: string | null
          company_address?: string | null
          company_city?: string | null
          company_country?: string | null
          company_linkedin_url?: string | null
          company_name_for_emails?: string | null
          company_phone?: string | null
          company_state?: string | null
          created_at?: string
          d2c_presence?: string | null
          description?: string | null
          e_commerce_presence?: string | null
          email?: string | null
          employee_count?: number | null
          engagement_score?: string | null
          extra_data?: Json | null
          extracted_from?: string | null
          facebook_url?: string | null
          firmographic_score?: string | null
          founded?: string | null
          hashtags?: string | null
          headquarters?: string | null
          id?: string
          ig_bio?: string | null
          ig_followers_count?: string | null
          ig_username?: string | null
          industry?: string | null
          instagram_url?: string | null
          integrated_video_urls?: string | null
          integrated_videos?: string | null
          keywords?: string | null
          latest_funding?: string | null
          latest_funding_amount?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          mentions?: string | null
          metadata?: Json | null
          name?: string
          number_of_retail_locations?: string | null
          phone?: string | null
          phone_from_website?: string | null
          pinterest_url?: string | null
          segmentation?: string | null
          short_description?: string | null
          size?: string | null
          social_media_presence?: string | null
          specialties?: string[] | null
          subsidiary_of?: string | null
          technologies?: string | null
          total_collaborations?: string | null
          total_funding?: string | null
          total_post_in_3_months?: string | null
          twitter_url?: string | null
          ugc_example?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          website_status?: string | null
          worked_with_creators?: string | null
        }
        Relationships: []
      }
      company_contacts: {
        Row: {
          buyer_intent_score: number | null
          city: string | null
          company_id: string | null
          corporate_phone: string | null
          country: string | null
          created_at: string
          date_of_filtration: string | null
          departments: string | null
          duplicate_of: string | null
          email: string | null
          email_from_website: string | null
          engagement_score: number | null
          extra_data: Json | null
          facebook_url: string | null
          first_name: string | null
          hiring_job_title: string | null
          home_phone: string | null
          id: string
          ig_score: string | null
          instagram_url: string | null
          is_duplicate: boolean | null
          job_basedon: string | null
          job_location: string | null
          job_tracking_link: string | null
          last_activity_at: string | null
          last_name: string | null
          lead_score: number | null
          lead_score_breakdown: Json | null
          linkedin_job_link: string | null
          linkedin_job_title: string | null
          mobile_phone: string | null
          mql: string | null
          notes_for_data: string | null
          notes_for_sdr: string | null
          other_phone: string | null
          person_linkedin_url: string | null
          pipeline_stage: string | null
          salary_estimated: string | null
          secondary_email: string | null
          seniority: string | null
          sql_status: string | null
          state: string | null
          tags: string[] | null
          tiktok_url: string | null
          title: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          website_url: string | null
          work_direct_phone: string | null
          youtube_url: string | null
        }
        Insert: {
          buyer_intent_score?: number | null
          city?: string | null
          company_id?: string | null
          corporate_phone?: string | null
          country?: string | null
          created_at?: string
          date_of_filtration?: string | null
          departments?: string | null
          duplicate_of?: string | null
          email?: string | null
          email_from_website?: string | null
          engagement_score?: number | null
          extra_data?: Json | null
          facebook_url?: string | null
          first_name?: string | null
          hiring_job_title?: string | null
          home_phone?: string | null
          id?: string
          ig_score?: string | null
          instagram_url?: string | null
          is_duplicate?: boolean | null
          job_basedon?: string | null
          job_location?: string | null
          job_tracking_link?: string | null
          last_activity_at?: string | null
          last_name?: string | null
          lead_score?: number | null
          lead_score_breakdown?: Json | null
          linkedin_job_link?: string | null
          linkedin_job_title?: string | null
          mobile_phone?: string | null
          mql?: string | null
          notes_for_data?: string | null
          notes_for_sdr?: string | null
          other_phone?: string | null
          person_linkedin_url?: string | null
          pipeline_stage?: string | null
          salary_estimated?: string | null
          secondary_email?: string | null
          seniority?: string | null
          sql_status?: string | null
          state?: string | null
          tags?: string[] | null
          tiktok_url?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          work_direct_phone?: string | null
          youtube_url?: string | null
        }
        Update: {
          buyer_intent_score?: number | null
          city?: string | null
          company_id?: string | null
          corporate_phone?: string | null
          country?: string | null
          created_at?: string
          date_of_filtration?: string | null
          departments?: string | null
          duplicate_of?: string | null
          email?: string | null
          email_from_website?: string | null
          engagement_score?: number | null
          extra_data?: Json | null
          facebook_url?: string | null
          first_name?: string | null
          hiring_job_title?: string | null
          home_phone?: string | null
          id?: string
          ig_score?: string | null
          instagram_url?: string | null
          is_duplicate?: boolean | null
          job_basedon?: string | null
          job_location?: string | null
          job_tracking_link?: string | null
          last_activity_at?: string | null
          last_name?: string | null
          lead_score?: number | null
          lead_score_breakdown?: Json | null
          linkedin_job_link?: string | null
          linkedin_job_title?: string | null
          mobile_phone?: string | null
          mql?: string | null
          notes_for_data?: string | null
          notes_for_sdr?: string | null
          other_phone?: string | null
          person_linkedin_url?: string | null
          pipeline_stage?: string | null
          salary_estimated?: string | null
          secondary_email?: string | null
          seniority?: string | null
          sql_status?: string | null
          state?: string | null
          tags?: string[] | null
          tiktok_url?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
          work_direct_phone?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_contacts_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "company_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_activities: {
        Row: {
          activity_type: string
          contact_id: string | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          ip_address: string | null
          metadata: Json | null
          page_url: string | null
          source: string | null
          title: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_url?: string | null
          source?: string | null
          title?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_url?: string | null
          source?: string | null
          title?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "company_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          bounce_type: string | null
          bounced: boolean | null
          bounced_at: string | null
          business_name: string | null
          city: string | null
          country: string | null
          created_at: string
          dm_sent: boolean | null
          email: string | null
          email_sent: boolean | null
          first_name: string | null
          id: string
          instagram: string | null
          job_title: string | null
          last_name: string | null
          linkedin: string | null
          location: string | null
          phone: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          tiktok: string | null
          timezone: string | null
          unsubscribed: boolean | null
          unsubscribed_at: string | null
          updated_at: string
          user_id: string
          voicemail_sent: boolean | null
        }
        Insert: {
          bounce_type?: string | null
          bounced?: boolean | null
          bounced_at?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          dm_sent?: boolean | null
          email?: string | null
          email_sent?: boolean | null
          first_name?: string | null
          id?: string
          instagram?: string | null
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          location?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          tiktok?: string | null
          timezone?: string | null
          unsubscribed?: boolean | null
          unsubscribed_at?: string | null
          updated_at?: string
          user_id: string
          voicemail_sent?: boolean | null
        }
        Update: {
          bounce_type?: string | null
          bounced?: boolean | null
          bounced_at?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          dm_sent?: boolean | null
          email?: string | null
          email_sent?: boolean | null
          first_name?: string | null
          id?: string
          instagram?: string | null
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          location?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          tiktok?: string | null
          timezone?: string | null
          unsubscribed?: boolean | null
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string
          voicemail_sent?: boolean | null
        }
        Relationships: []
      }
      content_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string
          id: string
          likes_count: number | null
          media_urls: string[] | null
          platforms: string[] | null
          published_at: string | null
          scheduled_for: string | null
          shares_count: number | null
          status: string
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          platforms?: string[] | null
          published_at?: string | null
          scheduled_for?: string | null
          shares_count?: number | null
          status?: string
          thumbnail_url?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          platforms?: string[] | null
          published_at?: string | null
          scheduled_for?: string | null
          shares_count?: number | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: string
          reason: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          post_id: string
          reason: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string
          reason?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_activity: {
        Row: {
          action: string
          contract_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          contract_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          contract_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_activity_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collaboration_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          cancellation_template: string | null
          created_at: string
          deliverables_template: Json | null
          description: string | null
          exclusivity_template: string | null
          id: string
          is_default: boolean | null
          name: string
          payment_terms_template: string | null
          terms_template: string
          updated_at: string
          usage_rights_template: string | null
          user_id: string
        }
        Insert: {
          cancellation_template?: string | null
          created_at?: string
          deliverables_template?: Json | null
          description?: string | null
          exclusivity_template?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          payment_terms_template?: string | null
          terms_template: string
          updated_at?: string
          usage_rights_template?: string | null
          user_id: string
        }
        Update: {
          cancellation_template?: string | null
          created_at?: string
          deliverables_template?: Json | null
          description?: string | null
          exclusivity_template?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          payment_terms_template?: string | null
          terms_template?: string
          updated_at?: string
          usage_rights_template?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          participant_ids: string[]
          platform: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          participant_ids: string[]
          platform?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          participant_ids?: string[]
          platform?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      country_timezones: {
        Row: {
          country_code: string
          country_name: string
          id: string
          timezone: string
          utc_offset: number
        }
        Insert: {
          country_code: string
          country_name: string
          id?: string
          timezone: string
          utc_offset: number
        }
        Update: {
          country_code?: string
          country_name?: string
          id?: string
          timezone?: string
          utc_offset?: number
        }
        Relationships: []
      }
      creator_earnings: {
        Row: {
          amount: number
          campaign_invitation_id: string | null
          created_at: string
          creator_id: string
          currency: string | null
          id: string
          paid_at: string | null
          status: string | null
        }
        Insert: {
          amount: number
          campaign_invitation_id?: string | null
          created_at?: string
          creator_id: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          campaign_invitation_id?: string | null
          created_at?: string
          creator_id?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_earnings_campaign_invitation_id_fkey"
            columns: ["campaign_invitation_id"]
            isOneToOne: false
            referencedRelation: "campaign_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_earnings_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_social_accounts: {
        Row: {
          created_at: string
          creator_id: string | null
          id: string
          metadata: Json
          platform: string
          platform_user_id: string | null
          profile_url: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          id?: string
          metadata?: Json
          platform: string
          platform_user_id?: string | null
          profile_url?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          id?: string
          metadata?: Json
          platform?: string
          platform_user_id?: string | null
          profile_url?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_social_accounts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          avatar: string | null
          avg_likes: string | null
          bio: string | null
          category: string[] | null
          created_at: string
          engagement: string | null
          followers: string | null
          handle: string
          id: string
          location: string | null
          name: string
          platform: string | null
          recent_post: string | null
          updated_at: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          avatar?: string | null
          avg_likes?: string | null
          bio?: string | null
          category?: string[] | null
          created_at?: string
          engagement?: string | null
          followers?: string | null
          handle: string
          id?: string
          location?: string | null
          name: string
          platform?: string | null
          recent_post?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar?: string | null
          avg_likes?: string | null
          bio?: string | null
          category?: string[] | null
          created_at?: string
          engagement?: string | null
          followers?: string | null
          handle?: string
          id?: string
          location?: string | null
          name?: string
          platform?: string | null
          recent_post?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          tool_used: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          tool_used?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          tool_used?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_reports: {
        Row: {
          chart_config: Json | null
          created_at: string
          data_source: string
          description: string | null
          dimensions: Json | null
          filters: Json | null
          id: string
          is_pinned: boolean | null
          metrics: Json
          name: string
          report_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chart_config?: Json | null
          created_at?: string
          data_source?: string
          description?: string | null
          dimensions?: Json | null
          filters?: Json | null
          id?: string
          is_pinned?: boolean | null
          metrics?: Json
          name: string
          report_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chart_config?: Json | null
          created_at?: string
          data_source?: string
          description?: string | null
          dimensions?: Json | null
          filters?: Json | null
          id?: string
          is_pinned?: boolean | null
          metrics?: Json
          name?: string
          report_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          company_contact_id: string | null
          company_id: string | null
          created_at: string
          currency: string | null
          expected_close_date: string | null
          id: string
          notes: string | null
          position: number | null
          probability: number | null
          stage_id: string | null
          title: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          company_contact_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          position?: number | null
          probability?: number | null
          stage_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          company_contact_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          position?: number | null
          probability?: number | null
          stage_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_contact_id_fkey"
            columns: ["company_contact_id"]
            isOneToOne: false
            referencedRelation: "company_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_campaign_contacts: {
        Row: {
          created_at: string
          creator_id: string
          dm_campaign_id: string
          error_message: string | null
          id: string
          replied_at: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          dm_campaign_id: string
          error_message?: string | null
          id?: string
          replied_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          dm_campaign_id?: string
          error_message?: string | null
          id?: string
          replied_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dm_campaign_contacts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_campaign_contacts_dm_campaign_id_fkey"
            columns: ["dm_campaign_id"]
            isOneToOne: false
            referencedRelation: "dm_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_campaigns: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          name: string
          platform: string
          reply_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: string | null
          template_id: string | null
          total_contacts: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name: string
          platform: string
          reply_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          total_contacts?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string
          platform?: string
          reply_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          total_contacts?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dm_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_deliverability_tests: {
        Row: {
          authentication_results: Json | null
          completed_at: string | null
          created_at: string
          email: string
          id: string
          inbox_placement: string | null
          result: Json | null
          spam_score: number | null
          status: string
          test_type: string
          user_id: string
          warnings: string[] | null
        }
        Insert: {
          authentication_results?: Json | null
          completed_at?: string | null
          created_at?: string
          email: string
          id?: string
          inbox_placement?: string | null
          result?: Json | null
          spam_score?: number | null
          status?: string
          test_type?: string
          user_id: string
          warnings?: string[] | null
        }
        Update: {
          authentication_results?: Json | null
          completed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          inbox_placement?: string | null
          result?: Json | null
          spam_score?: number | null
          status?: string
          test_type?: string
          user_id?: string
          warnings?: string[] | null
        }
        Relationships: []
      }
      email_events: {
        Row: {
          campaign_contact_id: string
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          campaign_contact_id: string
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          campaign_contact_id?: string
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_campaign_contact_id_fkey"
            columns: ["campaign_contact_id"]
            isOneToOne: false
            referencedRelation: "campaign_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_inbox: {
        Row: {
          body_html: string | null
          body_text: string | null
          campaign_contact_id: string | null
          campaign_id: string | null
          contact_id: string | null
          created_at: string
          folder: string
          from_email: string
          from_name: string | null
          id: string
          in_reply_to: string | null
          is_read: boolean
          is_starred: boolean
          message_id: string | null
          received_at: string
          subject: string | null
          to_email: string
          user_id: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          campaign_contact_id?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          folder?: string
          from_email: string
          from_name?: string | null
          id?: string
          in_reply_to?: string | null
          is_read?: boolean
          is_starred?: boolean
          message_id?: string | null
          received_at?: string
          subject?: string | null
          to_email: string
          user_id: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          campaign_contact_id?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          folder?: string
          from_email?: string
          from_name?: string | null
          id?: string
          in_reply_to?: string | null
          is_read?: boolean
          is_starred?: boolean
          message_id?: string | null
          received_at?: string
          subject?: string | null
          to_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_inbox_campaign_contact_id_fkey"
            columns: ["campaign_contact_id"]
            isOneToOne: false
            referencedRelation: "campaign_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_inbox_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_inbox_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_inbox_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          brevo_api_key: string | null
          created_at: string
          id: string
          sendgrid_key: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: string | null
          smtp_user: string | null
          twilio_number: string | null
          twilio_sid: string | null
          twilio_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brevo_api_key?: string | null
          created_at?: string
          id?: string
          sendgrid_key?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: string | null
          smtp_user?: string | null
          twilio_number?: string | null
          twilio_sid?: string | null
          twilio_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brevo_api_key?: string | null
          created_at?: string
          id?: string
          sendgrid_key?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: string | null
          smtp_user?: string | null
          twilio_number?: string | null
          twilio_sid?: string | null
          twilio_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_warmup_schedules: {
        Row: {
          created_at: string
          current_daily_limit: number
          domain: string
          emails_sent_today: number
          id: string
          increment_per_day: number
          last_send_date: string | null
          status: string
          target_daily_limit: number
          updated_at: string
          user_id: string
          warmup_start_date: string
        }
        Insert: {
          created_at?: string
          current_daily_limit?: number
          domain: string
          emails_sent_today?: number
          id?: string
          increment_per_day?: number
          last_send_date?: string | null
          status?: string
          target_daily_limit?: number
          updated_at?: string
          user_id: string
          warmup_start_date?: string
        }
        Update: {
          created_at?: string
          current_daily_limit?: number
          domain?: string
          emails_sent_today?: number
          id?: string
          increment_per_day?: number
          last_send_date?: string | null
          status?: string
          target_daily_limit?: number
          updated_at?: string
          user_id?: string
          warmup_start_date?: string
        }
        Relationships: []
      }
      enrichment_logs: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          data_after: Json | null
          data_before: Json | null
          fields_enriched: string[] | null
          id: string
          source: string
          status: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          data_after?: Json | null
          data_before?: Json | null
          fields_enriched?: string[] | null
          id?: string
          source: string
          status?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          data_after?: Json | null
          data_before?: Json | null
          fields_enriched?: string[] | null
          id?: string
          source?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrichment_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrichment_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "company_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      file_storage_tracking: {
        Row: {
          created_at: string
          expires_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          mime_type: string | null
          status: string | null
          storage_path: string | null
          tool_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          mime_type?: string | null
          status?: string | null
          storage_path?: string | null
          tool_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          mime_type?: string | null
          status?: string | null
          storage_path?: string | null
          tool_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      follow_up_queue: {
        Row: {
          campaign_contact_id: string
          created_at: string
          id: string
          scheduled_at: string
          sent_at: string | null
          sequence_id: string
          status: string | null
        }
        Insert: {
          campaign_contact_id: string
          created_at?: string
          id?: string
          scheduled_at: string
          sent_at?: string | null
          sequence_id: string
          status?: string | null
        }
        Update: {
          campaign_contact_id?: string
          created_at?: string
          id?: string
          scheduled_at?: string
          sent_at?: string | null
          sequence_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_queue_campaign_contact_id_fkey"
            columns: ["campaign_contact_id"]
            isOneToOne: false
            referencedRelation: "campaign_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_queue_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "follow_up_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_sequences: {
        Row: {
          campaign_id: string | null
          content: string | null
          created_at: string
          delay_hours: number
          id: string
          name: string
          status: string | null
          subject: string | null
          template_id: string | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          delay_hours?: number
          id?: string
          name: string
          status?: string | null
          subject?: string | null
          template_id?: string | null
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          delay_hours?: number
          id?: string
          name?: string
          status?: string | null
          subject?: string | null
          template_id?: string | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_sequences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_sequences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_sequences_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_leads: {
        Row: {
          about: string | null
          company_name: string | null
          created_at: string
          experience: Json | null
          first_name: string | null
          headline: string | null
          id: string
          last_name: string | null
          linkedin_url: string
          location: string | null
          profile_image_url: string | null
          scraped_at: string | null
          scraped_data: Json | null
          skills: Json | null
          updated_at: string
          user_id: string
          working_status: string | null
        }
        Insert: {
          about?: string | null
          company_name?: string | null
          created_at?: string
          experience?: Json | null
          first_name?: string | null
          headline?: string | null
          id?: string
          last_name?: string | null
          linkedin_url: string
          location?: string | null
          profile_image_url?: string | null
          scraped_at?: string | null
          scraped_data?: Json | null
          skills?: Json | null
          updated_at?: string
          user_id: string
          working_status?: string | null
        }
        Update: {
          about?: string | null
          company_name?: string | null
          created_at?: string
          experience?: Json | null
          first_name?: string | null
          headline?: string | null
          id?: string
          last_name?: string | null
          linkedin_url?: string
          location?: string | null
          profile_image_url?: string | null
          scraped_at?: string | null
          scraped_data?: Json | null
          skills?: Json | null
          updated_at?: string
          user_id?: string
          working_status?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          page_name: string
          path: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          page_name: string
          path?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          page_name?: string
          path?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          position: number
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          position?: number
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          image_url: string
          link: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          image_url: string
          link?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          image_url?: string
          link?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_history: {
        Row: {
          created_at: string
          credits_used: number | null
          file_name: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          output_format: string | null
          status: string | null
          tool_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credits_used?: number | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          output_format?: string | null
          status?: string | null
          tool_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credits_used?: number | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          output_format?: string | null
          status?: string | null
          tool_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      revenue_attribution: {
        Row: {
          attributed_percent: number | null
          attributed_value: number | null
          attribution_model: string | null
          campaign_id: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          id: string
          metadata: Json | null
          touchpoint_date: string
          touchpoint_type: string
          user_id: string
        }
        Insert: {
          attributed_percent?: number | null
          attributed_value?: number | null
          attribution_model?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          touchpoint_date: string
          touchpoint_type: string
          user_id: string
        }
        Update: {
          attributed_percent?: number | null
          attributed_value?: number | null
          attribution_model?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          touchpoint_date?: string
          touchpoint_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_attribution_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_attribution_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_attribution_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "company_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_attribution_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_creators: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_creators_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_default: boolean | null
          name: string
          page: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          is_default?: boolean | null
          name: string
          page: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          page?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          last_run_at: string | null
          name: string
          result_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          last_run_at?: string | null
          name: string
          result_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          last_run_at?: string | null
          name?: string
          result_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signature_templates: {
        Row: {
          content: string | null
          created_at: string
          fields: Json | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          fields?: Json | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          fields?: Json | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signatures: {
        Row: {
          created_at: string
          document_name: string
          document_url: string | null
          expires_at: string | null
          id: string
          recipient_email: string | null
          recipient_name: string | null
          signature_data: string | null
          signed_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_url?: string | null
          expires_at?: string | null
          id?: string
          recipient_email?: string | null
          recipient_name?: string | null
          signature_data?: string | null
          signed_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_url?: string | null
          expires_at?: string | null
          id?: string
          recipient_email?: string | null
          recipient_name?: string | null
          signature_data?: string | null
          signed_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smart_lists: {
        Row: {
          contact_count: number | null
          created_at: string
          description: string | null
          filters: Json
          id: string
          is_pinned: boolean | null
          name: string
          sort_by: string | null
          sort_order: string | null
          table_target: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          is_pinned?: boolean | null
          name: string
          sort_by?: string | null
          sort_order?: string | null
          table_target?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          is_pinned?: boolean | null
          name?: string
          sort_by?: string | null
          sort_order?: string | null
          table_target?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          active_hours_end: number
          active_hours_start: number
          avatar_url: string | null
          cooldown_until: string | null
          created_at: string
          daily_limit: number
          display_name: string | null
          error_message: string | null
          id: string
          is_primary: boolean
          last_checked_at: string | null
          last_message_at: string | null
          messages_sent_today: number
          platform: string
          send_delay_max: number
          send_delay_min: number
          status: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          active_hours_end?: number
          active_hours_start?: number
          avatar_url?: string | null
          cooldown_until?: string | null
          created_at?: string
          daily_limit?: number
          display_name?: string | null
          error_message?: string | null
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          last_message_at?: string | null
          messages_sent_today?: number
          platform: string
          send_delay_max?: number
          send_delay_min?: number
          status?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          active_hours_end?: number
          active_hours_start?: number
          avatar_url?: string | null
          cooldown_until?: string | null
          created_at?: string
          daily_limit?: number
          display_name?: string | null
          error_message?: string | null
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          last_message_at?: string | null
          messages_sent_today?: number
          platform?: string
          send_delay_max?: number
          send_delay_min?: number
          status?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          expires_at: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          plan: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string
          joined_at: string | null
          member_email: string
          member_name: string | null
          owner_id: string
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          member_email: string
          member_name?: string | null
          owner_id: string
          role?: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          member_email?: string
          member_name?: string | null
          owner_id?: string
          role?: string
          status?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          subject: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          subject?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          review: string | null
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review?: string | null
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review?: string | null
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_usage_analytics: {
        Row: {
          created_at: string
          file_count: number | null
          id: string
          processing_time_ms: number | null
          status: string | null
          tool_category: string
          tool_id: string
          total_file_size: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_count?: number | null
          id?: string
          processing_time_ms?: number | null
          status?: string | null
          tool_category: string
          tool_id: string
          total_file_size?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_count?: number | null
          id?: string
          processing_time_ms?: number | null
          status?: string | null
          tool_category?: string
          tool_id?: string
          total_file_size?: number | null
          user_id?: string
        }
        Relationships: []
      }
      tracking_sessions: {
        Row: {
          browser: string | null
          city: string | null
          contact_id: string | null
          country: string | null
          created_at: string
          device_type: string | null
          email: string | null
          first_seen_at: string | null
          id: string
          ip_address: string | null
          is_identified: boolean | null
          landing_page: string | null
          last_seen_at: string | null
          pages_viewed: Json | null
          referrer: string | null
          total_duration_seconds: number | null
          total_page_views: number | null
          user_agent: string | null
          user_id: string
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          contact_id?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          email?: string | null
          first_seen_at?: string | null
          id?: string
          ip_address?: string | null
          is_identified?: boolean | null
          landing_page?: string | null
          last_seen_at?: string | null
          pages_viewed?: Json | null
          referrer?: string | null
          total_duration_seconds?: number | null
          total_page_views?: number | null
          user_agent?: string | null
          user_id: string
          visitor_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          contact_id?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          email?: string | null
          first_seen_at?: string | null
          id?: string
          ip_address?: string | null
          is_identified?: boolean | null
          landing_page?: string | null
          last_seen_at?: string | null
          pages_viewed?: Json | null
          referrer?: string | null
          total_duration_seconds?: number | null
          total_page_views?: number | null
          user_agent?: string | null
          user_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_sessions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "company_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          language: string | null
          login_notifications: boolean | null
          marketing_emails: boolean | null
          theme: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          login_notifications?: boolean | null
          marketing_emails?: boolean | null
          theme?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          login_notifications?: boolean | null
          marketing_emails?: boolean | null
          theme?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_event_log: {
        Row: {
          created_at: string
          direction: string
          event_type: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          payload: Json | null
          response_body: string | null
          response_status: number | null
          retry_count: number | null
          status: string | null
          user_id: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          direction?: string
          event_type?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          retry_count?: number | null
          status?: string | null
          user_id: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          direction?: string
          event_type?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          retry_count?: number | null
          status?: string | null
          user_id?: string
          webhook_url?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          actions: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      campaign_performance: {
        Row: {
          click_count: number | null
          click_rate: number | null
          click_to_open_rate: number | null
          created_at: string | null
          id: string | null
          name: string | null
          open_count: number | null
          open_rate: number | null
          sent_count: number | null
          status: string | null
          total_contacts: number | null
          user_id: string | null
        }
        Insert: {
          click_count?: number | null
          click_rate?: never
          click_to_open_rate?: never
          created_at?: string | null
          id?: string | null
          name?: string | null
          open_count?: number | null
          open_rate?: never
          sent_count?: number | null
          status?: string | null
          total_contacts?: number | null
          user_id?: string | null
        }
        Update: {
          click_count?: number | null
          click_rate?: never
          click_to_open_rate?: never
          created_at?: string | null
          id?: string | null
          name?: string | null
          open_count?: number | null
          open_rate?: never
          sent_count?: number | null
          status?: string | null
          total_contacts?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_engagement_summary: {
        Row: {
          campaigns_received: number | null
          contact_id: string | null
          email: string | null
          first_name: string | null
          last_name: string | null
          last_opened_at: string | null
          last_sent_at: string | null
          total_clicks: number | null
          total_opens: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_rating_summary: {
        Row: {
          avg_rating: number | null
          five_star: number | null
          four_star: number | null
          one_star: number | null
          three_star: number | null
          tool_id: string | null
          total_reviews: number | null
          two_star: number | null
        }
        Relationships: []
      }
      tool_stats: {
        Row: {
          avg_processing_time_ms: number | null
          tool_id: string | null
          total_bytes_processed: number | null
          total_uses: number | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      batch_calculate_lead_scores: {
        Args: { p_user_id: string }
        Returns: number
      }
      calculate_buyer_intent_score: {
        Args: { p_contact_id: string }
        Returns: number
      }
      calculate_engagement_score: {
        Args: { p_contact_id: string }
        Returns: number
      }
      calculate_lead_score: { Args: { p_contact_id: string }; Returns: number }
      deduct_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_tool: string
          p_user_id: string
        }
        Returns: boolean
      }
      find_duplicate_contacts: {
        Args: { p_user_id: string }
        Returns: {
          contact_id: string
          duplicate_of_id: string
          match_type: string
          match_value: string
        }[]
      }
      get_user_top_tools: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          last_used: string
          tool_category: string
          tool_id: string
          usage_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      toggle_favorite: {
        Args: { p_tool_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "creator" | "brand"
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
      app_role: ["admin", "moderator", "user", "creator", "brand"],
    },
  },
} as const
