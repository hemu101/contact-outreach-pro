# Quick Start - 5 Minutes to Running

## 1. Clone & Install (1 min)
```bash
git clone <your-repo-url>
cd contact-outreach-pro
npm install
```

## 2. Create Supabase Project (1 min)
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in details and create project
4. Wait for provisioning (1-2 minutes)

## 3. Get Credentials (30 seconds)
1. In Supabase: Settings > API
2. Copy **Project URL** 
3. Copy **anon public key**

## 4. Setup Environment (30 seconds)
```bash
# In project root:
echo 'VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here' > .env.local
```

## 5. Setup Database (1 min)
1. In Supabase: SQL Editor > New Query
2. Copy entire contents of `scripts/database-migration.sql`
3. Paste into SQL Editor and click Run

## 6. Run App (30 seconds)
```bash
npm run dev
```

Visit `http://localhost:8081`

---

## ✅ Done!

You now have:
- ✓ Full-stack React + TypeScript app
- ✓ Supabase PostgreSQL database
- ✓ Complete contact management system
- ✓ Email campaign builder
- ✓ Analytics & tracking
- ✓ User authentication
- ✓ All 9 database tables with RLS security

## Next Steps

1. **Create Account**: Sign up with your email
2. **Add Contacts**: Import or manually add contacts
3. **Create Templates**: Set up email templates
4. **Send Campaign**: Create and send your first campaign
5. **Track Results**: View opens, clicks, and replies

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Can't find SUPABASE_URL" | Make sure `.env.local` exists with correct values |
| "Table not found" | Run database migration in Supabase SQL Editor |
| "Connection refused" | Check Supabase project is active (not paused) |
| Port 8081 in use? | Run `npm run dev -- --port 3000` to use port 3000 |

## Key Features

- 📊 Contact Management with tags and notes
- ✉️ Email Template Builder
- 📧 Campaign Management & Scheduling
- 📈 Real-time Analytics & Tracking
- 🔄 Automated Follow-ups
- 🔐 Enterprise Security (RLS)
- 👤 User Settings & Preferences
- 📦 Integrations Support
- 🗂️ Activity Audit Logs

## Documentation

- **Full Setup**: See [SETUP.md](./SETUP.md)
- **Project Info**: See [README.md](./README.md)
- **Database Schema**: See database-migration.sql

## What's Included

```
✓ React 18 + TypeScript
✓ Tailwind CSS + shadcn/ui
✓ Supabase (Auth + PostgreSQL)
✓ React Router
✓ React Hook Form
✓ TanStack Query
✓ Charts (Recharts)
✓ Drag & Drop (dnd-kit)
✓ Toast Notifications (Sonner)
✓ And 30+ other packages
```

## Deploy

### Deploy to Vercel (Recommended)
```bash
# Push to GitHub, then:
1. Go to vercel.com
2. Import your GitHub repo
3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel
4. Deploy!
```

### Deploy to Netlify
```bash
npm run build
# Then drag & drop the 'dist' folder to Netlify
```

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

**That's it! You're ready to start building.** 🚀
