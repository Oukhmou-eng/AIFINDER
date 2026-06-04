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
  ArrowRight
} from 'lucide-react';
import { 
  dashboardMetrics, 
  mockUsers, 
  tools as mockTools, 
  mockReports,
  getCategoryById 
} from '../../lib/mock-data';

// Composant StatCard utilisant les variables CSS du thème
function StatCard({ title, value, description, icon: Icon, trend, variant = 'primary' }) {
  const variantClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };
  const bgClass = variantClasses[variant] || variantClasses.primary;
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${bgClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span className={trend.isPositive ? 'text-success' : 'text-destructive'}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Table des outils en attente (simplifiée)
function ToolsTable({ tools }) {
  if (tools.length === 0) return null;
  return (
    <div className="divide-y divide-border">
      {tools.map((tool) => (
        <div key={tool.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-sm font-bold">
              {tool.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{tool.name}</p>
              <p className="text-xs text-muted-foreground">
                {getCategoryById(tool.categoryId)?.name || 'N/A'}
              </p>
            </div>
          </div>
          <Link to={`/admin/tools?edit=${tool.id}`}>
            <Button variant="ghost" size="sm">Voir</Button>
          </Link>
        </div>
      ))}
    </div>
  );
}

// Table des utilisateurs avec avatar et rôle
function UsersTable({ users }) {
  return (
    <div className="divide-y divide-border">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
              {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
            </Badge>
            <Link to={`/admin/users?edit=${user.id}`}>
              <Button variant="ghost" size="sm">Voir</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// Table des signalements
function ReportsTable({ reports }) {
  if (reports.length === 0) return null;
  return (
    <div className="divide-y divide-border">
      {reports.map((report) => (
        <div key={report.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">Signalement #{report.id.slice(0, 8)}</p>
            <p className="text-xs text-muted-foreground">
              {report.reason} - {report.type}
            </p>
          </div>
          <Link to={`/admin/reports?view=${report.id}`}>
            <Button variant="ghost" size="sm">Traiter</Button>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const pendingTools = mockTools.filter(t => t.status === "pending");
  const recentUsers = mockUsers.slice(0, 5);
  const pendingReports = mockReports.filter(r => r.status === "pending");

  const metrics = {
    totalUsers: dashboardMetrics?.totalUsers || 1248,
    approvedTools: dashboardMetrics?.approvedTools || 320,
    pendingToolsCount: dashboardMetrics?.pendingTools || 15,
    pendingReportsCount: dashboardMetrics?.pendingReports || 3,
    resolvedReportsThisWeek: dashboardMetrics?.resolvedReportsThisWeek || 7,
    activeUsersToday: dashboardMetrics?.activeUsersToday || 89,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Bienvenue dans votre espace d&apos;administration</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Utilisateurs totaux"
          value={metrics.totalUsers.toLocaleString()}
          description="cette semaine"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Outils approuvés"
          value={metrics.approvedTools}
          description={`${metrics.pendingToolsCount} en attente`}
          icon={Wrench}
          variant="success"
        />
        <StatCard
          title="Signalements en attente"
          value={metrics.pendingReportsCount}
          description={`${metrics.resolvedReportsThisWeek} résolus cette semaine`}
          icon={Flag}
          variant="warning"
        />
        <StatCard
          title="Utilisateurs actifs"
          value={metrics.activeUsersToday}
          description="aujourd&apos;hui"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          variant="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Outils en attente de validation
              </CardTitle>
              <CardDescription>
                {pendingTools.length} outil{pendingTools.length > 1 ? "s" : ""} à valider
              </CardDescription>
            </div>
            <Link to="/admin/tools?status=pending">
              <Button variant="outline" size="sm">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingTools.length > 0 ? (
              <ToolsTable tools={pendingTools.slice(0, 3)} />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-success mb-3" />
                <p className="text-muted-foreground">Aucun outil en attente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nouvel utilisateur inscrit", user: "Sophie Leroy", time: "Il y a 2h" },
                { action: "Outil proposé", user: "Jean Dupont", time: "Il y a 4h" },
                { action: "Commentaire signalé", user: "Marie Martin", time: "Il y a 6h" },
                { action: "Outil validé", user: "Admin", time: "Il y a 8h" },
                { action: "Utilisateur suspendu", user: "Admin", time: "Hier" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.user} · {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs récents</TabsTrigger>
          <TabsTrigger value="reports">Signalements récents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Derniers utilisateurs inscrits</CardTitle>
                <CardDescription>Les 5 derniers comptes créés</CardDescription>
              </div>
              <Link to="/admin/users">
                <Button variant="outline" size="sm">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <UsersTable users={recentUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Signalements en attente</CardTitle>
                <CardDescription>Nécessitent votre attention</CardDescription>
              </div>
              <Link to="/admin/reports">
                <Button variant="outline" size="sm">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingReports.length > 0 ? (
                <ReportsTable reports={pendingReports} />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-success mb-3" />
                  <p className="text-muted-foreground">Aucun signalement en attente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}