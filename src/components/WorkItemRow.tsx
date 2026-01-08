import { WorkItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Mail,
  MessageSquare,
  FileText,
  Calendar,
  CheckSquare,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface WorkItemRowProps {
  item: WorkItem;
  onClick?: () => void;
}

export function WorkItemRow({ item, onClick }: WorkItemRowProps) {
  const getItemIcon = (type: WorkItem['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'task':
        return <CheckSquare className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
        "hover:bg-accent/50",
        !item.isRead && "bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
        {getItemIcon(item.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className={cn(
            "text-sm truncate flex items-center gap-1.5",
            !item.isRead && "font-medium",
            item.status === 'completed' && "text-muted-foreground line-through"
          )}>
            {item.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
            {item.title}
          </h4>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground">{item.source}</p>
          {item.priority && (
            <Badge variant={item.priority as any} className="h-4 px-1 text-[10px] uppercase">
              {item.priority}
            </Badge>
          )}
          {item.metadata?.aiReason && (
            <span className="text-[10px] text-primary/60 italic truncate max-w-[150px]">
              • {item.metadata.aiReason}
            </span>
          )}
        </div>
        {item.preview && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {item.preview}
          </p>
        )}
      </div>

      {!item.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
