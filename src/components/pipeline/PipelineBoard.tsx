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
import { Plus, GripVertical, Trash2, DollarSign, Loader2, Kanban, ArrowRight, Settings2, Palette, Edit } from 'lucide-react';

const STAGE_COLORS = [
  '#6366f1', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#a855f7',
];

export function PipelineBoard() {
  const { stages, deals, isLoading, createStage, createDeal, updateDeal, deleteDeal, initDefaultStages } = usePipeline();
  const { contacts } = useCompanyContacts();
  const { companies } = useCompanies();
  const [showAdd, setShowAdd] = useState(false);
  const [showStageManager, setShowStageManager] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#6366f1');
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

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    createStage.mutate({
      name: newStageName,
      color: newStageColor,
      position: stages.length,
    });
    setNewStageName('');
  };

  const handleDrop = (stageId: string) => {
    if (dragDeal) {
      updateDeal.mutate({ id: dragDeal, stage_id: stageId });
      setDragDeal(null);
    }
  };

  const stageDeals = (stageId: string) => deals.filter(d => d.stage_id === stageId);
  const stageTotal = (stageId: string) => stageDeals(stageId).reduce((s, d) => s + (d.value || 0), 0);
  const totalPipeline = deals.reduce((s, d) => s + (d.value || 0), 0);
  const weightedPipeline = deals.reduce((s, d) => s + (d.value || 0) * ((d.probability || 50) / 100), 0);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Kanban className="w-7 h-7" /> Pipeline</h1>
          <p className="text-muted-foreground mt-1">Drag deals between stages • Total: ${totalPipeline.toLocaleString()} • Weighted: ${weightedPipeline.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showStageManager} onOpenChange={setShowStageManager}>
            <DialogTrigger asChild>
              <Button variant="outline"><Settings2 className="w-4 h-4 mr-2" />Manage Stages</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Custom Pipeline Stages</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  {stages.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="flex-1 text-sm font-medium">{s.name}</span>
                      <Badge variant="outline" className="text-[10px]">{stageDeals(s.id).length} deals</Badge>
                      <span className="text-xs text-muted-foreground">Pos {s.position}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <Label className="text-sm font-medium">Add New Stage</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Stage name..."
                      value={newStageName}
                      onChange={e => setNewStageName(e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex gap-1">
                      {STAGE_COLORS.slice(0, 6).map(color => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded-full border-2 ${newStageColor === color ? 'border-foreground' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewStageColor(color)}
                        />
                      ))}
                    </div>
                    <Button onClick={handleAddStage} disabled={!newStageName.trim()} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
                {stageDeals(stage.id).map(deal => {
                  const contact = contacts.find(c => c.id === deal.company_contact_id);
                  return (
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
                        {contact && (
                          <p className="text-[10px] text-muted-foreground">{contact.first_name} {contact.last_name}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{deal.value?.toLocaleString()}</span>
                          <Badge variant="outline" className="text-[10px]">{deal.probability}%</Badge>
                        </div>
                        {deal.expected_close_date && (
                          <p className="text-[10px] text-muted-foreground">Close: {deal.expected_close_date}</p>
                        )}
                        <div className="flex gap-1 flex-wrap">
                          {stages.filter(s => s.id !== deal.stage_id).slice(0, 3).map(s => (
                            <Button key={s.id} variant="ghost" size="sm" className="h-5 text-[10px] px-1" onClick={() => updateDeal.mutate({ id: deal.id, stage_id: s.id })}>
                              <ArrowRight className="w-2 h-2 mr-0.5" />{s.name}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
