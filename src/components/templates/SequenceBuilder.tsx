import { useState } from 'react';
import { Plus, GripVertical, Trash2, Mail, MessageSquare, Phone, Linkedin, Clock, ArrowDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTemplates } from '@/hooks/useTemplates';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface SequenceStep {
  step: number;
  type: 'email' | 'linkedin' | 'instagram' | 'tiktok' | 'call' | 'task';
  delay: number;
  subject?: string;
  templateId?: string;
  templateName?: string;
}

interface SequenceBuilderProps {
  steps: SequenceStep[];
  onChange: (steps: SequenceStep[]) => void;
}

const stepTypeConfig = {
  email: { icon: Mail, label: 'Email', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'bg-sky-500/10 text-sky-500 border-sky-500/30' },
  instagram: { icon: MessageSquare, label: 'Instagram DM', color: 'bg-pink-500/10 text-pink-500 border-pink-500/30' },
  tiktok: { icon: MessageSquare, label: 'TikTok DM', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  call: { icon: Phone, label: 'Call', color: 'bg-green-500/10 text-green-500 border-green-500/30' },
  task: { icon: FileText, label: 'Manual Task', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
};

const delayOptions = [
  { value: 0, label: 'Immediately' },
  { value: 1, label: '1 day' },
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 5, label: '5 days' },
  { value: 7, label: '1 week' },
  { value: 10, label: '10 days' },
  { value: 14, label: '2 weeks' },
];

function SortableStep({ 
  step, 
  index, 
  isLast,
  allSteps,
  onUpdate, 
  onRemove, 
  onImportTemplate 
}: { 
  step: SequenceStep; 
  index: number; 
  isLast: boolean;
  allSteps: SequenceStep[];
  onUpdate: (index: number, updates: Partial<SequenceStep>) => void;
  onRemove: (index: number) => void;
  onImportTemplate: (index: number) => void;
}) {
  const config = stepTypeConfig[step.type];
  const Icon = config.icon;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `step-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "border rounded-xl p-4 bg-card transition-all",
          isDragging && "opacity-50 shadow-lg ring-2 ring-primary/30"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-secondary"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Step number + icon */}
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border shrink-0", config.color)}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  Step {index + 1}
                </Badge>
                <Badge className={cn("text-xs border", config.color)}>
                  {config.label}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemove(index)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Channel</Label>
                <Select value={step.type} onValueChange={(v) => onUpdate(index, { type: v as SequenceStep['type'] })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(stepTypeConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <cfg.icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Wait before sending</Label>
                <Select value={step.delay.toString()} onValueChange={(v) => onUpdate(index, { delay: parseInt(v) })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {delayOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(step.type === 'email') && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g., Quick intro from {{sender_name}}"
                  value={step.subject || ''}
                  onChange={(e) => onUpdate(index, { subject: e.target.value })}
                />
              </div>
            )}

            {/* Import template button */}
            {(step.type === 'email' || step.type === 'instagram' || step.type === 'tiktok' || step.type === 'linkedin') && (
              <div className="flex items-center gap-2">
                {step.templateName ? (
                  <Badge variant="secondary" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    {step.templateName}
                  </Badge>
                ) : null}
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onImportTemplate(index)}>
                  <FileText className="w-3 h-3 mr-1" />
                  {step.templateName ? 'Change Template' : 'Import Template'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connector arrow */}
      {!isLast && (
        <div className="flex flex-col items-center py-1">
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-[10px]">
              {delayOptions.find(d => d.value === (allSteps?.[index + 1]?.delay ?? 0))?.label || `${allSteps?.[index + 1]?.delay ?? 0} days`}
            </span>
          </div>
          <ArrowDown className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
    </div>
  );

  // Need access to parent steps for connector - workaround via closure
}

// No wrapper needed - allSteps is now part of SortableStep props

export function SequenceBuilder({ steps, onChange }: SequenceBuilderProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTargetIndex, setImportTargetIndex] = useState<number | null>(null);
  const { templates: emailTemplates } = useTemplates();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = parseInt((active.id as string).replace('step-', ''));
    const newIndex = parseInt((over.id as string).replace('step-', ''));

    const reordered = arrayMove(steps, oldIndex, newIndex).map((s, i) => ({ ...s, step: i + 1 }));
    onChange(reordered);
  };

  const addStep = (type: SequenceStep['type'] = 'email') => {
    const newStep: SequenceStep = {
      step: steps.length + 1,
      type,
      delay: steps.length === 0 ? 0 : 3,
      subject: type === 'email' ? '' : undefined,
    };
    onChange([...steps, newStep]);
  };

  const updateStep = (index: number, updates: Partial<SequenceStep>) => {
    const updated = steps.map((s, i) => i === index ? { ...s, ...updates } : s);
    onChange(updated);
  };

  const removeStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step: i + 1 }));
    onChange(filtered);
  };

  const openImportModal = (index: number) => {
    setImportTargetIndex(index);
    setShowImportModal(true);
  };

  const handleImportTemplate = (template: { id: string; name: string; subject?: string | null; type: string }) => {
    if (importTargetIndex === null) return;
    updateStep(importTargetIndex, {
      templateId: template.id,
      templateName: template.name,
      subject: template.subject || undefined,
    });
    setShowImportModal(false);
    setImportTargetIndex(null);
  };

  // Filter templates by the step type we're importing for
  const importStepType = importTargetIndex !== null ? steps[importTargetIndex]?.type : 'email';
  const filteredTemplates = emailTemplates.filter(t => {
    if (importStepType === 'email') return t.type === 'email';
    if (importStepType === 'instagram') return t.type === 'instagram';
    if (importStepType === 'tiktok') return t.type === 'tiktok';
    if (importStepType === 'linkedin') return t.type === 'linkedin';
    return true;
  });

  const items = steps.map((_, i) => `step-${i}`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Sequence Steps</h3>
          <p className="text-xs text-muted-foreground">Drag to reorder. Import templates into steps.</p>
        </div>
        <Badge variant="outline" className="text-xs">{steps.length} steps</Badge>
      </div>

      {steps.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <Mail className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-3">No steps yet. Add your first step to build the sequence.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(stepTypeConfig).map(([key, cfg]) => (
              <Button key={key} variant="outline" size="sm" className="text-xs" onClick={() => addStep(key as SequenceStep['type'])}>
                <cfg.icon className="w-3.5 h-3.5 mr-1" />
                {cfg.label}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-0">
              {steps.map((step, index) => (
                <SortableStep
                  key={`step-${index}`}
                  step={step}
                  index={index}
                  isLast={index === steps.length - 1}
                  onUpdate={updateStep}
                  onRemove={removeStep}
                  onImportTemplate={openImportModal}
                  allSteps={steps}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add step buttons */}
      {steps.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground self-center mr-1">Add:</span>
          {Object.entries(stepTypeConfig).map(([key, cfg]) => (
            <Button key={key} variant="outline" size="sm" className="h-7 text-xs" onClick={() => addStep(key as SequenceStep['type'])}>
              <cfg.icon className="w-3 h-3 mr-1" />
              {cfg.label}
            </Button>
          ))}
        </div>
      )}

      {/* Import Template Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Template</DialogTitle>
            <DialogDescription>
              Select a {importStepType} template to use in this step.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-2 py-2">
            {filteredTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No {importStepType} templates found. Create one in the Templates tab first.
              </p>
            ) : (
              filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleImportTemplate(template)}
                  className="w-full text-left p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-secondary/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{template.name}</p>
                      {template.subject && (
                        <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
