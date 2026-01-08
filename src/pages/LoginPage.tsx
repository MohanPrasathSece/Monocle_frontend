import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Eye, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/msal";
import { UserService } from '@/services/api';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const { signIn, register, signInWithGoogle, signInWithMicrosoft, currentUser, loading } = useAuth();
  const { instance } = useMsal();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn({ email: formData.email, password: formData.password });
        navigate('/dashboard');
      } else {
        await register(formData);
        setRegistrationSuccess(true);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) return;
    setResetLoading(true);
    try {
      await UserService.forgotPassword(forgotPasswordEmail);
      toast.success('If an account exists with that email, a reset link has been sent.');
      setIsForgotPassword(false);
    } catch (error) {
      toast.error('Failed to send reset link');
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleSuccess = async (authResponse: any) => {
    console.log('Google auth code received, sending to backend...');
    try {
      if (authResponse.code) {
        await signInWithGoogle(authResponse.code);
        // Trigger initial sync
        const { IntegrationService: IntegrationAPI } = await import('@/services/api');
        IntegrationAPI.syncGoogle().catch(err => console.error('Initial sync error:', err));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly',
  });

  const handleMicrosoftLogin = async () => {
    try {
      const loginResponse = await instance.loginPopup(loginRequest);
      if (loginResponse.accessToken) {
        await signInWithMicrosoft(loginResponse.accessToken);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setIsForgotPassword(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign in
          </Button>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Eye className="w-8 h-8 text-primary" />
                <span className="text-2xl font-semibold">Monocle</span>
              </div>
              <h1 className="text-display-sm text-foreground mb-2">Forgot Password</h1>
              <p className="text-muted-foreground">Enter your email and we'll send you a link to reset your password.</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@company.com"
                      required
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={resetLoading}>
                    {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-8"
        >
          <div className="flex items-center justify-center gap-2">
            <Eye className="w-8 h-8 text-primary" />
            <span className="text-2xl font-semibold">Monocle</span>
          </div>

          <div className="bg-card p-8 rounded-xl border shadow-lg space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Eye className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-muted-foreground text-sm">
                We've sent a verification link to <span className="font-semibold text-foreground">{formData.email}</span>.
                Please click the link to verify your account and get started.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button className="w-full" onClick={() => { setIsLogin(true); setRegistrationSuccess(false); }}>
                Back to Sign in
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Eye className="w-8 h-8 text-primary" />
              <span className="text-2xl font-semibold">Monocle</span>
            </div>
            <h1 className="text-display-sm text-foreground mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? 'Sign in to focus on what matters' : 'Start your focus journey today'}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    isLogin ? 'Sign in' : 'Create account'
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-center w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 rounded-full h-[44px] border-[#dadce0] hover:bg-[#f8f9fa] text-[#3c4043] font-medium"
                      onClick={() => loginWithGoogle()}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                      Continue with Google
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 rounded-full h-[44px]"
                    onClick={handleMicrosoftLogin}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                      <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                      <rect x="12" y="1" width="10" height="10" fill="#7fbb00" />
                      <rect x="1" y="12" width="10" height="10" fill="#00a1f1" />
                      <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
                    </svg>
                    Continue with Microsoft
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
