import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Mail, Eye, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FollowUpSequence {
  id?: string;
  name: string;
  trigger_type: string;
  delay_hours: number;
  subject: string;
  content: string;
  status: string;
}

interface FollowUpConfigProps {
  campaignId: string;
}

const triggerOptions = [
  { value: 'opened_not_clicked', label: 'Opened but didn\'t click', icon: Eye },
  { value: 'not_opened', label: 'Did not open', icon: Mail },
  { value: 'clicked', label: 'Clicked a link', icon: MousePointer },
];

const delayOptions = [
  { value: 1, label: '1 hour' },
  { value: 6, label: '6 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '1 day' },
  { value: 48, label: '2 days' },
  { value: 72, label: '3 days' },
  { value: 168, label: '1 week' },
];

export function FollowUpConfig({ campaignId }: FollowUpConfigProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sequences, setSequences] = useState<FollowUpSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSequences();
  }, [campaignId]);

  const fetchSequences = async () => {
    const { data, error } = await supabase
      .from('follow_up_sequences')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at');

    if (error) {
      console.error('Error fetching sequences:', error);
    } else {
      setSequences(data || []);
    }
    setLoading(false);
  };

  const addSequence = () => {
    setSequences([
      ...sequences,
      {
        name: `Follow-up ${sequences.length + 1}`,
        trigger_type: 'opened_not_clicked',
        delay_hours: 24,
        subject: '',
        content: '',
        status: 'active',
      },
    ]);
  };

  const updateSequence = (index: number, field: keyof FollowUpSequence, value: any) => {
    const updated = [...sequences];
    updated[index] = { ...updated[index], [field]: value };
    setSequences(updated);
  };

  const removeSequence = async (index: number) => {
    const sequence = sequences[index];
    
    if (sequence.id) {
      const { error } = await supabase
        .from('follow_up_sequences')
        .delete()
        .eq('id', sequence.id);

      if (error) {
        toast({ title: 'Failed to delete sequence', variant: 'destructive' });
        return;
      }
    }

    setSequences(sequences.filter((_, i) => i !== index));
    toast({ title: 'Sequence removed' });
  };

  const saveSequences = async () => {
    if (!user) return;
    setSaving(true);

    try {
      for (const seq of sequences) {
        if (seq.id) {
          // Update existing
          await supabase
            .from('follow_up_sequences')
            .update({
              name: seq.name,
              trigger_type: seq.trigger_type,
              delay_hours: seq.delay_hours,
              subject: seq.subject,
              content: seq.content,
              status: seq.status,
            })
            .eq('id', seq.id);
        } else {
          // Insert new
          await supabase.from('follow_up_sequences').insert({
            user_id: user.id,
            campaign_id: campaignId,
            name: seq.name,
            trigger_type: seq.trigger_type,
            delay_hours: seq.delay_hours,
            subject: seq.subject,
            content: seq.content,
            status: seq.status,
          });
        }
      }

      toast({ title: 'Follow-up sequences saved!' });
      fetchSequences();
    } catch (error: any) {
      toast({ title: 'Failed to save sequences', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading sequences...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Automated Follow-ups</h3>
          <p className="text-sm text-muted-foreground">
            Create follow-up emails triggered by recipient behavior
          </p>
        </div>
        <Button onClick={addSequence} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Follow-up
        </Button>
      </div>

      {sequences.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No follow-up sequences configured</p>
          <Button onClick={addSequence} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Create First Follow-up
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sequences.map((seq, index) => (
            <div
              key={seq.id || index}
              className="border border-border rounded-xl p-5 space-y-4 bg-secondary/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Input
                    value={seq.name}
                    onChange={(e) => updateSequence(index, 'name', e.target.value)}
                    className="w-48 font-medium"
                    placeholder="Sequence name"
                  />
                  <Switch
                    checked={seq.status === 'active'}
                    onCheckedChange={(checked) =>
                      updateSequence(index, 'status', checked ? 'active' : 'paused')
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {seq.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSequence(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger When</Label>
                  <Select
                    value={seq.trigger_type}
                    onValueChange={(value) => updateSequence(index, 'trigger_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Delay</Label>
                  <Select
                    value={seq.delay_hours.toString()}
                    onValueChange={(value) => updateSequence(index, 'delay_hours', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {delayOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Follow-up Subject</Label>
                <Input
                  value={seq.subject}
                  onChange={(e) => updateSequence(index, 'subject', e.target.value)}
                  placeholder="Re: {{subject}} - Just following up..."
                />
              </div>

              <div className="space-y-2">
                <Label>Follow-up Content</Label>
                <Textarea
                  value={seq.content}
                  onChange={(e) => updateSequence(index, 'content', e.target.value)}
                  placeholder="Hi {{firstName}}, I wanted to follow up on my previous email..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Use variables: {'{{firstName}}'}, {'{{lastName}}'}, {'{{businessName}}'}, {'{{email}}'}
                </p>
              </div>
            </div>
          ))}

          <Button onClick={saveSequences} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Follow-up Sequences'}
          </Button>
        </div>
      )}
    </div>
  );
}
