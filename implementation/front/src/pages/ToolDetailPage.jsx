import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, Heart, Scale, ExternalLink, Share2, FileDown, Flag, Check, Play,
  Send, MessageSquare, Award, Cpu, FolderHeart, Tag, Hash, Trash2, Lock, AlertCircle,
  Plus, X, Info, Link as LinkIcon, DollarSign, Globe, Calendar, Building, Code, Zap,
  FileText, GitFork, Box, Layers, ShieldCheck, Target, Users, BookOpen, MessageCircle,
  ListChecks, FileSearch, HelpCircle, Sparkles, Edit, Save, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { AddToCollectionDialog } from '../components/ui/add-to-collection-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { ToolOwnFeatures } from '../components/ui/tool-own-features';
import { PricingPlansSection } from '../components/ui/pricing-plans';
import { toast } from 'sonner';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { useAuth } from '../contexts/auth-context';
import { useCompare } from '../contexts/compare-context';
import { cn } from '../lib/utils';
import Sidebar from '../components/layout/sidebar';
import CatalogAPI from '../services/catalogAPI';
import AdminAPI from '../services/adminAPI';

const pricingColors = {
  free: 'bg-success/10 text-success border-success/20',
  freemium: 'bg-info/10 text-info border-info/20',
  paid: 'bg-warning/10 text-warning border-warning/20'
};

const pricingLabels = {
  free: 'Gratuit',
  freemium: 'Freemium',
  paid: 'Payant'
};

const statusConfig = {
  actif: { label: 'Actif', className: 'bg-success/10 text-success border-success/20' },
  en_attente: { label: 'En attente de validation', className: 'bg-warning/10 text-warning border-warning/20' },
  refusé: { label: 'Rejeté', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  inactive: { label: 'Inactif', className: 'bg-muted/10 text-muted-foreground' }
};

function StarRating({ rating, size = 'default' }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className={cn('fill-warning text-warning', size === 'small' ? 'h-3 w-3' : 'h-4 w-4')} />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<Star key={i} className={cn('text-warning', size === 'small' ? 'h-3 w-3' : 'h-4 w-4')} />);
    } else {
      stars.push(<Star key={i} className={cn('text-muted-foreground/30', size === 'small' ? 'h-3 w-3' : 'h-4 w-4')} />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

function BenchmarkScore({ label, score, maxScore = 100 }) {
  const percentage = (score / maxScore) * 100;
  let colorClass = 'bg-success';
  if (score < 60) colorClass = 'bg-destructive';
  else if (score < 80) colorClass = 'bg-warning';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium capitalize">{label}</span>
        <span className="text-muted-foreground">{score}/{maxScore}</span>
      </div>
      <Progress value={percentage} className={cn('h-2', colorClass)} />
    </div>
  );
}

export default function ToolDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isFavorite, addFavorite, removeFavorite } = useAuth();
  const { addToolToCompare, removeToolFromCompare, isToolInCompare, canAddTool } = useCompare();

  const [tool, setTool] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiComments, setApiComments] = useState([]);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [promptResponse, setPromptResponse] = useState('');
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [commentReportId, setCommentReportId] = useState(null);
  const [commentReportDialogOpen, setCommentReportDialogOpen] = useState(false);
  const [commentReportReason, setCommentReportReason] = useState('');
  const [commentReportDescription, setCommentReportDescription] = useState('');
  const [isWritingComment, setIsWritingComment] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [imgError, setImgError] = useState(false);

  // États pour l’édition (réservée aux utilisateurs propriétaires en cas de rejet)
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [existingProviders, setExistingProviders] = useState([]);
  const [allPlatforms, setAllPlatforms] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // États pour le formulaire d’édition (identique à ProposeToolPage)
  const [editName, setEditName] = useState('');
  const [editProvider, setEditProvider] = useState('');
  const [editShortDescription, setEditShortDescription] = useState('');
  const [editLongDescription, setEditLongDescription] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editReleaseDate, setEditReleaseDate] = useState('');
  const [editIsOpenSource, setEditIsOpenSource] = useState(false);
  const [editSelectedCategories, setEditSelectedCategories] = useState([]);
  const [editCategorySearchQuery, setEditCategorySearchQuery] = useState('');
  const [editShowNewCategoryForm, setEditShowNewCategoryForm] = useState(false);
  const [editNewCategoryName, setEditNewCategoryName] = useState('');
  const [editNewCategoryDesc, setEditNewCategoryDesc] = useState('');
  const [editToolTags, setEditToolTags] = useState([]);
  const [editNewTagInput, setEditNewTagInput] = useState('');
  const [editAvailableTags, setEditAvailableTags] = useState([]);
  const [editSelectedPlatforms, setEditSelectedPlatforms] = useState([]);
  const [editCustomPlatform, setEditCustomPlatform] = useState('');
  const [editShowCustomPlatformInput, setEditShowCustomPlatformInput] = useState(false);
  const [editToolFeatures, setEditToolFeatures] = useState([]);
  const [editNewFeatureName, setEditNewFeatureName] = useState('');
  const [editNewFeatureDesc, setEditNewFeatureDesc] = useState('');
  const [editToolPerformances, setEditToolPerformances] = useState([]);
  const [editPerfDomain, setEditPerfDomain] = useState('');
  const [editPerfScore, setEditPerfScore] = useState(0);
  const [editPerfDesc, setEditPerfDesc] = useState('');
  const [editToolPricingPlans, setEditToolPricingPlans] = useState([]);
  const [editShowPlanDialog, setEditShowPlanDialog] = useState(false);
  const [editEditingPlan, setEditEditingPlan] = useState({
    nameTemplate: '', name: '', type: 'paid', price: 0, currency: '€', currencyOther: '',
    period: 'month', description: '', features: [], availableModels: []
  });
  const [editSelectedModels, setEditSelectedModels] = useState([]);
  const [editModelSearchQuery, setEditModelSearchQuery] = useState('');
  const [editShowNewModelDialog, setEditShowNewModelDialog] = useState(false);
  const [editCurrentNewModel, setEditCurrentNewModel] = useState({
    id: '', name: '', provider: '', providerSelected: '', description: '',
    releaseDate: '', isOpenSource: false, hasApi: false, apiUrl: '',
    capabilities: [], performances: [], tags: [], pricingPlans: [],
    accessInTool: 'paid'
  });
  const [editNewApiPlan, setEditNewApiPlan] = useState({
    name: '', accessType: 'pay-as-you-go', inputTokenPrice: 0, outputTokenPrice: 0,
    currency: '€', quota: 0, quotaPeriod: 'month', limits: '', capabilities: '', overageRules: ''
  });
  const [editNewCapabilityInput, setEditNewCapabilityInput] = useState('');
  const [editNewPerfDomain, setEditNewPerfDomain] = useState('');
  const [editNewPerfScore, setEditNewPerfScore] = useState('');
  const [editNewPerfDesc, setEditNewPerfDesc] = useState('');
  const [editNewTagInputModel, setEditNewTagInputModel] = useState('');
  const [editSelectedProvider, setEditSelectedProvider] = useState('');
  const [editNewProviderInput, setEditNewProviderInput] = useState('');
  const [editShowNewProvider, setEditShowNewProvider] = useState(false);
  const [editToolPricingType, setEditToolPricingType] = useState('freemium');

  // Chargement initial de l’outil et des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [toolData, modelsData, platformsData] = await Promise.all([
          CatalogAPI.tool(slug),
          CatalogAPI.models(),
          CatalogAPI.platforms()
        ]);
        setTool(toolData);
        setAllModels(modelsData);
        if (toolData) {
          const commentsData = await CatalogAPI.comments(toolData.id);
          setApiComments(commentsData);
        }
        let platformsList = [];
        if (platformsData && platformsData.platforms) platformsList = platformsData.platforms;
        else if (Array.isArray(platformsData)) platformsList = platformsData;
        setAllPlatforms(platformsList);
      } catch (error) {
        console.error('Erreur chargement', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Chargement des données nécessaires au formulaire d’édition (catégories, tags, etc.)
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [cats, mods, tagsRes] = await Promise.all([
          CatalogAPI.categories(),
          CatalogAPI.models(),
          CatalogAPI.tags ? CatalogAPI.tags() : Promise.resolve([]),
        ]);
        setCategories(cats || []);
        setModelsList(mods || []);
        setExistingTags(tagsRes || []);
        const providers = [...new Set((mods || []).map(m => m.provider).filter(Boolean))];
        setExistingProviders(providers);
      } catch (err) {
        console.error('Erreur chargement données formulaire', err);
      }
    };
    loadFormData();
  }, []);

  // Remplissage du formulaire d’édition avec les données actuelles de l’outil
  useEffect(() => {
    if (tool && isEditing) {
      setEditName(tool.name || '');
      setEditProvider(tool.provider || '');
      setEditShortDescription(tool.description || '');
      setEditLongDescription(tool.longDescription || '');
      setEditUrl(tool.url || '');
      setEditLogoUrl(tool.logo || '');
      setEditReleaseDate(tool.releaseDate ? tool.releaseDate.split('T')[0] : '');
      setEditIsOpenSource(tool.openSource || false);
      setEditSelectedCategories(tool.categories || []);
      setEditToolTags(tool.tags || []);
      setEditSelectedPlatforms(tool.platforms || []);
      setEditToolFeatures(tool.ownFeatures?.map(f => ({ name: f, description: '' })) || []);
      setEditToolPerformances(Object.entries(tool.benchmarks || {}).map(([domain, score]) => ({ domain, score, description: '' })));
      setEditToolPricingPlans(tool.pricingPlans || []);
      setEditSelectedModels(tool.aiModels?.map(m => ({
        id: m.modelId,
        name: m.name,
        provider: m.provider,
        accessInTool: m.accessType || 'paid',
        description: '',
        capabilities: []
      })) || []);
      setEditToolPricingType(tool.pricing || 'freemium');
    }
  }, [tool, isEditing]);

  // Mise à jour des tags disponibles
  useEffect(() => {
    setEditAvailableTags(existingTags.filter(t => !editToolTags.some(tt => tt.id === t.id)));
  }, [existingTags, editToolTags]);

  const comments = [...apiComments].reverse().map(comment => ({
    ...comment,
    replies: [...(comment.replies || [])].reverse()
  }));

  const toolStatus = tool?.status || 'actif';
  const isPublic = toolStatus === 'active';
  const canView = isPublic || isAuthenticated;
  const isOwner = isAuthenticated && user && tool && String(user.id) === String(tool.userId);
  const canEdit = isOwner && toolStatus === 'refusé' && (tool.tentativesEffectuees < tool.tentativesMax);

  console.log('Tool status:', toolStatus);
  console.log('User:', user);
  console.log('Is authenticated:', isAuthenticated);
  console.log('Tool:', tool);
  console.log('Can view:', canView, 'Is public:', isPublic, 'Is owner:', isOwner, 'Can edit:', canEdit);

  // Gestionnaires d’édition (identiques à ProposeToolPage)
  const addEditCategory = (category) => {
    if (!editSelectedCategories.some(c => c.id === category.id)) {
      setEditSelectedCategories([...editSelectedCategories, category]);
    }
  };
  const removeEditCategory = (categoryId) => {
    setEditSelectedCategories(editSelectedCategories.filter(c => c.id !== categoryId));
  };
  const createAndAddEditCategory = async () => {
    if (!editNewCategoryName.trim()) {
      toast.error('Nom requis');
      return;
    }
    try {
      const result = await AdminAPI.createCategory({
        name: editNewCategoryName.trim(),
        description: editNewCategoryDesc.trim(),
        icon: 'Layers'
      });
      const newCat = result.category;
      setCategories(prev => [...prev, newCat]);
      setEditSelectedCategories([...editSelectedCategories, newCat]);
      setEditNewCategoryName('');
      setEditNewCategoryDesc('');
      setEditShowNewCategoryForm(false);
      toast.success('Catégorie créée');
    } catch (err) {
      toast.error(err.message);
    }
  };
  const addEditToolFeature = () => {
    if (editNewFeatureName.trim()) {
      setEditToolFeatures([...editToolFeatures, { name: editNewFeatureName, description: editNewFeatureDesc }]);
      setEditNewFeatureName('');
      setEditNewFeatureDesc('');
    }
  };
  const removeEditToolFeature = (index) => {
    setEditToolFeatures(editToolFeatures.filter((_, i) => i !== index));
  };
  const addEditToolPerformance = () => {
    if (editPerfDomain.trim() && editPerfScore >= 0 && editPerfScore <= 100) {
      setEditToolPerformances([...editToolPerformances, { domain: editPerfDomain, score: editPerfScore, description: editPerfDesc }]);
      setEditPerfDomain('');
      setEditPerfScore(0);
      setEditPerfDesc('');
    }
  };
  const removeEditToolPerformance = (index) => {
    setEditToolPerformances(editToolPerformances.filter((_, i) => i !== index));
  };
  const addEditToolTag = () => {
    if (editNewTagInput.trim()) {
      if (!editToolTags.some(t => t.name === editNewTagInput.trim())) {
        setEditToolTags([...editToolTags, { id: `new-${Date.now()}`, name: editNewTagInput.trim(), isNew: true }]);
      }
      setEditNewTagInput('');
    }
  };
  const selectEditExistingTag = (tag) => {
    if (!editToolTags.some(t => t.id === tag.id)) setEditToolTags([...editToolTags, tag]);
  };
  const removeEditTag = (tagId) => {
    setEditToolTags(editToolTags.filter(t => t.id !== tagId));
  };
  const toggleEditPlatform = (platform) => {
    setEditSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };
  const addEditCustomPlatform = () => {
    if (editCustomPlatform.trim()) {
      const newPlatform = editCustomPlatform.trim();
      if (!allPlatforms.some(p => (p.name || p) === newPlatform)) {
        setAllPlatforms([...allPlatforms, { id: `custom-${Date.now()}`, name: newPlatform }]);
      }
      if (!editSelectedPlatforms.includes(newPlatform)) {
        setEditSelectedPlatforms([...editSelectedPlatforms, newPlatform]);
      }
      setEditCustomPlatform('');
      setEditShowCustomPlatformInput(false);
    }
  };
  const handleEditAddPlanFeature = () => {
    setEditEditingPlan({
      ...editEditingPlan,
      features: [...editEditingPlan.features, { name: '', limits: [] }]
    });
  };
  const updateEditPlanFeature = (idx, field, value) => {
    const newFeatures = [...editEditingPlan.features];
    newFeatures[idx] = { ...newFeatures[idx], [field]: value };
    setEditEditingPlan({ ...editEditingPlan, features: newFeatures });
  };
  const removeEditPlanFeature = (idx) => {
    setEditEditingPlan({
      ...editEditingPlan,
      features: editEditingPlan.features.filter((_, i) => i !== idx)
    });
  };
  const addEditPlanAvailableModel = () => {
    setEditEditingPlan({
      ...editEditingPlan,
      availableModels: [...editEditingPlan.availableModels, { modelId: '', limits: [] }]
    });
  };
  const updateEditPlanModel = (idx, field, value) => {
    const newModels = [...editEditingPlan.availableModels];
    newModels[idx] = { ...newModels[idx], [field]: value };
    setEditEditingPlan({ ...editEditingPlan, availableModels: newModels });
  };
  const removeEditPlanModel = (idx) => {
    setEditEditingPlan({
      ...editEditingPlan,
      availableModels: editEditingPlan.availableModels.filter((_, i) => i !== idx)
    });
  };
  const addEditFeatureLimit = (featureIdx) => {
    const newFeatures = [...editEditingPlan.features];
    if (!newFeatures[featureIdx].limits) newFeatures[featureIdx].limits = [];
    newFeatures[featureIdx].limits.push({ type: 'none', value: '', period: 'month' });
    setEditEditingPlan({ ...editEditingPlan, features: newFeatures });
  };
  const removeEditFeatureLimit = (featureIdx, limitIdx) => {
    const newFeatures = [...editEditingPlan.features];
    newFeatures[featureIdx].limits.splice(limitIdx, 1);
    setEditEditingPlan({ ...editEditingPlan, features: newFeatures });
  };
  const updateEditFeatureLimit = (featureIdx, limitIdx, field, value) => {
    const newFeatures = [...editEditingPlan.features];
    newFeatures[featureIdx].limits[limitIdx][field] = value;
    setEditEditingPlan({ ...editEditingPlan, features: newFeatures });
  };
  const addEditModelLimit = (modelIdx) => {
    const newModels = [...editEditingPlan.availableModels];
    if (!newModels[modelIdx].limits) newModels[modelIdx].limits = [];
    newModels[modelIdx].limits.push({ type: 'none', value: '', period: 'month' });
    setEditEditingPlan({ ...editEditingPlan, availableModels: newModels });
  };
  const updateEditModelLimit = (modelIdx, limitIdx, field, value) => {
    const newModels = [...editEditingPlan.availableModels];
    newModels[modelIdx].limits[limitIdx][field] = value;
    setEditEditingPlan({ ...editEditingPlan, availableModels: newModels });
  };
  const removeEditModelLimit = (modelIdx, limitIdx) => {
    const newModels = [...editEditingPlan.availableModels];
    newModels[modelIdx].limits.splice(limitIdx, 1);
    setEditEditingPlan({ ...editEditingPlan, availableModels: newModels });
  };
  const resetEditEditingPlan = () => {
    setEditEditingPlan({
      nameTemplate: '', name: '', type: 'paid', price: 0, currency: '€', currencyOther: '',
      period: 'month', description: '', features: [], availableModels: []
    });
  };
  const saveEditPricingPlan = () => {
    if (!editEditingPlan.name) return;
    const newPlan = {
      name: editEditingPlan.name,
      type: editEditingPlan.type,
      price: editEditingPlan.price,
      currency: editEditingPlan.currency,
      period: editEditingPlan.period,
      description: editEditingPlan.description,
      features: editEditingPlan.features.map(f => ({
        name: f.name,
        limits: (f.limits || []).filter(l => l.type !== 'none' || (l.type === 'none' && l.value))
      })),
      availableModels: editEditingPlan.availableModels.map(m => ({
        modelId: m.modelId,
        limits: (m.limits || []).filter(l => l.type !== 'none' || (l.type === 'none' && l.value))
      }))
    };
    setEditToolPricingPlans([...editToolPricingPlans, newPlan]);
    setEditShowPlanDialog(false);
    resetEditEditingPlan();
  };
  const removeEditPricingPlan = (index) => {
    setEditToolPricingPlans(editToolPricingPlans.filter((_, i) => i !== index));
  };
  const handleEditAddExistingModel = (modelId) => {
    const model = modelsList.find(m => m.id === modelId);
    if (model && !editSelectedModels.find(m => m.id === model.id)) {
      setEditSelectedModels([...editSelectedModels, {
        id: model.id,
        name: model.name,
        provider: model.provider,
        description: model.description,
        type: model.type || '',
        accessInTool: 'paid',
        capabilities: model.capabilities || [],
        performances: [],
      }]);
    }
  };
  const updateEditModelAccessInTool = (modelId, access) => {
    setEditSelectedModels(editSelectedModels.map(m =>
      m.id === modelId ? { ...m, accessInTool: access } : m
    ));
  };
  const removeEditModel = (modelId) => {
    setEditSelectedModels(editSelectedModels.filter(m => m.id !== modelId));
  };
  const openEditNewModelDialog = () => {
    setEditCurrentNewModel({
      id: `new-${Date.now()}`, name: '', provider: '', providerSelected: '', description: '',
      releaseDate: '', isOpenSource: false, hasApi: false, apiUrl: '',
      capabilities: [], performances: [], pricingPlans: [],
      accessInTool: 'paid'
    });
    setEditShowNewModelDialog(true);
  };
  const addEditNewModelCapability = () => {
    if (editNewCapabilityInput.trim()) {
      setEditCurrentNewModel({
        ...editCurrentNewModel,
        capabilities: [...editCurrentNewModel.capabilities, editNewCapabilityInput.trim()]
      });
      setEditNewCapabilityInput('');
    }
  };
  const addEditNewModelPerformance = () => {
    if (editNewPerfDomain.trim() && editNewPerfScore) {
      setEditCurrentNewModel({
        ...editCurrentNewModel,
        performances: [...editCurrentNewModel.performances, {
          domain: editNewPerfDomain.trim(),
          score: parseInt(editNewPerfScore),
          description: editNewPerfDesc.trim()
        }]
      });
      setEditNewPerfDomain('');
      setEditNewPerfScore('');
      setEditNewPerfDesc('');
    }
  };
  const addEditNewModelPricingPlan = () => {
    if (!editNewApiPlan.name) return;
    const plan = {
      name: editNewApiPlan.name,
      accessType: editNewApiPlan.accessType,
      inputTokenPrice: editNewApiPlan.inputTokenPrice,
      outputTokenPrice: editNewApiPlan.outputTokenPrice,
      currency: editNewApiPlan.currency,
      quota: editNewApiPlan.quota,
      quotaPeriod: editNewApiPlan.quotaPeriod,
      limits: editNewApiPlan.limits,
      capabilities: editNewApiPlan.capabilities,
      overageRules: editNewApiPlan.overageRules,
    };
    setEditCurrentNewModel({
      ...editCurrentNewModel,
      pricingPlans: [...editCurrentNewModel.pricingPlans, plan]
    });
    setEditNewApiPlan({
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
  const removeEditCapability = (idx) => {
    setEditCurrentNewModel({
      ...editCurrentNewModel,
      capabilities: editCurrentNewModel.capabilities.filter((_, i) => i !== idx)
    });
  };
  const removeEditModelPerformance = (idx) => {
    setEditCurrentNewModel({
      ...editCurrentNewModel,
      performances: editCurrentNewModel.performances.filter((_, i) => i !== idx)
    });
  };
  const removeEditModelPricingPlan = (idx) => {
    setEditCurrentNewModel({
      ...editCurrentNewModel,
      pricingPlans: editCurrentNewModel.pricingPlans.filter((_, i) => i !== idx)
    });
  };
  const saveEditNewModel = () => {
    if (!editCurrentNewModel.name || !editCurrentNewModel.provider) {
      toast.error('Nom et fournisseur requis');
      return;
    }
    setEditSelectedModels([...editSelectedModels, { ...editCurrentNewModel, isNew: true }]);
    setEditShowNewModelDialog(false);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) { toast.error('Le nom est requis'); return; }
    if (!editShortDescription.trim()) { toast.error('La description courte est requise'); return; }
    if (!editLongDescription.trim()) { toast.error('La description détaillée est requise'); return; }
    if (!editUrl.trim()) { toast.error("L'URL est requise"); return; }
    if (editSelectedCategories.length === 0) {
      toast.error('Veuillez sélectionner au moins une catégorie');
      return;
    }
    if (editSelectedModels.length === 0) { toast.error('Veuillez sélectionner au moins un modèle AI'); return; }
    const finalProvider = editShowNewProvider ? editNewProviderInput : editSelectedProvider;
    if (!finalProvider) { toast.error('Le fournisseur est requis'); return; }

    setIsSubmittingEdit(true);
    const payload = {
      id: tool.id,
      name: editName,
      shortDescription: editShortDescription,
      longDescription: editLongDescription,
      url: editUrl,
      logoUrl: editLogoUrl,
      releaseDate: editReleaseDate,
      isOpenSource: editIsOpenSource,
      provider: finalProvider,
      pricingType: editToolPricingType,
      categoryIds: editSelectedCategories.map(c => c.id),
      tags: editToolTags,
      platforms: editSelectedPlatforms,
      features: editToolFeatures.map(f => f.name),
      performances: editToolPerformances,
      pricingPlans: editToolPricingPlans,
      models: editSelectedModels,
    };
    try {
      // Utilisation d’AdminAPI.updateTool (à adapter si besoin d’une route spécifique utilisateur)
      // Le backend devra vérifier que l’utilisateur est propriétaire et que le statut est rejeté avec tentatives restantes
      await AdminAPI.updateTool(tool.id, payload);
      toast.success('Proposition mise à jour et renvoyée pour validation');
      setIsEditing(false);
      // Recharger l’outil pour afficher les nouvelles données et décrémenter les tentatives
      const updatedTool = await CatalogAPI.tool(slug);
      setTool(updatedTool);
    } catch (err) {
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Gestionnaires des commentaires, favoris, etc. (inchangés)
  const handleAddComment = () => {
    if (!newCommentContent.trim()) return;
    CatalogAPI.addComment({ toolId: tool.id, content: newCommentContent })
      .then((updatedComments) => {
        setApiComments(updatedComments);
        setNewCommentContent('');
        setIsWritingComment(false);
        toast.success('Commentaire publié');
      })
      .catch(() => toast.error('Erreur lors de la publication'));
  };
  const handleAddReply = (parentId) => {
    if (!replyContent.trim()) return;
    CatalogAPI.addComment({ toolId: tool.id, content: replyContent, parentId })
      .then((updatedComments) => {
        setApiComments(updatedComments);
        setReplyContent('');
        setReplyingTo(null);
        toast.success('Réponse publiée');
      })
      .catch(() => toast.error('Erreur lors de la réponse'));
  };
  const handleDeleteComment = (commentId) => {
    CatalogAPI.deleteComment(commentId)
      .then(() => {
        CatalogAPI.comments(tool.id).then(setApiComments);
        toast.success('Commentaire supprimé');
      })
      .catch(() => toast.error('Erreur lors de la suppression'));
  };
  const handleCommentReport = () => {
    if (!commentReportReason) {
      toast.error('Veuillez sélectionner un motif');
      return;
    }
    CatalogAPI.report({
      toolId: tool.id,
      commentId: commentReportId,
      reason: commentReportReason,
      details: commentReportDescription
    })
      .then(() => {
        toast.success('Commentaire signalé');
        setCommentReportDialogOpen(false);
        setCommentReportReason('');
        setCommentReportDescription('');
        setCommentReportId(null);
      })
      .catch(() => toast.error('Erreur lors du signalement'));
  };
  const handleAddToCollection = () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux collections');
      return;
    }
    setShowAddToCollection(true);
  };
  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }
    if (isFavorite(tool.id)) {
      removeFavorite(tool.id);
      toast.success('Retiré des favoris');
    } else {
      addFavorite(tool.id);
      toast.success('Ajouté aux favoris');
    }
  };
  const handleCompareClick = () => {
    if (isToolInCompare(tool.id)) {
      removeToolFromCompare(tool.id);
      toast.success('Retiré de la comparaison');
    } else if (canAddTool) {
      addToolToCompare(tool);
      toast.success('Ajouté à la comparaison');
    } else {
      toast.error('Maximum 3 outils en comparaison');
    }
  };
  const handlePromptTest = async () => {
    if (!promptInput.trim()) return;
    setIsPromptLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPromptResponse(`Réponse simulée pour: "${promptInput}"\n\nCeci est une démonstration.`);
    setIsPromptLoading(false);
  };
  const handleGeneratePDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(tool.name, 20, 20);
    doc.setFontSize(12);
    const categoriesNames = (tool.categories || []).map(cat => cat.name).join(', ') || 'N/A';
    doc.text(`Catégories: ${categoriesNames}`, 20, 35);
    doc.text(`Note: ${tool.rating}/5 (${tool.reviewCount} avis)`, 20, 45);
    doc.text(`Tarification: ${pricingLabels[tool.pricing]}`, 20, 55);
    doc.setFontSize(14);
    doc.text('Description', 20, 70);
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(tool.longDescription, 170);
    doc.text(descLines, 20, 80);
    const platformsY = 80 + descLines.length * 5 + 10;
    doc.setFontSize(14);
    doc.text('Plateformes', 20, platformsY);
    doc.setFontSize(10);
    doc.text((tool.platforms || []).join(', '), 20, platformsY + 10);
    doc.setFontSize(14);
    doc.text('Modèles AI', 20, platformsY + 25);
    doc.setFontSize(10);
    (tool.aiModels || []).forEach((m, i) => {
      const model = allModels.find(mod => mod.id === m.modelId);
      doc.text(`• ${model?.name || m.name || m.modelId} (${m.accessType === 'free' ? 'Gratuit' : 'Payant'})`, 25, platformsY + 35 + i * 7);
    });
    doc.text(`URL: ${tool.url}`, 20, 280);
    doc.save(`${tool.slug}-info.pdf`);
    toast.success('PDF généré');
  };
  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Veuillez sélectionner un motif');
      return;
    }
    try {
      await CatalogAPI.report({
        toolId: tool.id,
        reason: reportReason,
        details: 'Signalement depuis la page détail'
      });
      toast.success('Signalement envoyé');
      setReportDialogOpen(false);
      setReportReason('');
    } catch (error) {
      toast.error('Erreur lors du signalement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1"><Sidebar /><main className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main></div>
        <Footer />
      </div>
    );
  }
  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header /><div className="flex flex-1"><Sidebar /><main className="flex-1 text-center py-12"><h1>Outil non trouvé</h1><Link to="/tools"><Button>Voir tous</Button></Link></main></div><Footer />
      </div>
    );
  }
  if (!canView) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header /><div className="flex flex-1"><Sidebar /><main className="flex-1 text-center py-12"><Lock className="mx-auto h-12 w-12 text-muted-foreground" /><h1>Accès restreint</h1><p>Outils en validation.</p><Link to="/login"><Button>Se connecter</Button></Link></main></div><Footer />
      </div>
    );
  }

  const isInCompare = isToolInCompare(tool.id);
  const isFav = isFavorite(tool.id);
  const statusDisplay = statusConfig[toolStatus] || { label: toolStatus, className: 'bg-muted/10' };
  const rejectionReason = tool.adminNote || null;

  // Rendu du formulaire d’édition (identique à ProposeToolPage, mais avec les états préfixés "edit")
  if (isEditing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              <Button variant="ghost" size="sm" className="mb-4" onClick={() => setIsEditing(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Annuler la modification
              </Button>
              <form onSubmit={handleSubmitEdit} className="space-y-6">
                <Accordion type="multiple" defaultValue={["general"]}>
                  {/* Informations générales */}
                  <AccordionItem value="general" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Informations générales</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Nom de l'outil *</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
                        <div><Label>Fournisseur / Éditeur *</Label>
                          <Select value={editSelectedProvider} onValueChange={(val) => {
                            if (val === 'new') { setEditShowNewProvider(true); setEditSelectedProvider(''); }
                            else { setEditShowNewProvider(false); setEditSelectedProvider(val); }
                          }}>
                            <SelectTrigger><SelectValue placeholder="Choisir un fournisseur" /></SelectTrigger>
                            <SelectContent>
                              {existingProviders.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                              <SelectItem value="new">+ Ajouter un fournisseur</SelectItem>
                            </SelectContent>
                          </Select>
                          {editShowNewProvider && <Input placeholder="Nom du nouveau fournisseur" value={editNewProviderInput} onChange={(e) => setEditNewProviderInput(e.target.value)} />}
                        </div>
                      </div>
                      <div><Label>Description courte *</Label><Input value={editShortDescription} onChange={(e) => setEditShortDescription(e.target.value)} maxLength={100} /></div>
                      <div><Label>Description détaillée *</Label><Textarea rows={5} value={editLongDescription} onChange={(e) => setEditLongDescription(e.target.value)} /></div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Site officiel *</Label><Input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} /></div>
                        <div><Label>Logo (URL)</Label><Input type="url" value={editLogoUrl} onChange={(e) => setEditLogoUrl(e.target.value)} /></div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Date de sortie</Label><Input type="date" value={editReleaseDate} onChange={(e) => setEditReleaseDate(e.target.value)} /></div>
                        <div className="flex items-center gap-3 mt-6"><Label>Open Source</Label><Switch checked={editIsOpenSource} onCheckedChange={setEditIsOpenSource} /></div>
                      </div>
                      <div><Label>Type de tarification *</Label>
                        <Select value={editToolPricingType} onValueChange={setEditToolPricingType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="free">Gratuit</SelectItem><SelectItem value="freemium">Freemium</SelectItem><SelectItem value="paid">Payant</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Catégories */}
                  <AccordionItem value="category_tags" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Catégories</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {editSelectedCategories.map(cat => (
                          <Badge key={cat.id} variant="secondary" className="gap-1">
                            {cat.name}
                            <button type="button" onClick={() => removeEditCategory(cat.id)} className="ml-1">×</button>
                          </Badge>
                        ))}
                      </div>
                      <Input placeholder="Rechercher une catégorie..." value={editCategorySearchQuery} onChange={(e) => setEditCategorySearchQuery(e.target.value)} />
                      <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                        {categories.filter(cat => !editSelectedCategories.some(c => c.id === cat.id) && cat.name.toLowerCase().includes(editCategorySearchQuery.toLowerCase())).map(cat => (
                          <div key={cat.id} className="flex justify-between p-2 hover:bg-muted cursor-pointer" onClick={() => addEditCategory(cat)}>
                            <span>{cat.name}</span><Plus className="h-4 w-4" />
                          </div>
                        ))}
                      </div>
                      {editShowNewCategoryForm ? (
                        <div className="space-y-2 border p-3 rounded">
                          <Input placeholder="Nom" value={editNewCategoryName} onChange={(e) => setEditNewCategoryName(e.target.value)} />
                          <Input placeholder="Description" value={editNewCategoryDesc} onChange={(e) => setEditNewCategoryDesc(e.target.value)} />
                          <div className="flex gap-2">
                            <Button type="button" size="sm" onClick={createAndAddEditCategory}>Créer</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setEditShowNewCategoryForm(false)}>Annuler</Button>
                          </div>
                        </div>
                      ) : (
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditShowNewCategoryForm(true)}>+ Nouvelle catégorie</Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Tags (simplifié – reprendre le même code que ProposeToolPage) */}
                  <AccordionItem value="tags" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Tags</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex flex-wrap gap-2">{editToolTags.map(tag => <Badge key={tag.id} variant="secondary">{tag.name}<button onClick={() => removeEditTag(tag.id)} className="ml-1">×</button></Badge>)}</div>
                      <div className="flex gap-2"><Input placeholder="Nouveau tag" value={editNewTagInput} onChange={(e) => setEditNewTagInput(e.target.value)} /><Button type="button" size="sm" onClick={addEditToolTag}>Ajouter</Button></div>
                      {editAvailableTags.length > 0 && <div className="border p-2"><p className="text-xs">Tags existants :</p><div className="flex flex-wrap gap-1">{editAvailableTags.map(tag => <Badge key={tag.id} variant="outline" className="cursor-pointer" onClick={() => selectEditExistingTag(tag)}>+ {tag.name}</Badge>)}</div></div>}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Plateformes */}
                  <AccordionItem value="platforms" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Plateformes</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex flex-wrap gap-2">{allPlatforms.map(p => {
                        const name = p.name || p;
                        return <Badge key={name} variant={editSelectedPlatforms.includes(name) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleEditPlatform(name)}>{name}</Badge>;
                      })}</div>
                      {editShowCustomPlatformInput ? (
                        <div className="flex gap-2"><Input placeholder="Nouvelle plateforme" value={editCustomPlatform} onChange={(e) => setEditCustomPlatform(e.target.value)} /><Button size="sm" onClick={addEditCustomPlatform}>Ajouter</Button><Button variant="ghost" size="sm" onClick={() => setEditShowCustomPlatformInput(false)}>Annuler</Button></div>
                      ) : <Button type="button" variant="outline" size="sm" onClick={() => setEditShowCustomPlatformInput(true)}>+ Ajouter une plateforme</Button>}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Fonctionnalités propres */}
                  <AccordionItem value="features" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Fonctionnalités propres</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {editToolFeatures.map((f, idx) => <div key={idx} className="flex justify-between"><span>{f.name}</span><Button variant="ghost" size="sm" onClick={() => removeEditToolFeature(idx)}><X className="h-4 w-4" /></Button></div>)}
                      <div><Input placeholder="Nom" value={editNewFeatureName} onChange={(e) => setEditNewFeatureName(e.target.value)} /><Textarea placeholder="Description" value={editNewFeatureDesc} onChange={(e) => setEditNewFeatureDesc(e.target.value)} rows={2} /><Button size="sm" onClick={addEditToolFeature}>Ajouter</Button></div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Performances */}
                  <AccordionItem value="performances" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Performances</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {editToolPerformances.map((p, idx) => <div key={idx} className="flex justify-between"><span>{p.domain}: {p.score}/100</span><Button variant="ghost" size="sm" onClick={() => removeEditToolPerformance(idx)}><X className="h-4 w-4" /></Button></div>)}
                      <div className="grid grid-cols-3 gap-2"><Input placeholder="Domaine" value={editPerfDomain} onChange={(e) => setEditPerfDomain(e.target.value)} /><Input type="number" placeholder="Score" value={editPerfScore} onChange={(e) => setEditPerfScore(Number(e.target.value))} /></div>
                      <Button size="sm" onClick={addEditToolPerformance}>Ajouter</Button>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Modèles AI */}
                  <AccordionItem value="models" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Modèles AI utilisés</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {editSelectedModels.map(model => (
                        <Card key={model.id} className="p-4">
                          <div className="flex justify-between"><div><h4>{model.name}</h4><p>{model.provider}</p><Badge variant={model.accessInTool === 'free' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => updateEditModelAccessInTool(model.id, model.accessInTool === 'free' ? 'paid' : 'free')}>{model.accessInTool === 'free' ? 'Gratuit' : 'Payant'}</Badge></div><Button variant="ghost" size="sm" onClick={() => removeEditModel(model.id)}><X /></Button></div>
                        </Card>
                      ))}
                      <div className="flex gap-2"><Input placeholder="Rechercher un modèle..." value={editModelSearchQuery} onChange={(e) => setEditModelSearchQuery(e.target.value)} /><Button type="button" variant="outline" onClick={openEditNewModelDialog}>+ Créer un modèle</Button></div>
                      <div className="border p-2 max-h-40 overflow-auto">{modelsList.filter(m => !editSelectedModels.some(s => s.id === m.id) && (m.name.toLowerCase().includes(editModelSearchQuery.toLowerCase()) || (m.provider || '').toLowerCase().includes(editModelSearchQuery.toLowerCase()))).map(m => <div key={m.id} className="flex justify-between p-1 hover:bg-muted cursor-pointer" onClick={() => handleEditAddExistingModel(m.id)}><span>{m.name} ({m.provider})</span><Plus className="h-4 w-4" /></div>)}</div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Plans tarifaires */}
                  <AccordionItem value="pricing" className="border rounded-lg p-4">
                    <AccordionTrigger className="text-lg font-semibold">Plans tarifaires</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {editToolPricingPlans.map((plan, idx) => <Card key={idx} className="p-4"><div className="flex justify-between"><div><h4>{plan.name}</h4><p>{plan.price}{plan.currency} / {plan.period}</p></div><Button variant="ghost" size="sm" onClick={() => removeEditPricingPlan(idx)}><Trash2 /></Button></div></Card>)}
                      <Button type="button" variant="outline" onClick={() => setEditShowPlanDialog(true)}>+ Ajouter un plan</Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                  <Button type="submit" disabled={isSubmittingEdit}>{isSubmittingEdit ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Envoyer la modification</Button>
                </div>
              </form>
            </div>
          </main>
        </div>
        <Footer />
        {/* Dialogues de plans et de nouveau modèle (similaires à ProposeToolPage) – omis pour brièveté, à recopier */}
      </div>
    );
  }

  // Rendu normal (affichage)
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Link to="/tools"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Tous les outils</Button></Link>
            {/* En-tête */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
                {tool.logo && !imgError ? <img src={tool.logo} alt={tool.name} className="max-w-full max-h-full object-contain" onError={() => setImgError(true)} /> : <span className="text-3xl font-bold text-primary">{tool.name?.charAt(0)}</span>}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className={pricingColors[tool.pricing]}>{pricingLabels[tool.pricing]}</Badge>
                  {tool.featured && <Badge className="bg-primary text-primary-foreground">En vedette</Badge>}
                  {isAuthenticated && <Badge variant="outline" className={statusDisplay.className}>{statusDisplay.label}</Badge>}
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{tool.name}</h1>
                <p className="text-muted-foreground mb-4">{tool.description}</p>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2"><StarRating rating={tool.rating} /><span>{tool.rating.toFixed(1)}</span><span>({tool.reviewCount} avis)</span></div>
                  <div className="flex items-center gap-1">{tool.platforms.map(p => <Badge key={p} variant="secondary" className="capitalize">{p}</Badge>)}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer"><Button>Visiter <ExternalLink className="ml-2 h-4 w-4" /></Button></a>
                  <Button variant={isInCompare ? 'secondary' : 'outline'} onClick={handleCompareClick}>{isInCompare ? <Check className="mr-2 h-4 w-4" /> : <Scale className="mr-2 h-4 w-4" />}{isInCompare ? 'Comparé' : 'Comparer'}</Button>
                  <Button variant="outline" onClick={handleFavoriteClick} className={cn(isFav && 'text-destructive border-destructive/50')}><Heart className={cn('mr-2 h-4 w-4', isFav && 'fill-current')} />{isFav ? 'Favori' : 'Ajouter'}</Button>
                  <Button variant="outline" onClick={handleAddToCollection}><FolderHeart className="mr-2 h-4 w-4" />Collection</Button>
                  <Button variant="ghost" size="icon" onClick={handleGeneratePDF}><FileDown className="h-4 w-4" /></Button>
                  <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <DialogTrigger asChild><Button variant="ghost" size="icon"><Flag className="h-4 w-4" /></Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Signaler</DialogTitle></DialogHeader><Select onValueChange={setReportReason}><SelectTrigger><SelectValue placeholder="Motif" /></SelectTrigger><SelectContent><SelectItem value="deprecated">Déprécié</SelectItem><SelectItem value="outdated">Non à jour</SelectItem><SelectItem value="unavailable">Indisponible</SelectItem><SelectItem value="incorrect">Erreur</SelectItem><SelectItem value="other">Autre</SelectItem></SelectContent></Select><Button onClick={handleReport}>Envoyer</Button></DialogContent>
                  </Dialog>
                  {canEdit && <Button variant="outline" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" />Modifier la proposition</Button>}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="comments">Commentaires ({comments.length})</TabsTrigger>
                {tool.hasApiTest && <TabsTrigger value="test"><Play className="h-4 w-4 mr-1" />Tester</TabsTrigger>}
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <Card><CardHeader><CardTitle>Description</CardTitle></CardHeader><CardContent><p className="whitespace-pre-line">{tool.longDescription}</p></CardContent></Card>
                    <Card><CardHeader><CardTitle>Modèles AI utilisés</CardTitle></CardHeader><CardContent><div className="space-y-4">{tool.aiModels.map(m => {
                      const model = allModels.find(mod => mod.id === m.modelId);
                      return <div key={m.modelId} className="border rounded-lg p-4"><Link to={`/models/${m.modelId}`} className="flex justify-between"><div><p className="font-semibold">{model?.name || m.modelId}</p><p className="text-sm text-muted-foreground">{model?.provider}</p></div><Badge className={m.accessType === 'free' ? 'bg-success' : 'bg-warning'}>{m.accessType === 'free' ? 'Gratuit' : 'Payant'}</Badge></Link>{Object.keys(model?.benchmarks || {}).length > 0 && <div className="mt-2 pt-2 border-t"><div className="flex items-center gap-1 text-xs font-medium mb-2"><Cpu className="h-3 w-3" /> Performances</div><div className="grid grid-cols-2 gap-2">{Object.entries(model.benchmarks).map(([k, v]) => <BenchmarkScore key={k} label={k} score={v} />)}</div></div>}</div>;
                    })}</div></CardContent></Card>
                    <Card><CardHeader><CardTitle>Fonctionnalités</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{tool.functions.map(f => <Badge key={f} variant="secondary" className="capitalize">{f}</Badge>)}</div></CardContent></Card>
                    {tool.ownFeatures?.length > 0 && <ToolOwnFeatures features={tool.ownFeatures} />}
                    {tool.pricingPlans?.length > 0 && <PricingPlansSection plans={tool.pricingPlans} type="tool" />}
                    {Object.keys(tool.benchmarks || {}).length > 0 && <Card><CardHeader><CardTitle>Performances</CardTitle></CardHeader><CardContent className="space-y-3">{Object.entries(tool.benchmarks).map(([k, v]) => <BenchmarkScore key={k} label={k} score={v} />)}</CardContent></Card>}
                  </div>
                  <div className="space-y-6">
                    {toolStatus === 'refusé' && rejectionReason && <Card className="border-destructive/30 bg-destructive/5"><CardHeader><CardTitle className="text-destructive">Motif du rejet</CardTitle></CardHeader><CardContent><p>{rejectionReason}</p></CardContent></Card>}
                    {isAuthenticated && toolStatus !== 'active' && tool.tentativesMax > 0 && <Card><CardHeader><CardTitle>Tentatives de soumission</CardTitle></CardHeader><CardContent><Progress value={(tool.tentativesEffectuees / tool.tentativesMax) * 100} className="h-2 mb-2" /><p>{tool.tentativesEffectuees} / {tool.tentativesMax} tentatives utilisées</p>{tool.tentativesEffectuees >= tool.tentativesMax && <p className="text-xs text-destructive mt-2">Maximum atteint, modification impossible.</p>}</CardContent></Card>}
                    <Card><CardHeader><CardTitle>Catégories</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{(tool.categories || []).map(cat => <Link key={cat.id} to={`/categories/${cat.slug}`}><Badge variant="secondary"><Hash className="h-3 w-3 mr-1" />{cat.name}</Badge></Link>)}</div></CardContent></Card>
                    <Card><CardHeader><CardTitle>Notes et avis</CardTitle></CardHeader><CardContent><div className="text-center"><div className="text-4xl font-bold">{(tool.averageRating || tool.rating).toFixed(1)}</div><StarRating rating={tool.rating} /><p className="text-sm mt-1">Basé sur {tool.reviewCount} avis</p>{tool.totalUsers && <p className="text-xs">{tool.totalUsers} utilisateurs</p>}</div></CardContent></Card>
                    <Card><CardHeader><CardTitle>Informations</CardTitle></CardHeader><CardContent className="space-y-3">{tool.releaseDate && <div className="flex justify-between"><span>Date de sortie</span><span>{new Date(tool.releaseDate).toLocaleDateString()}</span></div>}{tool.openSource !== undefined && <div><span>Open Source</span><span>{tool.openSource ? 'Oui' : 'Non'}</span></div>}{tool.provider && <div><span>Éditeur</span><span>{tool.provider}</span></div>}<div><span>Modèles IA</span><span>{tool.aiModels.length}</span></div><div><span>Plans tarifaires</span><span>{tool.pricingPlans?.length || 0}</span></div></CardContent></Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <div className="space-y-6">
                  {isAuthenticated ? <Card><CardContent className="p-4">{!isWritingComment ? <div className="flex items-center justify-between"><MessageSquare /> <Button onClick={() => setIsWritingComment(true)}>Écrire un commentaire</Button></div> : <div><Textarea value={newCommentContent} onChange={e => setNewCommentContent(e.target.value)} /><div className="flex justify-end gap-2 mt-2"><Button variant="outline" onClick={() => setIsWritingComment(false)}>Annuler</Button><Button onClick={handleAddComment}>Publier</Button></div></div>}</CardContent></Card> : <Card><CardContent><p>Connectez-vous pour commenter.</p></CardContent></Card>}
                  {comments.map(comment => <Card key={comment.id}><CardContent className="p-4"><div className="flex gap-4"><Avatar><AvatarImage src={comment.userAvatar} /><AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback></Avatar><div className="flex-1"><div className="flex justify-between"><span className="font-medium">{comment.userName}</span><span className="text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span></div><p>{comment.content}</p><div className="mt-2 flex gap-3"><Button variant="ghost" size="sm" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}><MessageSquare className="h-3.5 w-3.5 mr-1" />Répondre</Button>{user && String(user.id) === String(comment.userId) ? <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteComment(comment.id)}>Supprimer</Button> : <Button variant="ghost" size="sm" onClick={() => { setCommentReportId(comment.id); setCommentReportDialogOpen(true); }}>Signaler</Button>}</div>{replyingTo === comment.id && <div className="mt-3"><Textarea placeholder="Votre réponse..." value={replyContent} onChange={e => setReplyContent(e.target.value)} /><div className="flex justify-end gap-2 mt-2"><Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>Annuler</Button><Button size="sm" onClick={() => handleAddReply(comment.id)}>Publier</Button></div></div>}{comment.replies?.map(reply => <div key={reply.id} className="mt-3 pl-4 border-l"><div className="flex justify-between"><span className="font-medium text-sm">{reply.userName}</span><span className="text-xs">{new Date(reply.createdAt).toLocaleDateString()}</span></div><p className="text-sm">{reply.content}</p><div className="mt-1 flex gap-3">{user && String(user.id) === String(reply.userId) ? <Button variant="ghost" size="xs" className="text-destructive" onClick={() => handleDeleteComment(reply.id)}>Supprimer</Button> : <Button variant="ghost" size="xs" onClick={() => { setCommentReportId(reply.id); setCommentReportDialogOpen(true); }}>Signaler</Button>}</div></div>)}</div></div></CardContent></Card>)}
                </div>
              </TabsContent>

              {tool.hasApiTest && <TabsContent value="test" className="mt-6"><Card><CardHeader><CardTitle>Tester {tool.name}</CardTitle></CardHeader><CardContent><Textarea placeholder="Prompt" value={promptInput} onChange={e => setPromptInput(e.target.value)} rows={4} /><Button onClick={handlePromptTest} disabled={!promptInput.trim()}><Send className="mr-2 h-4 w-4" />Tester</Button>{promptResponse && <div className="mt-4 p-4 bg-muted rounded"><p>{promptResponse}</p></div>}</CardContent></Card></TabsContent>}
            </Tabs>
          </div>
          <AddToCollectionDialog open={showAddToCollection} onOpenChange={setShowAddToCollection} tool={tool} />
          <Dialog open={commentReportDialogOpen} onOpenChange={setCommentReportDialogOpen}><DialogContent><DialogHeader><DialogTitle>Signaler commentaire</DialogTitle></DialogHeader><Select onValueChange={setCommentReportReason}><SelectTrigger><SelectValue placeholder="Motif" /></SelectTrigger><SelectContent><SelectItem value="spam">Spam</SelectItem><SelectItem value="hateful">Injurieux</SelectItem><SelectItem value="inappropriate">Inapproprié</SelectItem><SelectItem value="other">Autre</SelectItem></SelectContent></Select><Textarea placeholder="Détails" value={commentReportDescription} onChange={e => setCommentReportDescription(e.target.value)} /><Button onClick={handleCommentReport}>Envoyer</Button></DialogContent></Dialog>
        </main>
      </div>
      <Footer />
    </div>
  );
}