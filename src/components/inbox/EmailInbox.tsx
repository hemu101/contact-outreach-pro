import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Reply
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EmailMessage {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  is_read: boolean;
  is_starred: boolean;
  folder: string;
  received_at: string;
  campaign_id: string | null;
  contact_id: string | null;
}

type FolderType = 'inbox' | 'starred' | 'sent' | 'archive' | 'trash';

export function EmailInbox() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [activeFolder, setActiveFolder] = useState<FolderType>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchEmails();
      subscribeToEmails();
    }
  }, [user, activeFolder]);

  const fetchEmails = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('email_inbox')
        .select('*')
        .eq('user_id', user.id)
        .order('received_at', { ascending: false });

      if (activeFolder === 'starred') {
        query = query.eq('is_starred', true);
      } else if (activeFolder !== 'inbox') {
        query = query.eq('folder', activeFolder);
      } else {
        query = query.eq('folder', 'inbox');
      }

      const { data, error } = await query;

      if (error) throw error;
      setEmails(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading emails',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToEmails = () => {
    const channel = supabase
      .channel('email-inbox-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_inbox',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEmails(prev => [payload.new as EmailMessage, ...prev]);
            toast({
              title: 'New email received',
              description: `From: ${(payload.new as EmailMessage).from_email}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setEmails(prev => 
              prev.map(e => e.id === payload.new.id ? payload.new as EmailMessage : e)
            );
          } else if (payload.eventType === 'DELETE') {
            setEmails(prev => prev.filter(e => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (email: EmailMessage) => {
    if (email.is_read) return;
    
    await supabase
      .from('email_inbox')
      .update({ is_read: true })
      .eq('id', email.id);

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user?.id,
      action_type: 'email_read',
      entity_type: 'email_inbox',
      entity_id: email.id,
      metadata: { from_email: email.from_email },
    });
  };

  const toggleStar = async (email: EmailMessage) => {
    await supabase
      .from('email_inbox')
      .update({ is_starred: !email.is_starred })
      .eq('id', email.id);
  };

  const moveToFolder = async (email: EmailMessage, folder: string) => {
    await supabase
      .from('email_inbox')
      .update({ folder })
      .eq('id', email.id);

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user?.id,
      action_type: `email_moved_to_${folder}`,
      entity_type: 'email_inbox',
      entity_id: email.id,
    });

    toast({
      title: `Email moved to ${folder}`,
    });
  };

  const filteredEmails = emails.filter(email => 
    email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = emails.filter(e => !e.is_read && e.folder === 'inbox').length;

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCount },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
      {/* Sidebar */}
      <div className="col-span-2">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inbox</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {folders.map((folder) => {
                const Icon = folder.icon;
                return (
                  <Button
                    key={folder.id}
                    variant={activeFolder === folder.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveFolder(folder.id as FolderType)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {folder.label}
                    {folder.count ? (
                      <Badge variant="secondary" className="ml-auto">
                        {folder.count}
                      </Badge>
                    ) : null}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email List */}
      <div className="col-span-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchEmails}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Mail className="h-8 w-8 mb-2" />
                  <p>No emails in this folder</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-accent/50 transition-colors",
                        selectedEmail?.id === email.id && "bg-accent",
                        !email.is_read && "bg-primary/5"
                      )}
                      onClick={() => {
                        setSelectedEmail(email);
                        markAsRead(email);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(email);
                          }}
                        >
                          <Star 
                            className={cn(
                              "h-4 w-4",
                              email.is_starred && "fill-yellow-400 text-yellow-400"
                            )} 
                          />
                        </Button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "font-medium truncate",
                              !email.is_read && "font-semibold"
                            )}>
                              {email.from_name || email.from_email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(email.received_at), 'MMM d')}
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm truncate",
                            !email.is_read ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {email.subject || '(No subject)'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {email.body_text?.substring(0, 60)}...
                          </p>
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

      {/* Email Detail */}
      <div className="col-span-6">
        <Card className="h-full flex flex-col">
          {selectedEmail ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedEmail.subject || '(No subject)'}</CardTitle>
                    <CardDescription className="mt-1">
                      From: {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}
                    </CardDescription>
                    <CardDescription>
                      {format(new Date(selectedEmail.received_at), 'PPpp')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={() => toggleStar(selectedEmail)}>
                      <Star className={cn(
                        "h-4 w-4",
                        selectedEmail.is_starred && "fill-yellow-400 text-yellow-400"
                      )} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => moveToFolder(selectedEmail, 'archive')}>
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => moveToFolder(selectedEmail, 'trash')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-4">
                {selectedEmail.body_html ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {selectedEmail.body_text}
                  </pre>
                )}
              </CardContent>
              <div className="p-4 border-t">
                <Button className="w-full">
                  <Reply className="mr-2 h-4 w-4" />
                  Reply
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MailOpen className="h-12 w-12 mb-4" />
              <p>Select an email to read</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
