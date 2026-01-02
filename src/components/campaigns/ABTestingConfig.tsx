import { useState } from 'react';
import { FlaskConical, Percent, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ABTestingConfigProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  variantA: { subject: string; content: string };
  variantB: { subject: string; content: string };
  onVariantAChange: (variant: { subject: string; content: string }) => void;
  onVariantBChange: (variant: { subject: string; content: string }) => void;
  splitPercentage?: number;
  onSplitChange?: (percentage: number) => void;
}

export function ABTestingConfig({
  enabled,
  onEnabledChange,
  variantA,
  variantB,
  onVariantAChange,
  onVariantBChange,
  splitPercentage = 50,
  onSplitChange,
}: ABTestingConfigProps) {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">A/B Testing</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Test different subject lines and content to see which performs better. Contacts will be randomly split between variants.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="ab-testing" className="text-sm text-muted-foreground">
            Enable
          </Label>
          <Switch
            id="ab-testing"
            checked={enabled}
            onCheckedChange={onEnabledChange}
          />
        </div>
      </div>

      {enabled && (
        <div className="space-y-6 pt-4 border-t border-border">
          {/* Split Percentage */}
          <div className="flex items-center gap-4">
            <Percent className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Split ratio:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary">Variant A: {splitPercentage}%</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-accent">Variant B: {100 - splitPercentage}%</span>
            </div>
          </div>

          {/* Variant A */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                A
              </span>
              <span className="font-medium text-foreground">Variant A</span>
            </div>
            <div className="pl-8 space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Subject Line</label>
                <Input
                  placeholder="Enter subject line for variant A"
                  value={variantA.subject}
                  onChange={(e) => onVariantAChange({ ...variantA, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Content</label>
                <Textarea
                  placeholder="Enter email content for variant A"
                  value={variantA.content}
                  onChange={(e) => onVariantAChange({ ...variantA, content: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Variant B */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-sm font-semibold">
                B
              </span>
              <span className="font-medium text-foreground">Variant B</span>
            </div>
            <div className="pl-8 space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Subject Line</label>
                <Input
                  placeholder="Enter subject line for variant B"
                  value={variantB.subject}
                  onChange={(e) => onVariantBChange({ ...variantB, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Content</label>
                <Textarea
                  placeholder="Enter email content for variant B"
                  value={variantB.content}
                  onChange={(e) => onVariantBChange({ ...variantB, content: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                After the campaign completes, you'll see detailed analytics comparing open rates, 
                click rates, and engagement for each variant to determine the winner.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
