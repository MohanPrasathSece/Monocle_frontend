import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signIn: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    signInWithGoogle: (idToken: string) => Promise<void>;
    signInWithMicrosoft: (accessToken: string) => Promise<void>;
    signOut: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setCurrentUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse saved user', e);
            }
        }
        setLoading(false);
    }, []);

    const signIn = async (credentials: any) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/users/login`, credentials);
            const { user, token: newToken } = res.data.data;

            setCurrentUser(user);
            setToken(newToken);
            localStorage.setItem('auth_token', newToken);
            localStorage.setItem('auth_user', JSON.stringify(user));

            toast({
                title: "Welcome!",
                description: `Signed in as ${user.name}`,
            });
        } catch (error: any) {
            console.error('Login error:', error);
            toast({
                title: "Login Failed",
                description: error.response?.data?.error || "Failed to sign in",
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: any) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/users/register`, userData);
            // We don't log the user in here because they need to verify first.

            toast({
                title: "Account Created!",
                description: "Success! Please check your email to verify your account.",
            });
        } catch (error: any) {
            console.error('Registration error:', error);
            toast({
                title: "Registration Failed",
                description: error.response?.data?.error || "Failed to create account",
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async (authCode: string) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/users/google-login`, { code: authCode });
            const { user, token: newToken } = res.data.data;

            setCurrentUser(user);
            setToken(newToken);
            localStorage.setItem('auth_token', newToken);
            localStorage.setItem('auth_user', JSON.stringify(user));

            toast({
                title: "Welcome!",
                description: `Signed in with Google as ${user.name}`,
            });
        } catch (error: any) {
            console.error('Google login error:', error);
            toast({
                title: "Google Login Failed",
                description: error.response?.data?.error || "Failed to sign in with Google",
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithMicrosoft = async (accessToken: string) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/users/microsoft-login`, { accessToken });
            const { user, token: newToken } = res.data.data;

            setCurrentUser(user);
            setToken(newToken);
            localStorage.setItem('auth_token', newToken);
            localStorage.setItem('auth_user', JSON.stringify(user));

            toast({
                title: "Welcome!",
                description: `Signed in with Microsoft as ${user.name}`,
            });
        } catch (error: any) {
            console.error('Microsoft login error:', error);
            toast({
                title: "Microsoft Login Failed",
                description: error.response?.data?.error || "Failed to sign in with Microsoft",
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = () => {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        toast({
            title: "Signed Out",
            description: "You have been successfully signed out",
        });
    };

    const value = {
        currentUser,
        loading,
        signIn,
        register,
        signInWithGoogle,
        signInWithMicrosoft,
        signOut,
        token
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
