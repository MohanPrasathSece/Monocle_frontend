import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { WorkItemRow } from '@/components/WorkItemRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AddWorkItemDialog } from '@/components/AddWorkItemDialog';
import { formatDistanceToNow, format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThreadService, WorkItemService, IntelligenceService } from '@/services/api';
import { WorkThread, WorkItem } from '@/lib/types';
import { toast } from 'sonner';

export default function WorkThreadDetail() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => threadId ? ThreadService.get(threadId) : Promise.reject('No ID'),
    enabled: !!threadId
  });

  const { data: threadItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['threadItems', threadId],
    queryFn: () => threadId ? WorkItemService.getThreadItems(threadId) : Promise.resolve([]),
    enabled: !!threadId
  });

  const queryClient = useQueryClient();

  const updateThreadMutation = useMutation({
    mutationFn: (updates: Partial<WorkThread>) => {
      if (!threadId) throw new Error('No thread ID');
      return ThreadService.update(threadId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      toast.success('Thread updated');
    },
    onError: () => {
      toast.error('Failed to update thread');
    }
  });

  const markComplete = () => {
    updateThreadMutation.mutate({ progress: 100 });
  };

  const { data: aiSummary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['threadSummary', threadId],
    queryFn: () => threadId ? IntelligenceService.getThreadSummary(threadId) : Promise.reject('No ID'),
    enabled: false, // Only fetch on button click
  });

  const [showSummary, setShowSummary] = useState(false);

  const handleAiCopilot = () => {
    setShowSummary(true);
    refetchSummary();
  };

  if (threadLoading) {
    return (
      <div className="min-h-screen bg-background text-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading thread...</p>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated />
        <main className="pt-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-display-sm mb-4">Thread not found</h1>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </motion.div>

          {/* Thread header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getPriorityVariant(thread.priority)}>
                    {thread.priority} priority
                  </Badge>
                  {thread.tags?.map((tag: string) => (
                    <Badge key={tag} variant="source">{tag}</Badge>
                  ))}
                </div>
                <h1 className="text-display-sm text-foreground">{thread.title}</h1>
                {thread.description && (
                  <p className="text-lg text-muted-foreground mt-2">{thread.description}</p>
                )}
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {thread.deadline && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Due {format(new Date(thread.deadline), "PPP 'at' p")}</span>
                </div>
              )}
              {thread.relatedPeople && thread.relatedPeople.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{thread.relatedPeople.join(', ')}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Last activity {formatDistanceToNow(new Date(thread.lastActivity), { addSuffix: true })}</span>
              </div>
            </div>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{thread.progress}% complete</span>
                </div>
                <Progress value={thread.progress} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Copilot Section - Winning Feature */}
          <AnimatePresence>
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-headline flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI Copilot Analysis
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowSummary(false)}>Close</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {summaryLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground italic">Analyzing thread activity and items...</p>
                      </div>
                    ) : aiSummary ? (
                      <>
                        <div className="space-y-2">
                          <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                            {aiSummary.summary}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recommended Next Steps</h4>
                          <div className="grid gap-2">
                            {aiSummary.nextSteps.map((step: string, i: number) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-lg border shadow-sm">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                                  {i + 1}
                                </div>
                                <span className="text-sm">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Related items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-headline flex items-center justify-between">
                  <span>Related Items</span>
                  <Badge variant="outline">{threadItems.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {itemsLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                  ) : threadItems.length > 0 ? (
                    threadItems.map((item: WorkItem) => (
                      <WorkItemRow key={item.id} item={item} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No items in this thread yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center gap-3"
          >
            <Button
              variant="default"
              onClick={markComplete}
              disabled={updateThreadMutation.isPending || thread.progress === 100}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {thread.progress === 100 ? 'Completed' : 'Mark as complete'}
            </Button>
            <Button
              variant="accent"
              onClick={handleAiCopilot}
              disabled={summaryLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Copilot
            </Button>
            <AddWorkItemDialog threadId={threadId} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
