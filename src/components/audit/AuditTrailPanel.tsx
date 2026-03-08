import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { Loader2, History } from 'lucide-react';
import { format } from 'date-fns';

export function AuditTrailPanel() {
  const { data: entries = [], isLoading } = useAuditTrail();

  const actionColor = (action: string) => {
    if (action === 'insert') return 'bg-green-500/10 text-green-500';
    if (action === 'update') return 'bg-blue-500/10 text-blue-500';
    if (action === 'delete') return 'bg-red-500/10 text-red-500';
    return '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><History className="w-7 h-7" /> Audit Trail</h1>
        <p className="text-muted-foreground mt-1">Track all changes across your data</p>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No audit entries yet. Changes will appear here automatically.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Changed Fields</TableHead>
                    <TableHead>Record ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(e.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{e.table_name}</Badge></TableCell>
                      <TableCell><Badge className={`text-xs ${actionColor(e.action)}`}>{e.action}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[300px]">
                          {e.changed_fields?.map(f => (
                            <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                          )) || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{e.record_id.slice(0, 8)}...</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
