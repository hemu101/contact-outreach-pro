import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Edit3, Save, X, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditableDocProps {
  sectionId: string;
  title: string;
  /** Default rendered content (the code-defined version) shown when no override exists */
  children: React.ReactNode;
}

/**
 * Wraps any documentation section. Loads any admin-saved override from
 * `doc_pages`. Admins see Edit / Save controls; everyone else sees read-only.
 */
export function EditableDoc({ sectionId, title, children }: EditableDocProps) {
  const { isAdmin } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();

  const [override, setOverride] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const fallbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('doc_pages')
        .select('content')
        .eq('section_id', sectionId)
        .maybeSingle();
      if (!cancelled) {
        setOverride(data?.content ?? null);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sectionId]);

  const startEdit = () => {
    // Seed the editor with the current override OR the rendered HTML of the default.
    const seed = override ?? fallbackRef.current?.innerHTML ?? '';
    setDraft(seed);
    setEditing(true);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('doc_pages')
      .upsert(
        { section_id: sectionId, title, content: draft, updated_by: user.id },
        { onConflict: 'section_id' }
      );
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    setOverride(draft);
    setEditing(false);
    toast({ title: 'Saved', description: 'Documentation updated.' });
  };

  const reset = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('doc_pages')
      .delete()
      .eq('section_id', sectionId);
    if (error) {
      toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
      return;
    }
    setOverride(null);
    setEditing(false);
    toast({ title: 'Reset', description: 'Restored to default content.' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {!isAdmin && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" /> Admin-only editing
          </span>
        )}
        {isAdmin && !editing && (
          <Button size="sm" variant="outline" onClick={startEdit}>
            <Edit3 className="w-4 h-4 mr-2" /> Edit
          </Button>
        )}
        {isAdmin && override && !editing && (
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset to default
          </Button>
        )}
        {isAdmin && editing && (
          <>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full min-h-[500px] p-4 rounded-lg bg-secondary/30 border border-border font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="HTML or plain text content..."
          />
          <p className="text-xs text-muted-foreground">
            Tip: HTML is supported. Use Tailwind classes like <code className="font-mono">text-foreground</code>.
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : override ? (
        <div
          className="prose prose-invert max-w-none doc-override"
          dangerouslySetInnerHTML={{ __html: override }}
        />
      ) : (
        <div ref={fallbackRef}>{children}</div>
      )}
    </div>
  );
}
