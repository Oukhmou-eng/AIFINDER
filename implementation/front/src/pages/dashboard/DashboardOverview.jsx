import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import {
  Heart,
  FolderHeart,
  MessageSquare,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ToolCard } from '../../components/tools/tool-card';
import { tools as mockTools, mockProposedTools, mockNotifications } from '../../lib/mock-data';

// Composant simple pour les cartes statistiques
function UserStatCard({ title, value, icon: Icon, variant, description }) {
  const colorClasses = {
    destructive: 'text-destructive',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[variant] || 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(user?.favorites || []);

  // Données simulées
  const favoriteTools = mockTools.filter((tool) => favorites.includes(tool.id)).slice(0, 4);
  const proposedTools = mockProposedTools.filter(prop => prop.userId === user?.id) || [];
  const recentNotifications = (user?.notifications || mockNotifications).filter((n) => !n.read).slice(0, 3);

  const stats = {
    favoritesCount: favorites.length,
    collectionsCount: user?.collections?.length || 0,
    commentsCount: user?.reviewsCount || 0,
    proposedToolsCount: proposedTools.length,
    pendingTools: proposedTools.filter(p => p.status === 'pending').length,
  };

  const toggleFavorite = (toolId) => {
    setFavorites((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bonjour, {user?.name?.split(' ')[0] || 'Utilisateur'} !
        </h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre tableau de bord. Voici un aperçu de votre activité.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <UserStatCard
          title="Favoris"
          value={stats.favoritesCount}
          icon={Heart}
          variant="destructive"
          description="Outils enregistrés"
        />
        <UserStatCard
          title="Collections"
          value={stats.collectionsCount}
          icon={FolderHeart}
          variant="primary"
          description="Collections créées"
        />
        <UserStatCard
          title="Commentaires"
          value={stats.commentsCount}
          icon={MessageSquare}
          variant="success"
          description="Avis publiés"
        />
        <UserStatCard
          title="Outils proposés"
          value={stats.proposedToolsCount}
          icon={PlusCircle}
          variant="warning"
          description={`${stats.pendingTools} en attente`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notifications récentes */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Vos alertes récentes</CardDescription>
            </div>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotifications.length > 0 ? (
              <>
                {recentNotifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={notification.link || '/dashboard/notifications'}
                    className="block rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link to="/dashboard/notifications">
                  <Button variant="ghost" className="w-full">
                    Voir toutes les notifications
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Aucune notification non lue
              </p>
            )}
          </CardContent>
        </Card>

        {/* Outils proposés (maintenant cliquables) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Mes outils proposés</CardTitle>
              <CardDescription>Suivez le statut de vos propositions</CardDescription>
            </div>
            <Link to="/propose-tool">
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Proposer
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {proposedTools.length > 0 ? (
              <div className="space-y-3">
                {proposedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={`/dashboard/proposals?highlight=${tool.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <span className="font-bold text-primary">{tool.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tool.category}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        tool.status === 'approved'
                          ? 'border-success/30 bg-success/10 text-success'
                          : tool.status === 'rejected'
                          ? 'border-destructive/30 bg-destructive/10 text-destructive'
                          : 'border-warning/30 bg-warning/10 text-warning'
                      }
                    >
                      {tool.status === 'approved' && <CheckCircle className="mr-1 h-3 w-3" />}
                      {tool.status === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                      {tool.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                      {tool.status === 'approved'
                        ? 'Approuvé'
                        : tool.status === 'rejected'
                        ? 'Refusé'
                        : 'En attente'}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <PlusCircle className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Vous n&apos;avez pas encore proposé d&apos;outil
                </p>
                <Link to="/propose-tool">
                  <Button className="mt-4">Proposer un outil</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Favoris */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Mes favoris</CardTitle>
            <CardDescription>Les outils que vous avez enregistrés</CardDescription>
          </div>
          <Link to="/dashboard/favorites">
            <Button variant="outline" size="sm">
              Voir tous
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {favoriteTools.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {favoriteTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} showCategory={false} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Heart className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Vous n&apos;avez pas encore de favoris
              </p>
              <Link to="/tools">
                <Button className="mt-4">Explorer les outils</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}