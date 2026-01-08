import { WorkInsight } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Zap, 
  Clock, 
  TrendingDown, 
  Brain,
  ArrowRight,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface InsightCardProps {
  insight: WorkInsight;
  onDismiss?: () => void;
  onAction?: () => void;
}

export function InsightCard({ insight, onDismiss, onAction }: InsightCardProps) {
  const getInsightIcon = (type: WorkInsight['type']) => {
    switch (type) {
      case 'attention-leak':
        return <Zap className="w-5 h-5" />;
      case 'ignored-work':
        return <AlertTriangle className="w-5 h-5" />;
      case 'overload':
        return <Brain className="w-5 h-5" />;
      case 'momentum-drift':
        return <TrendingDown className="w-5 h-5" />;
      case 'deadline-risk':
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityStyles = (severity: WorkInsight['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-l-destructive',
          iconBg: 'bg-destructive/10 text-destructive',
        };
      case 'warning':
        return {
          border: 'border-l-warning',
          iconBg: 'bg-warning/10 text-warning-foreground',
        };
      case 'info':
        return {
          border: 'border-l-primary',
          iconBg: 'bg-primary/10 text-primary',
        };
      default:
        return {
          border: 'border-l-muted',
          iconBg: 'bg-muted text-muted-foreground',
        };
    }
  };

  const styles = getSeverityStyles(insight.severity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        variant="insight"
        className={cn("relative", styles.border)}
      >
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className={cn("flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center", styles.iconBg)}>
              {getInsightIcon(insight.type)}
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h4 className="text-sm font-medium">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {insight.description}
                </p>
              </div>

              {insight.actionSuggestion && (
                <div className="flex items-center gap-2 text-xs text-primary">
                  <span className="font-medium">Suggestion:</span>
                  <span>{insight.actionSuggestion}</span>
                </div>
              )}

              {onAction && insight.actionSuggestion && (
                <Button 
                  variant="accent" 
                  size="sm"
                  onClick={onAction}
                  className="mt-2"
                >
                  Take action
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
