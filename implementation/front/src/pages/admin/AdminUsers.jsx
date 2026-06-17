import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, Users, UserCheck, UserX, MoreHorizontal, Eye, ShieldAlert, Ban, RefreshCw, PlusCircle, Loader2 } from 'lucide-react';
import { mockProposedTools, reviews } from '../../lib/mock-data';
import { toast } from 'sonner';
import api from '../../services/api';
import AdminAPI from '../../services/adminAPI';
import { CatalogAPI } from '../../services/catalogAPI';

// Composant StatCard local
function StatCard({ title, value, icon: Icon, variant = 'primary', loading = false }) {
  const variantClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${variantClasses[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminUsers() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsWithTools, setReviewsWithTools] = useState([]);

  // Récupération des utilisateurs depuis l'API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('users');
      setUsers(data.users || []);
    } catch (err) {
      toast.error("Erreur lors de la récupération des utilisateurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Récupération des paramètres d'URL pour ouverture auto et surbrillance
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');
    if (editId && users.length > 0) {
      const user = users.find(u => u.id === editId);
      if (user) {
        setSelectedUser(user);
        // Scroll vers la ligne et surbrillance
        setTimeout(() => {
          const row = document.getElementById(`user-row-${editId}`);
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.classList.add('bg-primary/10', 'transition-colors', 'duration-500');
            setTimeout(() => row.classList.remove('bg-primary/10'), 2000);
          }
        }, 100);
        // Nettoyer l'URL (optionnel)
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [location.search, users]);

  useEffect(() => {
    const loadReviewsWithTools = async () => {
      const enriched = await Promise.all(
        userReviews.map(async (review) => {
          const tool = await getToolById(review.toolId);
          return { ...review, tool };
        })
      );
      setReviewsWithTools(enriched);
    };
    if (userReviews.length > 0) {
      loadReviewsWithTools();
    } else {
      setReviewsWithTools([]);
    }
  }, [userReviews]);

  // Récupération des propositions et commentaires par utilisateur
  const getUserProposals = (userId) => {
    return mockProposedTools.filter(prop => prop.userId === userId);
  };

  const getUserReviews = (userId) => {
    return reviews.filter(review => review.userId === userId);
  };

  const filteredUsers = users.filter((user) => {
    const name = user.name || `${user.prenom || ''} ${user.nom || ''}`;
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getToolById = async (toolId) => {

    try {
      const tool = await CatalogAPI.tool(toolId);
      return tool || null;
    }
    catch (error) {
      toast.error(`Erreur lors de la récupération de l'outil avec l'ID ${toolId}`);
    }
  }

  const activeUsers = users.filter((u) => u.status === 'active').length;
  const suspendedUsers = users.filter((u) => u.status === 'suspended' || u.status === 'suspendu').length;

  const handleSuspend = async (user) => {
    try {
      await api.post('update_user', { id: user.id, statut: 'suspendu' });
      setUsers(users.map((u) =>
        u.id === user.id ? { ...u, status: 'suspended' } : u
      ));
      if (selectedUser?.id === user.id) setSelectedUser(prev => ({ ...prev, status: 'suspended' }));
      toast.success(`Utilisateur ${user.name || user.email} suspendu`);
    } catch (err) {
      toast.error("Erreur lors de la suspension");
    }
  };

  const loadUserDetails = async (user) => {
    try {
      const [submissionsRes, reviewsRes] = await Promise.all([
        AdminAPI.getUserSubmissions(user.id),
        AdminAPI.getUserReviews(user.id)
      ]);
      console.log('User ID:', user.id);
      console.log('Submissions:', submissionsRes);
      console.log('Reviews:', reviewsRes);
      setUserSubmissions(submissionsRes.submissions || []);
      setUserReviews(reviewsRes.reviews || []);
    } catch (err) {
      toast.error("Erreur lors du chargement des détails");
    }
  };

  const handleReactivate = async (user) => {
    try {
      await api.post('update_user', { id: user.id, statut: 'actif' });
      setUsers(users.map((u) =>
        u.id === user.id ? { ...u, status: 'active' } : u
      ));
      if (selectedUser?.id === user.id) setSelectedUser(prev => ({ ...prev, status: 'active' }));
      toast.success(`Utilisateur ${user.name || user.email} réactivé`);
    } catch (err) {
      toast.error("Erreur lors de la réactivation");
    }
  };

  const handleAddAdminSubmit = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('Tous les champs sont requis');
      return;
    }

    try {
      await api.post('register', {
        name: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.password,
        role: 'admin'
      });

      toast.success('Administrateur ajouté avec succès');
      setShowAddAdminDialog(false);
      setNewAdmin({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout de l'administrateur");
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez et surveillez les comptes utilisateurs</p>
        </div>
        <Button onClick={() => setShowAddAdminDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un administrateur
        </Button>
      </div>

      {/* Dialog d'ajout d'admin */}
      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un administrateur</DialogTitle>
            <DialogDescription>Créez un nouveau compte administrateur</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminName">Nom complet</Label>
              <Input
                id="adminName"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                placeholder="Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Mot de passe</Label>
              <Input
                id="adminPassword"
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddAdminDialog(false)}>Annuler</Button>
            <Button onClick={handleAddAdminSubmit}>Ajouter</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total utilisateurs" value={users.length} icon={Users} variant="primary" loading={loading} />
        <StatCard title="Utilisateurs actifs" value={activeUsers} icon={UserCheck} variant="success" loading={loading} />
        <StatCard title="Utilisateurs suspendus" value={suspendedUsers} icon={UserX} variant="destructive" loading={loading} />
      </div>

      {/* Filtres et tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {loading ? "Chargement..." : `${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? 's' : ''} trouvé${filteredUsers.length > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="suspendu">Suspendus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Récupération des utilisateurs...</p>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Aucun utilisateur trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} id={`user-row-${user.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{(user.name || user.email || '?').charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name || `${user.prenom || ''} ${user.nom || ''}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(user.status === 'active' || user.status === 'actif') ? 'default' : 'destructive'}>
                        {(user.status === 'active' || user.status === 'actif') ? 'Actif' : 'Suspendu'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            loadUserDetails(user);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>
                          {user.role !== 'admin' && (
                            (user.status === 'active' || user.status === 'actif') ? (
                              <DropdownMenuItem onClick={() => handleSuspend(user)}>
                                <Ban className="mr-2 h-4 w-4" />
                                Suspendre
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleReactivate(user)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Réactiver
                              </DropdownMenuItem>
                            )
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modale de détails */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;utilisateur</DialogTitle>
            <DialogDescription>Informations complètes du compte</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <>
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{(selectedUser.name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.name || `${selectedUser.prenom || ''} ${selectedUser.nom || ''}`}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <Badge
                    variant={(selectedUser.status === 'active' || selectedUser.status === 'actif') ? 'default' : 'destructive'}
                    className="mt-1"
                  >
                    {(selectedUser.status === 'active' || selectedUser.status === 'actif') ? 'Actif' : 'Suspendu'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pb-4 border-b">
                <div>
                  <p className="text-muted-foreground">Inscription</p>
                  <p className="font-medium">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dernière connexion</p>
                  <p className="font-medium">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}</p>
                </div>
              </div>

              {/* Onglets */}
              <Tabs defaultValue="proposals" className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="proposals">Outils proposés</TabsTrigger>
                  <TabsTrigger value="reviews">Commentaires</TabsTrigger>
                </TabsList>

                <TabsContent value="proposals" className="space-y-3 mt-4">
                  {userSubmissions.length > 0 ? (
                    <div className="space-y-2">
                      {userSubmissions.map(proposal => (
                        <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{proposal.toolName}</p>
                            <Badge variant="outline">{proposal.status}</Badge>
                          </div>
                          <Link to={`/admin/proposals/${proposal.toolId}`}>
                            <Button variant="ghost" size="sm">Détails</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Aucun outil proposé</p>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-3 mt-4">
                  {userReviews.length > 0 ? (
                    <div className="space-y-2">
                      {reviewsWithTools.map((review) => (
                        <div key={review.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{review.tool?.name || 'Outil inconnu'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{review.comment}</p>
                          </div>
                          <Link to={`/admin/proposals/${review.tool?.id || '#'}`}>
                            <Button variant="ghost" size="sm">Voir</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Aucun commentaire</p>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4 border-t">
                {(selectedUser.status === 'active' || selectedUser.status === 'actif') && selectedUser.role !== 'admin' ? (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleSuspend(selectedUser)}
                  >
                    Suspendre le compte
                  </Button>
                ) : (selectedUser.status === 'suspended' || selectedUser.status === 'suspendu') && selectedUser.role !== 'admin' ? (
                  <Button
                    className="flex-1"
                    onClick={() => handleReactivate(selectedUser)}
                  >
                    Réactiver le compte
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
