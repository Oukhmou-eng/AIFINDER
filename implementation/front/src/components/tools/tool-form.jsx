import { useState, useEffect } from 'react';
import {
  X, Info, Link as LinkIcon, DollarSign, Tag, Cpu,
  Building, Code, Star, Box, Trash2, Plus
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';
import api from '../../services/api';

export function ToolForm({ onSubmit, onCancel, isSubmitting = false, initialData = null }) {
  // ---------- États du formulaire ----------
  const [name, setName] = useState(initialData?.name || '');
  const [provider, setProvider] = useState(initialData?.provider || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
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

  const [toolTags, setToolTags] = useState(initialData?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');

  const [selectedPlatforms, setSelectedPlatforms] = useState(initialData?.platforms || []);
  const [customPlatform, setCustomPlatform] = useState('');
  const [showCustomPlatformInput, setShowCustomPlatformInput] = useState(false);

  const [toolFeatures, setToolFeatures] = useState(initialData?.features || []);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  const [toolPerformances, setToolPerformances] = useState(initialData?.performances || []);
  const [perfDomain, setPerfDomain] = useState('');
  const [perfScore, setPerfScore] = useState(0);

  const [selectedModels, setSelectedModels] = useState(initialData?.models || []);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);

  // ---------- Chargement des données au montage ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, modelData] = await Promise.all([
          api.get('categories'),
          api.get('models')
        ]);
        setAvailableCategories(catData.categories || []);
        setAvailableModels(modelData.models || []);
      } catch (err) {
        console.error("Erreur chargement données formulaire:", err);
      }
    };
    fetchData();
  }, []);

  // ---------- Handlers ----------
  const handleAddFeature = () => {
    if (newFeatureName.trim()) {
      setToolFeatures([...toolFeatures, { name: newFeatureName, description: newFeatureDesc }]);
      setNewFeatureName(''); setNewFeatureDesc('');
    }
  };

  const handleAddPerformance = () => {
    if (perfDomain.trim()) {
      setToolPerformances([...toolPerformances, { domain: perfDomain, score: perfScore }]);
      setPerfDomain(''); setPerfScore(0);
    }
  };

  const handleTogglePlatform = (p) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !shortDescription.trim() || !url.trim()) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    const formData = {
      name, provider, shortDescription, longDescription, url, logoUrl,
      releaseDate, isOpenSource, pricingType: toolPricingType,
      categoryId: showNewCategory ? 'new' : categoryId,
      newCategory: showNewCategory ? { name: newCategoryName, description: newCategoryDesc } : null,
      tags: toolTags,
      platforms: selectedPlatforms,
      features: toolFeatures,
      performances: toolPerformances,
      models: selectedModels
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <Accordion type="multiple" defaultValue={["general", "category"]}>
        {/* Informations générales */}
        <AccordionItem value="general" className="border rounded-lg p-2 px-4">
          <AccordionTrigger className="font-semibold">Informations générales</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l&apos;outil *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: ChatGPT" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Fournisseur</Label>
                <Input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Ex: OpenAI" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDesc">Description courte *</Label>
              <Input id="shortDesc" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longDesc">Description détaillée</Label>
              <Textarea id="longDesc" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={4} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="url">Site officiel *</Label>
                <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">URL du logo</Label>
                <Input id="logo" type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Catégorie & Plateformes */}
        <AccordionItem value="category" className="border rounded-lg p-2 px-4">
          <AccordionTrigger className="font-semibold">Catégorie & Plateformes</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select value={categoryId} onValueChange={(val) => {
                if (val === 'new') setShowNewCategory(true);
                else { setShowNewCategory(false); setCategoryId(val); }
              }}>
                <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                <SelectContent>
                  {availableCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  <SelectItem value="new">+ Nouvelle catégorie</SelectItem>
                </SelectContent>
              </Select>
              {showNewCategory && (
                <div className="mt-2 space-y-2 p-3 bg-muted rounded-lg">
                  <Input placeholder="Nom de la catégorie" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                  <Input placeholder="Description" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Plateformes</Label>
              <div className="flex flex-wrap gap-2">
                {['Web', 'Mobile', 'Desktop', 'API', 'Browser Extension'].map(p => (
                  <Badge 
                    key={p} 
                    variant={selectedPlatforms.includes(p) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTogglePlatform(p)}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Fonctionnalités & Modèles */}
        <AccordionItem value="features" className="border rounded-lg p-2 px-4">
          <AccordionTrigger className="font-semibold">Fonctionnalités & Modèles AI</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <Label>Fonctionnalités propres</Label>
              {toolFeatures.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm font-medium">{f.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setToolFeatures(toolFeatures.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Nom fonctionnalité" value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} />
                <Button type="button" variant="secondary" onClick={handleAddFeature}>Ajouter</Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Modèles AI utilisés</Label>
              <Select onValueChange={(val) => {
                const model = availableModels.find(m => m.id === val);
                if (model && !selectedModels.some(sm => sm.id === val)) {
                  setSelectedModels([...selectedModels, model]);
                }
              }}>
                <SelectTrigger><SelectValue placeholder="Ajouter un modèle" /></SelectTrigger>
                <SelectContent>
                  {availableModels.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {selectedModels.map(m => (
                  <Badge key={m.id} variant="secondary" className="gap-1">
                    {m.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedModels(selectedModels.filter(sm => sm.id !== m.id))} />
                  </Badge>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Traitement..." : (initialData ? "Modifier" : "Ajouter l'outil")}
        </Button>
      </div>
    </form>
  );
}
