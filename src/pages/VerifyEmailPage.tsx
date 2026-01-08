import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { UserService } from '@/services/api';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                await UserService.verifyEmail(token);
                setStatus('success');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Verification failed.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md text-center"
            >
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Eye className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-semibold">Monocle</span>
                </div>

                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                        <h1 className="text-2xl font-bold">Verifying your email...</h1>
                        <p className="text-muted-foreground">Please wait while we confirm your account.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
                        <h1 className="text-2xl font-bold">Email Verified!</h1>
                        <p className="text-muted-foreground">Your account has been successfully verified. You can now sign in and start focusing.</p>
                        <Button className="w-full" onClick={() => navigate('/login')}>
                            Sign In
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <XCircle className="w-16 h-16 mx-auto text-destructive" />
                        <h1 className="text-2xl font-bold">Verification Failed</h1>
                        <p className="text-muted-foreground">{message}</p>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                            Back to Sign In
                        </Button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
