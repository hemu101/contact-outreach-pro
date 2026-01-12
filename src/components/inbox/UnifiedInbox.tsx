import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, 
  Star, 
  Inbox, 
  Send, 
  Archive, 
  Trash2, 
  Search, 
  RefreshCw,
  MailOpen,
  Reply,
  Link2,
  Users,
  Instagram,
  Music2,
  MessageSquare,
  Filter,
  X,
  CheckCheck,
  Clock,
  ArrowRight,
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

  // Fetch email inbox
  const { data: emails = [], isLoading: emailsLoading, refetch: refetchEmails } = useQuery({
    queryKey: ['unified-inbox-emails', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_inbox')
        .select(`
          *,
          campaigns:campaign_id(name),
          contacts:contact_id(first_name, last_name)
        `)
        .eq('user_id', user?.id)
        .eq('folder', 'inbox')
        .order('received_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((e: any) => ({
        ...e,
        type: 'email' as const,
        campaign_name: e.campaigns?.name,
        contact_name: e.contacts ? `${e.contacts.first_name || ''} ${e.contacts.last_name || ''}`.trim() : null,
      }));
    },
    enabled: !!user,
  });

  // Fetch DM conversations (from dm_campaign_contacts)
  const { data: dmReplies = [], isLoading: dmsLoading, refetch: refetchDMs } = useQuery({
    queryKey: ['unified-inbox-dms', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dm_campaign_contacts')
        .select(`
          *,
          creators:creator_id(name, handle, platform),
          dm_campaigns:dm_campaign_id(name, platform)
        `)
        .not('replied_at', 'is', null)
        .order('replied_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        type: d.creators?.platform as 'instagram' | 'tiktok',
        from_handle: d.creators?.handle,
        from_name: d.creators?.name,
        subject: `Reply from @${d.creators?.handle}`,
        body_text: 'DM reply received. Check your ' + (d.creators?.platform || 'social media') + ' app for details.',
        is_read: !!d.status && d.status !== 'pending',
        is_starred: false,
        folder: 'inbox',
        received_at: d.replied_at,
        campaign_id: d.dm_campaign_id,
        campaign_name: d.dm_campaigns?.name,
        platform: d.creators?.platform,
        status: d.status,
      }));
    },
    enabled: !!user,
  });

  // Combine and sort messages
  const allMessages: Message[] = [...emails, ...dmReplies].sort(
    (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
  );

  // Filter messages
  const filteredMessages = allMessages.filter(msg => {
    // Apply search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      msg.subject?.toLowerCase().includes(searchLower) ||
      msg.from_email?.toLowerCase().includes(searchLower) ||
      msg.from_name?.toLowerCase().includes(searchLower) ||
      msg.from_handle?.toLowerCase().includes(searchLower) ||
      msg.body_text?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Apply type filter
    switch (activeFilter) {
      case 'email':
        return msg.type === 'email';
      case 'instagram':
        return msg.type === 'instagram';
      case 'tiktok':
        return msg.type === 'tiktok';
      case 'unread':
        return !msg.is_read;
      case 'starred':
        return msg.is_starred;
      case 'campaign_replies':
        return !!msg.campaign_id;
      default:
        return true;
    }
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (message: Message) => {
      if (message.type === 'email') {
        await supabase
          .from('email_inbox')
          .update({ is_read: true })
          .eq('id', message.id);
      } else {
        await supabase
          .from('dm_campaign_contacts')
          .update({ status: 'read' })
          .eq('id', message.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-inbox-emails'] });
      queryClient.invalidateQueries({ queryKey: ['unified-inbox-dms'] });
    },
  });

  // Toggle star mutation
  const toggleStar = useMutation({
    mutationFn: async (message: Message) => {
      if (message.type === 'email') {
        await supabase
          .from('email_inbox')
          .update({ is_starred: !message.is_starred })
          .eq('id', message.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-inbox-emails'] });
    },
  });

  // Archive mutation
  const archiveMessage = useMutation({
    mutationFn: async (message: Message) => {
      if (message.type === 'email') {
        await supabase
          .from('email_inbox')
          .update({ folder: 'archive' })
          .eq('id', message.id);
      } else {
        await supabase
          .from('dm_campaign_contacts')
          .update({ status: 'closed' })
          .eq('id', message.id);
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
    if (!message.is_read) {
      markAsRead.mutate(message);
    }
  };

  const handleRefresh = () => {
    refetchEmails();
    refetchDMs();
    toast({ title: 'Inbox refreshed' });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'tiktok':
        return <Music2 className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4 text-blue-500" />;
    }
  };

  const unreadCount = allMessages.filter(m => !m.is_read).length;
  const emailCount = emails.length;
  const dmCount = dmReplies.length;
  const campaignReplyCount = allMessages.filter(m => m.campaign_id).length;

  const isLoading = emailsLoading || dmsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Unified Inbox</h1>
        <p className="text-muted-foreground">
          View and respond to all email replies and DM responses in one place
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-250px)]">
        {/* Filters Sidebar */}
        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Filters</span>
                <Badge variant="secondary">{unreadCount}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                <Button
                  variant={activeFilter === 'all' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('all')}
                >
                  <Inbox className="mr-2 h-4 w-4" />
                  All Messages
                  <Badge variant="outline" className="ml-auto">{allMessages.length}</Badge>
                </Button>
                <Button
                  variant={activeFilter === 'unread' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('unread')}
                >
                  <MailOpen className="mr-2 h-4 w-4" />
                  Unread
                  <Badge variant="destructive" className="ml-auto">{unreadCount}</Badge>
                </Button>
                <Button
                  variant={activeFilter === 'starred' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('starred')}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Starred
                </Button>
                <Button
                  variant={activeFilter === 'campaign_replies' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('campaign_replies')}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Campaign Replies
                  <Badge variant="outline" className="ml-auto">{campaignReplyCount}</Badge>
                </Button>

                <div className="my-3 border-t pt-3">
                  <p className="text-xs text-muted-foreground px-2 mb-2">Channels</p>
                </div>

                <Button
                  variant={activeFilter === 'email' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('email')}
                >
                  <Mail className="mr-2 h-4 w-4 text-blue-500" />
                  Email
                  <Badge variant="outline" className="ml-auto">{emailCount}</Badge>
                </Button>
                <Button
                  variant={activeFilter === 'instagram' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('instagram')}
                >
                  <Instagram className="mr-2 h-4 w-4 text-pink-500" />
                  Instagram
                </Button>
                <Button
                  variant={activeFilter === 'tiktok' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter('tiktok')}
                >
                  <Music2 className="mr-2 h-4 w-4" />
                  TikTok
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message List */}
        <div className="col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <p>No messages found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredMessages.map((message) => (
                      <div
                        key={`${message.type}-${message.id}`}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-accent/50 transition-colors",
                          selectedMessage?.id === message.id && "bg-accent",
                          !message.is_read && "bg-primary/5"
                        )}
                        onClick={() => handleSelectMessage(message)}
                      >
                        <div className="flex items-start gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar.mutate(message);
                            }}
                          >
                            <Star 
                              className={cn(
                                "h-4 w-4",
                                message.is_starred && "fill-yellow-400 text-yellow-400"
                              )} 
                            />
                          </Button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {getMessageIcon(message.type)}
                              <span className={cn(
                                "font-medium truncate flex-1",
                                !message.is_read && "font-semibold"
                              )}>
                                {message.from_name || message.from_handle || message.from_email}
                              </span>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(message.received_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className={cn(
                              "text-sm truncate",
                              !message.is_read ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {message.subject || '(No subject)'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {message.campaign_name && (
                                <Badge variant="outline" className="text-xs">
                                  {message.campaign_name}
                                </Badge>
                              )}
                              {!message.is_read && (
                                <Badge variant="default" className="text-xs">New</Badge>
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
        <div className="col-span-6">
          <Card className="h-full flex flex-col">
            {selectedMessage ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getMessageIcon(selectedMessage.type)}
                        <CardTitle className="text-lg">
                          {selectedMessage.subject || '(No subject)'}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {(selectedMessage.from_name || selectedMessage.from_handle || selectedMessage.from_email || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {selectedMessage.from_name || selectedMessage.from_handle || selectedMessage.from_email}
                        </span>
                      </CardDescription>
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(selectedMessage.received_at), 'PPpp')}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        {selectedMessage.campaign_id && (
                          <Badge variant="outline" className="text-xs">
                            <Link2 className="h-3 w-3 mr-1" />
                            Campaign: {selectedMessage.campaign_name}
                          </Badge>
                        )}
                        {selectedMessage.contact_name && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {selectedMessage.contact_name}
                          </Badge>
                        )}
                        <Badge 
                          variant={selectedMessage.type === 'email' ? 'default' : 'secondary'}
                          className="text-xs capitalize"
                        >
                          {selectedMessage.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => toggleStar.mutate(selectedMessage)}
                      >
                        <Star className={cn(
                          "h-4 w-4",
                          selectedMessage.is_starred && "fill-yellow-400 text-yellow-400"
                        )} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => archiveMessage.mutate(selectedMessage)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4">
                  {selectedMessage.body_html ? (
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {selectedMessage.body_text || 'No content available.'}
                    </pre>
                  )}
                </CardContent>
                <div className="p-4 border-t space-y-3">
                  <Textarea
                    placeholder={`Reply to ${selectedMessage.from_name || selectedMessage.from_handle || selectedMessage.from_email}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {selectedMessage.type === 'email' 
                        ? 'Reply will be sent via email' 
                        : `Reply in ${selectedMessage.platform || selectedMessage.type} app`}
                    </p>
                    <Button disabled={!replyText.trim()}>
                      <Reply className="mr-2 h-4 w-4" />
                      {selectedMessage.type === 'email' ? 'Send Reply' : 'Copy Reply'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MailOpen className="h-12 w-12 mb-4" />
                <p className="font-medium">Select a message to read</p>
                <p className="text-sm">Choose from your inbox on the left</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
