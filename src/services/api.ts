import axios from 'axios';
import { User, WorkThread, WorkItem, WorkInsight, PriorityRecommendation, DailyStats, CognitiveLoadState, Team } from '@/lib/types';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const UserService = {
    create: async (user: User) => {
        const response = await api.post('/users', user);
        return response.data.data;
    },
    get: async (id: string) => {
        const response = await api.get(`/users/${id}`);
        return response.data.data;
    },
    updatePreferences: async (id: string, preferences: any) => {
        const response = await api.put(`/users/${id}/preferences`, preferences);
        return response.data;
    },
    forgotPassword: async (email: string) => {
        const response = await api.post('/users/forgot-password', { email });
        return response.data;
    },
    resetPassword: async (token: string, password: any) => {
        const response = await api.post('/users/reset-password', { token, password });
        return response.data;
    },
    verifyEmail: async (token: string) => {
        const response = await api.post('/users/verify-email', { token });
        return response.data;
    }
};

export const ThreadService = {
    getUserThreads: async (userId: string) => {
        const response = await api.get(`/threads/user/${userId}`);
        return response.data.data;
    },
    getActiveThreads: async (userId: string) => {
        const response = await api.get(`/threads/user/${userId}/active`);
        return response.data.data;
    },
    getUpcomingDeadlines: async (userId: string) => {
        const response = await api.get(`/threads/user/${userId}/upcoming-deadlines`);
        return response.data.data;
    },
    create: async (thread: Partial<WorkThread>) => {
        const response = await api.post('/threads', thread);
        return response.data.data;
    },
    update: async (id: string, updates: Partial<WorkThread>) => {
        const response = await api.put(`/threads/${id}`, updates);
        return response.data;
    },
    get: async (id: string) => {
        const response = await api.get(`/threads/${id}`);
        return response.data.data;
    },
    getTeamThreads: async (teamId: string) => {
        const response = await api.get(`/threads/team/${teamId}`);
        return response.data.data;
    }
};

export const WorkItemService = {
    getUserItems: async (userId: string) => {
        const response = await api.get(`/items/user/${userId}`);
        return response.data.data;
    },
    createItem: async (item: Partial<WorkItem>) => {
        const response = await api.post('/items', item);
        return response.data.data;
    },
    getUnreadItems: async (userId: string) => {
        const response = await api.get(`/items/user/${userId}/unread`);
        return response.data.data;
    },
    getThreadItems: async (threadId: string) => {
        const response = await api.get(`/items/thread/${threadId}`);
        return response.data.data;
    },
    getTeamItems: async (teamId: string) => {
        const response = await api.get(`/items/team/${teamId}`);
        return response.data.data;
    },
    markAsRead: async (id: string) => {
        const response = await api.put(`/items/${id}/read`);
        return response.data;
    },
    deleteItem: async (id: string) => {
        const response = await api.delete(`/items/${id}`);
        return response.data;
    },
    updateItem: async (id: string, updates: Partial<WorkItem>) => {
        const response = await api.put(`/items/${id}`, updates);
        return response.data;
    }
};

export const IntelligenceService = {
    getInsights: async (userId: string) => {
        // Trigger generation first, then fetch (or just fetch active)
        await api.post(`/intelligence/insights/${userId}/generate`);
        const response = await api.get(`/intelligence/insights/${userId}`);
        return response.data.data;
    },
    getRecommendations: async (userId: string) => {
        await api.post(`/intelligence/recommendations/${userId}/generate`);
        const response = await api.get(`/intelligence/recommendations/${userId}`);
        return response.data.data;
    },
    getCognitiveLoad: async (userId: string) => {
        await api.post(`/intelligence/cognitive-load/${userId}/calculate`);
        const response = await api.get(`/intelligence/cognitive-load/${userId}`);
        return response.data.data;
    },
    getDailyStats: async (userId: string) => {
        const response = await api.get(`/intelligence/stats/${userId}`);
        return response.data.data;
    },
    dismissInsight: async (id: string) => {
        const response = await api.put(`/intelligence/insights/${id}/dismiss`);
        return response.data;
    },
    recordFocusSession: async (userId: string, durationMinutes: number, tasksCompleted: number) => {
        const response = await api.post(`/intelligence/focus-session/${userId}`, { durationMinutes, tasksCompleted });
        return response.data;
    },
    getThreadSummary: async (threadId: string) => {
        const response = await api.get(`/intelligence/thread-summary/${threadId}`);
        return response.data.data;
    },
    chat: async (userId: string, message: string, history: any[]) => {
        const response = await api.post(`/intelligence/chat/${userId}`, { message, history });
        return response.data.data;
    }
};



export const TeamService = {
    create: async (name: string, description?: string) => {
        const response = await api.post('/teams', { name, description });
        return response.data.data;
    },
    getMyTeams: async () => {
        const response = await api.get('/teams');
        return response.data.data as Team[];
    },
    get: async (id: string) => {
        const response = await api.get(`/teams/${id}`);
        return response.data.data as Team;
    },
    invite: async (teamId: string, email: string) => {
        const response = await api.post(`/teams/${teamId}/invite`, { email });
        return response.data.data; // contains id, token, link
    },
    join: async (token: string) => {
        const response = await api.post('/teams/join', { token });
        return response.data.data as Team;
    },
    removeMember: async (teamId: string, memberId: string) => {
        const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
        return response.data.data as Team;
    },
    getInvitations: async (teamId: string) => {
        const response = await api.get(`/teams/${teamId}/invitations`);
        return response.data.data;
    },
    updateMemberRole: async (teamId: string, memberId: string, role: 'admin' | 'member') => {
        const response = await api.patch(`/teams/${teamId}/members/${memberId}/role`, { role });
        return response.data.data as Team;
    }
};

export const IntegrationService = {
    syncGoogle: async (accessToken: string) => {
        const response = await api.post('/integrations/google/sync', { accessToken });
        return response.data;
    },
    syncNotion: async (apiKey: string) => {
        const response = await api.post('/integrations/notion/sync', { apiKey });
        return response.data;
    }
};

export default api;
