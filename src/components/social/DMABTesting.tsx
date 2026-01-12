import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FlaskConical, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  BarChart3,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Copy,
  Loader2,
  Instagram,
  Music2,
  Lightbulb,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ABTest {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok';
  status: 'draft' | 'running' | 'completed' | 'paused';
  variantA: {
    name: string;
    content: string;
    sent: number;
    replied: number;
  };
  variantB: {
    name: string;
    content: string;
    sent: number;
    replied: number;
  };
  splitRatio: number;
  winner?: 'A' | 'B' | null;
  createdAt: string;
}

const VARIABLES = [
  '{{name}}',
  '{{handle}}',
  '{{followers}}',
  '{{platform}}',
];

export function DMABTesting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState<Partial<ABTest>>({
    name: '',
    platform: 'instagram',
    variantA: { name: 'Variant A', content: '', sent: 0, replied: 0 },
    variantB: { name: 'Variant B', content: '', sent: 0, replied: 0 },
    splitRatio: 50,
  });

  // Fetch A/B tests from dm_campaigns with ab_testing flag
  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['dm-ab-tests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user?.id)
        .eq('trigger_type', 'dm_ab_test')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        status: w.is_active ? 'running' : 'paused',
        ...((w.actions as any) || {}),
        createdAt: w.created_at,
      })) as ABTest[];
    },
    enabled: !!user,
  });

  // Create A/B test mutation
  const createTest = useMutation({
    mutationFn: async (test: Partial<ABTest>) => {
      const { error } = await supabase.from('workflows').insert({
        user_id: user?.id,
        name: test.name,
        trigger_type: 'dm_ab_test',
        is_active: false,
        actions: {
          platform: test.platform,
          variantA: test.variantA,
          variantB: test.variantB,
          splitRatio: test.splitRatio,
          status: 'draft',
        },
      });

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action_type: 'dm_ab_test_created',
        entity_type: 'dm_ab_test',
        metadata: { name: test.name, platform: test.platform },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-ab-tests'] });
      setShowCreateForm(false);
      setNewTest({
        name: '',
        platform: 'instagram',
        variantA: { name: 'Variant A', content: '', sent: 0, replied: 0 },
        variantB: { name: 'Variant B', content: '', sent: 0, replied: 0 },
        splitRatio: 50,
      });
      toast({ title: 'A/B test created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create test', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle test status
  const toggleTest = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-ab-tests'] });
      toast({ title: 'Test status updated' });
    },
  });

  // Delete test
  const deleteTest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workflows').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-ab-tests'] });
      toast({ title: 'Test deleted' });
    },
  });

  const calculateReplyRate = (sent: number, replied: number): number => {
    if (sent === 0) return 0;
    return (replied / sent) * 100;
  };

  const getWinner = (test: ABTest): 'A' | 'B' | null => {
    const rateA = calculateReplyRate(test.variantA.sent, test.variantA.replied);
    const rateB = calculateReplyRate(test.variantB.sent, test.variantB.replied);
    
    if (test.variantA.sent < 10 || test.variantB.sent < 10) return null;
    if (rateA > rateB + 5) return 'A';
    if (rateB > rateA + 5) return 'B';
    return null;
  };

  const insertVariable = (field: 'A' | 'B', variable: string) => {
    setNewTest(prev => ({
      ...prev,
      [field === 'A' ? 'variantA' : 'variantB']: {
        ...prev[field === 'A' ? 'variantA' : 'variantB']!,
        content: prev[field === 'A' ? 'variantA' : 'variantB']!.content + variable,
      },
    }));
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'instagram' ? Instagram : Music2;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="h-6 w-6" />
            DM A/B Testing
          </h2>
          <p className="text-muted-foreground">
            Compare different message variations to improve response rates
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New A/B Test
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Create New A/B Test</CardTitle>
            <CardDescription>
              Split your outreach between two message variations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input
                  placeholder="e.g., Initial Outreach Test"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newTest.platform}
                  onChange={(e) => setNewTest({ ...newTest, platform: e.target.value as any })}
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Variant A */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">A</Badge>
                  <Input
                    value={newTest.variantA?.name}
                    onChange={(e) => setNewTest({
                      ...newTest,
                      variantA: { ...newTest.variantA!, name: e.target.value },
                    })}
                    className="h-8"
                  />
                </div>
                <Textarea
                  placeholder="Write your first message variant..."
                  value={newTest.variantA?.content}
                  onChange={(e) => setNewTest({
                    ...newTest,
                    variantA: { ...newTest.variantA!, content: e.target.value },
                  })}
                  rows={6}
                />
                <div className="flex flex-wrap gap-1">
                  {VARIABLES.map((v) => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('A', v)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Variant B */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">B</Badge>
                  <Input
                    value={newTest.variantB?.name}
                    onChange={(e) => setNewTest({
                      ...newTest,
                      variantB: { ...newTest.variantB!, name: e.target.value },
                    })}
                    className="h-8"
                  />
                </div>
                <Textarea
                  placeholder="Write your second message variant..."
                  value={newTest.variantB?.content}
                  onChange={(e) => setNewTest({
                    ...newTest,
                    variantB: { ...newTest.variantB!, content: e.target.value },
                  })}
                  rows={6}
                />
                <div className="flex flex-wrap gap-1">
                  {VARIABLES.map((v) => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable('B', v)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Traffic Split: {newTest.splitRatio}% / {100 - (newTest.splitRatio || 50)}%</Label>
              <input
                type="range"
                min="10"
                max="90"
                value={newTest.splitRatio}
                onChange={(e) => setNewTest({ ...newTest, splitRatio: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Variant A: {newTest.splitRatio}%</span>
                <span>Variant B: {100 - (newTest.splitRatio || 50)}%</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createTest.mutate(newTest)}
                disabled={
                  !newTest.name || 
                  !newTest.variantA?.content || 
                  !newTest.variantB?.content ||
                  createTest.isPending
                }
              >
                {createTest.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FlaskConical className="h-4 w-4 mr-2" />
                )}
                Create Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tests List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tests.length === 0 && !showCreateForm ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium text-lg mb-2">No A/B tests yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first test to compare different DM message variations
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => {
            const PlatformIcon = getPlatformIcon(test.platform);
            const winner = getWinner(test);
            const rateA = calculateReplyRate(test.variantA.sent, test.variantA.replied);
            const rateB = calculateReplyRate(test.variantB.sent, test.variantB.replied);

            return (
              <Card key={test.id} className={winner ? 'border-green-500/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlatformIcon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                      {winner && (
                        <Badge variant="outline" className="text-green-600 border-green-500">
                          <Trophy className="h-3 w-3 mr-1" />
                          Winner: Variant {winner}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleTest.mutate({ 
                          id: test.id, 
                          isActive: test.status !== 'running' 
                        })}
                      >
                        {test.status === 'running' ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTest.mutate(test.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Variant A Stats */}
                    <div className={`p-4 rounded-lg border ${winner === 'A' ? 'border-green-500 bg-green-500/5' : 'bg-muted/30'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={winner === 'A' ? 'default' : 'outline'}>A</Badge>
                          <span className="font-medium">{test.variantA.name}</span>
                          {winner === 'A' && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <span className="text-2xl font-bold">{rateA.toFixed(1)}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {test.variantA.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Sent: <strong>{test.variantA.sent}</strong>
                        </span>
                        <span className="text-muted-foreground">
                          Replies: <strong className="text-green-600">{test.variantA.replied}</strong>
                        </span>
                      </div>
                      <Progress value={rateA} className="mt-2" />
                    </div>

                    {/* Variant B Stats */}
                    <div className={`p-4 rounded-lg border ${winner === 'B' ? 'border-green-500 bg-green-500/5' : 'bg-muted/30'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={winner === 'B' ? 'default' : 'secondary'}>B</Badge>
                          <span className="font-medium">{test.variantB.name}</span>
                          {winner === 'B' && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <span className="text-2xl font-bold">{rateB.toFixed(1)}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {test.variantB.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Sent: <strong>{test.variantB.sent}</strong>
                        </span>
                        <span className="text-muted-foreground">
                          Replies: <strong className="text-green-600">{test.variantB.replied}</strong>
                        </span>
                      </div>
                      <Progress value={rateB} className="mt-2" />
                    </div>
                  </div>

                  {/* Insights */}
                  {(test.variantA.sent >= 10 && test.variantB.sent >= 10) && (
                    <Alert className="mt-4">
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        {winner ? (
                          <>
                            <strong>Variant {winner}</strong> is performing {Math.abs(rateA - rateB).toFixed(1)}% better. 
                            Consider using this variant for all future outreach.
                          </>
                        ) : (
                          <>
                            Both variants are performing similarly. Continue the test to gather more data.
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tips Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            A/B Testing Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
              Test one element at a time (opener, call-to-action, personalization level)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
              Wait for at least 20 messages per variant before drawing conclusions
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
              Look for a 5%+ difference in reply rates to declare a winner
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
              Use the winning variant as your new control for future tests
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
