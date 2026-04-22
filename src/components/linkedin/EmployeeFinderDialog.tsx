import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Users, ExternalLink, Mail, Linkedin, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Person {
  name: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  email?: string;
  predicted_emails?: string[];
  linkedin?: string;
  source: string;
  confidence: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialWebsite?: string;
  companyName?: string;
  companyId?: string;
}

export function EmployeeFinderDialog({ open, onClose, initialWebsite = '', companyName = '', companyId }: Props) {
  const [website, setWebsite] = useState(initialWebsite);
  const [name, setName] = useState(companyName);
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setWebsite(initialWebsite || '');
    setName(companyName || '');
  }, [open, initialWebsite, companyName]);

  const sortedPeople = useMemo(
    () => [...people].sort((a, b) => (b.confidence || 0) - (a.confidence || 0)),
    [people]
  );

  const handleFind = async () => {
    if (!website.trim()) {
      toast({ title: 'Enter a company website', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setPeople([]);
    try {
      const { data, error } = await supabase.functions.invoke('find-company-people', {
        body: { website: website.trim(), company_name: name.trim() || undefined, company_id: companyId, save: !!companyId },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Search failed');
      setPeople(data.people || []);
      setSources(data.sources || []);
      toast({
        title: `Found ${data.people?.length || 0} people`,
        description: companyId ? `Saved ${data.saved} to contacts` : `Sources: ${(data.sources || []).join(', ')}`,
      });
    } catch (e: any) {
      toast({ title: 'Search failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Find Employees by Company
          </DialogTitle>
          <DialogDescription>
            Enter a company website to run a LeadIQ-style search across team pages, LinkedIn signals, and predicted work emails.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Company Website *</Label>
            <Input placeholder="acme.com" value={website} onChange={e => setWebsite(e.target.value)} />
          </div>
          <div>
            <Label>Company Name (optional)</Label>
            <Input placeholder="Acme Inc" value={name} onChange={e => setName(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleFind} disabled={loading || !website.trim()} className="w-full">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Searching all sources...</> : <><Sparkles className="w-4 h-4 mr-2" />Find Employees</>}
        </Button>

        {sources.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {sources.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
          </div>
        )}

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2">
            {sortedPeople.map((p, i) => (
              <div key={i} className="border border-border rounded-lg p-3 hover:bg-muted/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <Badge variant="secondary" className="text-xs">{p.source}</Badge>
                      <Badge variant="outline" className="text-xs">{p.confidence || 0}% match</Badge>
                    </div>
                    {p.title && <p className="text-sm text-muted-foreground">{p.title}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      {p.email && (
                        <span className="flex items-center gap-1 text-success">
                          <Mail className="w-3 h-3" />{p.email}
                        </span>
                      )}
                      {!p.email && p.predicted_emails && p.predicted_emails.length > 0 && (
                        <span className="flex items-center gap-1 text-warning">
                          <Mail className="w-3 h-3" />Predicted: {p.predicted_emails.slice(0, 2).join(', ')}
                        </span>
                      )}
                      {p.linkedin && (
                        <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <Linkedin className="w-3 h-3" />LinkedIn <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!loading && people.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No results yet. Enter a website and click Find Employees.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
