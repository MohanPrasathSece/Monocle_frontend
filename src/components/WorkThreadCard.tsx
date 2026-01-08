import { WorkThread } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Clock, Users, AlertTriangle, ChevronRight } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';

interface WorkThreadCardProps {
  thread: WorkThread;
  onClick?: () => void;
  isHighlighted?: boolean;
}

export function WorkThreadCard({ thread, onClick, isHighlighted = false }: WorkThreadCardProps) {
  const getPriorityVariant = (priority: WorkThread['priority']) => {
    switch (priority) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'secondary';
    }
  };

  const hasDeadline = thread.deadline !== undefined;
  const isNearDeadline = hasDeadline && thread.deadline &&
    new Date(thread.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000; // 3 days

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="interactive"
        className={cn(
          "group",
          isHighlighted && "ring-2 ring-primary/20 border-primary/30",
          thread.isIgnored && "opacity-70"
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={getPriorityVariant(thread.priority)} className="text-[10px] uppercase tracking-wide">
                  {thread.priority}
                </Badge>
                {thread.isIgnored && (
                  <Badge variant="warning" className="text-[10px]">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Needs attention
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base truncate">{thread.title}</CardTitle>
              {thread.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {thread.description}
                </p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 transition-transform group-hover:translate-x-1" />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{thread.progress}%</span>
            </div>
            <Progress value={thread.progress} className="h-1.5" />
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-3">
              {hasDeadline && thread.deadline && (
                <div className={cn(
                  "flex items-center gap-1",
                  isNearDeadline && "text-destructive"
                )}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{format(new Date(thread.deadline), "MMM d, h:mm a")}</span>
                </div>
              )}
              {thread.relatedPeople && thread.relatedPeople.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{thread.relatedPeople.length}</span>
                </div>
              )}
            </div>
            <span>{thread.itemIds?.length || 0} items</span>
          </div>

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {thread.tags.map((tag) => (
                <Badge key={tag} variant="source" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
