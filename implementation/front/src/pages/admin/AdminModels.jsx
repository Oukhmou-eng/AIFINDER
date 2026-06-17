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
  Loader2,
  Globe,
  Zap,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminAPI } from '../../services/adminAPI';

// Composant StatCard (inchangé)
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

// Modèle vide
const emptyModel = {
  name: '',
  providerSelected: '',
  provider: '',
  type: '',
  description: '',
  releaseDate: '',
  isOpenSource: false,
  hasApi: false,
  apiUrl: '',
  capabilities: [],
  performances: [],
  tags: [],
  pricingPlans: [],
  accessInTool: 'free',
};

// Plan API vide
const emptyApiPlan = {
  name: '',
  accessType: 'pay-as-you-go',
  inputTokenPrice: 0,
  outputTokenPrice: 0,
  currency: '€',
  quota: 0,
  quotaPeriod: 'month',
  limits: [],
  capabilities: '',
  overageRules: '',
};

const emptyPerf = { domain: '', score: '' };

export default function AdminModels() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modelsList, setModelsList] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNewModelDialog, setShowNewModelDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentNewModel, setCurrentNewModel] = useState(emptyModel);

  // États pour les listes dynamiques
  const [newCapabilityInput, setNewCapabilityInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [newPerfDomain, setNewPerfDomain] = useState('');
  const [newPerfScore, setNewPerfScore] = useState('');
  const [newPerfDesc, setNewPerfDesc] = useState('');
  const [newApiPlan, setNewApiPlan] = useState(emptyApiPlan);
  // États pour les limites du plan en cours d'ajout
  const [currentLimitType, setCurrentLimitType] = useState('requests');
  const [currentLimitValue, setCurrentLimitValue] = useState('');
  const [currentLimitPeriod, setCurrentLimitPeriod] = useState('month');

  // Chargement des données
  const fetchModels = async () => {
    setLoading(true);
    try {
      const [modelsData, providersData] = await Promise.all([
        AdminAPI.models(),
        AdminAPI.providers(),
      ]);
      setModelsList(modelsData.models || []);
      setProviders(providersData.providers || []);
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

  // Ouvrir dialogue création
  const openNewModelDialog = () => {
    setCurrentNewModel(emptyModel);
    setNewCapabilityInput('');
    setNewTagInput('');
    setNewPerfDomain('');
    setNewPerfScore('');
    setNewPerfDesc('');
    setNewApiPlan(emptyApiPlan);
    setEditMode(false);
    setSelectedModel(null);
    setShowNewModelDialog(true);
  };

  // Ouvrir dialogue édition (pré‑remplir)
  const openEdit = (model) => {
    const providerObj = providers.find(p => p.name === model.provider);
    // Convert benchmarks (object) → array [{domain, score, description}]
    const perfs = model.benchmarks
      ? Object.entries(model.benchmarks).map(([domain, score]) => ({
          domain,
          score: String(score),
          description: '',
        }))
      : [];
    setCurrentNewModel({
      name: model.name || '',
      providerSelected: providerObj ? providerObj.name : '',
      provider: model.provider || '',
      type: model.type || '',
      description: model.description || '',
      releaseDate: model.releaseDate || '',
      isOpenSource: !!model.openSource,
      hasApi: !!model.hasApi,
      apiUrl: model.apiUrl || '',
      capabilities: model.capabilities || [],
      performances: perfs,
      tags: model.tags || [],
      pricingPlans: (model.pricingPlans || []).map(p => ({
        name: p.name || '',
        accessType: p.accessType || 'pay-as-you-go',
        inputTokenPrice: p.inputPrice || 0,
        outputTokenPrice: p.outputPrice || 0,
        currency: p.currency || '€',
        quota: p.quota || 0,
        quotaPeriod: p.quotaPeriod || 'month',
        limits: p.limits || [],
        capabilities: p.capabilities || '',
        overageRules: p.overageRules || '',
      })),
      accessInTool: model.openSource ? 'free' : 'paid',
    });
    setNewCapabilityInput('');
    setNewTagInput('');
    setNewPerfDomain('');
    setNewPerfScore('');
    setNewPerfDesc('');
    setNewApiPlan(emptyApiPlan);
    setEditMode(true);
    setSelectedModel(model);
    setShowNewModelDialog(true);
  };

  // --- Gestion des fonctionnalités (capabilities) ---
  const addCapability = () => {
    if (!newCapabilityInput.trim()) return;
    setCurrentNewModel(prev => ({
      ...prev,
      capabilities: [...prev.capabilities, newCapabilityInput.trim()],
    }));
    setNewCapabilityInput('');
  };
  const removeCapability = (idx) => {
    setCurrentNewModel(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter((_, i) => i !== idx),
    }));
  };

  // --- Gestion des performances (benchmarks) ---
  const addPerformance = () => {
    if (!newPerfDomain.trim() || !newPerfScore) return;
    setCurrentNewModel(prev => ({
      ...prev,
      performances: [...prev.performances, {
        domain: newPerfDomain.trim(),
        score: parseInt(newPerfScore),
        description: newPerfDesc.trim(),
      }],
    }));
    setNewPerfDomain('');
    setNewPerfScore('');
    setNewPerfDesc('');
  };
  const removePerformance = (idx) => {
    setCurrentNewModel(prev => ({
      ...prev,
      performances: prev.performances.filter((_, i) => i !== idx),
    }));
  };

  // --- Gestion des tags ---
  const addTag = () => {
    if (!newTagInput.trim()) return;
    setCurrentNewModel(prev => ({
      ...prev,
      tags: [...prev.tags, newTagInput.trim()],
    }));
    setNewTagInput('');
  };
  const removeTag = (idx) => {
    setCurrentNewModel(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== idx),
    }));
  };

  // --- Gestion des plans tarifaires API ---
  const addNewModelPricingPlan = () => {
    if (!newApiPlan.name.trim()) return;
    setCurrentNewModel(prev => ({
      ...prev,
      pricingPlans: [...prev.pricingPlans, { ...newApiPlan }],
    }));
    setNewApiPlan(emptyApiPlan);
    setCurrentLimitValue('');
  };
  const removeModelPricingPlan = (idx) => {
    setCurrentNewModel(prev => ({
      ...prev,
      pricingPlans: prev.pricingPlans.filter((_, i) => i !== idx),
    }));
  };
  // Gestion des limites dans le plan en cours d'édition (newApiPlan)
  const addLimitToApiPlan = () => {
    if (!currentLimitValue) return;
    setNewApiPlan(prev => ({
      ...prev,
      limits: [...prev.limits, {
        type: currentLimitType,
        value: currentLimitValue,
        period: currentLimitPeriod,
      }],
    }));
    setCurrentLimitValue('');
  };
  const removeLimitFromApiPlan = (idx) => {
    setNewApiPlan(prev => ({
      ...prev,
      limits: prev.limits.filter((_, i) => i !== idx),
    }));
  };

  // --- Sauvegarde (création / mise à jour) ---
  const saveNewModel = async () => {
    if (!currentNewModel.name.trim()) {
      toast.error('Le nom du modèle est obligatoire');
      return;
    }
    if (!currentNewModel.provider.trim()) {
      toast.error('Le fournisseur est obligatoire');
      return;
    }

    const isNewProvider = currentNewModel.providerSelected === 'new';
    const providerObj = !isNewProvider
      ? providers.find(p => p.name === currentNewModel.provider)
      : null;

    // Construction du payload attendu par AdminAPI
    const payload = {
      name: currentNewModel.name.trim(),
      id_fourn: providerObj ? providerObj.id : 'new',
      ...(isNewProvider ? { provider_name: currentNewModel.provider.trim() } : {}),
      type: currentNewModel.type,
      description: currentNewModel.description,
      release_date: currentNewModel.releaseDate,
      est_open_source: currentNewModel.isOpenSource,
      a_api: currentNewModel.hasApi,
      api_url: currentNewModel.apiUrl,
      capabilities: currentNewModel.capabilities,
      performances: currentNewModel.performances.map(p => ({
        domain: p.domain,
        score: Number(p.score),
        description: p.description,
      })),
      tags: currentNewModel.tags,
      pricingPlans: currentNewModel.pricingPlans.map(plan => ({
        name: plan.name,
        accessType: plan.accessType,
        inputTokenPrice: plan.inputTokenPrice,
        outputTokenPrice: plan.outputTokenPrice,
        currency: plan.currency,
        quota: plan.quota,
        quotaPeriod: plan.quotaPeriod,
        limits: plan.limits,
        capabilities: plan.capabilities,
        overageRules: plan.overageRules,
      })),
      access_in_tool: currentNewModel.accessInTool,
    };

    setSaving(true);
    try {
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

      if (isNewProvider) {
        const providersData = await AdminAPI.providers();
        setProviders(providersData.providers || []);
      }

      toast.success(editMode ? 'Modèle mis à jour' : 'Modèle créé avec succès');
      setShowNewModelDialog(false);
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // --- Suppression ---
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
          <p className="text-muted-foreground mt-1 text-lg">
            Gérez la base de données des modèles d&apos;intelligence artificielle
          </p>
        </div>
        <Button onClick={openNewModelDialog} size="lg" className="shadow-sm">
          <Plus className="mr-2 h-5 w-5" />
          Nouveau modèle
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total modèles" value={stats.totalModels} icon={Cpu} variant="primary" loading={loading} />
        <StatCard title="Fournisseurs" value={stats.uniqueProviderCount} description="providers représentés" icon={Globe} loading={loading} />
        <StatCard title="Open Source" value={stats.openSourceCount} description="modèles libres" icon={Zap} variant="success" loading={loading} />
      </div>

      {/* Tableau des modèles (inchangé) */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Liste des modèles</CardTitle>
          <CardDescription>
            {loading
              ? 'Chargement...'
              : `${filteredModels.length} modèle${filteredModels.length > 1 ? 's' : ''} trouvé${filteredModels.length > 1 ? 's' : ''}`}
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
                    <TableHead className="text-center">Badges</TableHead>
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
                          {model.openSource && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-success/20 text-success border-success/30">
                              OS
                            </Badge>
                          )}
                          {model.hasApi && (
                            <Badge variant="default" className="h-5 px-1.5 text-[10px]">API</Badge>
                          )}
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

      {/* ========== DIALOGUE DE CRÉATION / MODIFICATION ========== */}
      <Dialog open={showNewModelDialog} onOpenChange={(open) => { if (!saving) setShowNewModelDialog(open); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Modifier le modèle' : 'Nouveau modèle AI'}</DialogTitle>
            <DialogDescription>Renseignez toutes les caractéristiques du modèle</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nom et fournisseur */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newModelName">Nom du modèle *</Label>
                <Input
                  id="newModelName"
                  value={currentNewModel.name}
                  onChange={(e) => setCurrentNewModel(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: GPT-4"
                />
              </div>
              <div className="space-y-2">
                <Label>Fournisseur *</Label>
                <Select
                  value={currentNewModel.providerSelected || ''}
                  onValueChange={(val) => {
                    if (val === 'new') {
                      setCurrentNewModel(prev => ({ ...prev, providerSelected: 'new', provider: '' }));
                    } else {
                      setCurrentNewModel(prev => ({ ...prev, providerSelected: val, provider: val }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                    <SelectItem value="new">+ Ajouter un fournisseur</SelectItem>
                  </SelectContent>
                </Select>
                {currentNewModel.providerSelected === 'new' && (
                  <Input
                    placeholder="Nom du nouveau fournisseur"
                    className="mt-2"
                    value={currentNewModel.provider || ''}
                    onChange={(e) => setCurrentNewModel(prev => ({ ...prev, provider: e.target.value }))}
                  />
                )}
              </div>
            </div>

            {/* Type */}
            <div className="grid gap-4 sm:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="newModelType">Type de modèle</Label>
                <Input
                  id="newModelType"
                  value={currentNewModel.type}
                  onChange={(e) => setCurrentNewModel(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="Ex: LLM, Vision, Audio..."
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="newModelDesc">Description</Label>
              <Textarea
                id="newModelDesc"
                rows={3}
                value={currentNewModel.description}
                onChange={(e) => setCurrentNewModel(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du modèle..."
              />
            </div>

            {/* Date de sortie et attributs booléens */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newModelRelease">Date de sortie</Label>
                <Input
                  id="newModelRelease"
                  type="date"
                  value={currentNewModel.releaseDate}
                  onChange={(e) => setCurrentNewModel(prev => ({ ...prev, releaseDate: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="newModelOpenSource">Open Source</Label>
                  <Switch
                    id="newModelOpenSource"
                    checked={currentNewModel.isOpenSource}
                    onCheckedChange={(v) => setCurrentNewModel(prev => ({ ...prev, isOpenSource: v }))}
                  />
                </div>
              </div>
            </div>

            {/* API */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Possède une API</Label>
                <Switch
                  checked={currentNewModel.hasApi}
                  onCheckedChange={(v) => setCurrentNewModel(prev => ({ ...prev, hasApi: v, apiUrl: v ? prev.apiUrl : '' }))}
                />
              </div>
              {currentNewModel.hasApi && (
                <Input
                  placeholder="URL de l'API (optionnel)"
                  value={currentNewModel.apiUrl || ''}
                  onChange={(e) => setCurrentNewModel(prev => ({ ...prev, apiUrl: e.target.value }))}
                />
              )}
            </div>

            {/* Plans tarifaires API (affiché uniquement si le modèle a une API) */}
            {currentNewModel.hasApi && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold">Plans tarifaires API</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => setNewApiPlan(emptyApiPlan)}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter un plan
                  </Button>
                </div>

                {/* Liste des plans déjà ajoutés */}
                {currentNewModel.pricingPlans.length > 0 && (
                  <div className="space-y-3">
                    {currentNewModel.pricingPlans.map((plan, idx) => (
                      <div key={plan.id || idx} className="border rounded-lg p-4 space-y-2 bg-muted/20 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg">{plan.name}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {plan.accessType === 'pay-as-you-go' ? 'Pay as you go' : 'Abonnement'}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeModelPricingPlan(idx)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>💰 Input : {plan.inputTokenPrice} {plan.currency} / token</div>
                          <div>💰 Output : {plan.outputTokenPrice} {plan.currency} / token</div>
                          {plan.quota > 0 && (
                            <div>📊 Quota : {plan.quota} / {plan.quotaPeriod}</div>
                          )}
                        </div>
                        {plan.limits?.length > 0 && (
                          <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                            <span className="font-medium">Limites :</span> {plan.limits.map(l => `${l.value} ${l.type} / ${l.period}`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulaire d'ajout d'un nouveau plan */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <Label>Nom du plan *</Label>
                    <Input
                      placeholder="Ex: Premium API"
                      value={newApiPlan.name}
                      onChange={(e) => setNewApiPlan(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type d'accès</Label>
                      <Select
                        value={newApiPlan.accessType}
                        onValueChange={(val) => setNewApiPlan(prev => ({ ...prev, accessType: val }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pay-as-you-go">Pay as you go</SelectItem>
                          <SelectItem value="subscription">Abonnement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Devise</Label>
                      <Input
                        placeholder="€, $, GBP..."
                        value={newApiPlan.currency}
                        onChange={(e) => setNewApiPlan(prev => ({ ...prev, currency: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prix input (par token)</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="0.000001"
                        value={newApiPlan.inputTokenPrice}
                        onChange={(e) => setNewApiPlan(prev => ({ ...prev, inputTokenPrice: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label>Prix output (par token)</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="0.000002"
                        value={newApiPlan.outputTokenPrice}
                        onChange={(e) => setNewApiPlan(prev => ({ ...prev, outputTokenPrice: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Quota inclus</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newApiPlan.quota}
                        onChange={(e) => setNewApiPlan(prev => ({ ...prev, quota: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="w-32">
                      <Label>Période du quota</Label>
                      <Select
                        value={newApiPlan.quotaPeriod}
                        onValueChange={(val) => setNewApiPlan(prev => ({ ...prev, quotaPeriod: val }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">/ jour</SelectItem>
                          <SelectItem value="week">/ semaine</SelectItem>
                          <SelectItem value="month">/ mois</SelectItem>
                          <SelectItem value="year">/ an</SelectItem>
                          <SelectItem value="none">aucune</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Limites détaillées du plan */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Limites d'utilisation</Label>
                    {newApiPlan.limits.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {newApiPlan.limits.map((limit, lIdx) => (
                          <div key={lIdx} className="flex flex-wrap items-center gap-2 bg-background p-2 rounded-md border">
                            <Input
                              type="number"
                              placeholder="Valeur"
                              value={limit.value}
                              onChange={(e) => {
                                const newLimits = [...newApiPlan.limits];
                                newLimits[lIdx].value = e.target.value;
                                setNewApiPlan(prev => ({ ...prev, limits: newLimits }));
                              }}
                              className="w-24"
                            />
                            <Select
                              value={limit.type}
                              onValueChange={(val) => {
                                const newLimits = [...newApiPlan.limits];
                                newLimits[lIdx].type = val;
                                setNewApiPlan(prev => ({ ...prev, limits: newLimits }));
                              }}
                            >
                              <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="messages">Messages</SelectItem>
                                <SelectItem value="tokens">Tokens</SelectItem>
                                <SelectItem value="requests">Requêtes</SelectItem>
                                <SelectItem value="images">Images</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={limit.period}
                              onValueChange={(val) => {
                                const newLimits = [...newApiPlan.limits];
                                newLimits[lIdx].period = val;
                                setNewApiPlan(prev => ({ ...prev, limits: newLimits }));
                              }}
                            >
                              <SelectTrigger className="w-28"><SelectValue placeholder="Période" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hour">/ heure</SelectItem>
                                <SelectItem value="day">/ jour</SelectItem>
                                <SelectItem value="week">/ semaine</SelectItem>
                                <SelectItem value="month">/ mois</SelectItem>
                                <SelectItem value="year">/ an</SelectItem>
                                <SelectItem value="total">total</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLimitFromApiPlan(lIdx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Valeur"
                        value={currentLimitValue}
                        onChange={(e) => setCurrentLimitValue(e.target.value)}
                        className="w-24"
                      />
                      <Select value={currentLimitType} onValueChange={setCurrentLimitType}>
                        <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="messages">Messages</SelectItem>
                          <SelectItem value="tokens">Tokens</SelectItem>
                          <SelectItem value="requests">Requêtes</SelectItem>
                          <SelectItem value="images">Images</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={currentLimitPeriod} onValueChange={setCurrentLimitPeriod}>
                        <SelectTrigger className="w-28"><SelectValue placeholder="Période" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hour">/ heure</SelectItem>
                          <SelectItem value="day">/ jour</SelectItem>
                          <SelectItem value="week">/ semaine</SelectItem>
                          <SelectItem value="month">/ mois</SelectItem>
                          <SelectItem value="year">/ an</SelectItem>
                          <SelectItem value="total">total</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" onClick={addLimitToApiPlan}>
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  <Button type="button" variant="default" onClick={addNewModelPricingPlan} className="w-full">
                    Ajouter ce plan
                  </Button>
                </div>
              </div>
            )}

            {/* Fonctionnalités (capacités) */}
            <div className="space-y-2">
              <Label>Fonctionnalités (capacités)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentNewModel.capabilities.map((cap, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                    {cap}
                    <button
                      type="button"
                      onClick={() => removeCapability(idx)}
                      className="ml-1 rounded hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Nouvelle fonctionnalité (ex: Vision, Texte)"
                  value={newCapabilityInput}
                  onChange={(e) => setNewCapabilityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCapability()}
                />
                <Button type="button" variant="outline" onClick={addCapability}>Ajouter</Button>
              </div>
            </div>

            {/* Performances (benchmarks) */}
            <div className="space-y-2">
              <Label>Performances (benchmarks)</Label>
              {currentNewModel.performances.length > 0 && (
                <div className="space-y-2">
                  {currentNewModel.performances.map((perf, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b pb-1 text-sm">
                      <div>
                        <span className="font-medium">{perf.domain}</span> — {perf.score}/100
                        {perf.description && <span className="text-xs text-muted-foreground ml-2">({perf.description})</span>}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 h-7"
                        onClick={() => removePerformance(idx)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  placeholder="Domaine (ex: MMLU)"
                  value={newPerfDomain}
                  onChange={(e) => setNewPerfDomain(e.target.value)}
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Score (0-100)"
                  value={newPerfScore}
                  onChange={(e) => setNewPerfScore(e.target.value)}
                />
                <Input
                  placeholder="Description (optionnel)"
                  value={newPerfDesc}
                  onChange={(e) => setNewPerfDesc(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" onClick={addPerformance} className="w-full sm:w-auto">
                Ajouter une performance
              </Button>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentNewModel.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(idx)}
                      className="ml-1 rounded hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Nouveau tag"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" variant="outline" onClick={addTag}>Ajouter</Button>
              </div>
            </div>

            {/* Accès dans cet outil */}
            <div className="flex items-center gap-3 border-t pt-4">
              <Label className="text-sm font-semibold whitespace-nowrap">Accès dans cet outil :</Label>
              <Select
                value={currentNewModel.accessInTool}
                onValueChange={(val) => setCurrentNewModel(prev => ({ ...prev, accessInTool: val }))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuit</SelectItem>
                  <SelectItem value="paid">Payant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewModelDialog(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={saveNewModel} disabled={saving}>
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</>
              ) : (
                editMode ? 'Enregistrer les modifications' : 'Enregistrer le modèle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}