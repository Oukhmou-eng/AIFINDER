import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
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
import { Search, Wrench, Clock, CheckCircle, XCircle, Plus, Star, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { tools as mockTools, categories, getCategoryById, getModelById } from '../../lib/mock-data';

// Composant StatCard local
function StatCard({ title, value, icon: Icon, variant = 'primary' }) {
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
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// Composant ToolsTable local
function ToolsTable({ tools, onView, onApprove, onReject, onDelete }) {
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
          const category = getCategoryById(tool.categoryId);
          return (
            <TableRow key={tool.id} id={`tool-row-${tool.id}`}>
              <TableCell className="font-medium">{tool.name}</TableCell>
              <TableCell>{category?.name || 'N/A'}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    tool.status === 'active'
                      ? 'default'
                      : tool.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {tool.status === 'active'
                    ? 'Actif'
                    : tool.status === 'pending'
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
              <TableCell>{tool.usageCount.toLocaleString()}</TableCell>
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
                    {tool.status === 'pending' && (
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
                    {tool.status !== 'pending' && (
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(tool)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    )}
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
  const [tools, setTools] = useState(mockTools);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const location = useLocation();

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tool.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || tool.categoryId === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingCount = tools.filter((t) => t.status === 'pending').length;
  const approvedCount = tools.filter((t) => t.status === 'active').length;
  const rejectedCount = tools.filter((t) => t.status === 'rejected').length;


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');
    if (editId) {
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

  const handleApprove = (tool) => {
    setTools(tools.map(t => t.id === tool.id ? { ...t, status: 'active' } : t));
  };

  const handleReject = (tool) => {
    setTools(tools.map(t => t.id === tool.id ? { ...t, status: 'rejected' } : t));
  };

  const handleDelete = (tool) => {
    setTools(tools.filter(t => t.id !== tool.id));
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
        <StatCard title="Total outils" value={tools.length} icon={Wrench} variant="primary" />
        <StatCard title="En attente" value={pendingCount} icon={Clock} variant="warning" />
        <StatCard title="Approuvés" value={approvedCount} icon={CheckCircle} variant="success" />
        <StatCard title="Refusés" value={rejectedCount} icon={XCircle} variant="destructive" />
      </div>

      {/* Filtres et tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des outils</CardTitle>
          <CardDescription>
            {filteredTools.length} outil{filteredTools.length > 1 ? 's' : ''} trouvé{filteredTools.length > 1 ? 's' : ''}
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
                  <span className="text-2xl font-bold text-primary">{selectedTool.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{selectedTool.name}</h3>
                  <p className="text-muted-foreground">{selectedTool.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline">{getCategoryById(selectedTool.categoryId)?.name || 'N/A'}</Badge>
                    <Badge
                      variant={
                        selectedTool.status === 'active'
                          ? 'default'
                          : selectedTool.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {selectedTool.status === 'active'
                        ? 'Approuvé'
                        : selectedTool.status === 'pending'
                          ? 'En attente'
                          : 'Refusé'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      {selectedTool.rating} ({selectedTool.reviewCount} avis)
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description complète</h4>
                <p className="text-sm text-muted-foreground">{selectedTool.longDescription}</p>
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
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Plateformes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTool.platforms?.map((platform) => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {selectedTool.status === 'pending' && (
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
                {selectedTool.status !== 'pending' && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDelete(selectedTool);
                      setSelectedTool(null);
                    }}
                  >
                    Supprimer
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue d'ajout d'outil (simplifié) */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel outil</DialogTitle>
            <DialogDescription>Ajoutez directement un outil à la plateforme</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l&apos;outil</Label>
              <Input id="name" placeholder="Ex: ChatGPT" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" type="url" placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description courte</Label>
              <Input id="description" placeholder="Une brève description..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullDescription">Description complète</Label>
              <Textarea id="fullDescription" placeholder="Description détaillée de l&apos;outil..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Catégorie</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tarification</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuit</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Payant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setIsAddDialogOpen(false)}>
              Ajouter l&apos;outil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}