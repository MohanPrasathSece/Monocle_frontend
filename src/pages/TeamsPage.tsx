import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TeamService } from '@/services/api';
import { Team } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Users, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');

    const { data: teams = [], isLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: TeamService.getMyTeams
    });

    const createTeamMutation = useMutation({
        mutationFn: (data: { name: string, description: string }) =>
            TeamService.create(data.name, data.description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setIsCreateOpen(false);
            setNewTeamName('');
            setNewTeamDesc('');
            toast.success('Team created successfully');
        },
        onError: () => {
            toast.error('Failed to create team');
        }
    });

    const handleCreate = () => {
        if (!newTeamName.trim()) return;
        createTeamMutation.mutate({ name: newTeamName, description: newTeamDesc });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header isAuthenticated />
            <main className="pt-24 pb-12 px-4">
                <div className="container mx-auto max-w-5xl space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
                            <p className="text-muted-foreground">Collaborate with your team on projects and tasks.</p>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Team
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create a New Team</DialogTitle>
                                    <DialogDescription>
                                        Give your team a name and description to get started.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Team Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Engineering, Marketing"
                                            value={newTeamName}
                                            onChange={(e) => setNewTeamName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc">Description</Label>
                                        <Input
                                            id="desc"
                                            placeholder="What is this team for?"
                                            value={newTeamDesc}
                                            onChange={(e) => setNewTeamDesc(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={handleCreate}
                                        disabled={!newTeamName.trim() || createTeamMutation.isPending}
                                    >
                                        {createTeamMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Team'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : teams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teams.map((team: Team) => (
                                <Card key={team.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/teams/${team.id}`)}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-start">
                                            <span>{team.name}</span>
                                            <Users className="w-5 h-5 text-muted-foreground" />
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {team.description || 'No description'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-muted-foreground">
                                            {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                                        </div>
                                        <div className="flex -space-x-2 overflow-hidden mt-3">
                                            {team.members.slice(0, 5).map((m, i) => (
                                                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-secondary flex items-center justify-center text-xs font-medium uppercase">
                                                    {m.name ? m.name[0] : m.email?.[0] || '?'}
                                                </div>
                                            ))}
                                            {team.members.length > 5 && (
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-xs font-medium">
                                                    +{team.members.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="ghost" className="w-full justify-between group-hover:text-primary">
                                            View Team <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-muted/30 rounded-lg border-dashed border-2">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium">No teams yet</h3>
                            <p className="text-muted-foreground mb-4">Create a team to start collaborating.</p>
                            <Button onClick={() => setIsCreateOpen(true)}>Create your first team</Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
