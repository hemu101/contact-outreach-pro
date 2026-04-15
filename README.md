# Contact Outreach Pro

A comprehensive contact outreach and campaign management application built with React, TypeScript, Vite, Supabase, and shadcn/ui.

## Features

- **Contact Management**: Add, organize, and manage your contacts with tags and detailed information
- **Email Templates**: Create and manage reusable email templates with variables
- **Campaign Management**: Create, schedule, and track email campaigns
- **Analytics & Tracking**: Monitor opens, clicks, replies, and other email events
- **Follow-ups**: Automated follow-up scheduling and management
- **User Settings**: Customize email signatures, auto-follow-up preferences, and more
- **Integrations**: Connect with external services for enhanced functionality
- **Activity Logs**: Track all user actions for audit purposes
- **Row Level Security**: Enterprise-grade data privacy with RLS policies

## Quick Start

### Prerequisites
- Node.js & npm (v16+)
- A Supabase account (free tier available at [supabase.com](https://supabase.com))

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd contact-outreach-pro

# Step 3: Install dependencies
npm i

# Step 4: Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Step 5: Set up database (see Database Setup section below)

# Step 6: Start the development server
npm run dev
```

### Database Setup

The application requires a Supabase PostgreSQL database. Follow these steps to set up:

1. **Create a Supabase Project**:
   - Go to [app.supabase.com](https://app.supabase.com)
   - Click "New Project" and follow the prompts
   - Wait for the database to be provisioned

2. **Get Your Credentials**:
   - Go to Project Settings > API
   - Copy your Project URL and anon key (public)
   - Paste them into your `.env.local` file

3. **Run Database Migrations**:
   - Open your Supabase project dashboard
   - Navigate to SQL Editor (left sidebar)
   - Click "New Query"
   - Copy the entire contents of `scripts/database-migration.sql`
   - Paste into the SQL editor
   - Click "Run" to execute the migration

4. **Enable Authentication**:
   - Go to Authentication > Providers
   - Make sure Email provider is enabled (it's enabled by default)

### Environment Variables

Create a `.env.local` file with the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
├── src/
│   ├── components/       # Reusable React components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── integrations/    # Supabase and other integrations
│   ├── lib/            # Utility functions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── scripts/            # Utility scripts (database migrations)
├── public/             # Static assets
└── package.json        # Dependencies
```

## Available Scripts

```sh
# Development server with hot module replacement
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Initialize database (generates SQL migration)
npm run init-db
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **State Management**: React Context + SWR
- **Routing**: React Router

## Database Tables

The application uses the following database tables:

- **contacts**: Store contact information with company, position, and tags
- **templates**: Email templates with subject and content
- **campaigns**: Email campaign management and tracking
- **campaign_contacts**: Junction table linking campaigns to contacts
- **email_events**: Track email opens, clicks, and other events
- **follow_ups**: Schedule and track follow-up emails
- **user_settings**: User preferences and email signatures
- **integrations**: Store integration configurations
- **activity_logs**: Audit trail of user actions

All tables have Row Level Security (RLS) policies enabled to ensure data privacy.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
