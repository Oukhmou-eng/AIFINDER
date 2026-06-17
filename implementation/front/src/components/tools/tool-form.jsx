import { useEffect, useMemo, useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { toast } from 'sonner';
import api from '../../services/api';

const PLATFORM_OPTIONS = ['Web', 'API', 'Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Extension Chrome'];
const PRICING_OPTIONS = [
  { value: 'free', label: 'Gratuit' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Payant' },
  { value: 'subscription', label: 'Abonnement' },
  { value: 'credits', label: 'Crédits' },
  { value: 'pay-as-you-go', label: 'Pay as you go' },
];

function readableName(value) {
  const letters = value.trim().replace(/[^\p{L}]/gu, '');
  if (letters.length < 8) return true;
  const vowels = (letters.match(/[aeiouyàâäéèêëîïôöùûü]/giu) || []).length;
  return vowels / letters.length >= 0.18 && !/(.)\1{4,}/u.test(value) && !/x{4,}$/i.test(value);
}

function validUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function ToolForm({ onSubmit, onCancel, isSubmitting = false, initialData = null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [provider, setProvider] = useState(initialData?.provider || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || initialData?.description || '');
  const [longDescription, setLongDescription] = useState(initialData?.longDescription || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
  const [releaseDate, setReleaseDate] = useState(initialData?.releaseDate || '');
  const [isOpenSource, setIsOpenSource] = useState(initialData?.isOpenSource || false);
  const [toolPricingType, setToolPricingType] = useState(initialData?.pricingType || 'freemium');

  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const [selectedPlatforms, setSelectedPlatforms] = useState(initialData?.platforms || []);
  const [customPlatform, setCustomPlatform] = useState('');

  const [selectedModels, setSelectedModels] = useState(initialData?.models || []);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [newModelName, setNewModelName] = useState('');
  const [newModelProvider, setNewModelProvider] = useState('');
  const [newModelType, setNewModelType] = useState('');
  const [newModelDescription, setNewModelDescription] = useState('');
  const [newModelLicense, setNewModelLicense] = useState('');
  const [newModelApiUrl, setNewModelApiUrl] = useState('');
  const [newModelOpenSource, setNewModelOpenSource] = useState(false);
  const [newModelMultimodal, setNewModelMultimodal] = useState(false);
  const [newModelHasApi, setNewModelHasApi] = useState(false);
  const [showNewModelForm, setShowNewModelForm] = useState(false);

  const [toolTags, setToolTags] = useState(initialData?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  const [toolFeatures, setToolFeatures] = useState(initialData?.features || []);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  const [toolPerformances, setToolPerformances] = useState(initialData?.performances || []);
  const [perfDomain, setPerfDomain] = useState('');
  const [perfScore, setPerfScore] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, modelData, tagData] = await Promise.all([
          api.get('categories'),
          api.get('models'),
          api.get('tags'),
        ]);
        setAvailableCategories(catData.categories || []);
        setAvailableModels(modelData.models || []);
        setAvailableTags(tagData.tags || []);
      } catch (err) {
        toast.error('Impossible de charger les catégories, modèles ou tags');
      }
    };
    fetchData();
  }, []);

  const errors = useMemo(() => {
    const items = [];
    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 80) items.push('Nom: entre 2 et 80 caractères.');
    if (!/^[\p{L}\p{N} .+&_-]+$/u.test(trimmedName)) items.push('Nom: caractères non autorisés.');
    if (!readableName(trimmedName)) items.push('Nom: semble aléatoire ou non lisible.');
    if (provider.trim().length < 2) items.push('Fournisseur requis.');
    if (shortDescription.trim().length < 20 || shortDescription.trim().length > 255) items.push('Description courte: entre 20 et 255 caractères.');
    if (longDescription.trim().length < 50) items.push('Description détaillée: au moins 50 caractères.');
    if (!validUrl(url)) items.push('Site officiel: URL http/https valide requise.');
    if (logoUrl.trim() && !validUrl(logoUrl)) items.push('Logo: URL valide requise.');
    if (!showNewCategory && !categoryId) items.push('Catégorie requise.');
    if (showNewCategory && newCategoryName.trim().length < 2) items.push('Nouvelle catégorie: nom requis.');
    if (selectedPlatforms.length === 0) items.push('Au moins une plateforme requise.');
    if (!toolPricingType) items.push('Type de tarification requis.');
    if (releaseDate && Number.isNaN(Date.parse(releaseDate))) items.push('Date de sortie invalide.');
    if (releaseDate && new Date(releaseDate) > new Date()) items.push('Date de sortie: ne doit pas être future.');
    selectedModels
      .filter(model => model.isNew)
      .forEach((model) => {
        if (!model.name || model.name.length < 2) items.push('Nouveau modèle: nom requis.');
        if (!model.provider || model.provider.length < 2) items.push(`Nouveau modèle ${model.name || ''}: fournisseur requis.`);
        if (!model.type || model.type.length < 2) items.push(`Nouveau modèle ${model.name || ''}: type requis.`);
        if (model.apiUrl && !validUrl(model.apiUrl)) items.push(`Nouveau modèle ${model.name || ''}: API URL invalide.`);
      });

    return items;
  }, [name, provider, shortDescription, longDescription, url, logoUrl, showNewCategory, categoryId, newCategoryName, selectedPlatforms, toolPricingType, releaseDate, selectedModels]);

  const handleTogglePlatform = (platform) => {
    setSelectedPlatforms(prev => prev.includes(platform) ? prev.filter(item => item !== platform) : [...prev, platform]);
  };

  const handleAddCustomPlatform = () => {
    const value = customPlatform.trim();
    if (!value) return;
    if (!selectedPlatforms.includes(value)) setSelectedPlatforms(prev => [...prev, value]);
    setCustomPlatform('');
  };

  const handleSelectTag = (tagName) => {
    if (!toolTags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
      setToolTags(prev => [...prev, { name: tagName }]);
    }
  };

  const handleCreateAndAddTag = () => {
    const value = newTagInput.trim();
    if (!value) return;

    // Rule: Refuse if the tag already exists in the available tags list
    const existsInAvailable = availableTags.some(tag => tag.name.toLowerCase() === value.toLowerCase());
    if (existsInAvailable) {
      toast.error(`Le tag "${value}" existe déjà dans la liste. Veuillez le sélectionner.`);
      return;
    }

    if (!toolTags.some(tag => tag.name.toLowerCase() === value.toLowerCase())) {
      setToolTags(prev => [...prev, { name: value }]);
    }
    setNewTagInput('');
  };

  const handleAddFeature = () => {
    const nameValue = newFeatureName.trim();
    if (!nameValue) return;
    setToolFeatures(prev => [...prev, { name: nameValue, description: newFeatureDesc.trim() }]);
    setNewFeatureName('');
    setNewFeatureDesc('');
  };

  const handleAddPerformance = () => {
    const domain = perfDomain.trim();
    const score = Number(perfScore);
    if (!domain || Number.isNaN(score)) return;
    setToolPerformances(prev => [...prev, { domain, score: Math.max(0, Math.min(100, score)) }]);
    setPerfDomain('');
    setPerfScore('');
  };

  const handleAddNewModel = () => {
    const modelName = newModelName.trim();
    const modelProvider = newModelProvider.trim() || provider.trim();
    const modelType = newModelType.trim();

    if (!modelName || !modelProvider || !modelType) {
      toast.error('Nom, fournisseur et type du nouveau modèle sont obligatoires');
      return;
    }
    if (newModelApiUrl.trim() && !validUrl(newModelApiUrl.trim())) {
      toast.error('URL API du modèle invalide');
      return;
    }
    if (selectedModels.some(model => model.name?.toLowerCase() === modelName.toLowerCase())) {
      toast.error('Ce modèle est déjà ajouté');
      return;
    }

    setSelectedModels(prev => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        modelId: null,
        isNew: true,
        name: modelName,
        provider: modelProvider,
        type: modelType,
        description: newModelDescription.trim(),
        license: newModelLicense.trim(),
        apiUrl: newModelApiUrl.trim(),
        openSource: newModelOpenSource,
        multimodal: newModelMultimodal,
        hasApi: newModelHasApi,
      },
    ]);

    setNewModelName('');
    setNewModelProvider('');
    setNewModelType('');
    setNewModelDescription('');
    setNewModelLicense('');
    setNewModelApiUrl('');
    setNewModelOpenSource(false);
    setNewModelMultimodal(false);
    setNewModelHasApi(false);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    onSubmit({
      name: name.trim(),
      provider: provider.trim(),
      shortDescription: shortDescription.trim(),
      longDescription: longDescription.trim(),
      url: url.trim(),
      logoUrl: logoUrl.trim(),
      releaseDate,
      isOpenSource,
      pricingType: toolPricingType,
      categoryId: showNewCategory ? 'new' : categoryId,
      newCategory: showNewCategory ? { name: newCategoryName.trim(), description: newCategoryDesc.trim() } : null,
      platforms: selectedPlatforms,
      models: selectedModels,
      tags: toolTags,
      features: toolFeatures,
      performances: toolPerformances,
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
          {errors[0]}
        </div>
      )}

      <Accordion type="multiple" defaultValue={['general', 'classification', 'pricing']}>
        <AccordionItem value="general" className="rounded-lg border px-4">
          <AccordionTrigger className="font-semibold">Informations de l&apos;outil</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l&apos;outil *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: ChatGPT" maxLength={80} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Fournisseur *</Label>
                <Input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Ex: OpenAI" maxLength={100} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Description courte *</Label>
              <Input id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={255} />
              <p className="text-xs text-muted-foreground">{shortDescription.length}/255</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Description détaillée *</Label>
              <Textarea id="longDescription" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={5} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="url">Site officiel *</Label>
                <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL du logo</Label>
                <Input id="logoUrl" type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.svg" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="classification" className="rounded-lg border px-4">
          <AccordionTrigger className="font-semibold">Classification</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select value={showNewCategory ? 'new' : categoryId} onValueChange={(value) => {
                setShowNewCategory(value === 'new');
                setCategoryId(value === 'new' ? '' : value);
              }}>
                <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                <SelectContent>
                  {availableCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  <SelectItem value="new">+ Nouvelle catégorie</SelectItem>
                </SelectContent>
              </Select>
              {showNewCategory && (
                <div className="mt-2 grid gap-2 rounded-lg bg-muted p-3">
                  <Input placeholder="Nom de la catégorie" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} maxLength={30} />
                  <Input placeholder="Description de la catégorie" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Plateformes *</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map(platform => (
                  <Badge
                    key={platform}
                    variant={selectedPlatforms.includes(platform) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTogglePlatform(platform)}
                  >
                    {platform}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Autre plateforme" value={customPlatform} onChange={(e) => setCustomPlatform(e.target.value)} />
                <Button type="button" variant="secondary" onClick={handleAddCustomPlatform}>Ajouter</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {toolTags.map((tag, index) => (
                  <Badge key={`${tag.name}-${index}`} variant="secondary" className="gap-1">
                    {tag.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setToolTags(toolTags.filter((_, idx) => idx !== index))} />
                  </Badge>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Sélectionner existant</span>
                  <Select onValueChange={handleSelectTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map(tag => (
                        <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Ou créer nouveau</span>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Nouveau tag..." 
                      value={newTagInput} 
                      onChange={(e) => setNewTagInput(e.target.value)} 
                    />
                    <Button type="button" variant="secondary" onClick={handleCreateAndAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pricing" className="rounded-lg border px-4">
          <AccordionTrigger className="font-semibold">Tarification et dates</AccordionTrigger>
          <AccordionContent className="grid gap-4 pt-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Type de tarification *</Label>
              <Select value={toolPricingType} onValueChange={setToolPricingType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRICING_OPTIONS.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Date de sortie</Label>
              <Input id="releaseDate" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label htmlFor="openSource">Open source</Label>
              <Switch id="openSource" checked={isOpenSource} onCheckedChange={setIsOpenSource} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="models" className="rounded-lg border px-4">
          <AccordionTrigger className="font-semibold">Modèles IA et capacités</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Modèles IA utilisés</Label>
              <Select onValueChange={(value) => {
                const model = availableModels.find(item => item.id === value);
                if (model && !selectedModels.some(item => item.id === value || item.modelId === value)) {
                  setSelectedModels([...selectedModels, { id: model.id, modelId: model.id, name: model.name, isNew: false }]);
                }
              }}>
                <SelectTrigger><SelectValue placeholder="Ajouter un modèle" /></SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {selectedModels.map(model => (
                  <Badge key={model.id || model.modelId || model.name} variant={model.isNew ? 'default' : 'secondary'} className="gap-1">
                    {model.name}{model.isNew ? ' (nouveau)' : ''}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedModels(selectedModels.filter(item => (item.id || item.modelId) !== (model.id || model.modelId)))} />
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="button" variant="secondary" onClick={() => setShowNewModelForm(prev => !prev)}>
              <Plus className="mr-2 h-4 w-4" />
              {showNewModelForm ? 'Masquer le formulaire' : 'Ajouter un modèle inexistant dans la base'}
            </Button>

            {showNewModelForm && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <div>
                  <Label>Ajouter un modèle inexistant dans la base</Label>
                  <p className="text-xs text-muted-foreground">Le modèle sera créé dans la table models puis lié à l&apos;outil proposé.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input placeholder="Nom du modèle *" value={newModelName} onChange={(e) => setNewModelName(e.target.value)} />
                  <Input placeholder="Fournisseur du modèle *" value={newModelProvider} onChange={(e) => setNewModelProvider(e.target.value)} />
                  <Input placeholder="Type * (LLM, image...)" value={newModelType} onChange={(e) => setNewModelType(e.target.value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Licence" value={newModelLicense} onChange={(e) => setNewModelLicense(e.target.value)} />
                  <Input placeholder="API URL" value={newModelApiUrl} onChange={(e) => setNewModelApiUrl(e.target.value)} />
                </div>
                <Textarea
                  placeholder="Description du modèle"
                  value={newModelDescription}
                  onChange={(e) => setNewModelDescription(e.target.value)}
                  rows={3}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                    <Label>Open source</Label>
                    <Switch checked={newModelOpenSource} onCheckedChange={setNewModelOpenSource} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                    <Label>Multimodal</Label>
                    <Switch checked={newModelMultimodal} onCheckedChange={setNewModelMultimodal} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                    <Label>Possède une API</Label>
                    <Switch checked={newModelHasApi} onCheckedChange={setNewModelHasApi} />
                  </div>
                </div>
                <Button type="button" variant="secondary" onClick={handleAddNewModel}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter ce modèle
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label>Fonctionnalités</Label>
              <div className="space-y-2">
                {toolFeatures.map((feature, index) => (
                  <div key={`${feature.name}-${index}`} className="flex items-center justify-between rounded-md bg-muted p-2">
                    <div>
                      <p className="text-sm font-medium">{feature.name}</p>
                      {feature.description && <p className="text-xs text-muted-foreground">{feature.description}</p>}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setToolFeatures(toolFeatures.filter((_, idx) => idx !== index))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input placeholder="Fonctionnalité" value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} />
                <Input placeholder="Description" value={newFeatureDesc} onChange={(e) => setNewFeatureDesc(e.target.value)} />
                <Button type="button" variant="secondary" onClick={handleAddFeature}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Performances</Label>
              <div className="flex flex-wrap gap-2">
                {toolPerformances.map((perf, index) => (
                  <Badge key={`${perf.domain}-${index}`} variant="outline" className="gap-1">
                    {perf.domain}: {perf.score}/100
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setToolPerformances(toolPerformances.filter((_, idx) => idx !== index))} />
                  </Badge>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                <Input placeholder="Domaine" value={perfDomain} onChange={(e) => setPerfDomain(e.target.value)} />
                <Input type="number" min="0" max="100" placeholder="Score" value={perfScore} onChange={(e) => setPerfScore(e.target.value)} />
                <Button type="button" variant="secondary" onClick={handleAddPerformance}>Ajouter</Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>}
        <Button type="submit" disabled={isSubmitting || errors.length > 0}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Modifier la proposition' : 'Soumettre pour validation'}
        </Button>
      </div>
    </form>
  );
}