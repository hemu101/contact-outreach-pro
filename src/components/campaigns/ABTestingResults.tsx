import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FlaskConical, 
  Trophy, 
  TrendingUp, 
  Eye, 
  MousePointer,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ABTestingResultsProps {
  variantA: {
    subject: string;
    content: string;
    sent: number;
    opens: number;
    clicks: number;
  };
  variantB: {
    subject: string;
    content: string;
    sent: number;
    opens: number;
    clicks: number;
  };
}

export function ABTestingResults({ variantA, variantB }: ABTestingResultsProps) {
  const aOpenRate = variantA.sent > 0 ? (variantA.opens / variantA.sent) * 100 : 0;
  const bOpenRate = variantB.sent > 0 ? (variantB.opens / variantB.sent) * 100 : 0;
  const aClickRate = variantA.opens > 0 ? (variantA.clicks / variantA.opens) * 100 : 0;
  const bClickRate = variantB.opens > 0 ? (variantB.clicks / variantB.opens) * 100 : 0;

  // Determine winner based on combined score (open rate + click rate)
  const aScore = aOpenRate + aClickRate;
  const bScore = bOpenRate + bClickRate;
  const winner = aScore > bScore ? 'A' : bScore > aScore ? 'B' : 'tie';
  const confidenceLevel = Math.abs(aScore - bScore) > 10 ? 'High' : Math.abs(aScore - bScore) > 5 ? 'Medium' : 'Low';

  const StatCard = ({ 
    variant, 
    subject, 
    sent, 
    opens, 
    clicks, 
    openRate, 
    clickRate,
    isWinner 
  }: { 
    variant: string;
    subject: string;
    sent: number;
    opens: number;
    clicks: number;
    openRate: number;
    clickRate: number;
    isWinner: boolean;
  }) => (
    <div className={cn(
      "p-4 rounded-lg border space-y-4",
      isWinner && "bg-success/5 border-success/30",
      !isWinner && "bg-secondary/30"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
            variant === 'A' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
          )}>
            {variant}
          </span>
          <div>
            <p className="font-medium">Variant {variant}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {subject || 'No subject'}
            </p>
          </div>
        </div>
        {isWinner && (
          <Badge className="bg-success/20 text-success border-0">
            <Trophy className="w-3 h-3 mr-1" />
            Winner
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 bg-secondary/50 rounded">
          <Mail className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold">{sent}</p>
          <p className="text-xs text-muted-foreground">Sent</p>
        </div>
        <div className="text-center p-2 bg-blue-500/10 rounded">
          <Eye className="w-4 h-4 mx-auto mb-1 text-blue-400" />
          <p className="text-lg font-bold">{opens}</p>
          <p className="text-xs text-muted-foreground">Opens</p>
        </div>
        <div className="text-center p-2 bg-purple-500/10 rounded">
          <MousePointer className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <p className="text-lg font-bold">{clicks}</p>
          <p className="text-xs text-muted-foreground">Clicks</p>
        </div>
      </div>

      {/* Rates */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Open Rate</span>
            <span className="font-medium">{openRate.toFixed(1)}%</span>
          </div>
          <Progress value={openRate} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Click Rate</span>
            <span className="font-medium">{clickRate.toFixed(1)}%</span>
          </div>
          <Progress value={clickRate} className="h-2" />
        </div>
      </div>
    </div>
  );

  const totalSent = variantA.sent + variantB.sent;
  const isComplete = totalSent > 0;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          A/B Testing Results
        </CardTitle>
        <CardDescription>
          {isComplete 
            ? `Based on ${totalSent} emails sent across both variants`
            : 'Results will appear once emails are sent'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isComplete ? (
          <>
            {/* Winner Banner */}
            {winner !== 'tie' && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-success/10 to-success/5 border border-success/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold">Variant {winner} is the winner!</p>
                    <p className="text-sm text-muted-foreground">
                      {confidenceLevel} confidence • {Math.abs(aScore - bScore).toFixed(1)}% difference
                    </p>
                  </div>
                </div>
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            )}

            {/* Variant Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                variant="A"
                subject={variantA.subject}
                sent={variantA.sent}
                opens={variantA.opens}
                clicks={variantA.clicks}
                openRate={aOpenRate}
                clickRate={aClickRate}
                isWinner={winner === 'A'}
              />
              <StatCard
                variant="B"
                subject={variantB.subject}
                sent={variantB.sent}
                opens={variantB.opens}
                clicks={variantB.clicks}
                openRate={bOpenRate}
                clickRate={bClickRate}
                isWinner={winner === 'B'}
              />
            </div>

            {/* Insights */}
            <div className="p-4 rounded-lg bg-secondary/50 text-sm">
              <p className="font-medium mb-2">Key Insights</p>
              <ul className="space-y-1 text-muted-foreground">
                {aOpenRate > bOpenRate ? (
                  <li>• Variant A's subject line performed {(aOpenRate - bOpenRate).toFixed(1)}% better at getting opens</li>
                ) : bOpenRate > aOpenRate ? (
                  <li>• Variant B's subject line performed {(bOpenRate - aOpenRate).toFixed(1)}% better at getting opens</li>
                ) : (
                  <li>• Both subject lines performed equally in terms of opens</li>
                )}
                {aClickRate > bClickRate ? (
                  <li>• Variant A's content drove {(aClickRate - bClickRate).toFixed(1)}% more clicks</li>
                ) : bClickRate > aClickRate ? (
                  <li>• Variant B's content drove {(bClickRate - aClickRate).toFixed(1)}% more clicks</li>
                ) : (
                  <li>• Both content versions performed equally in terms of clicks</li>
                )}
                <li>• Consider using the winning variant for future campaigns</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Waiting for campaign to send...</p>
            <p className="text-sm mt-1">
              Results will update in real-time as emails are delivered and opened
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
