import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Cpu, Wrench } from 'lucide-react';
import { aiModels, getToolsByModel } from '../../lib/mock-data';

// Composant StatCard local
function StatCard({ title, value, icon: Icon, description, variant = 'primary' }) {
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
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminModels() {
  const [searchQuery, setSearchQuery] = useState('');
  const [models, setModels] = useState(aiModels);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formDesc, setFormDesc] = useState('');

  // Compter le nombre d'outils utilisant chaque modèle
  const getToolsCount = (modelId) => getToolsByModel(modelId).length;
  const totalToolsUsingModels = models.reduce((sum, model) => sum + getToolsCount(model.id), 0);
  const providers = [...new Set(models.map((m) => m.provider))];

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (model) => {
    if (window.confirm(`Supprimer le modèle "${model.name}" ?`)) {
      setModels(models.filter(m => m.id !== model.id));
    }
  };

  const openEdit = (model) => {
    setSelectedModel(model);
    setFormName(model.name);
    setFormProvider(model.provider);
    setFormDesc(model.description);
    setEditMode(true);
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormProvider('');
    setFormDesc('');
    setSelectedModel(null);
    setEditMode(false);
  };

  const handleSave = () => {
    if (!formName.trim() || !formProvider.trim()) return;
    if (editMode && selectedModel) {
      setModels(models.map(m =>
        m.id === selectedModel.id
          ? { ...m, name: formName, provider: formProvider, description: formDesc }
          : m
      ));
    } else {
      const newModel = {
        id: `model-${Date.now()}`,
        name: formName,
        provider: formProvider,
        description: formDesc,
        capabilities: [], // optionnel, à compléter si besoin
        pricing: 'freemium', // valeur par défaut
      };
      setModels([...models, newModel]);
    }
    setIsAddDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des modèles AI</h1>
          <p className="text-muted-foreground mt-1">Gérez les modèles d&apos;intelligence artificielle</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau modèle
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total modèles" value={models.length} icon={Cpu} variant="primary" />
        <StatCard
          title="Fournisseurs"
          value={providers.length}
          description="différents providers"
          icon={Cpu}
        />
        <StatCard
          title="Utilisations"
          value={totalToolsUsingModels}
          description="outils utilisent ces modèles"
          icon={Wrench}
        />
      </div>

      {/* Tableau des modèles */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des modèles</CardTitle>
          <CardDescription>
            {filteredModels.length} modèle{filteredModels.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un modèle ou provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Outils</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Cpu className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{model.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{model.provider}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
                        {model.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getToolsCount(model.id)} outils</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(model)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(model)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogue d'ajout / modification */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && (resetForm(), setIsAddDialogOpen(false))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Modifier le modèle' : 'Nouveau modèle AI'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Modifiez les informations du modèle' : 'Ajoutez un nouveau modèle d&apos;intelligence artificielle'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="modelName">Nom du modèle *</Label>
              <Input
                id="modelName"
                placeholder="Ex: GPT-4"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="modelProvider">Provider / Fournisseur *</Label>
              <Input
                id="modelProvider"
                placeholder="Ex: OpenAI"
                value={formProvider}
                onChange={(e) => setFormProvider(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="modelDesc">Description</Label>
              <Textarea
                id="modelDesc"
                placeholder="Description du modèle..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setIsAddDialogOpen(false); }}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editMode ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}