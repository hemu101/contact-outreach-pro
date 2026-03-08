import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Tag, Download, X, Zap } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onTag: (tag: string) => void;
  onExport: () => void;
  onScoreAll: () => void;
  onClear: () => void;
}

export function BulkActionsBar({ selectedCount, onDelete, onTag, onExport, onScoreAll, onClear }: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in">
      <Badge variant="secondary" className="text-sm">{selectedCount} selected</Badge>
      <div className="flex gap-2 flex-1">
        <Button variant="outline" size="sm" onClick={() => onTag('hot-lead')}>
          <Tag className="w-3.5 h-3.5 mr-1" />Tag
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="w-3.5 h-3.5 mr-1" />Export
        </Button>
        <Button variant="outline" size="sm" onClick={onScoreAll}>
          <Zap className="w-3.5 h-3.5 mr-1" />Score
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
        </Button>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
