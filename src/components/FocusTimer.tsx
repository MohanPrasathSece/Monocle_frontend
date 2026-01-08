import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Zap, Brain, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { IntelligenceService } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function FocusTimer() {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [time, setTime] = useState(25 * 60); // 25 minutes default
    const [initialTime, setInitialTime] = useState(25 * 60);
    const [completedSessions, setCompletedSessions] = useState(0);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const recordSessionMutation = useMutation({
        mutationFn: (durationMins: number) => {
            if (!currentUser) throw new Error('Not authenticated');
            return IntelligenceService.recordFocusSession(currentUser.id, durationMins, 1);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
            queryClient.invalidateQueries({ queryKey: ['cognitiveLoad'] });
            toast.success('Focus session recorded! +1 Task toward goals');
        }
    });

    const handleComplete = useCallback(() => {
        setIsActive(false);
        setCompletedSessions(prev => prev + 1);
        const durationMins = Math.round(initialTime / 60);
        recordSessionMutation.mutate(durationMins);
        setTime(initialTime);

        // Play sound or notification here if needed
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focus Session Complete!', {
                body: 'Great job! Take a short break.',
                icon: '/favicon.ico'
            });
        }
    }, [initialTime, currentUser, recordSessionMutation]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && !isPaused) {
            interval = setInterval(() => {
                setTime((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(interval!);
                        handleComplete();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else {
            if (interval) clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, isPaused, handleComplete]);

    const toggleTimer = () => {
        if (!isActive) {
            setIsActive(true);
            setIsPaused(false);
            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } else {
            setIsPaused(!isPaused);
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsPaused(false);
        setTime(initialTime);
    };

    const progress = ((initialTime - time) / initialTime) * 100;

    return (
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-primary animate-pulse' : 'bg-secondary'}`}>
                            <Zap className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold">Deep Focus</h3>
                            <p className="text-xs text-muted-foreground">{isActive ? 'Session in progress' : 'Ready to focus?'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 border text-[10px] font-medium">
                        <Trophy className="w-3 h-3 text-warning-foreground" />
                        <span>{completedSessions} Today</span>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                    <motion.div
                        key={time}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl font-mono font-bold tracking-tighter mb-2"
                    >
                        {formatTime(time)}
                    </motion.div>

                    <div className="w-full space-y-4 mt-4">
                        <Progress value={progress} className="h-1.5" />

                        <div className="flex items-center gap-2">
                            <Button
                                className="flex-1"
                                variant={isActive && !isPaused ? "outline" : "default"}
                                onClick={toggleTimer}
                                disabled={recordSessionMutation.isPending}
                            >
                                {isActive ? (
                                    isPaused ? (
                                        <><Play className="w-4 h-4 mr-2" /> Resume</>
                                    ) : (
                                        <><Pause className="w-4 h-4 mr-2" /> Pause</>
                                    )
                                ) : (
                                    <><Zap className="w-4 h-4 mr-2" /> Start Focusing</>
                                )}
                            </Button>

                            {isActive && (
                                <Button variant="ghost" size="icon" onClick={resetTimer}>
                                    <Square className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Motivation Text */}
                <AnimatePresence mode="wait">
                    {isActive && !isPaused && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center text-[11px] text-primary font-medium mt-4 uppercase tracking-widest"
                        >
                            Protect this time. No context switching.
                        </motion.p>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
