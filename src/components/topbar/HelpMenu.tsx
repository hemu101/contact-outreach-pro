import { useState } from 'react';
import { HelpCircle, Send, BookOpen, MessageCircle, Mail } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function HelpMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user || !subject.trim() || !message.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject,
      message,
      category: 'general',
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Failed to send', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Sent!', description: "We'll get back to you soon." });
      setSubject('');
      setMessage('');
      setShowForm(false);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Help">
          <HelpCircle className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b flex items-center gap-2">
          <span>💡</span>
          <span className="font-semibold text-sm">Help &amp; Support</span>
        </div>
        {!showForm ? (
          <div className="p-2">
            <button
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left text-sm"
              onClick={() => {
                setOpen(false);
                navigate('/docs');
              }}
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="font-medium">📚 Documentation</p>
                <p className="text-xs text-muted-foreground">Browse guides &amp; tutorials</p>
              </div>
            </button>
            <button
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left text-sm"
              onClick={() => setShowForm(true)}
            >
              <MessageCircle className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="font-medium">💬 Contact Support</p>
                <p className="text-xs text-muted-foreground">Submit a help request</p>
              </div>
            </button>
            <a
              href="mailto:support@outreachflow.app"
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left text-sm"
            >
              <Mail className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="font-medium">📧 Email Us</p>
                <p className="text-xs text-muted-foreground">support@outreachflow.app</p>
              </div>
            </a>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <div>
              <Label className="text-xs">Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" />
            </div>
            <div>
              <Label className="text-xs">Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Describe your issue..." />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={submit} disabled={submitting}>
                <Send className="w-3 h-3 mr-1" /> Send
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
