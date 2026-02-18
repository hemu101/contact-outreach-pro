import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mail, Star, Inbox, Send, Archive, Trash2, Search, RefreshCw,
  MailOpen, Reply, Link2, Users, Instagram, Music2, MessageSquare,
  Clock, Sparkles, ArrowUpRight, Eye,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'email' | 'instagram' | 'tiktok';
  from_email?: string;
  from_name?: string;
  from_handle?: string;
  subject?: string;
  body_text?: string;
  body_html?: string;
  is_read: boolean;
  is_starred: boolean;
  folder: string;
  received_at: string;
  campaign_id?: string;
  campaign_name?: string;
  contact_id?: string;
  contact_name?: string;
  platform?: string;
  status?: 'pending' | 'replied' | 'closed';
}

type FilterType = 'all' | 'email' | 'instagram' | 'tiktok' | 'unread' | 'starred' | 'campaign_replies';

export function UnifiedInbox() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading: emailsLoading, refetch: refetchEmails } = useQuery({
    queryKey: ['unified-inbox-emails', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_inbox')
        .select(`*, campaigns:campaign_id(name), contacts:contact_id(first_name, last_name)`)
        .eq('user_id', user?.id)
        .eq('folder', 'inbox')
        .order('received_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((e: any) => ({
        ...e, type: 'email' as const,
        campaign_name: e.campaigns?.name,
        contact_name: e.contacts ? `${e.contacts.first_name || ''} ${e.contacts.last_name || ''}`.trim() : null,
      }));
    },
    enabled: !!user,
  });

  const { data: dmReplies = [], isLoading: dmsLoading, refetch: refetchDMs } = useQuery({
    queryKey: ['unified-inbox-dms', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dm_campaign_contacts')
        .select(`*, creators:creator_id(name, handle, platform), dm_campaigns:dm_campaign_id(name, platform)`)
        .not('replied_at', 'is', null)
        .order('replied_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id, type: d.creators?.platform as 'instagram' | 'tiktok',
        from_handle: d.creators?.handle, from_name: d.creators?.name,
        subject: `Reply from @${d.creators?.handle}`,
        body_text: 'DM reply received. Check your ' + (d.creators?.platform || 'social media') + ' app for details.',
        is_read: !!d.status && d.status !== 'pending', is_starred: false,
        folder: 'inbox', received_at: d.replied_at,
        campaign_id: d.dm_campaign_id, campaign_name: d.dm_campaigns?.name,
        platform: d.creators?.platform, status: d.status,
      }));
    },
    enabled: !!user,
  });

  const allMessages: Message[] = [...emails, ...dmReplies].sort(
    (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
  );

  const filteredMessages = allMessages.filter(msg => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      msg.subject?.toLowerCase().includes(searchLower) ||
      msg.from_email?.toLowerCase().includes(searchLower) ||
      msg.from_name?.toLowerCase().includes(searchLower) ||
      msg.from_handle?.toLowerCase().includes(searchLower) ||
      msg.body_text?.toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;
    switch (activeFilter) {
      case 'email': return msg.type === 'email';
      case 'instagram': return msg.type === 'instagram';
      case 'tiktok': return msg.type === 'tiktok';
      case 'unread': return !msg.is_read;
      case 'starred': return msg.is_starred;
      case 'campaign_replies': return !!msg.campaign_id;
      default: return true;
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (message: Message) => {
      if (message.type === 'email') {
        await supabase.from('email_inbox').update({ is_read: true }).eq('id', message.id);
      } else {
        await supabase.from('dm_campaign_contacts').update({ status: 'read' }).eq('id', message.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-inbox-emails'] });
      queryClient.invalidateQueries({ queryKey: ['unified-inbox-dms'] });
    },
  });

  const toggleStar = useMutation({
    mutationFn: async (message: Message) => {
      if (message.type === 'email') {
        await supabase.from('email_inbox').update({ is_starred: !message.is_starred }).eq('id', message.id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['unified-inbox-emails'] }),
  });

  const archiveMessage = useMutation({
    mutationFn: async (message: Message) => {
      if (message.type === 'email') {
        await supabase.from('email_inbox').update({ folder: 'archive' }).eq('id', message.id);
      } else {
        await supabase.from('dm_campaign_contacts').update({ status: 'closed' }).eq('id', message.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-inbox-emails'] });
      queryClient.invalidateQueries({ queryKey: ['unified-inbox-dms'] });
      setSelectedMessage(null);
      toast({ title: 'Message archived' });
    },
  });

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read) markAsRead.mutate(message);
  };

  const handleRefresh = () => {
    refetchEmails();
    refetchDMs();
    toast({ title: 'Inbox refreshed' });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'tiktok': return <Music2 className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4 text-primary" />;
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'instagram': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'tiktok': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const unreadCount = allMessages.filter(m => !m.is_read).length;
  const emailCount = emails.length;
  const dmCount = dmReplies.length;
  const campaignReplyCount = allMessages.filter(m => m.campaign_id).length;
  const isLoading = emailsLoading || dmsLoading;

  const filterButtons: { key: FilterType; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'all', label: 'All', icon: <Inbox className="h-4 w-4" />, count: allMessages.length },
    { key: 'unread', label: 'Unread', icon: <MailOpen className="h-4 w-4" />, count: unreadCount },
    { key: 'starred', label: 'Starred', icon: <Star className="h-4 w-4" /> },
    { key: 'campaign_replies', label: 'Campaigns', icon: <Link2 className="h-4 w-4" />, count: campaignReplyCount },
    { key: 'email', label: 'Email', icon: <Mail className="h-4 w-4 text-primary" />, count: emailCount },
    { key: 'instagram', label: 'Instagram', icon: <Instagram className="h-4 w-4 text-pink-500" /> },
    { key: 'tiktok', label: 'TikTok', icon: <Music2 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 glow-effect">
              <Inbox className="h-6 w-6 text-primary" />
            </div>
            Unified Inbox
          </h1>
          <p className="text-muted-foreground mt-1">
            All your email replies and DM responses in one place
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Messages', value: allMessages.length, icon: <MessageSquare className="h-4 w-4 text-primary" /> },
          { label: 'Unread', value: unreadCount, icon: <Eye className="h-4 w-4 text-warning" /> },
          { label: 'Emails', value: emailCount, icon: <Mail className="h-4 w-4 text-primary" /> },
          { label: 'DM Replies', value: dmCount, icon: <Send className="h-4 w-4 text-pink-400" /> },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterButtons.map((f) => (
          <Button
            key={f.key}
            variant={activeFilter === f.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "gap-1.5 rounded-full",
              activeFilter === f.key && "glow-effect"
            )}
          >
            {f.icon}
            {f.label}
            {f.count !== undefined && f.count > 0 && (
              <Badge variant={activeFilter === f.key ? 'secondary' : 'outline'} className="ml-1 text-xs px-1.5 py-0">
                {f.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-380px)]">
        {/* Message List */}
        <div className="col-span-5">
          <Card className="h-full flex flex-col glass-card">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50 border-border/50"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                    <div className="p-4 rounded-2xl bg-secondary/50 mb-4">
                      <Sparkles className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground mb-1">No messages yet</p>
                    <p className="text-sm text-muted-foreground max-w-[240px]">
                      {activeFilter === 'all'
                        ? 'Replies to your campaigns will appear here automatically.'
                        : `No ${activeFilter} messages found. Try a different filter.`}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {filteredMessages.map((message) => (
                      <div
                        key={`${message.type}-${message.id}`}
                        className={cn(
                          "px-4 py-3 cursor-pointer transition-all duration-150",
                          "hover:bg-accent/10",
                          selectedMessage?.id === message.id && "bg-primary/5 border-l-2 border-l-primary",
                          !message.is_read && "bg-primary/[0.03]"
                        )}
                        onClick={() => handleSelectMessage(message)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-9 w-9 mt-0.5 shrink-0">
                            <AvatarFallback className={cn("text-xs font-semibold", getChannelColor(message.type))}>
                              {(message.from_name || message.from_handle || message.from_email || '?')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={cn(
                                "text-sm truncate",
                                !message.is_read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                              )}>
                                {message.from_name || message.from_handle || message.from_email}
                              </span>
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(message.received_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className={cn(
                              "text-sm truncate mt-0.5",
                              !message.is_read ? "text-foreground/90" : "text-muted-foreground"
                            )}>
                              {message.subject || '(No subject)'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", getChannelColor(message.type))}>
                                {message.type}
                              </Badge>
                              {message.campaign_name && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {message.campaign_name}
                                </Badge>
                              )}
                              {!message.is_read && (
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                              )}
                              {message.is_starred && (
                                <Star className="h-3 w-3 fill-warning text-warning" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="col-span-7">
          <Card className="h-full flex flex-col glass-card">
            {selectedMessage ? (
              <>
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        {getMessageIcon(selectedMessage.type)}
                        <CardTitle className="text-lg truncate">
                          {selectedMessage.subject || '(No subject)'}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className={cn("text-[10px] font-semibold", getChannelColor(selectedMessage.type))}>
                            {(selectedMessage.from_name || selectedMessage.from_handle || selectedMessage.from_email || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {selectedMessage.from_name || selectedMessage.from_handle || selectedMessage.from_email}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(selectedMessage.received_at), 'PPpp')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn("text-xs border", getChannelColor(selectedMessage.type))}>
                          {selectedMessage.type}
                        </Badge>
                        {selectedMessage.campaign_name && (
                          <Badge variant="outline" className="text-xs">
                            <Link2 className="h-3 w-3 mr-1" />
                            {selectedMessage.campaign_name}
                          </Badge>
                        )}
                        {selectedMessage.contact_name && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {selectedMessage.contact_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => toggleStar.mutate(selectedMessage)}
                      >
                        <Star className={cn("h-4 w-4", selectedMessage.is_starred && "fill-warning text-warning")} />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => archiveMessage.mutate(selectedMessage)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-5">
                  {selectedMessage.body_html ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
                      {selectedMessage.body_text || 'No content available.'}
                    </pre>
                  )}
                </CardContent>
                <div className="p-4 border-t border-border/50 space-y-3">
                  <Textarea
                    placeholder={`Reply to ${selectedMessage.from_name || selectedMessage.from_handle || selectedMessage.from_email}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    className="bg-secondary/30 border-border/50 resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {selectedMessage.type === 'email'
                        ? 'Reply will be sent via email'
                        : `Reply in ${selectedMessage.platform || selectedMessage.type} app`}
                    </p>
                    <Button disabled={!replyText.trim()} className="gap-2">
                      <Reply className="h-4 w-4" />
                      {selectedMessage.type === 'email' ? 'Send Reply' : 'Copy Reply'}
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="p-5 rounded-2xl bg-secondary/50 mb-5">
                  <MailOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">Select a message</p>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                  Choose a conversation from the list to view its contents and reply
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
