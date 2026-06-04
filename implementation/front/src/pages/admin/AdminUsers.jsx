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
import { Search, Users, UserCheck, UserX, MoreHorizontal, Eye, ShieldAlert, Ban, RefreshCw, PlusCircle } from 'lucide-react';
import { mockUsers, mockProposedTools, reviews, getToolById } from '../../lib/mock-data';
import { toast } from 'sonner';

// Composant StatCard local
function StatCard({ title, value, icon: Icon, variant = 'primary' }) {
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
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminUsers() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState(mockUsers);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

  // Récupération des paramètres d'URL pour ouverture auto et surbrillance
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');
    if (editId) {
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

  // Récupération des propositions et commentaires par utilisateur
  const getUserProposals = (userId) => {
    return mockProposedTools.filter(prop => prop.userId === userId);
  };

  const getUserReviews = (userId) => {
    return reviews.filter(review => review.userId === userId);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeUsers = users.filter((u) => u.status === 'active').length;
  const suspendedUsers = users.filter((u) => u.status === 'suspended').length;

  const handleSuspend = (user) => {
    setUsers(users.map((u) =>
      u.id === user.id ? { ...u, status: 'suspended' } : u
    ));
    if (selectedUser?.id === user.id) setSelectedUser(null);
    toast.success(`Utilisateur ${user.name} suspendu`);
  };

  const handleReactivate = (user) => {
    setUsers(users.map((u) =>
      u.id === user.id ? { ...u, status: 'active' } : u
    ));
    if (selectedUser?.id === user.id) setSelectedUser(null);
    toast.success(`Utilisateur ${user.name} réactivé`);
  };

  const handleAddAdminSubmit = () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('Tous les champs sont requis');
      return;
    }
    const newAdminUser = {
      id: `admin-${Date.now()}`,
      name: newAdmin.name,
      email: newAdmin.email,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      avatar: '',
      favorites: [],
      collections: [],
      proposedTools: [],
      reviewsCount: 0,
    };
    setUsers([...users, newAdminUser]);
    setShowAddAdminDialog(false);
    setNewAdmin({ name: '', email: '', password: '' });
    toast.success('Administrateur ajouté avec succès');
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
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

      {/* Cartes statistiques (inchangées) */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total utilisateurs" value={users.length} icon={Users} variant="primary" />
        <StatCard title="Utilisateurs actifs" value={activeUsers} icon={UserCheck} variant="success" />
        <StatCard title="Utilisateurs suspendus" value={suspendedUsers} icon={UserX} variant="destructive" />
      </div>

      {/* Filtres et tableau (inchangés) */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
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
                <SelectItem value="suspended">Suspendus</SelectItem>
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
              {filteredUsers.map((user) => (
                <TableRow key={user.id} id={`user-row-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status === 'active' ? 'Actif' : 'Suspendu'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        {user.role !== 'admin' && (
                          user.status === 'active' ? (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modale de détails avec onglets (avec liens améliorés) */}
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
                  <AvatarFallback>{selectedUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <Badge
                    variant={selectedUser.status === 'active' ? 'default' : 'destructive'}
                    className="mt-1"
                  >
                    {selectedUser.status === 'active' ? 'Actif' : 'Suspendu'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pb-4 border-b">
                <div>
                  <p className="text-muted-foreground">Inscription</p>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dernière connexion</p>
                  <p className="font-medium">{new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Onglets pour les propositions et commentaires */}
              <Tabs defaultValue="proposals" className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="proposals">Outils proposés</TabsTrigger>
                  <TabsTrigger value="reviews">Commentaires</TabsTrigger>
                </TabsList>

                {/* Outils proposés */}
                <TabsContent value="proposals" className="space-y-3 mt-4">
                  {getUserProposals(selectedUser.id).length > 0 ? (
                    <div className="space-y-2">
                      {getUserProposals(selectedUser.id).map(proposal => {
                        const existingTool = getToolById(proposal.id);
                        return (
                          <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="font-medium">{proposal.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Statut : <Badge variant="outline" className={
                                  proposal.status === 'pending' ? 'bg-warning/10 text-warning' :
                                    proposal.status === 'approved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                                }>
                                  {proposal.status === 'pending' ? 'En attente' : proposal.status === 'approved' ? 'Approuvé' : 'Refusé'}
                                </Badge>
                              </p>
                            </div>
                            <Link to={`/admin/proposals/${proposal.id}`}>
                              <Button variant="ghost" size="sm">Voir les détails</Button>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Aucun outil proposé</p>
                  )}
                </TabsContent>

                {/* Commentaires */}
                <TabsContent value="reviews" className="space-y-3 mt-4">
                  {getUserReviews(selectedUser.id).length > 0 ? (
                    <div className="space-y-2">
                      {getUserReviews(selectedUser.id).map(review => {
                        const tool = getToolById(review.toolId);
                        return (
                          <div key={review.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="font-medium">{tool?.name || 'Outil inconnu'}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Note: {review.rating}/5</span>
                                <span>•</span>
                                <span className="truncate max-w-[200px]">{review.comment}</span>
                              </div>
                            </div>
                            <Link to={`/tools/${tool?.slug || '#'}?highlight=${review.id}`}>
                              <Button variant="ghost" size="sm">Voir le commentaire</Button>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Aucun commentaire</p>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4 border-t">
                {selectedUser.status === 'active' && selectedUser.role !== 'admin' ? (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleSuspend(selectedUser);
                      setSelectedUser(null);
                    }}
                  >
                    Suspendre le compte
                  </Button>
                ) : selectedUser.status === 'suspended' && selectedUser.role !== 'admin' ? (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleReactivate(selectedUser);
                      setSelectedUser(null);
                    }}
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