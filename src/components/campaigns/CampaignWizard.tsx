import { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  FileText, 
  Target, 
  Lightbulb, 
  PenTool, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Mail,
  MessageCircle,
  Phone,
  Globe,
  Upload,
  Bot,
  Layers,
  UserPlus,
  Eye,
  Search,
  Filter,
  GripVertical,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Tables } from '@/integrations/supabase/types';

type Contact = Tables<'contacts'>;
type DBTemplate = Tables<'templates'>;

interface CampaignWizardProps {
  mode: 'ai' | 'manual';
  contacts: Contact[];
  templates: DBTemplate[];
  onComplete: (data: WizardData) => void;
  onBack: () => void;
}

interface WizardData {
  companyName: string;
  website: string;
  mainActivity: string;
  location: string;
  leadSource: string;
  selectedContacts: string[];
  painPoints: string[];
  valuePropositions: string[];
  copywritingRules: string;
  selectedSteps: CampaignStep[];
  selectedTemplate: string | null;
}

interface CampaignStep {
  id: string;
  type: 'email' | 'linkedin_message' | 'linkedin_voice' | 'ai_voice' | 'whatsapp' | 'call' | 'manual_task' | 'linkedin_invite' | 'linkedin_visit' | 'api_call';
  delay?: number;
  condition?: string;
}

const wizardSteps = [
  { id: 'company', label: 'Company name', icon: Globe },
  { id: 'leads', label: 'Leads sources', icon: Users },
  { id: 'review', label: 'Leads review', icon: FileText },
  { id: 'pain', label: 'Pain points', icon: Target },
  { id: 'value', label: 'Value propositions', icon: Lightbulb },
  { id: 'copywriting', label: 'Copywriting rules', icon: PenTool },
  { id: 'sequence', label: 'Sequence review', icon: CheckCircle },
];

const leadSources = [
  { id: 'csv', name: 'CSV import', description: 'Add leads from a CSV file', icon: Upload },
  { id: 'ai', name: 'AI Lead Finder', description: 'AI will find leads similar to your ideal target', icon: Bot },
  { id: 'existing', name: 'Existing Contacts', description: 'Select from your existing contacts list', icon: Users },
  { id: 'linkedin', name: 'Add from LinkedIn', description: 'Use extension to import lead lists from LinkedIn', icon: MessageCircle },
];

const automaticSteps = [
  { type: 'email', name: 'Email', description: 'Send automatic email', icon: Mail },
  { type: 'whatsapp', name: 'WhatsApp', description: 'Send WhatsApp message', icon: MessageCircle },
  { type: 'linkedin_message', name: 'Chat message', description: 'Send on LinkedIn', icon: MessageCircle },
  { type: 'linkedin_voice', name: 'Voice message', description: 'Send on LinkedIn', icon: Phone },
  { type: 'ai_voice', name: 'AI Voice message', description: 'Send on LinkedIn', icon: Bot, beta: true },
  { type: 'linkedin_invite', name: 'Invitation', description: 'Send on LinkedIn', icon: UserPlus },
  { type: 'linkedin_visit', name: 'Visit profile', description: 'Visit profile', icon: Eye },
];

const manualSteps = [
  { type: 'call', name: 'Call', description: 'Create a task', icon: Phone },
  { type: 'manual_task', name: 'Manual task', description: 'Create a task', icon: Layers },
];

const otherSteps = [
  { type: 'api_call', name: 'Call an API', description: 'Call an API', icon: Globe },
];

// Sortable step item component
interface SortableStepItemProps {
  step: CampaignStep;
  stepInfo: typeof automaticSteps[0] | undefined;
  index: number;
  onRemove: () => void;
}

function SortableStepItem({ step, stepInfo, index, onRemove }: SortableStepItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const Icon = stepInfo?.icon || Mail;
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border bg-card transition-all",
        isDragging ? "border-primary shadow-lg z-50 opacity-90" : "border-border"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
          {index + 1}
        </span>
        <button 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <span className="font-medium text-foreground text-sm">{stepInfo?.name || step.type}</span>
        {step.delay && (
          <span className="text-xs text-muted-foreground ml-2">+{step.delay}d delay</span>
        )}
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}

export function CampaignWizard({ mode, contacts, templates, onComplete, onBack }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<WizardData>({
    companyName: '',
    website: '',
    mainActivity: '',
    location: 'United States',
    leadSource: 'existing',
    selectedContacts: [],
    painPoints: [],
    valuePropositions: [],
    copywritingRules: '',
    selectedSteps: [{ id: 'step-1', type: 'email' }],
    selectedTemplate: null,
  });
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newValueProp, setNewValueProp] = useState('');
  const [stepTab, setStepTab] = useState<'steps' | 'conditions'>('steps');

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(data);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const canContinue = () => {
    const step = wizardSteps[currentStep];
    switch (step.id) {
      case 'company':
        return data.companyName.trim().length > 0;
      case 'leads':
        return data.leadSource.length > 0;
      case 'review':
        return data.selectedContacts.length > 0;
      case 'sequence':
        return data.selectedSteps.length > 0;
      default:
        return true;
    }
  };

  const addPainPoint = () => {
    if (newPainPoint.trim()) {
      setData(prev => ({ ...prev, painPoints: [...prev.painPoints, newPainPoint.trim()] }));
      setNewPainPoint('');
    }
  };

  const addValueProp = () => {
    if (newValueProp.trim()) {
      setData(prev => ({ ...prev, valuePropositions: [...prev.valuePropositions, newValueProp.trim()] }));
      setNewValueProp('');
    }
  };

  const toggleContact = (id: string) => {
    setData(prev => ({
      ...prev,
      selectedContacts: prev.selectedContacts.includes(id)
        ? prev.selectedContacts.filter(c => c !== id)
        : [...prev.selectedContacts, id]
    }));
  };

  const selectAllContacts = () => {
    const filteredContacts = getFilteredContacts();
    setData(prev => ({
      ...prev,
      selectedContacts: filteredContacts.map(c => c.id)
    }));
  };

  const deselectAllContacts = () => {
    setData(prev => ({
      ...prev,
      selectedContacts: []
    }));
  };

  const toggleStep = (stepType: string) => {
    setData(prev => {
      const exists = prev.selectedSteps.find(s => s.type === stepType);
      if (exists) {
        return { ...prev, selectedSteps: prev.selectedSteps.filter(s => s.type !== stepType) };
      }
      const newStep: CampaignStep = { id: `step-${Date.now()}`, type: stepType as CampaignStep['type'] };
      return { ...prev, selectedSteps: [...prev.selectedSteps, newStep] };
    });
  };
  
  const removeStep = (stepId: string) => {
    setData(prev => ({
      ...prev,
      selectedSteps: prev.selectedSteps.filter(s => s.id !== stepId)
    }));
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData(prev => {
        const oldIndex = prev.selectedSteps.findIndex(s => s.id === active.id);
        const newIndex = prev.selectedSteps.findIndex(s => s.id === over.id);
        return {
          ...prev,
          selectedSteps: arrayMove(prev.selectedSteps, oldIndex, newIndex)
        };
      });
    }
  };
  
  const allStepTypes = [...automaticSteps, ...manualSteps, ...otherSteps].reduce((acc, s) => {
    acc[s.type] = s;
    return acc;
  }, {} as Record<string, typeof automaticSteps[0]>);

  const getFilteredContacts = () => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(c => 
      c.first_name?.toLowerCase().includes(query) ||
      c.last_name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.business_name?.toLowerCase().includes(query)
    );
  };

  const renderStepContent = () => {
    const step = wizardSteps[currentStep];

    switch (step.id) {
      case 'company':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Your company name and website</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {mode === 'ai' 
                  ? 'To create the most relevant campaign, please complete each step and provide as much context as possible to our AI.'
                  : 'Enter your company details to personalize your campaign.'
                }
              </p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Company name</label>
                <Input 
                  value={data.companyName}
                  onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Your company name"
                  className="h-11"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={data.website}
                    onChange={(e) => setData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourcompany.com"
                    className="h-11 pl-10"
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 text-sm text-muted-foreground cursor-pointer">
                  <Checkbox />
                  <span>I don't have a website</span>
                </label>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Main activity</label>
                <Textarea 
                  value={data.mainActivity}
                  onChange={(e) => setData(prev => ({ ...prev, mainActivity: e.target.value }))}
                  placeholder="Describe your company's main activity..."
                  className="min-h-[140px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {data.mainActivity.length}/2500
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
                <select
                  value={data.location}
                  onChange={(e) => setData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full h-11 px-3 rounded-lg bg-background border border-input text-foreground"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'leads':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Choose your leads sources</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You can choose where your leads come from for your campaigns.
              </p>
            </div>
            
            <div className="space-y-3">
              {leadSources.map(source => {
                const Icon = source.icon;
                return (
                  <button
                    key={source.id}
                    onClick={() => setData(prev => ({ ...prev, leadSource: source.id }))}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      data.leadSource === source.id
                        ? "bg-primary/5 border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{source.name}</h4>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 transition-all",
                      data.leadSource === source.id 
                        ? "bg-primary border-primary" 
                        : "border-muted-foreground/50"
                    )}>
                      {data.leadSource === source.id && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'review':
        const filteredContacts = getFilteredContacts();
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Review and select leads</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Select the contacts you want to include in this campaign.
              </p>
            </div>
            
            {/* Search and filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">
                {data.selectedContacts.length} of {filteredContacts.length} leads selected
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={selectAllContacts}
                >
                  Select All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={deselectAllContacts}
                >
                  Deselect All
                </Button>
              </div>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    data.selectedContacts.includes(contact.id)
                      ? "bg-primary/5 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <Checkbox 
                    checked={data.selectedContacts.includes(contact.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                    {contact.first_name?.[0] || contact.email?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {contact.first_name} {contact.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                  </div>
                  {contact.business_name && (
                    <Badge variant="secondary" className="hidden sm:inline-flex">
                      {contact.business_name}
                    </Badge>
                  )}
                </div>
              ))}
              
              {filteredContacts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No contacts found</p>
                  <p className="text-sm">Upload contacts first or adjust your search.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'pain':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Pain points</h3>
              <p className="text-sm text-muted-foreground mb-6">
                What problems does your product or service solve for your target audience?
              </p>
            </div>
            
            <div className="flex gap-2">
              <Input 
                value={newPainPoint}
                onChange={(e) => setNewPainPoint(e.target.value)}
                placeholder="Add a pain point..."
                onKeyPress={(e) => e.key === 'Enter' && addPainPoint()}
                className="h-11"
              />
              <Button onClick={addPainPoint} className="h-11 px-6">Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {data.painPoints.map((point, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20 text-sm py-1.5 px-3"
                  onClick={() => setData(prev => ({
                    ...prev,
                    painPoints: prev.painPoints.filter((_, i) => i !== idx)
                  }))}
                >
                  {point} ×
                </Badge>
              ))}
            </div>
            
            {mode === 'ai' && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium text-sm">AI Suggestion</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on your company description, common pain points might include: time management, manual processes, scalability issues...
                </p>
              </div>
            )}
          </div>
        );

      case 'value':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Value propositions</h3>
              <p className="text-sm text-muted-foreground mb-6">
                What unique value does your product or service provide?
              </p>
            </div>
            
            <div className="flex gap-2">
              <Input 
                value={newValueProp}
                onChange={(e) => setNewValueProp(e.target.value)}
                placeholder="Add a value proposition..."
                onKeyPress={(e) => e.key === 'Enter' && addValueProp()}
                className="h-11"
              />
              <Button onClick={addValueProp} className="h-11 px-6">Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {data.valuePropositions.map((prop, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20 text-sm py-1.5 px-3"
                  onClick={() => setData(prev => ({
                    ...prev,
                    valuePropositions: prev.valuePropositions.filter((_, i) => i !== idx)
                  }))}
                >
                  {prop} ×
                </Badge>
              ))}
            </div>
          </div>
        );

      case 'copywriting':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Copywriting rules</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Define any specific rules or tone for your campaign messages.
              </p>
            </div>
            
            <Textarea 
              value={data.copywritingRules}
              onChange={(e) => setData(prev => ({ ...prev, copywritingRules: e.target.value }))}
              placeholder="E.g., Keep messages under 100 words, use a friendly but professional tone, avoid jargon..."
              className="min-h-[250px] resize-none"
            />
          </div>
        );

      case 'sequence':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {mode === 'ai' ? 'Review your sequence' : 'Build my campaign manually'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start by choosing your sequence's first step
                </p>
              </div>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setStepTab('steps')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    stepTab === 'steps' 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Steps
                </button>
                <button
                  onClick={() => setStepTab('conditions')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    stepTab === 'conditions' 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Conditions
                </button>
              </div>
            </div>
            
            {stepTab === 'steps' ? (
              <div className="space-y-6">
                {/* Selected Steps - Sortable List */}
                {data.selectedSteps.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Your Sequence ({data.selectedSteps.length} steps)</h4>
                    <p className="text-xs text-muted-foreground mb-3">Drag to reorder steps</p>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={data.selectedSteps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {data.selectedSteps.map((step, idx) => {
                            const stepInfo = allStepTypes[step.type];
                            const Icon = stepInfo?.icon || Mail;
                            return (
                              <SortableStepItem 
                                key={step.id} 
                                step={step} 
                                stepInfo={stepInfo}
                                index={idx}
                                onRemove={() => removeStep(step.id)} 
                              />
                            );
                          })}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Add Automatic Steps</h4>
                    <div className="space-y-2">
                      {automaticSteps.map(step => {
                        const Icon = step.icon;
                        return (
                          <button
                            key={step.type}
                            onClick={() => toggleStep(step.type)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left bg-card border-border hover:border-primary/50"
                          >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-foreground text-sm">{step.name}</span>
                              <p className="text-xs text-muted-foreground">{step.description}</p>
                            </div>
                            {step.beta && (
                              <Badge variant="secondary" className="text-xs bg-pink-500/10 text-pink-500">Beta</Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-4">Add Manual Steps</h4>
                      <div className="space-y-2">
                        {manualSteps.map(step => {
                          const Icon = step.icon;
                          return (
                            <button
                              key={step.type}
                              onClick={() => toggleStep(step.type)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left bg-card border-border hover:border-primary/50"
                            >
                              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-orange-500" />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-foreground text-sm">{step.name}</span>
                                <p className="text-xs text-muted-foreground">{step.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-4">Other Steps</h4>
                      <div className="space-y-2">
                        {otherSteps.map(step => {
                          const Icon = step.icon;
                          return (
                            <button
                              key={step.type}
                              onClick={() => toggleStep(step.type)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left bg-card border-border hover:border-primary/50"
                            >
                              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-foreground text-sm">{step.name}</span>
                                <p className="text-xs text-muted-foreground">{step.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-4">Select Template</h4>
                      <select
                        value={data.selectedTemplate || ''}
                        onChange={(e) => setData(prev => ({ ...prev, selectedTemplate: e.target.value || null }))}
                        className="w-full h-11 px-3 rounded-lg bg-background border border-input text-foreground"
                      >
                        <option value="">Choose a template...</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Configure conditions for your sequence steps here.</p>
                <p className="text-sm mt-2">Coming soon...</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-[300px,1fr] gap-8 min-h-[600px]">
      {/* Left Sidebar - Steps */}
      <div className="space-y-6 py-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Get Started
        </div>
        <h2 className="text-xl font-bold text-foreground">Campaign creation</h2>
        
        <div className="space-y-1">
          {wizardSteps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                className={cn(
                  "flex items-center gap-3 w-full text-left py-2.5 transition-colors",
                  isCurrent && "text-primary font-medium",
                  isCompleted && "text-foreground",
                  !isCurrent && !isCompleted && "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isCompleted && "bg-primary border-primary",
                  isCurrent && "border-primary",
                  !isCurrent && !isCompleted && "border-muted-foreground/50"
                )}>
                  {isCompleted && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground italic">
            {mode === 'ai' 
              ? 'To create the most relevant campaign, please complete each step and provide as much context as possible to our AI. Your input is crucial for optimal results!'
              : 'Select where you want to source your leads from. You can connect integrations or upload your own list to get started.'
            }
          </p>
        </div>
        
        {mode === 'ai' && (
          <div className="flex items-center gap-2 text-primary">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">lemlist copilot</span>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
        <div className="min-h-[500px]">
          {renderStepContent()}
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
          <Button variant="outline" onClick={handlePrev} className="h-11 px-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            variant="gradient" 
            onClick={handleNext}
            disabled={!canContinue()}
            className="h-11 px-8"
          >
            {currentStep === wizardSteps.length - 1 ? 'Create Campaign' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
