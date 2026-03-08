import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { Plus, Trash2, Loader2, Zap, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';

const TRIGGERS = [
  { value: 'lead_score_change', label: 'Lead Score Changes', desc: 'When a contact reaches a score threshold' },
  { value: 'no_reply', label: 'No Reply Timeout', desc: 'When no reply received within X days' },
  { value: 'email_opened', label: 'Email Opened', desc: 'When a contact opens an email' },
  { value: 'page_visited', label: 'Page Visited', desc: 'When a tracked contact visits a page' },
  { value: 'form_submitted', label: 'Form Submitted', desc: 'When a tracked form is submitted' },
  { value: 'deal_stage_change', label: 'Deal Stage Change', desc: 'When a deal moves to a specific stage' },
];

const ACTIONS = [
  { value: 'move_to_stage', label: 'Move to Pipeline Stage' },
  { value: 'send_email', label: 'Send Email Template' },
  { value: 'add_tag', label: 'Add Tag to Contact' },
  { value: 'create_task', label: 'Create Task' },
  { value: 'webhook', label: 'Fire Webhook' },
  { value: 'update_score', label: 'Update Lead Score' },
];

export function AutomationRulesPage() {
  const { rules, isLoading, createRule, updateRule, deleteRule } = useAutomationRules();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const handleCreate = () => {
    if (!form.name?.trim() || !form.trigger_type || !form.action_type) return;
    createRule.mutate({
      name: form.name,
      description: form.description || null,
      trigger_type: form.trigger_type,
      trigger_config: { threshold: form.threshold, days: form.days, page_pattern: form.page_pattern },
      action_type: form.action_type,
      action_config: { tag: form.tag, webhook_url: form.webhook_url, stage_name: form.stage_name },
    });
    setForm({});
    setShowCreate(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Zap className="w-7 h-7" /> Automation Rules</h1>
          <p className="text-muted-foreground mt-1">Set up if-then rules to automate your workflow</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button variant="gradient"><Plus className="w-4 h-4 mr-2" />New Rule</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Automation Rule</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Rule Name *</Label><Input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Hot Lead Auto-Qualify" /></div>
              <div><Label>Description</Label><Textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
              
              <div className="p-3 rounded-lg bg-muted/30 space-y-3">
                <p className="text-sm font-semibold">IF (Trigger)</p>
                <Select value={form.trigger_type || ''} onValueChange={v => setForm({...form, trigger_type: v})}>
                  <SelectTrigger><SelectValue placeholder="Select trigger..." /></SelectTrigger>
                  <SelectContent>{TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
                {form.trigger_type === 'lead_score_change' && (
                  <div><Label className="text-xs">Score Threshold</Label><Input type="number" value={form.threshold || '70'} onChange={e => setForm({...form, threshold: e.target.value})} /></div>
                )}
                {form.trigger_type === 'no_reply' && (
                  <div><Label className="text-xs">Days Without Reply</Label><Input type="number" value={form.days || '7'} onChange={e => setForm({...form, days: e.target.value})} /></div>
                )}
                {form.trigger_type === 'page_visited' && (
                  <div><Label className="text-xs">URL Pattern</Label><Input value={form.page_pattern || ''} onChange={e => setForm({...form, page_pattern: e.target.value})} placeholder="/pricing*" /></div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-primary/5 space-y-3">
                <p className="text-sm font-semibold">THEN (Action)</p>
                <Select value={form.action_type || ''} onValueChange={v => setForm({...form, action_type: v})}>
                  <SelectTrigger><SelectValue placeholder="Select action..." /></SelectTrigger>
                  <SelectContent>{ACTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                </Select>
                {form.action_type === 'add_tag' && (
                  <div><Label className="text-xs">Tag Name</Label><Input value={form.tag || ''} onChange={e => setForm({...form, tag: e.target.value})} placeholder="hot-lead" /></div>
                )}
                {form.action_type === 'webhook' && (
                  <div><Label className="text-xs">Webhook URL</Label><Input value={form.webhook_url || ''} onChange={e => setForm({...form, webhook_url: e.target.value})} placeholder="https://..." /></div>
                )}
                {form.action_type === 'move_to_stage' && (
                  <div><Label className="text-xs">Stage Name</Label><Input value={form.stage_name || ''} onChange={e => setForm({...form, stage_name: e.target.value})} placeholder="Qualified" /></div>
                )}
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={!form.name?.trim() || !form.trigger_type || !form.action_type}>Create Rule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No automation rules yet. Create your first rule to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map(rule => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Switch checked={rule.is_active} onCheckedChange={v => updateRule.mutate({ id: rule.id, is_active: v })} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium text-sm">{rule.name}</span>
                        {rule.description && <p className="text-xs text-muted-foreground">{rule.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {TRIGGERS.find(t => t.value === rule.trigger_type)?.label || rule.trigger_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {ACTIONS.find(a => a.value === rule.action_type)?.label || rule.action_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{rule.execution_count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {rule.last_executed_at ? format(new Date(rule.last_executed_at), 'MMM d, HH:mm') : '—'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteRule.mutate(rule.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
