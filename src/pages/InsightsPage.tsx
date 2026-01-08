import { Header } from '@/components/Header';
import { InsightCard } from '@/components/InsightCard';
import { CognitiveLoadMeter } from '@/components/CognitiveLoadMeter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  TrendingUp,
  Clock,
  Zap,
  Brain,
  BarChart3,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IntelligenceService } from '@/services/api';
import { WorkInsight, DailyStats } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function InsightsPage() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const dismissInsightMutation = useMutation({
    mutationFn: (id: string) => IntelligenceService.dismissInsight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', userId] });
      toast.success('Insight dismissed');
    }
  });

  const { data: stats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['dailyStats', userId],
    queryFn: () => userId ? IntelligenceService.getDailyStats(userId) : Promise.resolve([]),
    enabled: !!userId
  });

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['insights', userId],
    queryFn: () => userId ? IntelligenceService.getInsights(userId) : Promise.resolve([]),
    enabled: !!userId
  });

  const { data: cognitiveLoad } = useQuery({
    queryKey: ['cognitiveLoad', userId],
    queryFn: () => userId ? IntelligenceService.getCognitiveLoad(userId) : Promise.resolve(null),
    enabled: !!userId
  });


  const chartData = stats.map((stat: DailyStats) => ({
    date: format(new Date(stat.date), 'EEE'),
    focusTime: Math.round(stat.focusTime / 60),
    switches: stat.contextSwitches,
    completed: stat.completedTasks,
  }));

  const avgFocusTime = stats.length > 0
    ? Math.round(stats.reduce((acc: number, s: DailyStats) => acc + s.focusTime, 0) / stats.length / 60)
    : 0;

  const avgSwitches = stats.length > 0
    ? Math.round(stats.reduce((acc: number, s: DailyStats) => acc + s.contextSwitches, 0) / stats.length)
    : 0;

  const totalCompleted = stats.reduce((acc: number, s: DailyStats) => acc + s.completedTasks, 0);

  // Fallback cognitive load
  const currentLoad = cognitiveLoad || {
    level: 'low',
    score: 0,
    factors: { activeThreads: 0, switchingFrequency: 0, workDuration: 0, pendingDeadlines: 0 }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              <h1 className="text-display-sm text-foreground">Insights</h1>
            </div>
            <p className="text-muted-foreground">
              Understand your work patterns and optimize your productivity.
            </p>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-4 mb-8"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Focus Time</p>
                    <p className="text-2xl font-semibold">{avgFocusTime}h</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-success" />
                  </div>
                </div>
                {/* Trend logic would go here if we had last week's data */}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Switches/Day</p>
                    <p className="text-2xl font-semibold">{avgSwitches}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-warning-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    <p className="text-2xl font-semibold">{totalCompleted}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <CognitiveLoadMeter load={currentLoad} compact />
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">Cognitive Load</p>
                  <p className="text-2xl font-semibold capitalize">{currentLoad.level}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Charts */}
            <div className="lg:col-span-2 space-y-6">
              {statsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-headline">Focus Time Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chartData.length > 0 ? (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 12 }}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  tick={{ fontSize: 12 }}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(value) => `${value}h`}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="focusTime"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth={2}
                                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-64 flex items-center justify-center text-muted-foreground">No data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-headline">Task Completion</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chartData.length > 0 ? (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData}>
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 12 }}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  tick={{ fontSize: 12 }}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                  }}
                                />
                                <Bar
                                  dataKey="completed"
                                  fill="hsl(var(--primary))"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-64 flex items-center justify-center text-muted-foreground">No data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </>
              )}
            </div>

            {/* Active insights */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-headline">Active Insights</h2>
                  <Badge variant="outline">{insights.length}</Badge>
                </div>

                <Tabs defaultValue="all">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    <TabsTrigger value="critical" className="flex-1">Critical</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3">
                    {insightsLoading ? (
                      <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                    ) : insights.length > 0 ? (
                      <AnimatePresence>
                        {insights.map((insight: WorkInsight) => (
                          <InsightCard
                            key={insight.id}
                            insight={insight}
                            onDismiss={() => dismissInsightMutation.mutate(insight.id)}
                            onAction={() => {
                              if (insight.relatedThreadIds?.[0]) {
                                navigate(`/thread/${insight.relatedThreadIds[0]}`);
                              }
                            }}
                          />
                        ))}
                      </AnimatePresence>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">No active insights</p>
                    )}
                  </TabsContent>

                  <TabsContent value="critical" className="space-y-3">
                    {insightsLoading ? null : (
                      <AnimatePresence>
                        {insights
                          .filter((i: WorkInsight) => i.severity === 'critical')
                          .map((insight: WorkInsight) => (
                            <InsightCard
                              key={insight.id}
                              insight={insight}
                              onDismiss={() => dismissInsightMutation.mutate(insight.id)}
                              onAction={() => {
                                if (insight.relatedThreadIds?.[0]) {
                                  navigate(`/thread/${insight.relatedThreadIds[0]}`);
                                }
                              }}
                            />
                          ))}
                      </AnimatePresence>
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>

              {/* Cognitive Load Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-headline flex items-center gap-2">
                      <Brain className="w-5 h-5 text-muted-foreground" />
                      Cognitive Load
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CognitiveLoadMeter load={currentLoad} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
