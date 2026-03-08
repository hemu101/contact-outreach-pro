import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSmartLists } from '@/hooks/useSmartLists';
import { Plus, Pin, Trash2, Filter, ListFilter } from 'lucide-react';

interface SmartListsPanelProps {
  onApplyFilters: (filters: any[]) => void;
  activeListId?: string;
}

const FILTER_FIELDS = [
  { value: 'seniority', label: 'Seniority' },
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
  { value: 'mql', label: 'MQL Status' },
  { value: 'sql_status', label: 'SQL Status' },
  { value: 'title', label: 'Job Title' },
  { value: 'departments', label: 'Department' },
  { value: 'lead_score', label: 'Lead Score' },
];

const OPERATORS = [
  { value: 'eq', label: 'equals' },
  { value: 'neq', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'gt', label: 'greater than' },
  { value: 'lt', label: 'less than' },
];

export function SmartListsPanel({ onApplyFilters, activeListId }: SmartListsPanelProps) {
  const { lists, createList, updateList, deleteList } = useSmartLists();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [filters, setFilters] = useState<{ field: string; operator: string; value: string }[]>([
    { field: 'seniority', operator: 'eq', value: '' },
  ]);

  const addFilter = () => setFilters([...filters, { field: 'country', operator: 'eq', value: '' }]);
  const removeFilter = (i: number) => setFilters(filters.filter((_, idx) => idx !== i));
  const updateFilter = (i: number, key: string, val: string) => {
    const f = [...filters];
    (f[i] as any)[key] = val;
    setFilters(f);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createList.mutate({ name, filters: filters.filter(f => f.value.trim()) });
    setName('');
    setFilters([{ field: 'seniority', operator: 'eq', value: '' }]);
    setShowCreate(false);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ListFilter className="w-4 h-4" />Smart Lists
          </CardTitle>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Smart List</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hot Leads in US" /></div>
                <Label>Filters</Label>
                {filters.map((f, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <Select value={f.field} onValueChange={v => updateFilter(i, 'field', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{FILTER_FIELDS.map(ff => <SelectItem key={ff.value} value={ff.value}>{ff.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={f.operator} onValueChange={v => updateFilter(i, 'operator', v)}>
                      <SelectTrigger className="h-8 text-sm w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>{OPERATORS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input className="h-8 text-sm" value={f.value} onChange={e => updateFilter(i, 'value', e.target.value)} placeholder="value" />
                    {filters.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFilter(i)}><Trash2 className="w-3 h-3" /></Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addFilter}><Plus className="w-3 h-3 mr-1" />Add Filter</Button>
                <Button onClick={handleCreate} className="w-full" disabled={!name.trim()}>Save Smart List</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {lists.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No saved lists yet</p>
        ) : (
          lists.map(list => (
            <div
              key={list.id}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${activeListId === list.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
              onClick={() => onApplyFilters(list.filters)}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm">{list.name}</span>
                {list.is_pinned && <Pin className="w-3 h-3 text-primary" />}
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-[10px]">{list.filters?.length || 0} filters</Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); deleteList.mutate(list.id); }}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
