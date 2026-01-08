import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TeamService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function InviteAcceptPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [teamId, setTeamId] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMsg('Invalid invitation link (missing token)');
            return;
        }

        TeamService.join(token)
            .then((team) => {
                setStatus('success');
                setTeamId(team.id);
            })
            .catch((err) => {
                console.error(err);
                setStatus('error');
                setErrorMsg(err.response?.data?.error || 'Failed to accept invitation');
            });
    }, [token]);

    const handleContinue = () => {
        if (teamId) {
            navigate(`/teams/${teamId}`);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header isAuthenticated />
            <main className="pt-24 px-4 flex justify-center">
                <Card className="w-full max-w-md mt-12">
                    <CardHeader className="text-center">
                        <CardTitle>Team Invitation</CardTitle>
                        <CardDescription>
                            {status === 'loading' && 'Verifying your invitation...'}
                            {status === 'success' && 'You have joined the team!'}
                            {status === 'error' && 'Invitation Failed'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        {status === 'loading' && (
                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        )}

                        {status === 'success' && (
                            <>
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                                <p className="text-center text-muted-foreground">
                                    You are now a member of the team. You can access assigned tasks and work threads.
                                </p>
                                <Button onClick={handleContinue} className="w-full">
                                    Go to Team
                                </Button>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <XCircle className="w-16 h-16 text-destructive" />
                                <p className="text-center text-destructive font-medium">
                                    {errorMsg}
                                </p>
                                <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                                    Return to Dashboard
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
