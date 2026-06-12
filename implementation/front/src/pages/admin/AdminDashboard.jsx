import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  Wrench, 
  Flag, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Loader2,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminAPI } from '../../services/adminAPI';

// Composant StatCard dynamique
function StatCard({ title, value, description, icon: Icon, trend, variant = 'primary', loading = false }) {
  const variantClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };
  const bgClass = variantClasses[variant] || variantClasses.primary;

  return (
    <Card className="relative overflow-hidden shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${bgClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <div className="flex items-center gap-2 text-xs mt-1">
          {trend && (
            <span className={trend.isPositive ? 'text-success font-bold' : 'text-destructive font-bold'}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Table des outils en attente
function ToolsTable({ tools }) {
  if (tools.length === 0) return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <CheckCircle className="h-12 w-12 text-success/20 mb-3" />
      <p className="text-muted-foreground">Aucun outil en attente de validation</p>
    </div>
  );

  return (
    <div className="divide-y divide-border">
      {tools.map((tool) => (
        <div key={tool.id} className="flex items-center justify-between py-4 group hover:bg-muted/50 px-2 rounded-lg transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              {tool.toolName ? tool.toolName.charAt(0) : 'IA'}
            </div>
            <div>
              <p className="font-bold text-foreground">{tool.toolName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Proposé par <span className="text-foreground font-medium">{tool.userFirstName} {tool.userName}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {new Date(tool.createdAt).toLocaleDateString('fr-FR')}
            </span>
            <Link to={`/admin/tools`}>
              <Button variant="outline" size="sm" className="h-8">Traiter</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// Table des utilisateurs
function UsersTable({ users }) {
  if (!users || users.length === 0) return null;
  return (
    <div className="divide-y divide-border">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between py-4 group hover:bg-muted/50 px-2 rounded-lg transition-colors">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border border-border shadow-sm">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                {user.nom ? user.nom.charAt(0) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-foreground">{user.prenom} {user.nom}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider font-bold">
              {user.role}
            </Badge>
            <Link to={`/admin/users?edit=${user.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// Table des signalements
function ReportsTable({ reports }) {
  if (!reports || reports.length === 0) return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <CheckCircle className="h-12 w-12 text-success/20 mb-3" />
      <p className="text-muted-foreground">Aucun signalement en attente</p>
    </div>
  );

  return (
    <div className="divide-y divide-border">
      {reports.map((report) => (
        <div key={report.id} className="flex items-center justify-between py-4 group hover:bg-muted/50 px-2 rounded-lg transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-bold text-foreground line-clamp-1">{report.reason}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Sur <span className="text-foreground font-medium">{report.toolName || 'Commentaire'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="text-[10px] bg-muted/50">
               {report.commentId ? 'Commentaire' : 'Outil'}
             </Badge>
             <Link to={`/admin/reports?view=${report.id}`}>
              <Button variant="ghost" size="sm" className="h-8">Traiter</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.dashboard();
      setData(response);
    } catch (err) {
      toast.error('Erreur lors de la récupération des données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data?.stats || {};
  const pendingTools = data?.pendingTools || [];
  const pendingReports = data?.pendingReports || [];
  const recentUsers = data?.users || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1 text-lg">Vue d&apos;ensemble de votre plateforme IA</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={fetchDashboardData} disabled={loading}>
             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Actualiser
           </Button>
        </div>
      </div>

      {/* Métriques clés */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers?.toLocaleString() || '0'}
          description="comptes enregistrés"
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          title="Outils actifs"
          value={stats.approvedTools || '0'}
          description={`${stats.totalTools || 0} au total`}
          icon={Wrench}
          variant="success"
          loading={loading}
        />
        <StatCard
          title="Modérations"
          value={stats.pendingReports || '0'}
          description="signalements à traiter"
          icon={Flag}
          variant="warning"
          loading={loading}
        />
        <StatCard
          title="En attente"
          value={stats.pendingTools || '0'}
          description="outils soumis"
          icon={Clock}
          variant="primary"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche : Outils en attente */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Soumissions en attente
              </CardTitle>
              <CardDescription>
                {stats.pendingTools || 0} outil{stats.pendingTools > 1 ? "s" : ""} attendent votre validation
              </CardDescription>
            </div>
            <Link to="/admin/tools">
              <Button variant="outline" size="sm" className="shadow-sm">
                Gérer tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              </div>
            ) : (
              <ToolsTable tools={pendingTools} />
            )}
          </CardContent>
        </Card>

        {/* Colonne droite : Activité plateforme */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-xl">Activité du système</CardTitle>
            <CardDescription>État actuel des services</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm font-medium">Base de données</span>
                   </div>
                   <Badge variant="outline" className="text-success border-success/30 bg-success/5">Opérationnel</Badge>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm font-medium">API IA Finder</span>
                   </div>
                   <Badge variant="outline" className="text-success border-success/30 bg-success/5">Opérationnel</Badge>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-warning" />
                      <span className="text-sm font-medium">Stockage Images</span>
                   </div>
                   <Badge variant="outline" className="text-warning border-warning/30 bg-warning/5">Lent</Badge>
                </div>
                
                <div className="pt-4 border-t">
                   <p className="text-xs font-bold uppercase text-muted-foreground mb-3">Statistiques Catégories</p>
                   <div className="flex items-center justify-between py-1">
                      <span className="text-sm">Total domaines</span>
                      <span className="font-bold">{stats.totalCategories || 0}</span>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets bas de page */}
      <Tabs defaultValue="users" className="space-y-4">
        <div className="flex items-center justify-between">
           <TabsList className="grid w-[400px] grid-cols-2">
             <TabsTrigger value="users" className="flex items-center gap-2 font-bold">
                <Users className="h-4 w-4" /> Utilisateurs récents
             </TabsTrigger>
             <TabsTrigger value="reports" className="flex items-center gap-2 font-bold">
                <Flag className="h-4 w-4" /> Signalements récents
             </TabsTrigger>
           </TabsList>
        </div>
        
        <TabsContent value="users">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-xl">Derniers inscrits</CardTitle>
                <CardDescription>Les nouveaux membres de la communauté</CardDescription>
              </div>
              <Link to="/admin/users">
                <Button variant="ghost" size="sm">
                  Gérer les utilisateurs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-2">
              {loading ? (
                <div className="py-10 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <UsersTable users={recentUsers} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-xl">Alertes en attente</CardTitle>
                <CardDescription>Signalements nécessitant une action immédiate</CardDescription>
              </div>
              <Link to="/admin/reports">
                <Button variant="ghost" size="sm">
                  Accéder à la modération
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-2">
               {loading ? (
                <div className="py-10 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <ReportsTable reports={pendingReports} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
