import { PriorityRecommendation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, Clock, Users, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface PriorityRecommendationCardProps {
  recommendation: PriorityRecommendation;
  rank: number;
  onSelect?: () => void;
}

export function PriorityRecommendationCard({ recommendation, rank, onSelect }: PriorityRecommendationCardProps) {
  if (!recommendation.thread) return null;
  const { thread, reasoning, score } = recommendation;

  const getWeightIcon = (weight: 'high' | 'medium' | 'low') => {
    switch (weight) {
      case 'high':
        return '●●●';
      case 'medium':
        return '●●○';
      case 'low':
        return '●○○';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.1 }}
    >
      <Card
        variant="interactive"
        className={cn(
          "relative overflow-hidden",
          rank === 0 && "ring-2 ring-primary/20 border-primary/30"
        )}
      >
        {/* Score indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-semibold text-primary">{score}</span>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="font-medium">#{rank + 1} Priority</span>
            <span>•</span>
            <Badge variant={thread.priority === 'high' ? 'high' : thread.priority === 'medium' ? 'medium' : 'low'}>
              {thread.priority}
            </Badge>
          </div>
          <CardTitle className="text-base pr-12">{thread.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Why this, why now */}
          <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Why this, why now?</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {reasoning.description}
            </p>
          </div>

          {/* Factors */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Contributing factors
            </span>
            <div className="space-y-1.5">
              {reasoning.factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{factor.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{factor.description}</span>
                    <span className={cn(
                      "text-[10px] tracking-wider",
                      factor.weight === 'high' && "text-destructive",
                      factor.weight === 'medium' && "text-warning-foreground",
                      factor.weight === 'low' && "text-muted-foreground"
                    )}>
                      {getWeightIcon(factor.weight)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <Button
            variant={rank === 0 ? "default" : "outline"}
            className="w-full group"
            onClick={onSelect}
          >
            Focus on this
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
