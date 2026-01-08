import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    Calendar,
    Clock,
    Users,
    Video,
    Plus,
    Loader2,
    Mail,
    ExternalLink,
    Trash2,
    Edit
} from 'lucide-react';

import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAuth } from '@/contexts/AuthContext';
import { IntegrationService } from '@/services/api';

interface Meeting {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    attendees: string[];
    platform: 'google' | 'teams';
    meetingLink?: string;
    joinUrl?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export default function MeetingsPage() {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<'google' | 'teams'>('google');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        attendees: '',
        platform: 'google' as 'google' | 'teams'
    });

    // Mock data for now - in real app, fetch from backend
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    const createMeetingMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const attendeesList = data.attendees.split(',').map(e => e.trim()).filter(Boolean);

            const payload = {
                title: data.title,
                description: data.description,
                startTime: new Date(data.startTime).toISOString(),
                endTime: new Date(data.endTime).toISOString(),
                attendees: attendeesList
            };

            if (data.platform === 'google') {
                return IntegrationService.createGoogleMeeting(payload);
            } else {
                return IntegrationService.createTeamsMeeting(payload);
            }
        },
        onSuccess: (response, variables) => {
            toast.success(`Meeting created successfully! Invitations sent to attendees.`);

            // Add to local state
            const newMeeting: Meeting = {
                id: Date.now().toString(),
                ...variables,
                attendees: variables.attendees.split(',').map(e => e.trim()).filter(Boolean),
                meetingLink: response.meetingLink || response.data?.meetingLink,
                joinUrl: response.joinUrl || response.data?.joinUrl,
                status: 'scheduled'
            };
            setMeetings(prev => [newMeeting, ...prev]);

            setIsCreateDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to create meeting';
            toast.error(errorMessage);

            if (errorMessage.includes('not connected')) {
                toast.info('Please connect your Microsoft account in the Integrations tab.');
            }
        }
    });

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            startTime: '',
            endTime: '',
            attendees: '',
            platform: 'google'
        });
    };

    const handleCreateMeeting = () => {
        if (!formData.title || !formData.startTime || !formData.endTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.platform === 'teams' && !currentUser?.integrations?.microsoft?.connected) {
            toast.error('Microsoft Teams integration NOT connected');
            // But we'll still let the request proceed to see the backend error if they think they are connected
        }

        createMeetingMutation.mutate(formData);
    };

    const upcomingMeetings = meetings.filter(m =>
        m.status === 'scheduled' && new Date(m.startTime) > new Date()
    );

    const pastMeetings = meetings.filter(m =>
        m.status === 'completed' || new Date(m.endTime) < new Date()
    );

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header isAuthenticated />

            <main className="pt-24 pb-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-display-sm text-foreground mb-2">
                                    Meetings Dashboard
                                </h1>
                                <p className="text-muted-foreground">
                                    Schedule and manage your meetings across Google Meet and Microsoft Teams
                                </p>
                            </div>

                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="lg" className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Schedule Meeting
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Schedule New Meeting</DialogTitle>
                                        <DialogDescription>
                                            Create a meeting and send invitations automatically
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6 py-4">
                                        {/* Platform Selection */}
                                        <div className="space-y-2">
                                            <Label>Meeting Platform</Label>
                                            <Select
                                                value={formData.platform}
                                                onValueChange={(value: 'google' | 'teams') =>
                                                    setFormData(prev => ({ ...prev, platform: value }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="google">
                                                        <div className="flex items-center gap-2">
                                                            <Video className="w-4 h-4" />
                                                            Google Meet
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="teams">
                                                        <div className="flex items-center gap-2">
                                                            <Video className="w-4 h-4" />
                                                            Microsoft Teams
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Title */}
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Meeting Title *</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g., Sprint Planning Meeting"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Meeting agenda and details..."
                                                rows={3}
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            />
                                        </div>

                                        {/* Date & Time */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="startTime">Start Time *</Label>
                                                <Input
                                                    id="startTime"
                                                    type="datetime-local"
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="endTime">End Time *</Label>
                                                <Input
                                                    id="endTime"
                                                    type="datetime-local"
                                                    value={formData.endTime}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Attendees */}
                                        <div className="space-y-2">
                                            <Label htmlFor="attendees">Attendees (comma-separated emails)</Label>
                                            <Textarea
                                                id="attendees"
                                                placeholder="john@example.com, sarah@example.com"
                                                rows={2}
                                                value={formData.attendees}
                                                onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Email invitations will be sent automatically to all attendees
                                            </p>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreateMeeting}
                                            disabled={createMeetingMutation.isPending}
                                        >
                                            {createMeetingMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Create & Send Invites
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid gap-6 md:grid-cols-3 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Upcoming</p>
                                        <p className="text-3xl font-bold">{upcomingMeetings.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">This Week</p>
                                        <p className="text-3xl font-bold">
                                            {upcomingMeetings.filter(m => {
                                                const meetingDate = new Date(m.startTime);
                                                const weekFromNow = new Date();
                                                weekFromNow.setDate(weekFromNow.getDate() + 7);
                                                return meetingDate <= weekFromNow;
                                            }).length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Completed</p>
                                        <p className="text-3xl font-bold">{pastMeetings.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meetings List */}
                    <Tabs defaultValue="upcoming" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="past">Past</TabsTrigger>
                        </TabsList>

                        <TabsContent value="upcoming" className="space-y-4">
                            {upcomingMeetings.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                            <Calendar className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">No upcoming meetings</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Schedule your first meeting to get started
                                            </p>
                                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Schedule Meeting
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                upcomingMeetings.map((meeting) => (
                                    <MeetingCard key={meeting.id} meeting={meeting} />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="past" className="space-y-4">
                            {pastMeetings.length === 0 ? (
                                <Card className="p-12 text-center text-muted-foreground">
                                    No past meetings
                                </Card>
                            ) : (
                                pastMeetings.map((meeting) => (
                                    <MeetingCard key={meeting.id} meeting={meeting} isPast />
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}

function MeetingCard({ meeting, isPast = false }: { meeting: Meeting; isPast?: boolean }) {
    return (
        <Card className={isPast ? 'opacity-60' : ''}>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meeting.platform === 'google' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                                }`}>
                                <Video className={`w-5 h-5 ${meeting.platform === 'google' ? 'text-blue-500' : 'text-purple-500'
                                    }`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{meeting.title}</h3>
                                {meeting.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {new Date(meeting.startTime).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                {meeting.attendees.length} attendees
                            </div>
                            <Badge variant="outline">
                                {meeting.platform === 'google' ? 'Google Meet' : 'Microsoft Teams'}
                            </Badge>
                        </div>

                        {meeting.attendees.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {meeting.attendees.slice(0, 2).join(', ')}
                                    {meeting.attendees.length > 2 && ` +${meeting.attendees.length - 2} more`}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {meeting.meetingLink && (
                            <Button size="sm" variant="outline" asChild>
                                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Event
                                </a>
                            </Button>
                        )}
                        {meeting.joinUrl && !isPast && (
                            <Button size="sm" asChild>
                                <a href={meeting.joinUrl} target="_blank" rel="noopener noreferrer">
                                    <Video className="w-4 h-4 mr-2" />
                                    Join Meeting
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
