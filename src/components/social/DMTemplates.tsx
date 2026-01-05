import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Edit2,
  Copy,
  MessageSquare,
  Instagram,
  Music2,
  Loader2,
  Save,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface DMTemplate {
  id: string;
  name: string;
  content: string;
  type: string;
  subject: string | null;
  created_at: string;
  updated_at: string;
}

const VARIABLES = [
  { name: '{{name}}', description: 'Creator name' },
  { name: '{{handle}}', description: 'Username/handle' },
  { name: '{{platform}}', description: 'Platform name' },
  { name: '{{followers}}', description: 'Follower count' },
];

export function DMTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DMTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    platform: 'instagram',
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['dm-templates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user?.id)
        .in('type', ['instagram_dm', 'tiktok_dm', 'dm'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DMTemplate[];
    },
    enabled: !!user,
  });

  const saveTemplate = useMutation({
    mutationFn: async (data: { name: string; content: string; platform: string; id?: string }) => {
      const templateData = {
        user_id: user?.id,
        name: data.name,
        content: data.content,
        type: `${data.platform}_dm`,
        subject: null,
      };

      if (data.id) {
        const { error } = await supabase
          .from('templates')
          .update(templateData)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('templates').insert(templateData);
        if (error) throw error;
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action_type: data.id ? 'template_updated' : 'template_created',
        entity_type: 'dm_template',
        entity_id: data.id || undefined,
        metadata: { platform: data.platform, name: data.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-templates'] });
      setIsOpen(false);
      setEditingTemplate(null);
      setFormData({ name: '', content: '', platform: 'instagram' });
      toast({ title: editingTemplate ? 'Template updated' : 'Template created' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to save template', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-templates'] });
      toast({ title: 'Template deleted' });
    },
  });

  const handleEdit = (template: DMTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      platform: template.type.replace('_dm', ''),
    });
    setIsOpen(true);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard' });
  };

  const insertVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + variable,
    }));
  };

  const getPlatformIcon = (type: string) => {
    if (type.includes('instagram')) return Instagram;
    if (type.includes('tiktok')) return Music2;
    return MessageSquare;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              DM Templates
            </CardTitle>
            <CardDescription>
              Create reusable message templates for social outreach
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingTemplate(null);
              setFormData({ name: '', content: '', platform: 'instagram' });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Edit Template' : 'Create DM Template'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      placeholder="e.g., Initial Outreach"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select
                      value={formData.platform}
                      onValueChange={(v) => setFormData({ ...formData, platform: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">
                          <div className="flex items-center gap-2">
                            <Instagram className="h-4 w-4" />
                            Instagram
                          </div>
                        </SelectItem>
                        <SelectItem value="tiktok">
                          <div className="flex items-center gap-2">
                            <Music2 className="h-4 w-4" />
                            TikTok
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea
                    placeholder="Write your DM template here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Insert personalization variables:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {VARIABLES.map((v) => (
                      <Button
                        key={v.name}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(v.name)}
                        title={v.description}
                      >
                        {v.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      saveTemplate.mutate({
                        ...formData,
                        id: editingTemplate?.id,
                      })
                    }
                    disabled={!formData.name || !formData.content || saveTemplate.isPending}
                  >
                    {saveTemplate.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingTemplate ? 'Update' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : templates && templates.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {templates.map((template) => {
                const Icon = getPlatformIcon(template.type);
                return (
                  <div
                    key={template.id}
                    className="p-4 rounded-lg border bg-card space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{template.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {template.type.replace('_dm', '')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(template.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTemplate.mutate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No DM templates yet</p>
            <p className="text-sm">Create templates to speed up your outreach</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
