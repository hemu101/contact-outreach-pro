import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePipeline } from '@/hooks/usePipeline';
import { useCompanyContacts } from '@/hooks/useCompanyContacts';
import { useCompanies } from '@/hooks/useCompanies';
import { Plus, GripVertical, Trash2, DollarSign, Loader2, Kanban, ArrowRight } from 'lucide-react';

export function PipelineBoard() {
  const { stages, deals, isLoading, createDeal, updateDeal, deleteDeal, initDefaultStages } = usePipeline();
  const { contacts } = useCompanyContacts();
  const { companies } = useCompanies();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [dragDeal, setDragDeal] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && stages.length === 0) {
      initDefaultStages.mutate();
    }
  }, [isLoading, stages.length]);

  const handleSave = () => {
    if (!form.title?.trim()) return;
    createDeal.mutate({
      title: form.title,
      stage_id: form.stage_id || stages[0]?.id,
      value: parseFloat(form.value) || 0,
      probability: parseInt(form.probability) || 50,
      expected_close_date: form.expected_close_date || null,
      company_contact_id: form.company_contact_id || null,
      company_id: form.company_id || null,
      notes: form.notes || null,
    });
    setForm({});
    setShowAdd(false);
  };

  const handleDrop = (stageId: string) => {
    if (dragDeal) {
      updateDeal.mutate({ id: dragDeal, stage_id: stageId });
      setDragDeal(null);
    }
  };

  const stageDeals = (stageId: string) => deals.filter(d => d.stage_id === stageId);
  const stageTotal = (stageId: string) => stageDeals(stageId).reduce((s, d) => s + (d.value || 0), 0);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Kanban className="w-7 h-7" /> Pipeline</h1>
          <p className="text-muted-foreground mt-1">Drag deals between stages to update progress</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button variant="gradient"><Plus className="w-4 h-4 mr-2" />Add Deal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Deal</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Value</Label><Input type="number" value={form.value || ''} onChange={e => setForm({...form, value: e.target.value})} /></div>
                <div><Label>Probability %</Label><Input type="number" value={form.probability || '50'} onChange={e => setForm({...form, probability: e.target.value})} /></div>
              </div>
              <div><Label>Stage</Label>
                <Select value={form.stage_id || stages[0]?.id} onValueChange={v => setForm({...form, stage_id: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Company</Label>
                <Select value={form.company_id || ''} onValueChange={v => setForm({...form, company_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select company..." /></SelectTrigger>
                  <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Contact</Label>
                <Select value={form.company_contact_id || ''} onValueChange={v => setForm({...form, company_contact_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select contact..." /></SelectTrigger>
                  <SelectContent>{contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Close Date</Label><Input type="date" value={form.expected_close_date || ''} onChange={e => setForm({...form, expected_close_date: e.target.value})} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} rows={2} /></div>
              <Button onClick={handleSave} className="w-full" disabled={!form.title?.trim()}>Create Deal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div
            key={stage.id}
            className="min-w-[280px] w-[280px] flex-shrink-0"
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(stage.id)}
          >
            <Card className="border-border h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <CardTitle className="text-sm font-semibold">{stage.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{stageDeals(stage.id).length}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    ${stageTotal(stage.id).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 min-h-[200px]">
                {stageDeals(stage.id).map(deal => (
                  <Card
                    key={deal.id}
                    draggable
                    onDragStart={() => setDragDeal(deal.id)}
                    className="cursor-grab active:cursor-grabbing border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{deal.title}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteDeal.mutate(deal.id)}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{deal.value?.toLocaleString()}</span>
                        <Badge variant="outline" className="text-[10px]">{deal.probability}%</Badge>
                      </div>
                      {deal.expected_close_date && (
                        <p className="text-[10px] text-muted-foreground">Close: {deal.expected_close_date}</p>
                      )}
                      {/* Move buttons for non-drag users */}
                      <div className="flex gap-1">
                        {stages.filter(s => s.id !== deal.stage_id).slice(0, 2).map(s => (
                          <Button key={s.id} variant="ghost" size="sm" className="h-5 text-[10px] px-1" onClick={() => updateDeal.mutate({ id: deal.id, stage_id: s.id })}>
                            <ArrowRight className="w-2 h-2 mr-0.5" />{s.name}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
