import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { tools as mockTools, categories as mockCategories, aiModels as mockAIModels, mockUsers } from "../lib/mock-data";
import {
  LayoutDashboard,
  Wrench,
  Users,
  FolderOpen,
  Brain,
  Star,
  Settings,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  Shield
} from "lucide-react";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
        <p className="text-muted-foreground mb-6">
          Cette page est réservée aux administrateurs.
        </p>
        <Link to="/">
          <Button>Retour à l&apos;accueil</Button>
        </Link>
      </div>
    );
  }

  const stats = {
    totalTools: mockTools.length,
    activeTools: mockTools.filter(t => t.status === "active").length,
    pendingTools: mockTools.filter(t => t.status === "pending").length,
    totalUsers: mockUsers.length,
    totalCategories: mockCategories.length,
    totalModels: mockAIModels.length,
    totalReviews: mockTools.reduce((acc, t) => acc + t.reviewCount, 0),
  };

  const filteredTools = mockTools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tool.category && tool.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-primary/5">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Administration</p>
                  <p className="text-xs text-muted-foreground">Panneau de contrôle</p>
                </div>
              </div>
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "overview" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("overview")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Vue d&apos;ensemble
                </Button>
                <Button
                  variant={activeTab === "tools" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("tools")}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Outils
                  <Badge variant="secondary" className="ml-auto">{stats.totalTools}</Badge>
                </Button>
                <Button
                  variant={activeTab === "users" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("users")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Utilisateurs
                  <Badge variant="secondary" className="ml-auto">{stats.totalUsers}</Badge>
                </Button>
                <Button
                  variant={activeTab === "categories" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("categories")}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Catégories
                  <Badge variant="secondary" className="ml-auto">{stats.totalCategories}</Badge>
                </Button>
                <Button
                  variant={activeTab === "models" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("models")}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Modèles IA
                  <Badge variant="secondary" className="ml-auto">{stats.totalModels}</Badge>
                </Button>
                <Button
                  variant={activeTab === "reviews" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("reviews")}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Avis
                  <Badge variant="secondary" className="ml-auto">{stats.totalReviews}</Badge>
                </Button>
                <hr className="my-2" />
                <Button
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="tools">Outils</TabsTrigger>
                <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                <TabsTrigger value="categories">Catégories</TabsTrigger>
              </TabsList>
              {(activeTab === "tools" || activeTab === "users") && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Outils</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTools}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">+12%</span> ce mois
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">+8%</span> ce mois
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avis</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalReviews}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">+24%</span> ce mois
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">En attente</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingTools}</div>
                    <p className="text-xs text-muted-foreground">outils à valider</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Outils récemment ajoutés</CardTitle>
                    <CardDescription>Les 5 derniers outils ajoutés à la plateforme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockTools.slice(0, 5).map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              {tool.logo || tool.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{tool.name}</p>
                              <p className="text-xs text-muted-foreground">{tool.category || "Non catégorisé"}</p>
                            </div>
                          </div>
                          <Badge variant={tool.status === "active" ? "default" : "secondary"}>
                            {tool.status === "active" ? "Actif" : "En attente"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statistiques par catégorie</CardTitle>
                    <CardDescription>Répartition des outils par catégorie</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockCategories.slice(0, 5).map((category) => (
                        <div key={category.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                              {category.icon || "📁"}
                            </div>
                            <p className="font-medium text-sm">{category.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{category.toolCount}</span>
                            <span className="text-xs text-muted-foreground">outils</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gestion des outils</CardTitle>
                    <CardDescription>
                      Ajoutez, modifiez ou supprimez des outils de la plateforme
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un outil
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Outil</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Avis</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTools.map((tool) => (
                        <TableRow key={tool.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm">
                                {tool.logo || tool.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{tool.name}</p>
                                <p className="text-xs text-muted-foreground">{tool.slug}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tool.category || "N/A"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={tool.status === "active" ? "default" : tool.status === "pending" ? "secondary" : "destructive"}
                              className="gap-1"
                            >
                              {tool.status === "active" && <CheckCircle2 className="h-3 w-3" />}
                              {tool.status === "pending" && <Clock className="h-3 w-3" />}
                              {tool.status === "inactive" && <XCircle className="h-3 w-3" />}
                              {tool.status === "active" ? "Actif" : tool.status === "pending" ? "En attente" : "Inactif"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{tool.rating.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{tool.reviewCount}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link to={`/tools/${tool.slug}`} className="flex items-center">
                                    <ArrowUpRight className="h-4 w-4 mr-2" />
                                    Voir
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {tool.status === "active" ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      Désactiver
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Activer
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gestion des utilisateurs</CardTitle>
                    <CardDescription>
                      Gérez les comptes utilisateurs et leurs permissions
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un utilisateur
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead>Favoris</TableHead>
                        <TableHead>Avis</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((userItem) => (
                        <TableRow key={userItem.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{userItem.name}</p>
                                <p className="text-xs text-muted-foreground">{userItem.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={userItem.role === "admin" ? "default" : "secondary"}>
                              {userItem.role === "admin" ? "Admin" : "Utilisateur"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(userItem.createdAt).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>{userItem.favorites?.length || 0}</TableCell>
                          <TableCell>{userItem.reviewsCount || 0}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Changer le rôle
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gestion des catégories</CardTitle>
                    <CardDescription>
                      Organisez les outils par catégories
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une catégorie
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Outils</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-lg">
                                {category.icon || "📁"}
                              </div>
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {category.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {category.slug}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{category.toolCount}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link to={`/categories/${category.slug}`} className="flex items-center">
                                    <ArrowUpRight className="h-4 w-4 mr-2" />
                                    Voir
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Models Tab */}
            <TabsContent value="models">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gestion des modèles IA</CardTitle>
                    <CardDescription>
                      Base de données des modèles d&apos;intelligence artificielle
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un modèle
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modèle</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Benchmark</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAIModels.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{model.name}</p>
                              <p className="text-xs text-muted-foreground">{model.version}</p>
                            </div>
                          </TableCell>
                          <TableCell>{model.provider}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{model.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${model.benchmarkScore}%` }}
                                />
                              </div>
                              <span className="text-sm">{model.benchmarkScore}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link to={`/models/${model.id}`} className="flex items-center">
                                    <ArrowUpRight className="h-4 w-4 mr-2" />
                                    Voir
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Modération des avis</CardTitle>
                  <CardDescription>
                    Examinez et modérez les avis des utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTools.slice(0, 3).map((tool) => (
                      <div key={tool.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Jean Dupont</p>
                              <p className="text-xs text-muted-foreground">
                                sur <span className="font-medium">{tool.name}</span> - Il y a 2 heures
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Excellent outil que j&apos;utilise quotidiennement pour mon travail. L&apos;interface est intuitive et les résultats sont impressionnants.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approuver
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive">
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres généraux</CardTitle>
                    <CardDescription>
                      Configuration générale de la plateforme
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom du site</label>
                      <Input defaultValue="AI Tools Directory" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input defaultValue="Découvrez les meilleurs outils d'intelligence artificielle" />
                    </div>
                    <Button>Sauvegarder</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SEO</CardTitle>
                    <CardDescription>
                      Optimisation pour les moteurs de recherche
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meta titre</label>
                      <Input defaultValue="AI Tools Directory - Trouvez les meilleurs outils IA" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meta description</label>
                      <Input defaultValue="Explorez notre catalogue complet d'outils d'intelligence artificielle..." />
                    </div>
                    <Button>Sauvegarder</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}