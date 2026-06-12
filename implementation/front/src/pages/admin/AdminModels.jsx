import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Cpu, 
  Wrench, 
  Loader2, 
  ExternalLink,
  Shield,
  CheckCircle,
  XCircle,
  Globe,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminAPI } from '../../services/adminAPI';

function StatCard({ title, value, icon: Icon, description, variant = 'primary', loading = false }) {
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
        <div className={`rounded-full p-2 ${variantClasses[variant] || variantClasses.primary}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

function slugify(value) {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminModels() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modelsList, setModelsList] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: '',
    description: '',
    licence: '',
    api_url: '',
    est_open_source: false,
    multimodal: false,
    a_api: false,
    release_date: '',
    id_fourn: ''
  });

  const fetchModels = async () => {
    setLoading(true);
    try {
      const data = await AdminAPI.models();
      const models = data.models || [];
      setModelsList(models);
      
      const uniqueProviders = [];
      const providerIds = new Set();
      models.forEach(m => {
        if (m.provider && m.id_fourn && !providerIds.has(m.id_fourn)) {
          uniqueProviders.push({ id: String(m.id_fourn), name: m.provider });
          providerIds.add(m.id_fourn);
        }
      });
      setProviders(uniqueProviders);
    } catch (err) {
      toast.error(err.message || 'Erreur lors du chargement des modèles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const filteredModels = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (modelsList || []).filter(
      (model) =>
        (model.name || '').toLowerCase().includes(query) ||
        (model.provider || '').toLowerCase().includes(query) ||
        (model.type || '').toLowerCase().includes(query)
    );
  }, [modelsList, searchQuery]);

  const stats = useMemo(() => {
    const totalModels = modelsList.length;
    const openSourceCount = modelsList.filter(m => m.openSource).length;
    const uniqueProviderCount = new Set(modelsList.map(m => m.provider)).size;
    return { totalModels, openSourceCount, uniqueProviderCount };
  }, [modelsList]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: '',
      description: '',
      licence: '',
      api_url: '',
      est_open_source: false,
      multimodal: false,
      a_api: false,
      release_date: '',
      id_fourn: providers[0]?.id || ''
    });
    setSelectedModel(null);
    setEditMode(false);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (model) => {
    setSelectedModel(model);
    setFormData({
      name: model.name || '',
      slug: model.slug || '',
      type: model.type || '',
      description: model.description || '',
      licence: model.license || '',
      api_url: model.apiUrl || '',
      est_open_source: !!model.openSource,
      multimodal: !!model.multimodal,
      a_api: !!model.hasApi,
      release_date: model.releaseDate || '',
      id_fourn: model.id_fourn ? String(model.id_fourn) : ''
    });
    setEditMode(true);
    setIsDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [id]: value };
      if (id === 'name' && (!editMode || !prev.slug)) {
        newData.slug = slugify(value);
      }
      return newData;
    });
  };

  const handleSwitchChange = (id, checked) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom du modèle est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData };
      let result;
      
      if (editMode && selectedModel) {
        result = await AdminAPI.updateModel({ ...payload, id: selectedModel.id });
      } else {
        result = await AdminAPI.createModel(payload);
      }

      const savedModel = result.model;
      setModelsList(current => {
        if (editMode) {
          return current.map(m => m.id === savedModel.id ? savedModel : m);
        }
        return [...current, savedModel].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      });

      toast.success(editMode ? 'Modèle mis à jour' : 'Modèle créé');
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (model) => {
    if (!window.confirm(`Supprimer le modèle "${model.name}" ?`)) return;

    try {
      await AdminAPI.deleteModel(model.id);
      setModelsList(current => current.filter(m => m.id !== model.id));
      toast.success('Modèle supprimé avec succès');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des modèles AI</h1>
          <p className="text-muted-foreground mt-1 text-lg">Gérez la base de données des modèles d&apos;intelligence artificielle</p>
        </div>
        <Button onClick={openCreate} size="lg" className="shadow-sm">
          <Plus className="mr-2 h-5 w-5" />
          Nouveau modèle
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total modèles" 
          value={stats.totalModels} 
          icon={Cpu} 
          variant="primary" 
          loading={loading} 
        />
        <StatCard
          title="Fournisseurs"
          value={stats.uniqueProviderCount}
          description="providers représentés"
          icon={Globe}
          loading={loading}
        />
        <StatCard
          title="Open Source"
          value={stats.openSourceCount}
          description="modèles libres"
          icon={Zap}
          variant="success"
          loading={loading}
        />
      </div>

      {/* Tableau des modèles */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Liste des modèles</CardTitle>
          <CardDescription>
            {loading ? 'Chargement...' : `${filteredModels.length} modèle${filteredModels.length > 1 ? 's' : ''} trouvé${filteredModels.length > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, provider ou type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground font-medium">Chargement des modèles...</p>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-20 bg-muted/10">
                <Cpu className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-lg">Aucun modèle trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead>Modèle</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Capabilities</TableHead>
                    <TableHead className="w-20 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((model) => (
                    <TableRow key={model.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Cpu className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{model.name}</p>
                            <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                              /{model.slug}
                            </code>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">{model.provider}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground capitalize">{model.type || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1.5">
                          {model.openSource && <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-success/20 text-success border-success/30">OS</Badge>}
                          {model.multimodal && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">Multi</Badge>}
                          {model.hasApi && <Badge variant="default" className="h-5 px-1.5 text-[10px]">API</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(model)} className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(model)}
                              className="text-destructive cursor-pointer focus:bg-destructive/10"
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogue d'ajout / modification */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open && !saving) {
          resetForm();
          setIsDialogOpen(false);
        } else if (open) {
          setIsDialogOpen(true);
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editMode ? 'Modifier le modèle' : 'Nouveau modèle AI'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Mettez à jour les caractéristiques techniques du modèle' : 'Ajoutez un nouveau modèle à la base de données'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Section Gauche : Infos de base */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-bold">Nom du modèle *</Label>
                <Input
                  id="name"
                  placeholder="Ex: GPT-4o"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug" className="text-sm font-bold">Slug (identifiant URL)</Label>
                <Input
                  id="slug"
                  placeholder="Ex: gpt-4o"
                  value={formData.slug}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="id_fourn" className="text-sm font-bold">Fournisseur / Provider</Label>
                <Select 
                  value={formData.id_fourn} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, id_fourn: val }))}
                >
                  <SelectTrigger id="id_fourn">
                    <SelectValue placeholder="Choisir un provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type" className="text-sm font-bold">Type de modèle</Label>
                <Input
                  id="type"
                  placeholder="Ex: LLM, Vision, Audio..."
                  value={formData.type}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="release_date" className="text-sm font-bold">Date de sortie</Label>
                <Input
                  id="release_date"
                  type="date"
                  value={formData.release_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Section Droite : Caractéristiques techniques */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="licence" className="text-sm font-bold">Licence</Label>
                <Input
                  id="licence"
                  placeholder="Ex: Propriétaire, Apache 2.0..."
                  value={formData.licence}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="api_url" className="text-sm font-bold">URL de l&apos;API / Documentation</Label>
                <Input
                  id="api_url"
                  placeholder="https://platform.openai.com/..."
                  value={formData.api_url}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Open Source</Label>
                    <p className="text-xs text-muted-foreground">Le modèle est-il libre d&apos;accès ?</p>
                  </div>
                  <Switch 
                    checked={formData.est_open_source} 
                    onCheckedChange={(checked) => handleSwitchChange('est_open_source', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Multimodal</Label>
                    <p className="text-xs text-muted-foreground">Gère plusieurs types de données ?</p>
                  </div>
                  <Switch 
                    checked={formData.multimodal} 
                    onCheckedChange={(checked) => handleSwitchChange('multimodal', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">API disponible</Label>
                    <p className="text-xs text-muted-foreground">Propose une interface de programmation ?</p>
                  </div>
                  <Switch 
                    checked={formData.a_api} 
                    onCheckedChange={(checked) => handleSwitchChange('a_api', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Description sur toute la largeur */}
            <div className="md:col-span-2 grid gap-2">
              <Label htmlFor="description" className="text-sm font-bold">Description complète</Label>
              <Textarea
                id="description"
                placeholder="Détails techniques, points forts du modèle..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} className="min-w-[100px]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                editMode ? 'Enregistrer les modifications' : 'Créer le modèle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}