import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { WorkThreadCard } from '@/components/WorkThreadCard';
import { WorkTaskCard } from '@/components/WorkTaskCard';
import { TeamService, ThreadService, WorkItemService } from '@/services/api';
import { Team, WorkThread, WorkItem, Invitation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Mail, Link as LinkIcon, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TeamDetailsPage() {
    const { teamId } = useParams<{ teamId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string>('none');

    const { data: team, isLoading } = useQuery({
        queryKey: ['team', teamId],
        queryFn: () => teamId ? TeamService.get(teamId) : Promise.reject('No ID'),
        enabled: !!teamId
    });

    // ... (keep queries)

    const createTaskMutation = useMutation({
        mutationFn: (data: { title: string, assigneeId?: string }) => {
            if (!teamId) throw new Error('No ID');
            return WorkItemService.createItem({
                title: data.title,
                type: 'task',
                source: 'Manual',
                teamId,
                assigneeId: data.assigneeId === 'none' ? undefined : data.assigneeId,
                isRead: false
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamItems', teamId] });
            setIsTaskDialogOpen(false);
            setNewTaskTitle('');
            setNewTaskAssigneeId('none');
            toast.success('Task created and notification sent');
        }
    });

    const { data: teamThreads = [], isLoading: threadsLoading } = useQuery({
        queryKey: ['teamThreads', teamId],
        queryFn: () => teamId ? ThreadService.getTeamThreads(teamId) : Promise.resolve([]),
        enabled: !!teamId
    });

    const { data: teamItems = [], isLoading: itemsLoading } = useQuery({
        queryKey: ['teamItems', teamId],
        queryFn: () => teamId ? WorkItemService.getTeamItems(teamId) : Promise.resolve([]),
        enabled: !!teamId
    });

    const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
        queryKey: ['teamInvitations', teamId],
        queryFn: () => teamId ? TeamService.getInvitations(teamId) : Promise.resolve([]),
        enabled: !!teamId
    });

    const inviteMutation = useMutation({
        mutationFn: (email: string) => {
            if (!teamId) throw new Error('No ID');
            return TeamService.invite(teamId, email);
        },
        onSuccess: (data) => {
            setInviteLink(data.link);
            queryClient.invalidateQueries({ queryKey: ['teamInvitations', teamId] });
            toast.success('Invitation created and email sent!');
            // Keep dialog open to show link
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to invite');
        }
    });

    const removeMemberMutation = useMutation({
        mutationFn: (memberId: string) => {
            if (!teamId) throw new Error('No ID');
            return TeamService.removeMember(teamId, memberId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team', teamId] });
            toast.success('Member removed');
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: (data: { memberId: string, role: 'admin' | 'member' }) => {
            if (!teamId) throw new Error('No ID');
            return TeamService.updateMemberRole(teamId, data.memberId, data.role);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team', teamId] });
            toast.success('Role updated');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to update role');
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (itemId: string) => WorkItemService.deleteItem(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamItems', teamId] });
            toast.success('Task deleted');
        },
        onError: (err: any) => {
            toast.error('Failed to delete task');
        }
    });

    const updateTaskStatusMutation = useMutation({
        mutationFn: (data: { id: string, status: string }) =>
            WorkItemService.updateItem(data.id, { status: data.status as any }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamItems', teamId] });
            queryClient.invalidateQueries({ queryKey: ['teamThreads', teamId] });
        }
    });

    const handleInvite = () => {
        if (!inviteEmail || !inviteEmail.includes('@')) return;
        inviteMutation.mutate(inviteEmail);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        toast.success('Link copied to clipboard');
    };

    const { currentUser } = useAuth();
    const isAdmin = useMemo(() => {
        if (!team || !currentUser) return false;
        if (team.ownerId === currentUser.id) return true;
        const member = team.members.find(m => m.userId === currentUser.id);
        return member?.role === 'admin';
    }, [team, currentUser]);

    if (isLoading) {
        return <div className="flex justify-center pt-24"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!team) return <div>Team not found</div>;

    return (
        <div className="min-h-screen bg-background">
            <Header isAuthenticated />
            <main className="pt-24 pb-12 px-4">
                <div className="container mx-auto max-w-5xl space-y-8">
                    {/* Header */}
                    <div>
                        <Button variant="ghost" onClick={() => navigate('/teams')} className="mb-4 pl-0">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teams
                        </Button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                                <p className="text-muted-foreground">{team.description}</p>
                            </div>
                            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Invite Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Invite to Team</DialogTitle>
                                        <DialogDescription>
                                            Send an email invitation or share a link.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {!inviteLink ? (
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    placeholder="colleague@example.com"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={handleInvite} disabled={inviteMutation.isPending} className="w-full">
                                                {inviteMutation.isPending ? <Loader2 className="animate-spin" /> : 'Generate Invite Link'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 py-4">
                                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                <span>Invitation created for {inviteEmail}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Share this link</Label>
                                                <div className="flex gap-2">
                                                    <Input readOnly value={inviteLink} />
                                                    <Button size="icon" variant="outline" onClick={copyLink}>
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">This link expires in 7 days.</p>
                                            </div>
                                            <Button variant="outline" onClick={() => { setInviteLink(''); setInviteEmail(''); }} className="w-full">
                                                Invite Another
                                            </Button>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <Tabs defaultValue="members">
                        <TabsList>
                            <TabsTrigger value="members">Members</TabsTrigger>
                            <TabsTrigger value="work">Work & Tasks</TabsTrigger>
                        </TabsList>

                        <TabsContent value="members" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Team Members</CardTitle>
                                    <CardDescription>Manage who has access to this team.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Active Members</h4>
                                        {team.members.map((member) => (
                                            <div key={member.userId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src="" />
                                                        <AvatarFallback>{member.name?.[0] || '?'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{member.name || 'Unknown'}</p>
                                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {isAdmin ? (
                                                        <Select
                                                            value={member.role}
                                                            onValueChange={(value) => updateRoleMutation.mutate({ memberId: member.userId, role: value as 'admin' | 'member' })}
                                                            disabled={member.userId === team.ownerId}
                                                        >
                                                            <SelectTrigger className="w-[110px] h-8 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="admin">Admin</SelectItem>
                                                                <SelectItem value="member">Member</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                                            {member.role}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                                                    </span>
                                                    {isAdmin && member.role !== 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to remove this member?')) {
                                                                    removeMemberMutation.mutate(member.userId);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {invitations.length > 0 && (
                                            <>
                                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-4">Pending Invitations</h4>
                                                {invitations.map((inv: Invitation) => (
                                                    <div key={inv.id || inv._id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg opacity-80">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                                <Mail className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{inv.email}</p>
                                                                <p className="text-xs text-muted-foreground">Invited by manager</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Badge variant="outline" className="capitalize">
                                                                {inv.status}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                Sent {format(new Date(inv.createdAt), 'MMM d')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="work" className="mt-6 space-y-8">
                            <div>
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    Active Work Threads
                                    <Badge variant="outline">{teamThreads.length}</Badge>
                                </h3>
                                {threadsLoading ? <div className="flex justify-center"><Loader2 className="animate-spin" /></div> :
                                    teamThreads.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {teamThreads.map((t: WorkThread) => <WorkThreadCard key={t.id} thread={t} />)}
                                        </div>
                                    ) : <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">No active threads assigned to this team.</div>}
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    Team Tasks & Items
                                    <Badge variant="outline">{teamItems.length}</Badge>
                                    <div className="ml-auto">
                                        {isAdmin && (
                                            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        <Plus className="w-3 h-3 mr-2" /> Add Task
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add Team Task</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label>Task Title</Label>
                                                            <Input
                                                                placeholder="e.g. Prepare Quarter Report"
                                                                value={newTaskTitle}
                                                                onChange={e => setNewTaskTitle(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Assign To (Optional)</Label>
                                                            <Select value={newTaskAssigneeId} onValueChange={setNewTaskAssigneeId}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a team member" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">No Assignee (Team Task)</SelectItem>
                                                                    {team.members.map(member => (
                                                                        <SelectItem key={member.userId} value={member.userId}>
                                                                            {member.name || member.email}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <p className="text-[10px] text-muted-foreground">Assigned users will receive an email notification.</p>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            onClick={() => createTaskMutation.mutate({ title: newTaskTitle, assigneeId: newTaskAssigneeId })}
                                                            disabled={!newTaskTitle || createTaskMutation.isPending}
                                                        >
                                                            {createTaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Task'}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </h3>
                                {itemsLoading ? <div className="flex justify-center"><Loader2 className="animate-spin" /></div> :
                                    teamItems.length > 0 ? (
                                        <div className="space-y-4">
                                            {teamItems.map((item: WorkItem) => (
                                                item.type === 'task' ? (
                                                    <WorkTaskCard
                                                        key={item.id}
                                                        task={item}
                                                        onStatusChange={(id, status) => updateTaskStatusMutation.mutate({ id, status })}
                                                    />
                                                ) : (
                                                    <Card key={item.id}>
                                                        <CardContent className="p-4 flex justify-between items-center">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                                <div>
                                                                    <p className="font-medium">{item.title}</p>
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <span>{item.source}</span>
                                                                        <span>•</span>
                                                                        <span>{format(new Date(item.timestamp), 'MMM d, h:mm a')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {item.assigneeId && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Assigned to {team.members.find(m => m.userId === item.assigneeId)?.name || 'Member'}
                                                                    </Badge>
                                                                )}
                                                                <Badge variant={item.isRead ? "outline" : "default"}>{item.type}</Badge>
                                                                {isAdmin && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                        onClick={() => {
                                                                            if (confirm('Are you sure you want to delete this task?')) {
                                                                                deleteTaskMutation.mutate(item.id);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            ))}
                                        </div>
                                    ) : <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">No items assigned to this team.</div>}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
