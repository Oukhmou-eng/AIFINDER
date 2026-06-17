import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // ← remplace next/link et usePathname
import {
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Heart,
  FolderOpen,
  Bell,
  Settings,
  LayoutDashboard,
  Scale
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useAuth } from '../../contexts/auth-context';
import { useCompare } from '../../contexts/compare-context';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/tools', label: 'Outils' },
  { href: '/categories', label: 'Catégories' },
  { href: '/models', label: 'Modèles AI' },
  { href: '/ranking', label: 'Classement' },
];

export function Header() {
  const location = useLocation();     // ← remplace usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout, unreadNotificationCount } = useAuth();
  const { compareTools } = useCompare();

  const pathname = location.pathname; // ← récupère le chemin actuel

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">AI</span>
          </div>
          <span className="text-xl font-bold text-foreground">Finder</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                pathname === item.href
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <Link to="/search">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Rechercher</span>
            </Button>
          </Link>

          {/* Compare button */}
          {compareTools.length > 0 && (
            <Link to="/compare">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                <Scale className="h-4 w-4" />
                <span>Comparer</span>
                <Badge variant="secondary" className="ml-1">
                  {compareTools.length}
                </Badge>
              </Button>
            </Link>
          )}

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              {!isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                          {unreadNotificationCount}
                        </span>
                      )}
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2 font-medium">Notifications</div>
                    <DropdownMenuSeparator />
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {unreadNotificationCount === 0 ? 'Aucune nouvelle notification' : `${unreadNotificationCount} notification(s) non lue(s)`}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/notifications" className="cursor-pointer">
                        Voir toutes les notifications
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>)}

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline text-sm font-medium">{user?.name}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Inscription</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/search" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher
                  </Button>
                </Link>

                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        pathname === item.href
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {compareTools.length > 0 && (
                  <Link to="/compare" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center">
                        <Scale className="mr-2 h-4 w-4" />
                        Comparer
                      </span>
                      <Badge variant="secondary">{compareTools.length}</Badge>
                    </Button>
                  </Link>
                )}

                {!isAuthenticated && (
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Connexion</Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Inscription</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}