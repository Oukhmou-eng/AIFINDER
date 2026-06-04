import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { tools as mockTools } from "../lib/mock-data";
import { 
  Heart, 
  Star, 
  Settings, 
  User, 
  Bell, 
  Shield, 
  LogOut,
  ExternalLink,
  Trash2,
  Edit,
  Clock,
  TrendingUp,
  Bookmark,
  Plus
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
        <p className="text-muted-foreground mb-6">
          Vous devez être connecté pour accéder à cette page.
        </p>
        <Link to="/login">
          <Button>Se connecter</Button>
        </Link>
      </div>
    );
  }

  const favoriteTools = mockTools.filter(tool => 
    user?.favorites?.includes(tool.id)
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-2 capitalize">
                  {user?.role === "admin" ? "Administrateur" : "Utilisateur"}
                </Badge>
              </div>
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "overview" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("overview")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Vue d&apos;ensemble
                </Button>
                <Button
                  variant={activeTab === "favorites" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("favorites")}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Favoris
                </Button>
                <Button
                  variant={activeTab === "reviews" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("reviews")}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Mes avis
                </Button>
                <Button
                  variant={activeTab === "collections" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("collections")}
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Collections
                </Button>
                <Link to="/propose-tool" className="w-full">
                  <Button variant="ghost" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Proposer un outil
                  </Button>
                </Link>
                <Button
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
                {user?.role === "admin" && (
                  <Link to="/admin" className="w-full">
                    <Button variant="ghost" className="w-full justify-start text-primary">
                      <Shield className="h-4 w-4 mr-2" />
                      Administration
                    </Button>
                  </Link>
                )}
                <hr className="my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
              <TabsTrigger value="favorites">Favoris</TabsTrigger>
              <TabsTrigger value="reviews">Mes avis</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview">
              <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Favoris</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user?.favorites?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">outils sauvegardés</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avis</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user?.reviewsCount || 0}</div>
                    <p className="text-xs text-muted-foreground">avis publiés</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Membre depuis</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">date d&apos;inscription</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                  <CardDescription>Vos dernières interactions sur la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ajouté ChatGPT aux favoris</p>
                        <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">A laissé un avis sur Midjourney</p>
                        <p className="text-xs text-muted-foreground">Il y a 1 jour</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-full bg-primary/10">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">A comparé 3 outils de génération d&apos;images</p>
                        <p className="text-xs text-muted-foreground">Il y a 3 jours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favoris */}
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle>Mes outils favoris</CardTitle>
                  <CardDescription>
                    Les outils que vous avez sauvegardés pour un accès rapide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {favoriteTools.length > 0 ? (
                    <div className="space-y-4">
                      {favoriteTools.map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">
                              {tool.logo || tool.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-medium">{tool.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link to={`/tools/${tool.slug}`}>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Aucun favori</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Commencez à explorer et ajoutez des outils à vos favoris
                      </p>
                      <Link to="/tools">
                        <Button>Découvrir les outils</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mes avis */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Mes avis</CardTitle>
                  <CardDescription>
                    Les avis que vous avez publiés sur les outils
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">ChatGPT</h3>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= 5 ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Excellent outil pour la rédaction et la programmation. L&apos;interface est intuitive et les réponses sont pertinentes.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Publié le 15 janvier 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Collections */}
            <TabsContent value="collections">
              <Card>
                <CardHeader>
                  <CardTitle>Mes collections</CardTitle>
                  <CardDescription>
                    Organisez vos outils favoris en collections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Aucune collection</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Créez des collections pour organiser vos outils par thème ou projet
                    </p>
                    <Button>Créer une collection</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Paramètres */}
            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>
                      Mettez à jour vos informations de profil
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input id="name" defaultValue={user?.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Parlez-nous un peu de vous..."
                        rows={3}
                      />
                    </div>
                    <Button>Sauvegarder les modifications</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Gérez vos préférences de notification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Nouveaux outils</p>
                          <p className="text-sm text-muted-foreground">
                            Recevez des notifications pour les nouveaux outils
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Activer</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Mises à jour des favoris</p>
                          <p className="text-sm text-muted-foreground">
                            Soyez informé des mises à jour de vos outils favoris
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Activer</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sécurité</CardTitle>
                    <CardDescription>
                      Gérez la sécurité de votre compte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline">Changer le mot de passe</Button>
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-destructive mb-2">Zone de danger</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        La suppression de votre compte est irréversible.
                      </p>
                      <Button variant="destructive">Supprimer mon compte</Button>
                    </div>
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