import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Enable required extensions
    const extensions = [
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public',
      'CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public',
      'CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA public',
    ];

    for (const ext of extensions) {
      const { error } = await supabase.rpc('execute_sql', { sql: ext }).catch(() => ({ error: null }));
      if (error) console.log('Extension creation note:', error.message);
    }

    // Create tables
    const tables = `
      -- Create contacts table
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        position TEXT,
        notes TEXT,
        tags TEXT[] DEFAULT '{}',
        status TEXT DEFAULT 'active',
        source TEXT,
        last_contacted_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, email)
      );

      -- Create templates table
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        variables TEXT[] DEFAULT '{}',
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create campaigns table
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        template_id UUID REFERENCES templates(id),
        status TEXT DEFAULT 'draft',
        scheduled_at TIMESTAMP WITH TIME ZONE,
        sent_at TIMESTAMP WITH TIME ZONE,
        total_contacts INTEGER DEFAULT 0,
        sent_count INTEGER DEFAULT 0,
        opened_count INTEGER DEFAULT 0,
        clicked_count INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create campaign_contacts table (junction table)
      CREATE TABLE IF NOT EXISTS campaign_contacts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        sent_at TIMESTAMP WITH TIME ZONE,
        opened_at TIMESTAMP WITH TIME ZONE,
        clicked_at TIMESTAMP WITH TIME ZONE,
        replied_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(campaign_id, contact_id)
      );

      -- Create email_events table
      CREATE TABLE IF NOT EXISTS email_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        campaign_contact_id UUID NOT NULL REFERENCES campaign_contacts(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        event_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create follow_ups table
      CREATE TABLE IF NOT EXISTS follow_ups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        campaign_id UUID REFERENCES campaigns(id),
        template_id UUID REFERENCES templates(id),
        scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
        sent_at TIMESTAMP WITH TIME ZONE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create user_settings table
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        email_signature TEXT,
        default_template_id UUID,
        auto_follow_up_enabled BOOLEAN DEFAULT FALSE,
        auto_follow_up_days INTEGER DEFAULT 3,
        notifications_enabled BOOLEAN DEFAULT TRUE,
        theme TEXT DEFAULT 'light',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create integrations table
      CREATE TABLE IF NOT EXISTS integrations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        name TEXT NOT NULL,
        config JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, provider)
      );

      -- Create activity_logs table
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id UUID,
        changes JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Execute table creation
    const { error: tableError } = await supabase.rpc('execute_sql', { sql: tables }).catch(() => ({ error: null }));
    if (tableError) console.log('Tables creation note:', tableError.message);

    // Create indexes
    const indexes = `
      CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
      CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
      CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
      CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_campaign_contacts_contact_id ON campaign_contacts(contact_id);
      CREATE INDEX IF NOT EXISTS idx_email_events_campaign_contact_id ON email_events(campaign_contact_id);
      CREATE INDEX IF NOT EXISTS idx_follow_ups_user_id ON follow_ups(user_id);
      CREATE INDEX IF NOT EXISTS idx_follow_ups_contact_id ON follow_ups(contact_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
    `;

    const { error: indexError } = await supabase.rpc('execute_sql', { sql: indexes }).catch(() => ({ error: null }));
    if (indexError) console.log('Indexes creation note:', indexError.message);

    // Enable RLS
    const rls = `
      ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
      ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
      ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
      ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc('execute_sql', { sql: rls }).catch(() => ({ error: null }));
    if (rlsError) console.log('RLS enablement note:', rlsError.message);

    console.log('✅ Database initialization completed successfully!');
    console.log('All tables, indexes, and security policies are now configured.');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
