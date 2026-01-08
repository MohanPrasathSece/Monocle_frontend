import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { mockUser, mockDailyStats } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  Bell,
  Eye,
  LogOut,
  Calendar,
  Clock,
  CheckCircle2,
  Settings,
  Link as LinkIcon,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const userData = currentUser || mockUser;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const totalFocusTime = Math.round(
    mockDailyStats.reduce((acc, s) => acc + s.focusTime, 0) / 60
  );
  const totalTasksCompleted = mockDailyStats.reduce((acc, s) => acc + s.completedTasks, 0);

  const connectedApps = [
    { name: 'Google Workspace', connected: true, icon: '📧' },
    { name: 'Slack', connected: true, icon: '💬' },
    { name: 'Linear', connected: true, icon: '📋' },
    { name: 'Notion', connected: false, icon: '📝' },
    { name: 'GitHub', connected: false, icon: '💻' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="text-2xl">{userData.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-display-sm text-foreground">{userData.name}</h1>
                    <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {userData.email}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <Badge variant="info">
                        <Shield className="w-3 h-3 mr-1" />
                        Pro Plan
                      </Badge>
                      <Badge variant="outline">
                        Member since Jan 2024
                      </Badge>
                    </div>
                  </div>

                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-headline">This Week</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Focus Time</span>
                    </div>
                    <span className="font-semibold">{totalFocusTime}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      <span>Tasks Done</span>
                    </div>
                    <span className="font-semibold">{totalTasksCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Active Days</span>
                    </div>
                    <span className="font-semibold">7</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Connected Apps */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-headline flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Connected Apps
                  </CardTitle>
                  <CardDescription>
                    Manage integrations to unify your work data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connectedApps.map((app) => (
                      <div
                        key={app.name}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{app.icon}</span>
                          <span className="font-medium">{app.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {app.connected ? (
                            <Badge variant="success">Connected</Badge>
                          ) : (
                            <Button variant="outline" size="sm">Connect</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-headline">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Notifications</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive gentle nudges when insights are available
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Focus Mode</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hide distracting elements when working
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Privacy Mode</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Store only aggregated data, not individual items
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sign out */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
