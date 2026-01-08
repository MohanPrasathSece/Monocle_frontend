import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Calendar, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { IntegrationService } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

export default function IntegrationsPage() {
    const { currentUser } = useAuth();
    const [googleSyncing, setGoogleSyncing] = useState(false);
    const queryClient = useQueryClient();

    const loginToGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleSyncing(true);
            try {
                await IntegrationService.syncGoogle(tokenResponse.access_token);
                toast.success('Successfully synced Google Calendar, Tasks & Work Emails!');
                // Invalidate all related queries to refresh the dashboard
                queryClient.invalidateQueries({ queryKey: ['threads', currentUser?.id] });
                queryClient.invalidateQueries({ queryKey: ['items', currentUser?.id] });
                queryClient.invalidateQueries({ queryKey: ['recommendations', currentUser?.id] });
                queryClient.invalidateQueries({ queryKey: ['insights', currentUser?.id] });
            } catch (error) {
                console.error('Google Sync Error:', error);
                toast.error('Failed to sync google data.');
            } finally {
                setGoogleSyncing(false);
            }
        },
        scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks.readonly https://www.googleapis.com/auth/gmail.readonly',
        onError: () => toast.error('Google Login Failed')
    });

    return (
        <div className="min-h-screen bg-background">
            <Header isAuthenticated />
            <main className="pt-24 pb-12 px-4">
                <div className="container mx-auto space-y-8 max-w-5xl">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                        <p className="text-muted-foreground">Connect your external tools to bring all your work into Monocle.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Google Integration */}
                        <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Google Workspace</CardTitle>
                                        <CardDescription>Sync Calendar, Tasks, and Work Emails</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-secondary/50 p-4 rounded-lg space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Import work emails with AI prioritization</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Import meetings as work items</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Import tasks from Google Tasks</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => loginToGoogle()}
                                    disabled={googleSyncing}
                                >
                                    {googleSyncing ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Syncing...
                                        </>
                                    ) : 'Connect & Sync'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>
                            Synced items will appear in a new thread called <strong>"External Imports"</strong>.
                            You can then drag-and-drop them to other projects or convert them into tasks.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
