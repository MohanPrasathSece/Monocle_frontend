import { WorkItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    MoreVertical,
    CheckSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface WorkTaskCardProps {
    task: WorkItem;
    onStatusChange?: (id: string, status: WorkItem['status']) => void;
    onClick?: () => void;
}

export function WorkTaskCard({ task, onStatusChange, onClick }: WorkTaskCardProps) {
    const getStatusIcon = (status: WorkItem['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'in-progress':
                return <Clock className="w-5 h-5 text-blue-500" />;
            default:
                return <Circle className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'medium':
                return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'low':
                return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default:
                return 'text-muted-foreground bg-muted-foreground/10 border-muted-foreground/20';
        }
    };

    return (
        <div
            className={cn(
                "group relative flex items-start gap-4 p-4 bg-card border rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/20",
                task.status === 'completed' && "opacity-60 bg-muted/30"
            )}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
                    onStatusChange?.(task.id, nextStatus as any);
                }}
                className="mt-1 flex-shrink-0 transition-transform active:scale-90"
            >
                {getStatusIcon(task.status || 'todo')}
            </button>

            <div className="flex-1 min-w-0 pointer-events-auto" onClick={onClick}>
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={cn(
                        "text-base font-semibold transition-all",
                        task.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                        {task.title}
                    </h4>
                    <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                        {formatDistanceToNow(task.timestamp, { addSuffix: true })}
                    </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {task.preview || task.metadata?.description || "No description provided."}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    {task.priority && (
                        <Badge variant="outline" className={cn("text-[10px] h-5 lowercase px-2", getPriorityColor(task.priority))}>
                            {task.priority}
                        </Badge>
                    )}

                    <Badge variant="secondary" className="text-[10px] h-5 px-2 font-normal">
                        {task.source}
                    </Badge>

                    {task.assigneeId && (
                        <Badge variant="outline" className="text-[10px] h-5 px-2 bg-primary/5 text-primary border-primary/20">
                            Assigned to You
                        </Badge>
                    )}

                    {task.status === 'in-progress' && (
                        <Badge variant="info" className="text-[10px] h-5 px-2">
                            In Progress
                        </Badge>
                    )}
                </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'todo')}>
                            Mark as Todo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'in-progress')}>
                            Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'completed')}>
                            Mark as Completed
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
