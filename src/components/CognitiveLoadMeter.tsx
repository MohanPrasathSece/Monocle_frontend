import { CognitiveLoadState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Brain, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CognitiveLoadMeterProps {
  load: CognitiveLoadState;
  compact?: boolean;
}

export function CognitiveLoadMeter({ load, compact = false }: CognitiveLoadMeterProps) {
  const getLoadColor = (level: CognitiveLoadState['level']) => {
    switch (level) {
      case 'low':
        return 'bg-load-low';
      case 'medium':
        return 'bg-load-medium';
      case 'high':
        return 'bg-load-high';
      case 'critical':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const getLoadLabel = (level: CognitiveLoadState['level']) => {
    switch (level) {
      case 'low':
        return 'Low Load';
      case 'medium':
        return 'Moderate';
      case 'high':
        return 'High Load';
      case 'critical':
        return 'Overload';
      default:
        return 'Unknown';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Brain className="w-4 h-4 text-muted-foreground" />
          <div 
            className={cn(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
              getLoadColor(load.level)
            )} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Cognitive Load</span>
        </div>
        <div className="flex items-center gap-2">
          {load.level === 'critical' && (
            <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
          )}
          <span className={cn(
            "text-sm font-medium",
            load.level === 'critical' && "text-destructive"
          )}>
            {getLoadLabel(load.level)}
          </span>
        </div>
      </div>
      
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full", getLoadColor(load.level))}
          initial={{ width: 0 }}
          animate={{ width: `${load.score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Active threads</span>
          <span className="font-medium text-foreground">{load.factors.activeThreads}</span>
        </div>
        <div className="flex justify-between">
          <span>Switches/hr</span>
          <span className="font-medium text-foreground">{load.factors.switchingFrequency}</span>
        </div>
        <div className="flex justify-between">
          <span>Work duration</span>
          <span className="font-medium text-foreground">{load.factors.workDuration}h</span>
        </div>
        <div className="flex justify-between">
          <span>Deadlines</span>
          <span className="font-medium text-foreground">{load.factors.pendingDeadlines}</span>
        </div>
      </div>
    </div>
  );
}
