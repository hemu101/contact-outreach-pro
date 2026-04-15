# Contact Outreach Pro - Complete Setup Guide

## Overview

This guide will walk you through the complete setup of the Contact Outreach Pro application, including environment configuration, database setup, and getting the app running.

## Prerequisites

Before you start, make sure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **A Supabase Account** (free) - [Sign up](https://supabase.com)
- **A GitHub Account** (optional, for source control)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <YOUR_REPOSITORY_URL>

# Navigate into the project
cd contact-outreach-pro

# Install all dependencies
npm install
```

## Step 2: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in your project details:
   - **Name**: Contact Outreach Pro (or your preferred name)
   - **Database Password**: Create a strong password and save it securely
   - **Region**: Select the region closest to you
4. Click **"Create new project"**
5. Wait for the database to be provisioned (this may take 1-2 minutes)

## Step 3: Get Your Credentials

Once your Supabase project is created:

1. In your Supabase dashboard, click **"Settings"** (gear icon)
2. Click **"API"** in the left sidebar
3. You'll see:
   - **Project URL** (under "API URL")
   - **anon public** (under "Project API keys")
   - **service_role** (optional, for server-side operations)

Copy these values - you'll need them next.

## Step 4: Configure Environment Variables

1. In the project root, create a file named `.env.local`:

```bash
cp .env.example .env.local  # If .env.example exists
# OR create it manually
touch .env.local
```

2. Open `.env.local` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase credentials.

## Step 5: Set Up the Database

### Option A: Manual SQL Migration (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click the **"New Query"** button
4. Open the file `scripts/database-migration.sql` in your text editor
5. Copy the entire contents of the file
6. Paste it into the Supabase SQL Editor
7. Click the **"Run"** button

The database will now be set up with all tables, indexes, and security policies.

### Option B: Using the Initialization Script

```bash
# This generates the migration SQL for you
npm run init-db

# Then follow Option A above to run the generated SQL
```

## Step 6: Verify Database Setup

After running the migration:

1. In Supabase, click **"Table Editor"** in the left sidebar
2. You should see the following tables:
   - contacts
   - templates
   - campaigns
   - campaign_contacts
   - email_events
   - follow_ups
   - user_settings
   - integrations
   - activity_logs

If all tables are present, your database is correctly set up!

## Step 7: Start the Development Server

```bash
npm run dev
```

Your app will start on `http://localhost:5173` (or the next available port).

## Step 8: Test the Application

1. Open `http://localhost:5173` in your browser
2. You should see the login/signup page
3. Create a test account:
   - Click **"Sign Up"** (if available) or enter your test email
   - Create a password
   - Confirm your email (check your inbox)

4. Once logged in, you can start using the app:
   - **Add Contacts**: Navigate to the contacts section and add your first contact
   - **Create Templates**: Set up email templates for your campaigns
   - **Create Campaigns**: Send email campaigns to your contacts

## Troubleshooting

### "Missing environment variables" error

Make sure your `.env.local` file exists and has the correct credentials:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

### Database table not found error

Run the database migration again:
1. Go to Supabase SQL Editor
2. Run the `scripts/database-migration.sql` file again

### "Connection refused" error

1. Check that your Supabase project is active (not paused)
2. Verify your credentials in `.env.local`
3. Make sure you're using the correct Project URL

### Email confirmation not working

1. Go to your Supabase project > Authentication > Email Templates
2. Check that the email templates are configured
3. For testing, you can disable email confirmation (not recommended for production):
   - Go to Authentication > Providers > Email
   - Toggle "Confirm email" to OFF

## Project Structure

```
contact-outreach-pro/
├── src/
│   ├── components/           # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── integrations/        # Supabase integration
│   ├── lib/                 # Utility functions
│   ├── App.tsx              # Main app component
│   └── main.tsx             # App entry point
├── scripts/
│   ├── init-database.js     # Database initialization script
│   └── database-migration.sql # SQL migration file
├── public/                  # Static assets
├── .env.local               # Environment variables (create this)
├── package.json             # Dependencies
├── README.md                # Project documentation
└── SETUP.md                 # This file
```

## Available Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Generate database migration SQL
npm run init-db

# Lint code for errors
npm run lint
```

## Database Tables Overview

### contacts
Stores customer/lead information:
- name, email, phone, company, position
- tags, status, source
- last_contacted_at timestamp

### templates
Email templates for campaigns:
- name, subject, content
- variables, category
- is_favorite flag

### campaigns
Email campaign management:
- name, description
- status (draft, scheduled, sent)
- tracking: sent_count, opened_count, clicked_count, reply_count

### campaign_contacts
Links contacts to campaigns:
- status, sent_at, opened_at, clicked_at, replied_at

### email_events
Tracks email interactions:
- event_type (open, click, etc.)
- event_data (JSON for additional info)

### follow_ups
Manages follow-up emails:
- scheduled_date, sent_at
- status, contact_id, campaign_id

### user_settings
User preferences:
- email_signature
- auto_follow_up settings
- theme preference
- notifications settings

### integrations
External service connections:
- provider name, config (JSON)
- is_active flag

### activity_logs
Audit trail:
- action type, entity type/id
- changes (JSON), ip_address, user_agent

## Security Features

The application includes enterprise-grade security:

1. **Row Level Security (RLS)**: All tables have RLS policies enabled
2. **User Isolation**: Each user can only see their own data
3. **Authentication**: Supabase built-in auth with email verification
4. **Encrypted Passwords**: Bcrypt hashing via Supabase Auth
5. **HTTPS Only**: All API connections are encrypted
6. **Activity Logging**: All actions are logged for audit purposes

## Performance Tips

1. **Indexes**: Database indexes are automatically created for faster queries
2. **Pagination**: Use pagination when viewing large contact lists
3. **Caching**: React Query is used for efficient data caching
4. **Lazy Loading**: Components load on-demand to reduce initial load time

## Next Steps

After setup is complete:

1. **Customize Your Settings**: Go to Settings to configure your email signature
2. **Import Contacts**: Add your contacts manually or via CSV import (if available)
3. **Create Templates**: Set up email templates for your campaigns
4. **Send First Campaign**: Create and send your first email campaign
5. **Track Results**: Monitor opens, clicks, and replies in the analytics dashboard

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [React Documentation](https://react.dev)
3. Check the project README.md for additional information
4. Open an issue on GitHub with details about your problem

## Deployment

To deploy your application:

1. **Push to GitHub**: Commit your changes and push to GitHub
2. **Deploy to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Add your environment variables
   - Deploy!

Alternatively, deploy to:
- Netlify
- AWS Amplify
- Firebase Hosting
- Your own server

## Tips and Best Practices

1. **Backup Your Data**: Regularly backup your Supabase database
2. **Monitor Activity Logs**: Review activity logs for security insights
3. **Update Dependencies**: Keep npm packages up to date for security patches
4. **Use Strong Passwords**: Create strong passwords for your Supabase account
5. **Enable 2FA**: Enable two-factor authentication on your Supabase account

---

**Congratulations!** You now have a fully functional Contact Outreach Pro application. Start reaching out to your contacts and building relationships!
