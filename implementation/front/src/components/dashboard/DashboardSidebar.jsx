import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Heart, 
  FolderHeart, 
  PlusCircle, 
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileText  
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useAuth } from '../../contexts/auth-context';
import {Link} from 'react-router-dom';

const navItems = [
  { href: '/dashboard/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/favorites', icon: Heart, label: 'Favoris' },
  { href: '/dashboard/collections', icon: FolderHeart, label: 'Collections' },
  { href: '/dashboard/proposals', icon: FileText, label: 'Mes propositions' }, 
  { href: '/propose-tool', icon: PlusCircle, label: 'Proposer un outil' },
  { href: '/dashboard/reviews', icon: MessageSquare, label: 'Mes commentaires' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { href: '/dashboard/settings', icon: Settings, label: 'Paramètres' },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState(true);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={cn(
      "flex h-screen flex-col border-r border-border bg-card transition-all duration-300 sticky top-0",
      collapsed ? "w-[72px]" : "w-64"
    )}>
      

      {/* User info */}
      <div className={cn(
        "border-b border-border p-4",
        collapsed ? "flex justify-center" : ""
      )}>
        <Link to="/dashboard/profile" className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          )}
        </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {item.href === '/dashboard/notifications' && !collapsed && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
                  2
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      

      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4 border-t border-border p-2">
        {!collapsed && (
          <NavLink to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">AI Tools</span>
          </NavLink>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Logout */}
      <div className="border-t border-border p-2">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}