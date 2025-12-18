import { Mail, Users, CheckCircle, Clock } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { ActivityFeed } from './ActivityFeed';
import { ActivityLog } from '@/types/contact';

interface DashboardProps {
  stats: {
    totalContacts: number;
    emailsSent: number;
    dmsSent: number;
    pending: number;
  };
  activities: ActivityLog[];
}

export function Dashboard({ stats, activities }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your outreach campaigns</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Contacts"
          value={stats.totalContacts}
          change="+12% from last week"
          trend="up"
          icon={Users}
        />
        <StatsCard
          title="Emails Sent"
          value={stats.emailsSent}
          change="+8% success rate"
          trend="up"
          icon={Mail}
        />
        <StatsCard
          title="DMs Sent"
          value={stats.dmsSent}
          change="Instagram & TikTok"
          trend="neutral"
          icon={CheckCircle}
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          change="Scheduled for today"
          trend="neutral"
          icon={Clock}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities} />
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-left font-medium">
              📤 Upload New CSV
            </button>
            <button className="w-full px-4 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-left font-medium">
              ✉️ Create Email Template
            </button>
            <button className="w-full px-4 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-left font-medium">
              🚀 Launch Campaign
            </button>
            <button className="w-full px-4 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-left font-medium">
              ⚡ Export n8n Workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
