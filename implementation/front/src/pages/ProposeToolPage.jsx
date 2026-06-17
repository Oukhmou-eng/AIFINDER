import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, X, Info, Link as LinkIcon, DollarSign, Globe, Tag, Cpu,
  Calendar, Building, Code, Star, Zap, Award, FileText, GitFork, Box, Layers, Trash2,
  ShieldCheck, Target, Users, BookOpen, MessageCircle, ListChecks, FileSearch, HelpCircle,
  Sparkles, CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/auth-context';
import { toast } from 'sonner';
import { Footer } from '../components/layout/footer';
import { Header } from '../components/layout/header';
import Sidebar from '../components/layout/sidebar';
import CatalogAPI from '../services/catalogAPI';
import AdminAPI from '../services/adminAPI';

export default function ProposeToolPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------- Données chargées depuis l'API ----------
  const [categories, setCategories] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [existingProviders, setExistingProviders] = useState([]);

  const [adminStats, setAdminStats] = useState({ totalTools: 0, pendingTools: 0, approvedTools: 0 });
  const [adminPublishDirect, setAdminPublishDirect] = useState(false); // optionnel

  const defaultPlatforms = ['Web', 'Mobile', 'API', 'Desktop', 'VS Code', 'Discord'];
  const [allPlatforms, setAllPlatforms] = useState(defaultPlatforms);

  useEffect(() => {
    if (isAdmin) {
      CatalogAPI.stats().then(stats => {
        setAdminStats({
          totalTools: stats.totalTools || 0,
          pendingTools: stats.pendingTools || 0,
          approvedTools: stats.approvedTools || 0
        });
      }).catch(console.error);
    }
  }, [isAdmin]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, mods, tagsRes] = await Promise.all([
          CatalogAPI.categories(),
          CatalogAPI.models(),
          CatalogAPI.tags ? CatalogAPI.tags() : Promise.resolve([]),
        ]);

        // Chargement des plateformes avec normalisation du format
        let platformsData = [];
        if (CatalogAPI.platforms) {
          try {
            const response = await CatalogAPI.platforms();
            // Gère les différents formats de réponse possibles
            if (response && response.platforms) platformsData = response.platforms;
            else if (Array.isArray(response)) platformsData = response;
            else if (response && response.data) platformsData = response.data;
          } catch (err) {
            console.error('Erreur chargement plateformes', err);
          }
        }
        // Si aucune plateforme chargée, utiliser les valeurs par défaut
        setAllPlatforms(platformsData.length ? platformsData : defaultPlatforms);
        setCategories(cats || []);
        setModelsList(mods || []);
        setExistingTags(tagsRes || []);
        const providers = [...new Set((mods || []).map(m => m.provider).filter(Boolean))];
        setExistingProviders(providers);
      } catch (err) {
        console.error('Erreur chargement données', err);
        toast.error('Impossible de charger les données nécessaires');
      }
    };
    loadData();
  }, []);

  // États pour l’ajout d’un plan tarifaire (popup)
  const [editingPlan, setEditingPlan] = useState({
    nameTemplate: '',
    name: '',
    type: 'paid',
    price: 0,
    currency: '€',
    currencyOther: '',
    period: 'month',
    description: '',
    features: [],
    availableModels: []
  });

  // ---------- Informations générales ----------
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [url, setUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [isOpenSource, setIsOpenSource] = useState(false);

  // ---------- Catégories multiples ----------
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');


  // ---------- Tags ----------
  const [toolTags, setToolTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  useEffect(() => {
    setAvailableTags(existingTags.filter(t => !toolTags.some(tt => tt.id === t.id)));
  }, [existingTags, toolTags]);

  // ---------- Plateformes ----------

  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [customPlatform, setCustomPlatform] = useState('');
  const [showCustomPlatformInput, setShowCustomPlatformInput] = useState(false);

  // ---------- Fonctionnalités propres ----------
  const [toolFeatures, setToolFeatures] = useState([]);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  // ---------- Performances ----------
  const [toolPerformances, setToolPerformances] = useState([]);
  const [perfDomain, setPerfDomain] = useState('');
  const [perfScore, setPerfScore] = useState(0);
  const [perfDesc, setPerfDesc] = useState('');

  // ---------- Plans tarifaires ----------
  const [toolPricingPlans, setToolPricingPlans] = useState([]);
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  // ---------- Modèles AI ----------
  const [selectedModels, setSelectedModels] = useState([]);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [showNewModelDialog, setShowNewModelDialog] = useState(false);
  const [currentNewModel, setCurrentNewModel] = useState({
    id: '', name: '', provider: '', providerSelected: '', description: '',
    releaseDate: '', isOpenSource: false, hasApi: false, apiUrl: '',
    capabilities: [], performances: [], tags: [],
    pricingPlans: [],
    accessInTool: 'paid'
  });
  const [newApiPlan, setNewApiPlan] = useState({
    name: '',
    accessType: 'pay-as-you-go',
    inputTokenPrice: 0,
    outputTokenPrice: 0,
    currency: '€',
    quota: 0,
    quotaPeriod: 'month',
    limits: '',
    capabilities: '',
    overageRules: '',
  });
  const [newCapabilityInput, setNewCapabilityInput] = useState('');
  const [newPerfDomain, setNewPerfDomain] = useState('');
  const [newPerfScore, setNewPerfScore] = useState('');
  const [newPerfDesc, setNewPerfDesc] = useState('');
  const [newTagInputModel, setNewTagInputModel] = useState('');

  // Fournisseur (pour l'outil)
  const [selectedProvider, setSelectedProvider] = useState('');
  const [newProviderInput, setNewProviderInput] = useState('');
  const [showNewProvider, setShowNewProvider] = useState(false);
  const [toolPricingType, setToolPricingType] = useState('freemium');

  // ---------- Helpers ----------

  // Helpers pour les catégories multiples
  const addCategory = (category) => {
    if (!selectedCategories.some(c => c.id === category.id)) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const removeCategory = (categoryId) => {
    setSelectedCategories(selectedCategories.filter(c => c.id !== categoryId));
  };

  const createAndAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Le nom de la catégorie est obligatoire');
      return;
    }
    try {
      const result = await AdminAPI.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
        icon: 'Layers'
      });
      const newCat = result.category;
      setCategories(prev => [...prev, newCat]);
      setSelectedCategories([...selectedCategories, newCat]);
      setNewCategoryName('');
      setNewCategoryDesc('');
      setShowNewCategoryForm(false);
      toast.success('Catégorie créée et ajoutée');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la création');
    }
  };

  const addToolFeature = () => {
    if (newFeatureName.trim()) {
      setToolFeatures([...toolFeatures, { name: newFeatureName, description: newFeatureDesc }]);
      setNewFeatureName(''); setNewFeatureDesc('');
    }
  };
  const removeToolFeature = (index) => setToolFeatures(toolFeatures.filter((_, i) => i !== index));

  const addToolPerformance = () => {
    if (perfDomain.trim() && perfScore >= 0 && perfScore <= 100) {
      setToolPerformances([...toolPerformances, { domain: perfDomain, score: perfScore, description: perfDesc }]);
      setPerfDomain(''); setPerfScore(0); setPerfDesc('');
    }
  };
  const removeToolPerformance = (index) => setToolPerformances(toolPerformances.filter((_, i) => i !== index));

  const addToolTag = () => {
    if (newTagInput.trim()) {
      if (!toolTags.some(t => t.name === newTagInput.trim())) {
        setToolTags([...toolTags, { id: `new-${Date.now()}`, name: newTagInput.trim(), isNew: true }]);
      }
      setNewTagInput('');
    }
  };
  const selectExistingTag = (tag) => {
    if (!toolTags.some(t => t.id === tag.id)) setToolTags([...toolTags, tag]);
  };
  const removeTag = (tagId) => setToolTags(toolTags.filter(t => t.id !== tagId));

  const togglePlatform = (platform) => setSelectedPlatforms(prev =>
    prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
  );
  const addCustomPlatform = () => {
    if (customPlatform.trim()) {
      const newPlatform = customPlatform.trim();
      if (!allPlatforms.includes(newPlatform)) setAllPlatforms([...allPlatforms, newPlatform]);
      if (!selectedPlatforms.includes(newPlatform)) setSelectedPlatforms([...selectedPlatforms, newPlatform]);
      setCustomPlatform('');
      setShowCustomPlatformInput(false);
    }
  };

  // Gestion des plans tarifaires (dialogue)
  const handleAddPlanFeature = () => {
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, { name: '', limits: [] }]
    });
  };
  const updatePlanFeature = (idx, field, value) => {
    const newFeatures = [...editingPlan.features];
    newFeatures[idx] = { ...newFeatures[idx], [field]: value };
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };
  const removePlanFeature = (idx) => {
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_, i) => i !== idx)
    });
  };
  const addPlanAvailableModel = () => {
    setEditingPlan({
      ...editingPlan,
      availableModels: [...editingPlan.availableModels, { modelId: '', limits: [] }]
    });
  };
  const updatePlanModel = (idx, field, value) => {
    const newModels = [...editingPlan.availableModels];
    newModels[idx] = { ...newModels[idx], [field]: value };
    setEditingPlan({ ...editingPlan, availableModels: newModels });
  };
  const removePlanModel = (idx) => {
    setEditingPlan({
      ...editingPlan,
      availableModels: editingPlan.availableModels.filter((_, i) => i !== idx)
    });
  };
  const addFeatureLimit = (featureIdx) => {
    const newFeatures = [...editingPlan.features];
    if (!newFeatures[featureIdx].limits) newFeatures[featureIdx].limits = [];
    newFeatures[featureIdx].limits.push({ type: 'none', value: '', period: 'month' });
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };
  const removeFeatureLimit = (featureIdx, limitIdx) => {
    const newFeatures = [...editingPlan.features];
    newFeatures[featureIdx].limits.splice(limitIdx, 1);
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };
  const updateFeatureLimit = (featureIdx, limitIdx, field, value) => {
    const newFeatures = [...editingPlan.features];
    newFeatures[featureIdx].limits[limitIdx][field] = value;
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };
  const addModelLimit = (modelIdx) => {
    const newModels = [...editingPlan.availableModels];
    if (!newModels[modelIdx].limits) newModels[modelIdx].limits = [];
    newModels[modelIdx].limits.push({ type: 'none', value: '', period: 'month' });
    setEditingPlan({ ...editingPlan, availableModels: newModels });
  };
  const updateModelLimit = (modelIdx, limitIdx, field, value) => {
    const newModels = [...editingPlan.availableModels];
    newModels[modelIdx].limits[limitIdx][field] = value;
    setEditingPlan({ ...editingPlan, availableModels: newModels });
  };
  const removeModelLimit = (modelIdx, limitIdx) => {
    const newModels = [...editingPlan.availableModels];
    newModels[modelIdx].limits.splice(limitIdx, 1);
    setEditingPlan({ ...editingPlan, availableModels: newModels });
  };
  const resetEditingPlan = () => {
    setEditingPlan({
      nameTemplate: '', name: '', type: 'paid', price: 0, currency: '€', currencyOther: '',
      period: 'month', description: '', features: [], availableModels: []
    });
  };
  const savePricingPlan = () => {
    if (!editingPlan.name) return;
    const newPlan = {
      name: editingPlan.name,
      type: editingPlan.type,
      price: editingPlan.price,
      currency: editingPlan.currency,
      period: editingPlan.period,
      description: editingPlan.description,
      features: editingPlan.features.map(f => ({
        name: f.name,
        limits: (f.limits || []).filter(l => l.type !== 'none' || (l.type === 'none' && l.value))
      })),
      availableModels: editingPlan.availableModels.map(m => ({
        modelId: m.modelId,
        limits: (m.limits || []).filter(l => l.type !== 'none' || (l.type === 'none' && l.value))
      }))
    };
    setToolPricingPlans([...toolPricingPlans, newPlan]);
    setShowPlanDialog(false);
    resetEditingPlan();
  };
  const removePricingPlan = (index) => setToolPricingPlans(toolPricingPlans.filter((_, i) => i !== index));

  // Gestion des modèles AI
  const handleAddExistingModel = (modelId) => {
    const model = modelsList.find(m => m.id === modelId);
    if (model && !selectedModels.find(m => m.id === model.id)) {
      setSelectedModels([...selectedModels, {
        id: model.id,
        name: model.name,
        provider: model.provider,
        description: model.description,
        type: model.type || '',
        releaseDate: '',
        isOpenSource: false,
        apiUrl: model.apiUrl || '',
        capabilities: model.capabilities || [],
        performances: [],
        tags: [],
        pricingPlans: [],
        accessInTool: 'paid'
      }]);
    }
  };
  const updateModelAccessInTool = (modelId, access) => {
    setSelectedModels(selectedModels.map(m =>
      m.id === modelId ? { ...m, accessInTool: access } : m
    ));
  };
  const removeModel = (modelId) => setSelectedModels(selectedModels.filter(m => m.id !== modelId));
  const openNewModelDialog = () => {
    setCurrentNewModel({
      id: `new-${Date.now()}`, name: '', provider: '', providerSelected: '', description: '',
      releaseDate: '', isOpenSource: false, hasApi: false, apiUrl: '',
      capabilities: [], performances: [], tags: [], pricingPlans: [],
      accessInTool: 'paid'
    });
    setShowNewModelDialog(true);
  };
  const addNewModelCapability = () => {
    if (newCapabilityInput.trim()) {
      setCurrentNewModel({
        ...currentNewModel,
        capabilities: [...currentNewModel.capabilities, newCapabilityInput.trim()]
      });
      setNewCapabilityInput('');
    }
  };
  const addNewModelPerformance = () => {
    if (newPerfDomain.trim() && newPerfScore) {
      setCurrentNewModel({
        ...currentNewModel,
        performances: [...currentNewModel.performances, {
          domain: newPerfDomain.trim(),
          score: parseInt(newPerfScore),
          description: newPerfDesc.trim()
        }]
      });
      setNewPerfDomain('');
      setNewPerfScore('');
      setNewPerfDesc('');
    }
  };
  const addNewModelTag = () => {
    if (newTagInputModel.trim()) {
      setCurrentNewModel({
        ...currentNewModel,
        tags: [...currentNewModel.tags, { id: `new-${Date.now()}`, name: newTagInputModel.trim() }]
      });
      setNewTagInputModel('');
    }
  };
  const addNewModelPricingPlan = () => {
    if (!newApiPlan.name) return;
    const plan = {
      name: newApiPlan.name,
      accessType: newApiPlan.accessType,
      inputTokenPrice: newApiPlan.inputTokenPrice,
      outputTokenPrice: newApiPlan.outputTokenPrice,
      currency: newApiPlan.currency,
      quota: newApiPlan.quota,
      quotaPeriod: newApiPlan.quotaPeriod,
      limits: newApiPlan.limits,
      capabilities: newApiPlan.capabilities,
      overageRules: newApiPlan.overageRules,
    };
    setCurrentNewModel({
      ...currentNewModel,
      pricingPlans: [...currentNewModel.pricingPlans, plan]
    });
    setNewApiPlan({
      name: '',
      accessType: 'pay-as-you-go',
      inputTokenPrice: 0,
      outputTokenPrice: 0,
      currency: '€',
      quota: 0,
      quotaPeriod: 'month',
      limits: '',
      capabilities: '',
      overageRules: '',
    });
  };
  const removeCapability = (idx) => {
    setCurrentNewModel({
      ...currentNewModel,
      capabilities: currentNewModel.capabilities.filter((_, i) => i !== idx)
    });
  };
  const removeModelPerformance = (idx) => {
    setCurrentNewModel({
      ...currentNewModel,
      performances: currentNewModel.performances.filter((_, i) => i !== idx)
    });
  };
  const removeModelTag = (idx) => {
    setCurrentNewModel({
      ...currentNewModel,
      tags: currentNewModel.tags.filter((_, i) => i !== idx)
    });
  };
  const removeModelPricingPlan = (idx) => {
    setCurrentNewModel({
      ...currentNewModel,
      pricingPlans: currentNewModel.pricingPlans.filter((_, i) => i !== idx)
    });
  };
  const saveNewModel = () => {
    if (!currentNewModel.name || !currentNewModel.provider) {
      toast.error('Nom et fournisseur requis');
      return;
    }
    setSelectedModels([...selectedModels, { ...currentNewModel, isNew: true }]);
    setShowNewModelDialog(false);
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Le nom est requis'); return; }
    if (!shortDescription.trim()) { toast.error('La description courte est requise'); return; }
    if (!longDescription.trim()) { toast.error('La description détaillée est requise'); return; }
    if (!url.trim()) { toast.error("L'URL est requise"); return; }
    if (selectedCategories.length === 0) {
      toast.error('Veuillez sélectionner au moins une catégorie');
      return;
    }
    if (selectedModels.length === 0) { toast.error('Veuillez sélectionner au moins un modèle AI'); return; }
    const finalProvider = showNewProvider ? newProviderInput : selectedProvider;
    if (!finalProvider) { toast.error('Le fournisseur est requis'); return; }

    setIsSubmitting(true);
    const proposal = {
      name, shortDescription, longDescription, url, logoUrl,
      releaseDate, isOpenSource,
      provider: finalProvider,
      pricingType: toolPricingType,
      categoryIds: selectedCategories.map(c => c.id),
      tags: toolTags,
      platforms: selectedPlatforms,
      features: toolFeatures,
      performances: toolPerformances,
      pricingPlans: toolPricingPlans,
      models: selectedModels,
      adminPublish: isAdmin && adminPublishDirect
    };
    try {
      await CatalogAPI.submitTool(proposal);
      toast.success('Votre proposition a été soumise avec succès !');
      navigate(isAdmin ? '/admin/tools' : '/dashboard/proposals');
    } catch (err) {
      toast.error(err.message || "Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Connexion requise</h1>
            <p className="text-muted-foreground mb-6">Vous devez être connecté pour proposer un outil.</p>
            <Link to="/login"><Button>Se connecter</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            {/* Header identique à l’original */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/10 border border-primary/20 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500" />
                <Sparkles className="h-12 w-12 text-primary animate-pulse relative z-10" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider text-[10px] py-1">
                    <Target className="h-3 w-3 mr-1" /> Nouvelle Soumission
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] uppercase py-1">
                    <Users className="h-3 w-3 mr-1" /> Communauté
                  </Badge>
                  {isAdmin && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] uppercase py-1">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Mode Admin
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight">
                  {isAdmin ? "Créer un outil (Admin)" : "Contribuer au catalogue AI"}
                </h1>
                <p className="text-muted-foreground text-lg max-w-4xl leading-relaxed">
                  {isAdmin
                    ? "En tant qu'administrateur, vous pouvez ajouter un outil directement au catalogue ou le soumettre pour validation."
                    : "Aidez-nous à construire la plus grande base de connaissances sur l'IA. Soumettez un outil, un modèle ou une plateforme et participez à l'évolution de l'écosystème."}
                </p>
              </div>
            </div>

            <Tabs defaultValue="form" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-8 space-x-8">
                <TabsTrigger
                  value="form"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-1 font-semibold transition-all"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  Formulaire détaillé
                </TabsTrigger>
                <TabsTrigger
                  value="guidelines"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-1 font-semibold transition-all"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guide de publication
                </TabsTrigger>
                <TabsTrigger
                  value="faq"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-1 font-semibold transition-all"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Questions fréquentes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="mt-0 outline-none">
                <div className="grid lg:grid-cols-3 gap-10">
                  {/* Colonne Formulaire (2/3) - remplacée par le formulaire détaillé */}
                  <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-none bg-transparent">
                      <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <Accordion type="multiple" defaultValue={["general"]}>
                            {/* Section Informations générales */}
                            <AccordionItem value="general" className="border rounded-lg p-4">
                              <AccordionTrigger className="text-lg font-semibold">Informations générales</AccordionTrigger>
                              <AccordionContent className="space-y-4 pt-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="name">Nom de l'outil *</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: ChatGPT" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="provider">Fournisseur / Éditeur *</Label>
                                    <Select value={selectedProvider} onValueChange={(val) => {
                                      if (val === 'new') { setShowNewProvider(true); setSelectedProvider(''); }
                                      else { setShowNewProvider(false); setSelectedProvider(val); }
                                    }}>
                                      <SelectTrigger><Building className="mr-2 h-4 w-4" /><SelectValue placeholder="Choisir un fournisseur" /></SelectTrigger>
                                      <SelectContent>
                                        {existingProviders.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        <SelectItem value="new">+ Ajouter un fournisseur</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {showNewProvider && (
                                      <Input placeholder="Nom du nouveau fournisseur" value={newProviderInput} onChange={(e) => setNewProviderInput(e.target.value)} />
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="shortDesc">Description courte *</Label>
                                  <Input id="shortDesc" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={100} placeholder="Une phrase décrivant l'outil" />
                                  <p className="text-xs text-muted-foreground">{shortDescription.length}/100</p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="longDesc">Description détaillée *</Label>
                                  <Textarea id="longDesc" rows={5} value={longDescription} onChange={(e) => setLongDescription(e.target.value)} placeholder="Description complète..." />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="url">Site officiel *</Label>
                                    <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="logoUrl">Logo (URL)</Label>
                                    <Input id="logoUrl" type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                                  </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="releaseDate">Date de sortie</Label>
                                    <Input id="releaseDate" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
                                  </div>
                                  <div className="flex items-center gap-3 mt-6">
                                    <Label htmlFor="openSource">Open Source</Label>
                                    <Switch id="openSource" checked={isOpenSource} onCheckedChange={setIsOpenSource} />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="pricingType">Type de tarification *</Label>
                                  <Select value={toolPricingType} onValueChange={setToolPricingType}>
                                    <SelectTrigger><DollarSign className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="free">Gratuit</SelectItem>
                                      <SelectItem value="freemium">Freemium</SelectItem>
                                      <SelectItem value="paid">Payant</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            {/* Section Catégorie et tags */}
                            <AccordionItem value="category_tags" className="border rounded-lg p-4">
                              <AccordionTrigger className="text-lg font-semibold">Catégories</AccordionTrigger>
                              <AccordionContent className="space-y-4 pt-4">
                                <div className="space-y-2">
                                  <Label>Catégories sélectionnées *</Label>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedCategories.length === 0 ? (
                                      <span className="text-sm text-muted-foreground">Aucune catégorie sélectionnée</span>
                                    ) : (
                                      selectedCategories.map(cat => (
                                        <Badge key={cat.id} variant="secondary" className="gap-1">
                                          {cat.name}
                                          <button
                                            type="button"
                                            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                                            onClick={() => removeCategory(cat.id)}
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </Badge>
                                      ))
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Ajouter des catégories existantes</Label>
                                    <Input
                                      placeholder="Rechercher une catégorie..."
                                      value={categorySearchQuery}
                                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                                    />
                                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                                      {categories
                                        .filter(cat =>
                                          !selectedCategories.some(selected => selected.id === cat.id) &&
                                          (cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                                            (cat.slug && cat.slug.toLowerCase().includes(categorySearchQuery.toLowerCase())))
                                        )
                                        .map(cat => (
                                          <div
                                            key={cat.id}
                                            className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                                            onClick={() => addCategory(cat)}
                                          >
                                            <span>{cat.name}</span>
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                        ))}
                                      {categories.filter(cat => !selectedCategories.some(selected => selected.id === cat.id)).length === 0 && (
                                        <p className="text-sm text-muted-foreground p-2">Aucune catégorie disponible</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-2">
                                    {!showNewCategoryForm ? (
                                      <Button type="button" variant="outline" size="sm" onClick={() => setShowNewCategoryForm(true)}>
                                        <Plus className="mr-2 h-4 w-4" /> Créer une nouvelle catégorie
                                      </Button>
                                    ) : (
                                      <div className="space-y-2 border rounded-md p-3">
                                        <Input
                                          placeholder="Nom de la nouvelle catégorie"
                                          value={newCategoryName}
                                          onChange={(e) => setNewCategoryName(e.target.value)}
                                        />
                                        <Input
                                          placeholder="Description (optionnel)"
                                          value={newCategoryDesc}
                                          onChange={(e) => setNewCategoryDesc(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                          <Button type="button" size="sm" onClick={createAndAddCategory}>
                                            Créer et ajouter
                                          </Button>
                                          <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCategoryForm(false)}>
                                            Annuler
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            {/* Section Plateformes */}
                            <AccordionItem value="platforms" className="border rounded-lg p-4">
                              <AccordionTrigger className="text-lg font-semibold">Plateformes disponibles</AccordionTrigger>
                              <AccordionContent className="space-y-4 pt-4">
                                <div className="flex flex-wrap gap-2">
                                  {allPlatforms.map(p => (
                                    <Badge key={p.id} variant={selectedPlatforms.includes(p.name) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => togglePlatform(p.name)}>
                                      {p.name}
                                    </Badge>
                                  ))}
                                </div>
                                <div>
                                  {showCustomPlatformInput ? (
                                    <div className="flex gap-2">
                                      <Input placeholder="Nouvelle plateforme" value={customPlatform} onChange={(e) => setCustomPlatform(e.target.value)} />
                                      <Button type="button" size="sm" onClick={addCustomPlatform}>Ajouter</Button>
                                      <Button type="button" size="sm" variant="ghost" onClick={() => setShowCustomPlatformInput(false)}>Annuler</Button>
                                    </div>
                                  ) : (
                                    <Button type="button" variant="outline" size="sm" onClick={() => setShowCustomPlatformInput(true)}>+ Ajouter une plateforme</Button>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            {/* Section Fonctionnalités propres */}
                            <AccordionItem value="features" className="border rounded-lg p-4">
                              <AccordionTrigger className="text-lg font-semibold">Fonctionnalités propres</AccordionTrigger>
                              <AccordionContent className="space-y-4 pt-4">
                                {toolFeatures.map((f, idx) => (
                                  <div key={idx} className="flex justify-between items-start border-b pb-2">
                                    <div><span className="font-medium">{f.name}</span>{f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}</div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeToolFeature(idx)}><X className="h-4 w-4" /></Button>
                                  </div>
                                ))}
                                <div className="grid gap-2">
                                  <Input placeholder="Nom de la fonctionnalité" value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} />
                                  <Button type="button" size="sm" onClick={addToolFeature}>Ajouter</Button>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            {/* Section Performances de l'outil */}
                            <AccordionItem value="performances" className="border rounded-lg p-4">
                              <AccordionTrigger className="text-lg font-semibold">Performances</AccordionTrigger>
                              <AccordionContent className="space-y-4 pt-4">
                                {toolPerformances.map((p, idx) => (
                                  <div key={idx} className="flex justify-between items-center border-b pb-2">
                                    <div><span className="font-medium">{p.domain}</span> : {p.score}/100{p.description && <span className="text-xs text-muted-foreground ml-2">({p.description})</span>}</div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeToolPerformance(idx)}><X className="h-4 w-4" /></Button>
                                  </div>
                                ))}
                                <div className="grid gap-2 sm:grid-cols-3">
                                  <Input placeholder="Domaine (ex: Génération texte)" value={perfDomain} onChange={(e) => setPerfDomain(e.target.value)} />
                                  <Input type="number" min="0" max="100" placeholder="Score /100" value={perfScore} onChange={(e) => setPerfScore(Number(e.target.value))} />
                                </div>
                                <Button type="button" size="sm" onClick={addToolPerformance}>Ajouter une performance</Button>
                              </AccordionContent>
                            </AccordionItem>

                            {/* Section Modèles AI utilisés */}
                            <AccordionItem value="models" className="border rounded-lg p-4">
                              <AccordionTrigger className="text-lg font-semibold">Modèles AI utilisés</AccordionTrigger>
                              <AccordionContent className="space-y-4 pt-4">
                                {selectedModels.map((model, idx) => (
                                  <Card key={idx} className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium">{model.name}</h4>
                                        <p className="text-sm text-muted-foreground">{model.provider}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                          <span className="text-xs">Accès dans cet outil :</span>
                                          <Badge variant={model.accessInTool === 'free' ? 'success' : 'warning'} className="cursor-pointer" onClick={() => updateModelAccessInTool(model.id, model.accessInTool === 'free' ? 'paid' : 'free')}>
                                            {model.accessInTool === 'free' ? 'Gratuit' : 'Payant'}
                                          </Badge>
                                        </div>
                                      </div>
                                      <Button type="button" variant="ghost" size="sm" onClick={() => removeModel(model.id)}><X className="h-4 w-4" /></Button>
                                    </div>
                                  </Card>
                                ))}

                                {/* Zone d'ajout avec recherche */}
                                <div className="space-y-3">
                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <Input
                                        placeholder="Rechercher un modèle existant..."
                                        value={modelSearchQuery}
                                        onChange={(e) => setModelSearchQuery(e.target.value)}
                                        className="pr-8"
                                      />
                                      {modelSearchQuery && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-0 top-0 h-full"
                                          onClick={() => setModelSearchQuery('')}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                    <Button type="button" variant="outline" onClick={openNewModelDialog}>+ Créer un nouveau modèle</Button>
                                  </div>

                                  {/* Liste des modèles disponibles (filtrée) */}
                                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                                    {modelsList
                                      .filter(m => !selectedModels.some(sm => sm.id === m.id) &&
                                        (modelSearchQuery === '' ||
                                          m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                                          (m.provider && m.provider.toLowerCase().includes(modelSearchQuery.toLowerCase()))))
                                      .slice(0, 20)
                                      .map(model => (
                                        <div
                                          key={model.id}
                                          className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                                          onClick={() => handleAddExistingModel(model.id)}
                                        >
                                          <div>
                                            <span className="font-medium">{model.name}</span>
                                            <span className="text-sm text-muted-foreground ml-2">{model.provider}</span>
                                          </div>
                                          <Plus className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                      ))}
                                    {modelsList.filter(m => !selectedModels.some(sm => sm.id === m.id) &&
                                      (modelSearchQuery === '' ||
                                        m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                                        (m.provider && m.provider.toLowerCase().includes(modelSearchQuery.toLowerCase())))).length === 0 && (
                                        <p className="text-sm text-muted-foreground p-2">
                                          {modelSearchQuery ? 'Aucun modèle trouvé' : 'Tous les modèles sont déjà sélectionnés'}
                                        </p>
                                      )}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            {/* Section Plans tarifaires de l'outil */}
                            <AccordionItem value="pricing" className="border rounded-lg p-4">
                              <AccordionTrigger className="text-lg font-semibold">Plans tarifaires</AccordionTrigger>
                              <AccordionContent className="space-y-4 pt-4">
                                {toolPricingPlans.map((plan, idx) => (
                                  <Card key={idx} className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-bold">{plan.name}</h4>
                                        <p>{plan.price}{plan.currency} / {plan.period}</p>
                                        {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
                                        <div className="mt-2">
                                          <span className="text-xs font-medium">Fonctionnalités:</span>
                                          <ul className="list-disc list-inside text-xs">
                                            {plan.features.map((f, i) => (
                                              <li key={i}>
                                                {f.name}
                                                {f.limits && f.limits.length > 0 && (
                                                  <ul className="ml-4 list-circle">
                                                    {f.limits.map((limit, li) => (
                                                      <li key={li}>
                                                        {limit.type !== 'none' && limit.value
                                                          ? `${limit.value} ${limit.type}${limit.period !== 'total' ? ` / ${limit.period}` : ' total'}`
                                                          : 'Aucune limite'}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                        <div className="mt-1">
                                          <span className="text-xs font-medium">Modèles accessibles:</span>
                                          <ul className="list-disc list-inside text-xs">
                                            {plan.availableModels.map((m, i) => (
                                              <li key={i}>
                                                {m.modelId}
                                                {m.limits && m.limits.length > 0 && (
                                                  <ul className="ml-4 list-circle">
                                                    {m.limits.map((limit, li) => (
                                                      <li key={li}>
                                                        {limit.type !== 'none' && limit.value
                                                          ? `${limit.value} ${limit.type}${limit.period !== 'total' ? ` / ${limit.period}` : ' total'}`
                                                          : 'Aucune limite'}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                      <Button type="button" variant="ghost" size="sm" onClick={() => removePricingPlan(idx)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                  </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={() => setShowPlanDialog(true)}>+ Ajouter un plan</Button>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>

                          <div className="flex justify-end gap-4">
                            <Link to="/dashboard/proposals"><Button type="button" variant="outline">Annuler</Button></Link>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? 'Envoi...' : 'Soumettre la proposition'}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Colonne latérale – adaptée */}
                  <div className="space-y-8">
                    {/* Cycle de vie de la soumission */}
                    <Card className="shadow-sm border-primary/10">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                          Cycle de vie
                        </CardTitle>
                        <CardDescription>Étapes après votre soumission</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {[
                          { step: 1, title: "Vérification automatique", desc: "Validation des champs obligatoires (nom, description, URL, fournisseur) et des modèles IA sélectionnés." },
                          { step: 2, title: "Examen technique", desc: "Vérification des fonctionnalités, des performances et de la cohérence des plans tarifaires." },
                          { step: 3, title: "Décision finale", desc: "Validation ou rejet par notre équipe. En cas de rejet, vous disposez de 3 tentatives pour modifier et renvoyer." }
                        ].map((item) => (
                          <div key={item.step} className="flex gap-4 group">
                            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                              {item.step}
                            </div>
                            <div>
                              <p className="font-bold text-sm mb-1">{item.title}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Critères de qualité / Recommandations */}
                    <Card className="shadow-sm border-accent/20 bg-accent/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileSearch className="h-5 w-5 text-accent" />
                          Conseils pour une validation rapide
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Description détaillée (&gt;100 mots)</span>
                          <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/5">Recommandé</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Au moins un modèle IA référencé</span>
                          <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/5">Obligatoire</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">URL fonctionnelle et en HTTPS</span>
                          <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/5">Recommandé</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Plan tarifaire explicite (gratuit, freemium, payant)</span>
                          <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/5">Recommandé</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Catégorie(s) pertinente(s)</span>
                          <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/5">Obligatoire</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic pt-2 border-t">
                          * Une fiche complète accélère l’examen et améliore la visibilité de votre outil dans le catalogue.
                        </p>
                      </CardContent>
                    </Card>

                    {isAdmin && (
                      // Section administration
                      <>
                        <Card className="shadow-sm border-primary/20 bg-primary/5">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <ShieldCheck className="h-5 w-5 text-primary" />
                              Administration
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total outils</span>
                                <span className="font-bold">{adminStats.totalTools}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">En attente</span>
                                <span className="font-bold text-warning">{adminStats.pendingTools}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Approuvés</span>
                                <span className="font-bold text-success">{adminStats.approvedTools}</span>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Publier directement</span>
                              <Switch
                                checked={adminPublishDirect}
                                onCheckedChange={setAdminPublishDirect}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {adminPublishDirect
                                ? "L'outil sera directement actif dans le catalogue sans passer par la validation."
                                : "L'outil sera soumis en attente de validation (processus standard)."}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => navigate('/admin/tools')}
                            >
                              Gérer les outils
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="shadow-sm border-accent/20 bg-accent/5">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Star className="h-5 w-5 text-accent" />
                              Actions rapides
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <Link to="/admin/categories">
                              <Button variant="ghost" size="sm" className="w-full justify-start">
                                <Tag className="mr-2 h-4 w-4" /> Gérer les catégories
                              </Button>
                            </Link>
                            <Link to="/admin/models">
                              <Button variant="ghost" size="sm" className="w-full justify-start">
                                <Cpu className="mr-2 h-4 w-4" /> Gérer les modèles
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </>
                    )}




                  </div>
                </div>
              </TabsContent>

              <TabsContent value="guidelines" className="mt-0 outline-none">
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-6">
                    <CardTitle className="text-2xl font-bold">Guide de soumission – Catalogue AI</CardTitle>
                    <CardDescription>
                      Respectez ces bonnes pratiques pour que votre outil soit accepté et bien référencé.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Ce que nous valorisons */}
                      <div className="space-y-4">
                        <h4 className="font-bold flex items-center gap-2 text-primary">
                          <Zap className="h-4 w-4" /> Critères d’acceptation
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex gap-3 text-sm">
                            <div className="h-5 w-5 rounded bg-success/10 text-success flex items-center justify-center shrink-0">✓</div>
                            <span><strong>Modèles IA référencés :</strong> indiquez les modèles utilisés (GPT‑4, Claude, Gemini, Llama, etc.) via la sélection existante ou la création rapide.</span>
                          </li>
                          <li className="flex gap-3 text-sm">
                            <div className="h-5 w-5 rounded bg-success/10 text-success flex items-center justify-center shrink-0">✓</div>
                            <span><strong>Catégories précises :</strong> choisissez au moins une catégorie (ex: Productivité, Code, Image, Audio). Si nécessaire, vous pouvez en créer une nouvelle.</span>
                          </li>
                          <li className="flex gap-3 text-sm">
                            <div className="h-5 w-5 rounded bg-success/10 text-success flex items-center justify-center shrink-0">✓</div>
                            <span><strong>Description détaillée :</strong> expliquez concrètement comment l’IA est utilisée, quels sont les cas d’usage et les points forts par rapport aux concurrents.</span>
                          </li>
                          <li className="flex gap-3 text-sm">
                            <div className="h-5 w-5 rounded bg-success/10 text-success flex items-center justify-center shrink-0">✓</div>
                            <span><strong>Fonctionnalités & performances :</strong> listez les fonctionnalités propres à l’outil et, le cas échéant, renseignez des scores de performance (benchmarks).</span>
                          </li>
                          <li className="flex gap-3 text-sm">
                            <div className="h-5 w-5 rounded bg-success/10 text-success flex items-center justify-center shrink-0">✓</div>
                            <span><strong>Tarification transparente :</strong> précisez le modèle économique (gratuit, freemium, payant) et, si nécessaire, détaillez les plans avec leurs limites.</span>
                          </li>
                        </ul>
                      </div>

                      {/* Ce qui sera refusé */}
                      <div className="space-y-4">
                        <h4 className="font-bold flex items-center gap-2 text-destructive">
                          <Info className="h-4 w-4" /> Motifs de rejet fréquents
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex gap-3 text-sm">
                            <div className="h-5 w-5 rounded bg-destructive/10 text-destructive flex items-center justify-center shrink-0">×</div>
                            <span><strong>Informations manquantes :</strong> nom, description, URL ou fournisseur absent.</span>
                          </li>
                          <li className="flex gap-3 text-sm">
                            <div className="h-5 w-5 rounded bg-destructive/10 text-destructive flex items-center justify-center shrink-0">×</div>
                            <span><strong>Aucun modèle IA renseigné :</strong> un outil d’IA doit au moins utiliser un modèle référencé dans notre catalogue.</span>
                          </li>
                          <li className="flex gap-3 text-sm">
                            <div className="h-5 w-5 rounded bg-destructive/10 text-destructive flex items-center justify-center shrink-0">×</div>
                            <span><strong>Description trop vague ou copiée :</strong> la description détaillée doit être originale et propre à l’outil.</span>
                          </li>
                          <li className="flex gap-3 text-sm">
                            <div className="h-5 w-5 rounded bg-destructive/10 text-destructive flex items-center justify-center shrink-0">×</div>
                            <span><strong>Liens brisés ou sites non sécurisés :</strong> l’URL doit être valide et en HTTPS de préférence.</span>
                          </li>
                          <li className="flex gap-3 text-sm">
                            <div className="h-5 w-5 rounded bg-destructive/10 text-destructive flex items-center justify-center shrink-0">×</div>
                            <span><strong>Non‑respect des conditions d’utilisation :</strong> les outils malveillants ou contraires à l’éthique seront supprimés.</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Conseils pour la description */}
                    <div className="p-6 bg-muted/20 rounded-xl border border-border">
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Rédiger une description efficace
                      </h4>
                      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                        <p>
                          Une bonne description permet à la fois aux utilisateurs et à notre équipe de validation de comprendre rapidement la valeur de l’outil.
                          Nous vous recommandons d’inclure :
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Le **problème** que l’outil résout.</li>
                          <li>La **technologie** ou les modèles IA sous‑jacents (ex: fine‑tuning, retrieval‑augmented generation, etc.).</li>
                          <li>Des **exemples concrets** d’utilisation.</li>
                          <li>Les **intégrations** possibles (API, plugins, etc.).</li>
                        </ul>
                        <p className="mt-2">
                          Une description riche améliore le référencement interne et aide les utilisateurs à faire leur choix.
                        </p>
                      </div>
                    </div>

                    {/* Mentions sur le processus de validation */}
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                      <div className="flex gap-3 items-start">
                        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Validation humaine</span>
                          <p className="text-muted-foreground">Chaque soumission est examinée par notre équipe. Vous recevrez une notification par email en cas d’acceptation ou de refus, avec un motif détaillé en cas de rejet.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Tentatives de modification</span>
                          <p className="text-muted-foreground">En cas de rejet, vous disposez de 3 tentatives pour corriger et renvoyer votre proposition. Passé ce délai, la soumission sera définitivement clôturée.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="faq" className="mt-0 outline-none">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Questions fréquentes</CardTitle>
                    <CardDescription>
                      Tout ce que vous devez savoir sur la soumission, la validation et la gestion de vos propositions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Accordion type="single" collapsible className="w-full">
                      {[
                        {
                          q: "Combien de temps prend la validation d’un outil ?",
                          a: "Notre équipe examine chaque soumission sous **48 heures ouvrées**. Si votre fiche est complète (catégories, modèles IA, description détaillée), la validation peut être plus rapide. Vous recevrez une notification sur votre compte et par email."
                        },
                        {
                          q: "Puis-je modifier ma proposition après l’avoir envoyée ?",
                          a: "Une fois soumise, la proposition est **gelée** pendant l’examen. Si elle est rejetée, vous pourrez la modifier et la renvoyer (dans la limite de **3 tentatives**)."
                        },
                        {
                          q: "Qu’est-ce que les tentatives de modification ?",
                          a: "En cas de rejet, vous disposez de **3 tentatives** pour corriger votre proposition (le nombre de tentatives restantes est visible dans votre espace). Passé ce délai, la soumission est définitivement clôturée et vous devrez créer une nouvelle proposition."
                        },
                        {
                          q: "Que se passe-t-il si je dépasse le nombre de tentatives ?",
                          a: "Votre proposition sera définitivement refusée. Vous devrez alors créer une **nouvelle soumission** (avec un slug différent) si vous souhaitez proposer à nouveau l’outil."
                        },
                        {
                          q: "Pourquoi mon outil a-t-il été rejeté ?",
                          a: "Le motif précis est indiqué dans la note administrative (visible dans le détail de la proposition). Les raisons fréquentes sont : absence de modèle IA, description insuffisante, URL invalide, ou non‑respect des conditions d’utilisation. Vous pouvez corriger et renvoyer jusqu’à 3 fois."
                        }
                      ].map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-b-muted">
                          <AccordionTrigger className="hover:no-underline font-semibold py-4">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />

      {/* Dialogue pour ajouter un plan tarifaire */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ajouter un plan tarifaire</DialogTitle><DialogDescription>Définissez un forfait (Gratuit, Plus, Pro, etc.)</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Nom du plan avec sélection ou saisie libre */}
            <div className="grid gap-2">
              <Label>Nom du plan *</Label>
              <Select
                value={editingPlan.nameTemplate || ''}
                onValueChange={(val) => {
                  if (val === 'custom') {
                    setEditingPlan({ ...editingPlan, nameTemplate: 'custom', name: '' });
                  } else {
                    setEditingPlan({ ...editingPlan, nameTemplate: val, name: val });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type de plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gratuit">Gratuit</SelectItem>
                  <SelectItem value="Plus">Plus</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="custom">Autre...</SelectItem>
                </SelectContent>
              </Select>
              {editingPlan.nameTemplate === 'custom' && (
                <Input
                  placeholder="Nom personnalisé"
                  value={editingPlan.name || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                />
              )}
            </div>

            {/* Type de plan (gratuit / payant) automatique ou modifiable */}
            <div className="grid gap-2">
              <Label>Type de tarification *</Label>
              <Select
                value={editingPlan.type || 'paid'}
                onValueChange={(val) => setEditingPlan({ ...editingPlan, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuit</SelectItem>
                  <SelectItem value="paid">Payant</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {editingPlan.type === 'free'
                  ? "Seuls les modèles gratuits (ou freemium) de l'outil seront disponibles dans ce plan."
                  : "Tous les modèles sélectionnés pour l'outil seront disponibles."}
              </p>
            </div>

            {/* Prix et devise */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix</Label>
                <Input
                  id="price"
                  type="number"
                  step="any"
                  placeholder="0"
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Devise</Label>
                <Select
                  value={editingPlan.currency || '€'}
                  onValueChange={(val) => {
                    if (val === 'other') {
                      setEditingPlan({ ...editingPlan, currency: '' });
                    } else {
                      setEditingPlan({ ...editingPlan, currency: val });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="€">€ (Euro)</SelectItem>
                    <SelectItem value="$">$ (Dollar)</SelectItem>
                    <SelectItem value="other">Autre...</SelectItem>
                  </SelectContent>
                </Select>
                {editingPlan.currency === '' && (
                  <Input
                    placeholder="Devise (ex: GBP, ¥)"
                    value={editingPlan.currencyOther || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, currencyOther: e.target.value, currency: e.target.value })}
                  />
                )}
              </div>
            </div>

            {/* Période */}
            <div className="space-y-2">
              <Label>Période</Label>
              <Select
                value={editingPlan.period}
                onValueChange={(val) => setEditingPlan({ ...editingPlan, period: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">/ mois</SelectItem>
                  <SelectItem value="year">/ an</SelectItem>
                  <SelectItem value="week">/ semaine</SelectItem>
                  <SelectItem value="day">/ jour</SelectItem>
                  <SelectItem value="one-time">unique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Description du plan (optionnel)"
              value={editingPlan.description || ''}
              onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
            />

            {/* Fonctionnalités incluses avec limites détaillées */}
            <div className="space-y-3">
              <Label>Fonctionnalités incluses</Label>
              <div className="space-y-2">
                {editingPlan.features.map((f, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <Input placeholder="Nom de la fonctionnalité" value={f.name} onChange={(e) => updatePlanFeature(idx, 'name', e.target.value)} />

                    {/* Liste des limites */}
                    <div className="space-y-2">
                      {(f.limits || []).map((limit, lIdx) => (
                        <div key={lIdx} className="grid grid-cols-4 gap-2 items-center">
                          <Select value={limit.type} onValueChange={(val) => updateFeatureLimit(idx, lIdx, 'type', val)}>
                            <SelectTrigger><SelectValue placeholder="Type de limite" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Aucune limite</SelectItem>
                              <SelectItem value="messages">Messages</SelectItem>
                              <SelectItem value="tokens">Tokens</SelectItem>
                              <SelectItem value="requests">Requêtes</SelectItem>
                              <SelectItem value="images">Images</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>

                          {limit.type !== 'none' && (
                            <>
                              <Input type="number" placeholder="Valeur" value={limit.value || ''} onChange={(e) => updateFeatureLimit(idx, lIdx, 'value', e.target.value)} />
                              <Select value={limit.period} onValueChange={(val) => updateFeatureLimit(idx, lIdx, 'period', val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hour">/ heure</SelectItem>
                                  <SelectItem value="day">/ jour</SelectItem>
                                  <SelectItem value="week">/ semaine</SelectItem>
                                  <SelectItem value="month">/ mois</SelectItem>
                                  <SelectItem value="year">/ an</SelectItem>
                                  <SelectItem value="total">total</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeFeatureLimit(idx, lIdx)}><X className="h-4 w-4" /></Button>
                            </>
                          )}
                          {limit.type === 'none' && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeFeatureLimit(idx, lIdx)}><X className="h-4 w-4" /></Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => addFeatureLimit(idx)}>+ Ajouter une limite</Button>
                    </div>

                    <div className="flex justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePlanFeature(idx)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddPlanFeature}>
                  + Ajouter une fonctionnalité
                </Button>
              </div>
            </div>

            {/* Modèles accessibles dans ce plan */}
            <div className="space-y-3">
              <Label>Modèles accessibles dans ce plan</Label>
              <div className="space-y-2">
                {editingPlan.availableModels.map((m, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <Select
                      value={m.modelId}
                      onValueChange={(val) => updatePlanModel(idx, 'modelId', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un modèle" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedModels
                          .filter(model => editingPlan.type === 'free' ? model.accessInTool === 'free' : true)
                          .map(model => (
                            <SelectItem key={model.id} value={model.id}>{model.name} ({model.provider})</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {/* Liste des limites */}
                    <div className="space-y-2">
                      {(m.limits || []).map((limit, lIdx) => (
                        <div key={lIdx} className="grid grid-cols-4 gap-2 items-center">
                          <Select value={limit.type} onValueChange={(val) => updateModelLimit(idx, lIdx, 'type', val)}>
                            <SelectTrigger><SelectValue placeholder="Type de limite" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Aucune limite</SelectItem>
                              <SelectItem value="messages">Messages</SelectItem>
                              <SelectItem value="tokens">Tokens</SelectItem>
                              <SelectItem value="requests">Requêtes</SelectItem>
                              <SelectItem value="images">Images</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>

                          {limit.type !== 'none' && (
                            <>
                              <Input
                                type="number"
                                placeholder="Valeur"
                                value={limit.value || ''}
                                onChange={(e) => updateModelLimit(idx, lIdx, 'value', e.target.value)}
                              />
                              <Select value={limit.period} onValueChange={(val) => updateModelLimit(idx, lIdx, 'period', val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hour">/ heure</SelectItem>
                                  <SelectItem value="day">/ jour</SelectItem>
                                  <SelectItem value="week">/ semaine</SelectItem>
                                  <SelectItem value="month">/ mois</SelectItem>
                                  <SelectItem value="year">/ an</SelectItem>
                                  <SelectItem value="total">total</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeModelLimit(idx, lIdx)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {limit.type === 'none' && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeModelLimit(idx, lIdx)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => addModelLimit(idx)}>
                        + Ajouter une limite
                      </Button>
                    </div>

                    <div className="flex justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePlanModel(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addPlanAvailableModel}>
                  + Ajouter un modèle accessible
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowPlanDialog(false)}>Annuler</Button><Button onClick={savePricingPlan}>Ajouter le plan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour créer un nouveau modèle */}
      <Dialog open={showNewModelDialog} onOpenChange={setShowNewModelDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouveau modèle AI</DialogTitle><DialogDescription>Renseignez toutes les caractéristiques du modèle</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            {/* Nom et fournisseur */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newModelName">Nom du modèle *</Label>
                <Input
                  id="newModelName"
                  value={currentNewModel.name}
                  onChange={(e) => setCurrentNewModel({ ...currentNewModel, name: e.target.value })}
                  placeholder="Ex: GPT-4"
                />
              </div>
              <div className="space-y-2">
                <Label>Fournisseur *</Label>
                <Select
                  value={currentNewModel.providerSelected || ''}
                  onValueChange={(val) => {
                    if (val === 'new') {
                      setCurrentNewModel({ ...currentNewModel, providerSelected: 'new', provider: '' });
                    } else {
                      setCurrentNewModel({ ...currentNewModel, providerSelected: val, provider: val });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingProviders.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    <SelectItem value="new">+ Ajouter un fournisseur</SelectItem>
                  </SelectContent>
                </Select>
                {currentNewModel.providerSelected === 'new' && (
                  <Input
                    placeholder="Nom du nouveau fournisseur"
                    value={currentNewModel.provider || ''}
                    onChange={(e) => setCurrentNewModel({ ...currentNewModel, provider: e.target.value })}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="newModelDesc">Description</Label>
              <Textarea
                id="newModelDesc"
                rows={3}
                value={currentNewModel.description}
                onChange={(e) => setCurrentNewModel({ ...currentNewModel, description: e.target.value })}
                placeholder="Description du modèle..."
              />
            </div>

            {/* Date de sortie et Open Source */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newModelRelease">Date de sortie</Label>
                <Input
                  id="newModelRelease"
                  type="date"
                  value={currentNewModel.releaseDate}
                  onChange={(e) => setCurrentNewModel({ ...currentNewModel, releaseDate: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Label htmlFor="newModelOpenSource">Open Source</Label>
                <Switch
                  id="newModelOpenSource"
                  checked={currentNewModel.isOpenSource}
                  onCheckedChange={(v) => setCurrentNewModel({ ...currentNewModel, isOpenSource: v })}
                />
              </div>
            </div>

            {/* API */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Possède une API</Label>
                <Switch
                  checked={currentNewModel.hasApi}
                  onCheckedChange={(v) => setCurrentNewModel({ ...currentNewModel, hasApi: v, apiUrl: v ? currentNewModel.apiUrl : '' })}
                />
              </div>
              {currentNewModel.hasApi && (
                <Input
                  placeholder="URL de l'API (optionnel)"
                  value={currentNewModel.apiUrl || ''}
                  onChange={(e) => setCurrentNewModel({ ...currentNewModel, apiUrl: e.target.value })}
                />
              )}
            </div>

            {/* Fonctionnalités (capacités) */}
            <div className="space-y-2">
              <Label>Fonctionnalités</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentNewModel.capabilities.map((cap, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {cap}
                    <button type="button" className="ml-1" onClick={() => removeCapability(idx)}>×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Nouvelle fonctionnalité (ex: Vision, Texte)"
                  value={newCapabilityInput}
                  onChange={(e) => setNewCapabilityInput(e.target.value)}
                />
                <Button type="button" size="sm" onClick={addNewModelCapability}>Ajouter</Button>
              </div>
            </div>

            {/* Performances (benchmarks) */}
            <div className="space-y-2">
              <Label>Performances</Label>
              {currentNewModel.performances.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-1">
                  <span>{p.domain}: {p.score}/100 {p.description && `(${p.description})`}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeModelPerformance(idx)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="grid gap-2 sm:grid-cols-3">
                <Input placeholder="Domaine (ex: MMLU)" value={newPerfDomain} onChange={(e) => setNewPerfDomain(e.target.value)} />
                <Input type="number" min="0" max="100" placeholder="Score" value={newPerfScore} onChange={(e) => setNewPerfScore(e.target.value)} />
              </div>
              <Button type="button" size="sm" onClick={addNewModelPerformance}>Ajouter une performance</Button>
            </div>



            {/* Plans tarifaires API (affiché uniquement si le modèle a une API) */}
            {currentNewModel.hasApi && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold">Plans tarifaires API</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    // Ajouter un nouveau plan vide dans la liste
                    setCurrentNewModel({
                      ...currentNewModel,
                      pricingPlans: [
                        ...currentNewModel.pricingPlans,
                        {
                          id: Date.now(),
                          name: '',
                          accessType: 'pay-as-you-go',
                          inputTokenPrice: 0,
                          outputTokenPrice: 0,
                          currency: '€',
                          quota: 0,
                          quotaPeriod: 'month',
                          limits: [], // tableau de { type, value, period }
                          capabilities: '',
                          overageRules: '',
                        }
                      ]
                    });
                  }}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter un plan
                  </Button>
                </div>

                {currentNewModel.pricingPlans.map((plan, idx) => (
                  <div key={plan.id || idx} className="border rounded-lg p-4 space-y-4 bg-muted/20">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">Plan #{idx + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newPlans = [...currentNewModel.pricingPlans];
                          newPlans.splice(idx, 1);
                          setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <Label>Nom du plan *</Label>
                        <Input
                          placeholder="Ex: Premium API"
                          value={plan.name}
                          onChange={(e) => {
                            const newPlans = [...currentNewModel.pricingPlans];
                            newPlans[idx].name = e.target.value;
                            setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Type d'accès</Label>
                          <Select
                            value={plan.accessType}
                            onValueChange={(val) => {
                              const newPlans = [...currentNewModel.pricingPlans];
                              newPlans[idx].accessType = val;
                              setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Type d'accès" />
                            </SelectTrigger>
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
                            value={plan.currency}
                            onChange={(e) => {
                              const newPlans = [...currentNewModel.pricingPlans];
                              newPlans[idx].currency = e.target.value;
                              setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                            }}
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
                            value={plan.inputTokenPrice}
                            onChange={(e) => {
                              const newPlans = [...currentNewModel.pricingPlans];
                              newPlans[idx].inputTokenPrice = parseFloat(e.target.value);
                              setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                            }}
                          />
                          <p className="text-xs text-muted-foreground">Ex: 0.001 = 0,001€ par 1 000 tokens</p>
                        </div>
                        <div>
                          <Label>Prix output (par token)</Label>
                          <Input
                            type="number"
                            step="0.000001"
                            placeholder="0.000002"
                            value={plan.outputTokenPrice}
                            onChange={(e) => {
                              const newPlans = [...currentNewModel.pricingPlans];
                              newPlans[idx].outputTokenPrice = parseFloat(e.target.value);
                              setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label>Quota inclus</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={plan.quota}
                            onChange={(e) => {
                              const newPlans = [...currentNewModel.pricingPlans];
                              newPlans[idx].quota = parseInt(e.target.value) || 0;
                              setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                            }}
                          />
                        </div>
                        <div className="w-32">
                          <Label>Période du quota</Label>
                          <Select
                            value={plan.quotaPeriod}
                            onValueChange={(val) => {
                              const newPlans = [...currentNewModel.pricingPlans];
                              newPlans[idx].quotaPeriod = val;
                              setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Période" />
                            </SelectTrigger>
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

                      {/* Gestion des limites détaillées */}
                      <div className="space-y-2">
                        <Label className="font-semibold">Limites d'utilisation</Label>
                        {plan.limits && plan.limits.length > 0 && (
                          <div className="space-y-2 mb-2">
                            {plan.limits.map((limit, lIdx) => (
                              <div key={lIdx} className="flex flex-wrap items-center gap-2 bg-background p-2 rounded-md border">
                                {/* Type de limite avec option personnalisée */}
                                <div className="flex-1 min-w-[120px]">
                                  <Select
                                    value={limit.type === 'custom' ? 'custom' : (limit.type || 'requests')}
                                    onValueChange={(val) => {
                                      const newPlans = [...currentNewModel.pricingPlans];
                                      if (val === 'custom') {
                                        newPlans[idx].limits[lIdx].type = 'custom';
                                        newPlans[idx].limits[lIdx].customType = '';
                                      } else {
                                        newPlans[idx].limits[lIdx].type = val;
                                        newPlans[idx].limits[lIdx].customType = undefined;
                                      }
                                      setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                                    }}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="messages">Messages</SelectItem>
                                      <SelectItem value="tokens">Tokens</SelectItem>
                                      <SelectItem value="requests">Requêtes</SelectItem>
                                      <SelectItem value="images">Images</SelectItem>
                                      <SelectItem value="custom">Autre</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {limit.type === 'custom' && (
                                    <Input
                                      placeholder="Type personnalisé (ex: caractères)"
                                      value={limit.customType || ''}
                                      onChange={(e) => {
                                        const newPlans = [...currentNewModel.pricingPlans];
                                        newPlans[idx].limits[lIdx].customType = e.target.value;
                                        setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                                      }}
                                      className="mt-1"
                                    />
                                  )}
                                </div>

                                {/* Valeur */}
                                <Input
                                  type="number"
                                  placeholder="Valeur"
                                  value={limit.value || ''}
                                  onChange={(e) => {
                                    const newPlans = [...currentNewModel.pricingPlans];
                                    newPlans[idx].limits[lIdx].value = e.target.value;
                                    setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                                  }}
                                  className="w-24"
                                />

                                {/* Période avec option personnalisée */}
                                <div className="flex-1 min-w-[140px]">
                                  <Select
                                    value={limit.period === 'custom' ? 'custom' : (limit.period || 'month')}
                                    onValueChange={(val) => {
                                      const newPlans = [...currentNewModel.pricingPlans];
                                      if (val === 'custom') {
                                        newPlans[idx].limits[lIdx].period = 'custom';
                                        newPlans[idx].limits[lIdx].customPeriod = '';
                                      } else {
                                        newPlans[idx].limits[lIdx].period = val;
                                        newPlans[idx].limits[lIdx].customPeriod = undefined;
                                      }
                                      setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                                    }}
                                  >
                                    <SelectTrigger className="w-28">
                                      <SelectValue placeholder="Période" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="hour">/ heure</SelectItem>
                                      <SelectItem value="day">/ jour</SelectItem>
                                      <SelectItem value="week">/ semaine</SelectItem>
                                      <SelectItem value="month">/ mois</SelectItem>
                                      <SelectItem value="year">/ an</SelectItem>
                                      <SelectItem value="total">total</SelectItem>
                                      <SelectItem value="custom">Personnalisé</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {limit.period === 'custom' && (
                                    <Input
                                      placeholder="Ex: 2 minutes, trimestre"
                                      value={limit.customPeriod || ''}
                                      onChange={(e) => {
                                        const newPlans = [...currentNewModel.pricingPlans];
                                        newPlans[idx].limits[lIdx].customPeriod = e.target.value;
                                        setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                                      }}
                                      className="mt-1"
                                    />
                                  )}
                                </div>

                                {/* Bouton suppression */}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newPlans = [...currentNewModel.pricingPlans];
                                    newPlans[idx].limits.splice(lIdx, 1);
                                    setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newPlans = [...currentNewModel.pricingPlans];
                            if (!newPlans[idx].limits) newPlans[idx].limits = [];
                            newPlans[idx].limits.push({
                              type: 'requests',
                              value: '',
                              period: 'month'
                            });
                            setCurrentNewModel({ ...currentNewModel, pricingPlans: newPlans });
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Ajouter une limite
                        </Button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Accès dans cet outil */}
            <div className="flex items-center gap-2">
              <Label>Accès dans cet outil :</Label>
              <Select value={currentNewModel.accessInTool} onValueChange={(v) => setCurrentNewModel({ ...currentNewModel, accessInTool: v })}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuit</SelectItem>
                  <SelectItem value="paid">Payant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowNewModelDialog(false)}>Annuler</Button><Button onClick={saveNewModel}>Ajouter le modèle</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}