import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CognitiveLoadMeter } from './CognitiveLoadMeter';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { IntelligenceService } from '@/services/api';
import {
  LayoutDashboard,
  Lightbulb,
  User,
  Users,
  Settings,
  LogOut,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  isAuthenticated?: boolean;
}

export function Header({ isAuthenticated = false }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

  const { data: cognitiveLoad } = useQuery({
    queryKey: ['cognitiveLoad', currentUser?.id],
    queryFn: () => currentUser?.id ? IntelligenceService.getCognitiveLoad(currentUser.id) : Promise.resolve(null),
    enabled: !!currentUser
  });

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/insights', label: 'Insights', icon: Lightbulb },
    { path: '/integrations', label: 'Integrations', icon: Share2 },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/login">Get started</Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  // Get user initials for avatar fallback
  const userInitials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : currentUser.email?.[0].toUpperCase() || '?';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
      <div className="container mx-auto px-4 h-20 flex items-center">
        <div className="flex-1 flex items-center">
          <Logo size="md" />
        </div>

        <nav className="hidden md:flex items-center justify-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 flex items-center justify-end gap-4">
          {/* Cognitive Load Indicator */}
          <div className="hidden lg:block">
            <CognitiveLoadMeter
              load={cognitiveLoad || {
                level: 'low',
                score: 0,
                factors: { activeThreads: 0, switchingFrequency: 0, workDuration: 0, pendingDeadlines: 0 }
              }}
              compact
            />
          </div>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name || 'User'} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{currentUser.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
