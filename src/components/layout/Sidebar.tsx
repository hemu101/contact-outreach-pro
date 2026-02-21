import { useState } from 'react';
import { 
  Mail, 
  Users, 
  FileText, 
  Settings, 
  Zap,
  ChevronLeft,
  ChevronRight,
  PieChart,
  LayoutDashboard,
  Inbox,
  Flame,
  Shield,
  Instagram,
  Library,
  Link2,
  UserSearch,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'analytics', icon: PieChart, label: 'Analytics' },
  { id: 'contacts', icon: Users, label: 'Contacts' },
  { id: 'templates', icon: FileText, label: 'Templates' },
  { id: 'campaigns', icon: Mail, label: 'Campaigns' },
  { id: 'unified-inbox', icon: Inbox, label: 'Unified Inbox' },
  { id: 'deliverability', icon: Shield, label: 'Deliverability' },
  { id: 'warmup', icon: Flame, label: 'Email Warmup' },
  { id: 'social-dms', icon: Instagram, label: 'Social DMs' },
  { id: 'link-finder', icon: Link2, label: 'Link Finder' },
  { id: 'linkedin-scraper', icon: UserSearch, label: 'LinkedIn Scraper' },
  { id: 'companies', icon: Building2, label: 'Companies' },
  { id: 'n8n', icon: Zap, label: 'n8n Workflow' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-sidebar-foreground">OutreachFlow</h1>
              <p className="text-xs text-muted-foreground">Automation Hub</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-primary" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
              {!collapsed && (
                <span className={cn("font-medium animate-fade-in", isActive && "text-foreground")}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
