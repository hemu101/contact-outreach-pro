# Database Schema Documentation

## Overview

Contact Outreach Pro uses a PostgreSQL database (via Supabase) with 9 main tables. All tables have Row Level Security (RLS) enabled to ensure data privacy.

## Database Architecture

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
└────────┬────────┘
         │
    ┌────┴─────────────────────────────────────────────────────┐
    │                                                             │
    ▼                    ▼                    ▼                   ▼
┌─────────┐        ┌──────────┐        ┌──────────┐      ┌──────────────┐
│Contacts │        │Templates │        │Campaigns │      │User_Settings │
└────┬────┘        └──────────┘        └────┬─────┘      └──────────────┘
     │                                        │
     └────────────────────┬───────────────────┘
                          │
                          ▼
                  ┌──────────────────┐
                  │Campaign_Contacts │
                  └────────┬─────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
      ┌──────────┐   ┌─────────┐  ┌────────────┐
      │Follow_Ups│   │Email_   │  │Integrations│
      │          │   │Events   │  │            │
      └──────────┘   └─────────┘  └────────────┘
            │
            └──── Activity_Logs
```

## Table Details

### 1. contacts
Primary table for storing contact information.

**Purpose**: Store customer/lead contact details with metadata

**Fields**:
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary key | Yes |
| user_id | UUID | Foreign key to auth.users | Yes |
| name | TEXT | Contact full name | Yes |
| email | TEXT | Contact email address | Yes |
| phone | TEXT | Contact phone number | No |
| company | TEXT | Company name | No |
| position | TEXT | Job title/position | No |
| notes | TEXT | Additional notes | No |
| tags | TEXT[] | Array of tags for categorization | No |
| status | TEXT | Contact status (active, inactive, etc) | No |
| source | TEXT | How contact was acquired | No |
| last_contacted_at | TIMESTAMP | Last contact date | No |
| created_at | TIMESTAMP | Record creation date | Yes |
| updated_at | TIMESTAMP | Last update date | Yes |

**Constraints**:
- UNIQUE(user_id, email) - Each user can have unique email
- FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE

**Indexes**:
- idx_contacts_user_id - Optimize queries by user
- idx_contacts_email - Optimize email lookups

**RLS Policies**:
- Users can only view/edit/delete their own contacts

---

### 2. templates
Email template management for reusable email content.

**Purpose**: Store email templates with customizable variables

**Fields**:
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary key | Yes |
| user_id | UUID | Foreign key to auth.users | Yes |
| name | TEXT | Template name | Yes |
| subject | TEXT | Email subject line | Yes |
| content | TEXT | Email body content | Yes |
| category | TEXT | Template category | No |
| variables | TEXT[] | Placeholders (e.g., {{name}}) | No |
| is_favorite | BOOLEAN | Mark as favorite | No |
| created_at | TIMESTAMP | Record creation date | Yes |
| updated_at | TIMESTAMP | Last update date | Yes |

**Constraints**:
- FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE

**Indexes**:
- idx_templates_user_id - Optimize user queries

**RLS Policies**:
- Users can only view/edit/delete their own templates

---

### 3. campaigns
Email campaign management and tracking.

**Purpose**: Manage email campaigns with analytics and status tracking

**Fields**:
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary key | Yes |
| user_id | UUID | Foreign key to auth.users | Yes |
| name | TEXT | Campaign name | Yes |
| description | TEXT | Campaign description | No |
| template_id | UUID | Foreign key to templates | No |
| status | TEXT | Campaign status (draft, scheduled, sent, archived) | No |
| scheduled_at | TIMESTAMP | Schedule send time | No |
| sent_at | TIMESTAMP | Actual send time | No |
| total_contacts | INTEGER | Total contacts targeted | No |
| sent_count | INTEGER | Emails successfully sent | No |
| opened_count | INTEGER | Number of opens | No |
| clicked_count | INTEGER | Number of clicks | No |
| reply_count | INTEGER | Number of replies | No |
| created_at | TIMESTAMP | Record creation date | Yes |
| updated_at | TIMESTAMP | Last update date | Yes |

**Constraints**:
- FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE
- FOREIGN KEY(template_id) REFERENCES templates(id)

**Indexes**:
- idx_campaigns_user_id - Optimize user queries

**RLS Policies**:
- Users can only view/edit/delete their own campaigns

---

### 4. campaign_contacts
Junction table linking campaigns to contacts.

**Purpose**: Track which contacts receive which campaigns and their status

**Fields**:
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary key | Yes |
| campaign_id | UUID | Foreign key to campaigns | Yes |
| contact_id | UUID | Foreign key to contacts | Yes |
| status | TEXT | Delivery status (pending, sent, failed, etc) | No |
| sent_at | TIMESTAMP | When email was sent | No |
| opened_at | TIMESTAMP | When email was first opened | No |
| clicked_at | TIMESTAMP | When first link was clicked | No |
| replied_at | TIMESTAMP | When contact replied | No |
| created_at | TIMESTAMP | Record creation date | Yes |
| updated_at | TIMESTAMP | Last update date | Yes |

**Constraints**:
- UNIQUE(campaign_id, contact_id) - One record per contact per campaign
- FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
- FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE

**Indexes**:
- idx_campaign_contacts_campaign_id - Optimize campaign queries
- idx_campaign_contacts_contact_id - Optimize contact queries

**RLS Policies**:
- Users can only see campaign contacts for campaigns they own

---

### 5. email_events
Track individual email interaction events.

**Purpose**: Record detailed email events (opens, clicks, bounces, etc)

**Fields**:
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary key | Yes |
| campaign_contact_id | UUID | Foreign key to campaign_contacts | Yes |
| event_type | TEXT | Event type (open, click, bounce, spam, etc) | Yes |
| event_data | JSONB | Additional event metadata | No |
| created_at | TIMESTAMP | When event occurred | Yes |

**Example event_data**:
```json
{
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "link_url": "https://example.com",
  "timestamp": "2024-04-15T10:30:00Z"
}
```

**Constraints**:
- FOREIGN KEY(campaign_contact_id) REFERENCES campaign_contacts(id) ON DELETE CASCADE

**Indexes**:
- idx_email_events_campaign_contact_id - Optimize event queries

**RLS Policies**:
- Users can only view events for campaigns they own

---

### 6. follow_ups
Manage automated follow-up email scheduling.

**Purpose**: Schedule and track follow-up emails

**Fields**:
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary key | Yes |
| user_id | UUID | Foreign key to auth.users | Yes |
| contact_id | UUID | Foreign key to contacts | Yes |
| campaign_id | UUID | Foreign key to campaigns | No |
| template_id | UUID | Foreign key to templates | No |
| scheduled_date | TIMESTAMP | When to send follow-up | Yes |
| sent_at | TIMESTAMP | When follow-up was sent | No |
| status | TEXT | Status (pending, sent, skipped, etc) | No |
| created_at | TIMESTAMP | Record creation date | Yes |
| updated_at | TIMESTAMP | Last update date | Yes |

**Constraints**:
- FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE
- FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE
- FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
- FOREIGN KEY(template_id) REFERENCES templates(id)

**Indexes**:
- idx_follow_ups_user_id - Optimize user queries
- idx_follow_ups_contact_id - Optimize contact queries

**RLS Policies**:
- Users can only view/edit/delete their own follow-ups

---

### 7. user_settings
Store per-user configuration and preferences.

**Purpose**: Keep track of user-specific settings and preferences

**Fields**:
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary key | Yes |
| user_id | UUID | Foreign key to auth.users (UNIQUE) | Yes |
| email_signature | TEXT | User's email signature | No |
| default_template_id | UUID | Default template to use | No |
| auto_follow_up_enabled | BOOLEAN | Enable auto follow-ups | No |
| auto_follow_up_days | INTEGER | Days until follow-up | No |
| notifications_enabled | BOOLEAN | Enable notifications | No |
| theme | TEXT | UI theme (light, dark, etc) | No |
| created_at | TIMESTAMP | Record creation date | Yes |
| updated_at | TIMESTAMP | Last update date | Yes |

**Constraints**:
- UNIQUE(user_id) - One record per user
- FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE

**RLS Policies**:
- Users can only view/edit their own settings

---

### 8. integrations
External service integrations configuration.

**Purpose**: Store API credentials and configurations for external services

**Fields**:
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary key | Yes |
| user_id | UUID | Foreign key to auth.users | Yes |
| provider | TEXT | Service provider name | Yes |
| name | TEXT | Integration display name | Yes |
| config | JSONB | API keys and configuration | No |
| is_active | BOOLEAN | Whether integration is enabled | No |
| created_at | TIMESTAMP | Record creation date | Yes |
| updated_at | TIMESTAMP | Last update date | Yes |

**Example config**:
```json
{
  "api_key": "sk_live_...",
  "api_secret": "...encrypted...",
  "webhook_url": "https://example.com/webhook"
}
```

**Constraints**:
- UNIQUE(user_id, provider) - One integration per provider per user
- FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE

**RLS Policies**:
- Users can only view/edit/delete their own integrations

---

### 9. activity_logs
Comprehensive audit trail of all user actions.

**Purpose**: Track all user actions for security and auditing

**Fields**:
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary key | Yes |
| user_id | UUID | Foreign key to auth.users | Yes |
| action | TEXT | Action performed (create, update, delete, etc) | Yes |
| entity_type | TEXT | Type of entity (contact, campaign, etc) | No |
| entity_id | UUID | ID of the entity affected | No |
| changes | JSONB | Before/after changes | No |
| ip_address | INET | IP address of request | No |
| user_agent | TEXT | Browser user agent | No |
| created_at | TIMESTAMP | When action occurred | Yes |

**Example changes**:
```json
{
  "before": {
    "status": "draft"
  },
  "after": {
    "status": "sent"
  }
}
```

**Constraints**:
- FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE

**Indexes**:
- idx_activity_logs_user_id - Optimize user audit queries

**RLS Policies**:
- Users can only view/insert their own activity logs

---

## Indexes

All indexes created for optimal query performance:

```sql
idx_contacts_user_id              -- User contact lookups
idx_contacts_email                -- Email duplicate prevention
idx_templates_user_id             -- User template lookups
idx_campaigns_user_id             -- User campaign lookups
idx_campaign_contacts_campaign_id -- Campaign contact lookups
idx_campaign_contacts_contact_id  -- Contact campaign lookups
idx_email_events_campaign_contact -- Event tracking
idx_follow_ups_user_id            -- Follow-up lookups
idx_follow_ups_contact_id         -- Contact follow-ups
idx_activity_logs_user_id         -- Audit trail
```

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

1. **Data Isolation**: Each user can only access their own data
2. **Referential Integrity**: Users can't access data through foreign keys
3. **Audit Trail**: All actions are logged with user context
4. **Multi-tenancy**: Complete data separation between users

## Migrations

Database setup is handled by SQL migration file: `scripts/database-migration.sql`

To apply migrations:
1. Open Supabase SQL Editor
2. Create New Query
3. Copy entire migration.sql content
4. Execute

## Performance Considerations

1. **Indexes**: All frequently queried fields have indexes
2. **UNIQUE Constraints**: Prevent duplicate data efficiently
3. **Foreign Keys**: Maintain referential integrity with cascading deletes
4. **JSONB**: Flexible storage for configuration and event data
5. **Timestamps**: Track creation and updates automatically

## Backup & Recovery

Supabase includes automatic daily backups. To manually backup:

1. Go to Supabase Dashboard
2. Settings > Backups
3. Click "Create backup"

To restore from backup:
1. Go to Backups tab
2. Click restore icon next to desired backup
3. Confirm restoration

## Monitoring

To monitor database performance:

1. **Supabase Dashboard**: Settings > Database > Usage
2. **Query Performance**: Check slow query logs
3. **Storage**: Monitor table sizes and growth
4. **Connections**: Check active connections

## Best Practices

1. **Regular Backups**: Schedule automated backups
2. **Archive Old Data**: Move campaigns > 1 year old to archive
3. **Clean Activity Logs**: Archive activity logs older than 90 days
4. **Update Statistics**: Run ANALYZE periodically
5. **Monitor Connections**: Keep connections below max limit

## Common Queries

### Get user's contacts
```sql
SELECT * FROM contacts 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;
```

### Get campaign analytics
```sql
SELECT 
  id, name,
  total_contacts,
  sent_count,
  opened_count,
  clicked_count,
  reply_count,
  ROUND(100.0 * opened_count / NULLIF(sent_count, 0), 2) AS open_rate
FROM campaigns
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Get recent activity
```sql
SELECT action, entity_type, created_at
FROM activity_logs
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 50;
```

---

**For more information about PostgreSQL, visit**: https://www.postgresql.org/docs/
**For Supabase documentation**: https://supabase.com/docs
