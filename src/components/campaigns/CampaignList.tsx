import { useState } from 'react';
import { Mail, Eye, MousePointer, Play, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Campaign {
  id: string;
  name: string;
  status: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  total_contacts: number | null;
  sent_count: number | null;
  open_count: number | null;
  click_count: number | null;
}

interface CampaignListProps {
  campaigns: Campaign[];
  onViewCampaign: (id: string) => void;
  onLaunchCampaign: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
}

export function CampaignList({ campaigns, onViewCampaign, onLaunchCampaign, onDeleteCampaign }: CampaignListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [launchConfirm, setLaunchConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/20 text-success border-0"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-500/20 text-blue-400 border-0"><Play className="w-3 h-3 mr-1" />Running</Badge>;
      case 'scheduled':
        return <Badge className="bg-warning/20 text-warning border-0"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
        <p className="text-muted-foreground">Create your first campaign to start reaching out to contacts</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const openRate = campaign.sent_count && campaign.sent_count > 0 
            ? ((campaign.open_count || 0) / campaign.sent_count * 100).toFixed(1) 
            : '0';
          const clickRate = campaign.sent_count && campaign.sent_count > 0 
            ? ((campaign.click_count || 0) / campaign.sent_count * 100).toFixed(1) 
            : '0';

          return (
            <div 
              key={campaign.id} 
              className="glass-card rounded-xl p-6 hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => onViewCampaign(campaign.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created {format(new Date(campaign.created_at), 'PPP')}
                    {campaign.completed_at && ` • Completed ${format(new Date(campaign.completed_at), 'PPp')}`}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-foreground font-medium">{campaign.sent_count || 0}</span>
                      <span className="text-muted-foreground">/ {campaign.total_contacts || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span className="text-foreground">{openRate}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-purple-400" />
                      <span className="text-foreground">{clickRate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {campaign.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="gradient"
                        onClick={() => setLaunchConfirm({ open: true, id: campaign.id, name: campaign.name })}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Launch
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setDeleteConfirm({ open: true, id: campaign.id, name: campaign.name })}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
        title="Delete Campaign?"
        description={`Are you sure you want to delete "${deleteConfirm.name}"? This will remove all associated contacts and data. This action cannot be undone.`}
        confirmLabel="Yes, delete"
        onConfirm={() => {
          onDeleteCampaign(deleteConfirm.id);
          setDeleteConfirm({ open: false, id: '', name: '' });
        }}
      />

      <ConfirmDialog
        open={launchConfirm.open}
        onOpenChange={(open) => setLaunchConfirm(prev => ({ ...prev, open }))}
        title="Launch Campaign?"
        description={`Are you sure you want to launch "${launchConfirm.name}"? Emails will start sending immediately.`}
        confirmLabel="Yes, launch"
        variant="default"
        onConfirm={() => {
          onLaunchCampaign(launchConfirm.id);
          setLaunchConfirm({ open: false, id: '', name: '' });
        }}
      />
    </>
  );
}
