import { Sparkles, PenTool, FileText, Zap, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CampaignCreationModalProps {
  onSelectMode: (mode: 'ai' | 'manual') => void;
  onBrowseTemplates: () => void;
}

export function CampaignCreationModal({ onSelectMode, onBrowseTemplates }: CampaignCreationModalProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Create a new campaign</h2>
        <p className="text-muted-foreground mt-2">Choose how you want to build your campaign</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Campaign */}
        <button
          onClick={() => onSelectMode('ai')}
          className="group relative p-6 rounded-xl border-2 border-dashed border-border hover:border-primary bg-gradient-to-br from-primary/5 to-transparent transition-all text-left"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative">
            {/* Visual Illustration */}
            <div className="h-40 mb-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Icon decorations */}
                  <div className="absolute -top-6 -left-8 w-8 h-8 rounded-lg bg-muted flex items-center justify-center opacity-50">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="absolute -top-4 right-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center opacity-50">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="absolute bottom-0 -left-6 w-8 h-8 rounded-lg bg-muted flex items-center justify-center opacity-50">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  {/* Main AI Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-foreground">Create with AI</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                Beta
              </span>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Ready to launch in minutes
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Smart leadlist generator
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                One lead, one personalized approach
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Create AI campaign
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </button>

        {/* Manual Campaign */}
        <button
          onClick={() => onSelectMode('manual')}
          className="group relative p-6 rounded-xl border-2 border-dashed border-border hover:border-primary bg-card transition-all text-left"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative">
            {/* Visual Illustration */}
            <div className="h-40 mb-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center relative overflow-hidden">
              <div className="space-y-2 w-full max-w-[200px] px-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-muted-foreground" />
                  <div className="h-2 flex-1 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <div className="h-2 flex-1 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-2 ml-8">
                  <div className="w-4 h-4 rounded bg-muted flex items-center justify-center">
                    <Users className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="h-2 flex-1 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <div className="h-2 flex-1 bg-muted rounded" />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-3">Create manually</h3>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Add steps and leads manually
              </li>
              <li className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-primary" />
                Write outbound messages with {'{{variables}}'}
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Create complex condition-based sequences
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="w-full">
                Create manual campaign
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </button>
      </div>

      {/* Templates Section */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-medium text-foreground">Start with templates</h4>
              <p className="text-sm text-muted-foreground">+100 templates</p>
            </div>
          </div>
          <Button variant="outline" onClick={onBrowseTemplates}>
            Browse template library
          </Button>
        </div>
      </div>
    </div>
  );
}
