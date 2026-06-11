import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
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
  DialogFooter,
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
import { Search, Wrench, Clock, CheckCircle, XCircle, Plus, Star, MoreHorizontal, Eye, Trash2, Loader2 } from 'lucide-react';
import { getModelById } from '../../lib/mock-data';
import { toast } from 'sonner';
import api from '../../services/api';
import { ToolForm } from '../../components/tools/tool-form';

// Composant StatCard local
function StatCard({ title, value, icon: Icon, variant = 'primary', loading = false }) {
  const variantClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
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

// Composant ToolsTable local
function ToolsTable({ tools, onView, onApprove, onReject, onDelete, loading = false }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Chargement des outils...</p>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun outil trouvé</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Note</TableHead>
          <TableHead>Utilisations</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map((tool) => {
          const categoryNames = tool.categories?.map(c => c.name).join(', ') || 'N/A';
          return (
            <TableRow key={tool.id} id={`tool-row-${tool.id}`}>
              <TableCell className="font-medium">{tool.name}</TableCell>
              <TableCell>{categoryNames}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    tool.status === 'active' || tool.status === 'actif'
                      ? 'default'
                      : tool.status === 'pending' || tool.status === 'en_attente'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {tool.status === 'active' || tool.status === 'actif'
                    ? 'Actif'
                    : tool.status === 'pending' || tool.status === 'en_attente'
                      ? 'En attente'
                      : 'Refusé'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  {tool.rating}/5
                </div>
              </TableCell>
              <TableCell>{(tool.usageCount || 0).toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(tool)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </DropdownMenuItem>
                    {(tool.status === 'pending' || tool.status === 'en_attente') && (
                      <>
                        <DropdownMenuItem onClick={() => onApprove(tool)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approuver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReject(tool)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Refuser
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(tool)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function AdminTools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTool, setSelectedTool] = useState(null);
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();

  const fetchTools = async () => {
    setLoading(true);
    try {
      const data = await api.get('tools');
      setTools(data.tools || []);
    } catch (err) {
      toast.error("Erreur lors de la récupération des outils");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.get('categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTools();
    fetchCategories();
  }, []);

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = statusFilter === 'all';
    if (!matchesStatus) {
      if (statusFilter === 'active') matchesStatus = (tool.status === 'active' || tool.status === 'actif');
      if (statusFilter === 'pending') matchesStatus = (tool.status === 'pending' || tool.status === 'en_attente');
      if (statusFilter === 'rejected') matchesStatus = (tool.status === 'rejected' || tool.status === 'refusé');
    }

    const matchesCategory = categoryFilter === 'all' || tool.categoryIds?.includes(categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingCount = tools.filter((t) => t.status === 'pending' || t.status === 'en_attente').length;
  const approvedCount = tools.filter((t) => (t.status === 'active' || t.status === 'actif')).length;
  const rejectedCount = tools.filter((t) => (t.status === 'rejected' || t.status === 'refusé')).length;


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');
    if (editId && tools.length > 0) {
      const tool = tools.find(t => t.id === editId);
      if (tool) {
        setSelectedTool(tool);

        // Scroll et surbrillance
        setTimeout(() => {
          const row = document.getElementById(`tool-row-${editId}`);
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.classList.add('bg-primary/10', 'transition-colors', 'duration-2000');
            setTimeout(() => {
              row.classList.remove('bg-primary/10');
            }, 2000);
          }
        }, 100);
      }
    }
  }, [location.search, tools]);

  const handleAddToolSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Simulation locale pour l'instant
      const newTool = {
        id: `new-${Date.now()}`,
        ...formData,
        status: 'active',
        rating: 0,
        usageCount: 0,
        reviewCount: 0,
        categories: categories.filter(c => c.id === formData.categoryId)
      };
      
      setTools([newTool, ...tools]);
      toast.success("Outil ajouté avec succès");
      setIsAddDialogOpen(false);
    } catch (err) {
      toast.error("Erreur lors de l'ajout de l'outil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (tool) => {
    try {
      toast.success(`Outil ${tool.name} approuvé`);
      setTools(tools.map(t => t.id === tool.id ? { ...t, status: 'active' } : t));
    } catch (err) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleReject = async (tool) => {
    try {
      toast.success(`Outil ${tool.name} refusé`);
      setTools(tools.map(t => t.id === tool.id ? { ...t, status: 'rejected' } : t));
    } catch (err) {
      toast.error("Erreur lors du refus");
    }
  };

  const handleDelete = async (tool) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'outil ${tool.name} ?`)) {
      try {
        toast.success(`Outil ${tool.name} supprimé`);
        setTools(tools.filter(t => t.id !== tool.id));
      } catch (err) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des outils AI</h1>
          <p className="text-muted-foreground mt-1">Validez et gérez les outils de la plateforme</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un outil
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total outils" value={tools.length} icon={Wrench} variant="primary" loading={loading} />
        <StatCard title="En attente" value={pendingCount} icon={Clock} variant="warning" loading={loading} />
        <StatCard title="Approuvés" value={approvedCount} icon={CheckCircle} variant="success" loading={loading} />
        <StatCard title="Refusés" value={rejectedCount} icon={XCircle} variant="destructive" loading={loading} />
      </div>

      {/* Filtres et tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des outils</CardTitle>
          <CardDescription>
            {loading ? "Chargement..." : `${filteredTools.length} outil${filteredTools.length > 1 ? 's' : ''} trouvé${filteredTools.length > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un outil..."
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
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="active">Approuvés</SelectItem>
                <SelectItem value="rejected">Refusés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ToolsTable
            tools={filteredTools}
            onView={setSelectedTool}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modale de détails de l'outil */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;outil</DialogTitle>
            <DialogDescription>Informations complètes et options de gestion</DialogDescription>
          </DialogHeader>
          {selectedTool && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                  {selectedTool.logo ? (
                    <img src={selectedTool.logo} alt={selectedTool.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary">{selectedTool.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{selectedTool.name}</h3>
                  <p className="text-muted-foreground">{selectedTool.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {selectedTool.categories?.map(cat => (
                      <Badge key={cat.id} variant="outline">{cat.name}</Badge>
                    ))}
                    <Badge
                      variant={
                        selectedTool.status === 'active' || selectedTool.status === 'actif'
                          ? 'default'
                          : selectedTool.status === 'pending' || selectedTool.status === 'en_attente'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {selectedTool.status === 'active' || selectedTool.status === 'actif'
                        ? 'Approuvé'
                        : selectedTool.status === 'pending' || selectedTool.status === 'en_attente'
                          ? 'En attente'
                          : 'Refusé'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      {selectedTool.rating} ({selectedTool.reviewCount || 0} avis)
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description complète</h4>
                <p className="text-sm text-muted-foreground">{selectedTool.longDescription || selectedTool.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Modèles AI utilisés</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTool.aiModels?.map((m) => {
                      const modelName = getModelById ? getModelById(m.modelId)?.name : m.modelId;
                      return (
                        <Badge key={m.modelId} variant="outline">
                          {modelName || m.modelId}
                          <span className={`ml-1 ${m.accessType === 'free' ? 'text-success' : 'text-warning'}`}>
                            ({m.accessType === 'free' ? 'Gratuit' : 'Payant'})
                          </span>
                        </Badge>
                      );
                    }) || <p className="text-xs text-muted-foreground">Aucun modèle spécifié</p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Plateformes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTool.platforms?.map((platform) => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    )) || <p className="text-xs text-muted-foreground">Non spécifié</p>}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {(selectedTool.status === 'pending' || selectedTool.status === 'en_attente') && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleReject(selectedTool);
                        setSelectedTool(null);
                      }}
                    >
                      Refuser
                    </Button>
                    <Button
                      onClick={() => {
                        handleApprove(selectedTool);
                        setSelectedTool(null);
                      }}
                    >
                      Approuver
                    </Button>
                  </>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedTool);
                    setSelectedTool(null);
                  }}
                >
                  Supprimer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue d'ajout d'outil */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel outil</DialogTitle>
            <DialogDescription>Remplissez le formulaire complet pour ajouter l&apos;outil au catalogue</DialogDescription>
          </DialogHeader>
          <ToolForm 
            onSubmit={handleAddToolSubmit} 
            onCancel={() => setIsAddDialogOpen(false)} 
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
