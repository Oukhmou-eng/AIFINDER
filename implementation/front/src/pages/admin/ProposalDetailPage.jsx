import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  DollarSign,
  ExternalLink,
  Globe,
  Tag,
  Cpu,
  CheckCircle,
  XCircle,
  Loader2,
  Star,
  Play,
  Hash,
  Trash2,
  Edit,
  Save,
  X,
  Plus,
  Info,
  Building,
  Users,
  FileText,
  Layers,
  Zap,
  CreditCard,
  Flag,
  Calendar,
  LinkIcon,
  Wrench,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { ToolOwnFeatures } from '../../components/ui/tool-own-features';
import { PricingPlansSection } from '../../components/ui/pricing-plans';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import AdminAPI from '../../services/adminAPI';
import CatalogAPI from '../../services/catalogAPI';

// Composant StarRating
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

const STATUS_CONFIG = {
  pending: { label: 'En attente', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Approuvé', className: 'bg-success/10 text-success border-success/20' },
  approved_tool: { label: 'Approuvé', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Refusé', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  en_attente: { label: 'En attente', className: 'bg-warning/10 text-warning border-warning/20' },
  actif: { label: 'Approuvé', className: 'bg-success/10 text-success border-success/20' },
};

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

// ============================================================
// Composants pour la validation par scores (copiés depuis AdminTools)
// ============================================================

function scoreColor(score) {
  if (score >= 80) return 'bg-success text-success-foreground';
  if (score >= 60) return 'bg-warning text-warning-foreground';
  return 'bg-destructive text-destructive-foreground';
}

function scoreBorder(score) {
  if (score >= 80) return 'border-success/40 bg-success/5';
  if (score >= 60) return 'border-warning/40 bg-warning/5';
  return 'border-destructive/40 bg-destructive/5';
}

function ValidationPanel({ validation }) {
  if (!validation) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Lancez la validation pour calculer les scores des champs.
      </div>
    );
  }

  const entries = Object.entries(validation.fields || {});

  return (
    <div className="space-y-4">
      <div className={`rounded-lg border p-4 ${scoreBorder(validation.finalScore)}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Score final</p>
            <p className="text-3xl font-bold">{validation.finalScore}/100</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Source: {validation.source || 'local'}
            </p>
          </div>
          <Badge className={scoreColor(validation.finalScore)}>
            {validation.recommendation === 'validable' ? 'Validable' : 'À revoir'}
          </Badge>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${validation.finalScore}%` }} />
        </div>
        {validation.externalSummary && (
          <p className="mt-3 text-sm text-muted-foreground">{validation.externalSummary}</p>
        )}
        {validation.externalError && (
          <p className="mt-3 text-sm text-destructive">{validation.externalError}</p>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {entries.map(([field, result]) => (
          <div key={field} className={`rounded-lg border p-3 ${scoreBorder(result.score)}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{field}</p>
                <p className="text-xs text-muted-foreground">{result.label}</p>
              </div>
              <Badge className={scoreColor(result.score)}>{result.score}/100</Badge>
            </div>
            {result.issues?.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                {result.issues.map((issue, idx) => <li key={idx}>{issue}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProposalInfo({ tool, submission }) {
  if (!tool) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Informations de l'outil
        </CardTitle>
        <CardDescription>Détails complets de la proposition</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Section Général */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4" /> Général
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex justify-between items-center border-b pb-1">
              <span className="text-muted-foreground">Nom</span>
              <span className="font-medium">{tool.name}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1">
              <span className="text-muted-foreground">Fournisseur</span>
              <span className="font-medium">{tool.provider || '-'}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1">
              <span className="text-muted-foreground">URL</span>
              <a href={tool.url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]">
                <LinkIcon className="h-3 w-3" /> {tool.url}
              </a>
            </div>
            <div className="flex justify-between items-center border-b pb-1">
              <span className="text-muted-foreground">Tarification</span>
              <Badge variant="outline" className={
                tool.pricing === 'free' ? 'border-success text-success' :
                  tool.pricing === 'freemium' ? 'border-info text-info' :
                    'border-warning text-warning'
              }>
                {pricingLabels[tool.pricing] || 'Inconnu'}
              </Badge>
            </div>
            <div className="flex justify-between items-center border-b pb-1">
              <span className="text-muted-foreground">Date de sortie</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {tool.releaseDate ? new Date(tool.releaseDate).toLocaleDateString('fr-FR') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-1">
              <span className="text-muted-foreground">Open Source</span>
              <Badge variant={tool.openSource ? 'default' : 'secondary'}>
                {tool.openSource ? 'Oui' : 'Non'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Section Soumission */}
        {(submission?.userName || submission?.createdAt) && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" /> Soumission
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex justify-between items-center border-b pb-1">
                <span className="text-muted-foreground">Proposé par</span>
                <span className="font-medium">{submission.userName || '-'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-1">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{submission.userEmail || '-'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-1">
                <span className="text-muted-foreground">Date de soumission</span>
                <span className="font-medium">
                  {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString('fr-FR') : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section Descriptions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" /> Descriptions
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground text-sm">Courte :</span>
              <p className="text-sm mt-1 bg-muted/30 p-2 rounded">{tool.description || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Détaillée :</span>
              <p className="text-sm mt-1 bg-muted/30 p-2 rounded whitespace-pre-line max-h-60 overflow-y-auto">
                {tool.longDescription || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Classifications */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Layers className="h-4 w-4" /> Classifications
          </h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span className="text-muted-foreground text-xs">Catégories</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {tool.categories?.length ? tool.categories.map(cat => (
                  <Badge key={cat.id} variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {cat.name}
                  </Badge>
                )) : <span className="text-xs text-muted-foreground">-</span>}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Plateformes</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {tool.platforms?.length ? tool.platforms.map(platform => (
                  <Badge key={platform} variant="secondary" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {platform}
                  </Badge>
                )) : <span className="text-xs text-muted-foreground">-</span>}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Modèles IA</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {tool.aiModels?.length ? tool.aiModels.map(model => (
                  <Badge key={model.modelId} variant="outline" className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" /> {model.name}
                  </Badge>
                )) : <span className="text-xs text-muted-foreground">-</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        {(tool.ownFeatures?.length > 0 || tool.functions?.length > 0) && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Zap className="h-4 w-4" /> Fonctionnalités
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {tool.ownFeatures?.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-xs">Propres :</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tool.ownFeatures.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
                  </div>
                </div>
              )}
              {tool.functions?.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-xs">Détectées :</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tool.functions.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plans tarifaires */}
        {tool.pricingPlans?.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" /> Plans tarifaires
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {tool.pricingPlans.map(plan => (
                <div key={plan.id} className="border rounded-lg p-3 bg-card hover:shadow-sm transition-shadow">
                  <div className="font-medium text-primary">{plan.name}</div>
                  <div className="text-sm mt-1">
                    <span className="text-lg font-bold">{plan.price}</span> {plan.currency} / {plan.period}
                  </div>
                  {plan.description && <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>}
                  {plan.features?.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {plan.features.slice(0, 2).join(', ')}{plan.features.length > 2 && '...'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benchmarks */}
        {tool.benchmarks && Object.keys(tool.benchmarks).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Award className="h-4 w-4" /> Performances (benchmarks)
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(tool.benchmarks).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="capitalize text-sm flex items-center gap-1">
                    <Star className="h-3 w-3 text-warning" /> {key}
                  </span>
                  <span className="font-mono font-bold">{value}/100</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note admin et tentatives */}
        {(tool.adminNote || tool.tentativesMax > 0) && (
          <div className="space-y-3 pt-2 border-t">
            {tool.adminNote && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="font-medium text-destructive flex items-center gap-2">
                  <Flag className="h-4 w-4" /> Note administrative
                </p>
                <p className="text-sm mt-1 whitespace-pre-line">{tool.adminNote}</p>
              </div>
            )}
            {tool.tentativesMax > 0 && (
              <div className="flex justify-between items-center text-sm bg-muted/20 p-2 rounded">
                <span className="text-muted-foreground">Tentatives restantes pour modification :</span>
                <span className="font-bold">
                  {tool.tentativesMax - tool.tentativesEffectuees} / {tool.tentativesMax}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// Composant principal
// ============================================================

export default function ProposalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [tool, setTool] = useState(null);
  const [allModels, setAllModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [end_save, setEndSave] = useState(false);

  // États pour le formulaire d'édition complet (inchangés)
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    longDescription: '',
    url: '',
    pricing: 'free',
    openSource: false
  });
  const [editCategories, setEditCategories] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [editFeatures, setEditFeatures] = useState([]);
  const [editPerformances, setEditPerformances] = useState([]);
  const [editModels, setEditModels] = useState([]);
  const [editPricingPlans, setEditPricingPlans] = useState([]);
  const [editProvider, setEditProvider] = useState('');
  const [editReleaseDate, setEditReleaseDate] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editPricingType, setEditPricingType] = useState('freemium');

  // Données de référence chargées depuis l'API
  const [categories, setCategories] = useState([]);
  const [allPlatforms, setAllPlatforms] = useState([]);
  const [modelsList, setModelsList] = useState([]);

  // États pour les formulaires dynamiques (création rapide)
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const [newTagInput, setNewTagInput] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [showCustomPlatformInput, setShowCustomPlatformInput] = useState(false);

  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  const [perfDomain, setPerfDomain] = useState('');
  const [perfScore, setPerfScore] = useState(0);
  const [perfDesc, setPerfDesc] = useState('');

  // Dialogue création modèle IA
  const [showNewModelDialog, setShowNewModelDialog] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [currentNewModel, setCurrentNewModel] = useState({
    id: '', name: '', provider: '', providerSelected: '', description: '',
    releaseDate: '', isOpenSource: false, hasApi: false, apiUrl: '',
    capabilities: [], performances: [],
    pricingPlans: [],
    accessInTool: 'paid'
  });
  const [newCapabilityInput, setNewCapabilityInput] = useState('');
  const [newPerfDomain, setNewPerfDomain] = useState('');
  const [newPerfScore, setNewPerfScore] = useState('');
  const [newPerfDesc, setNewPerfDesc] = useState('');
  const [newTagInputModel, setNewTagInputModel] = useState('');
  const [newApiPlan, setNewApiPlan] = useState({
    name: '', accessType: 'pay-as-you-go', inputTokenPrice: 0, outputTokenPrice: 0,
    currency: '€', quota: 0, quotaPeriod: 'month', limits: '', capabilities: '', overageRules: ''
  });

  // Dialogue plan tarifaire
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState({
    nameTemplate: '', name: '', type: 'paid', price: 0, currency: '€', currencyOther: '',
    period: 'month', description: '', features: [], availableModels: []
  });

  // États pour la validation par scores (remplace approve/reject)
  const [validationDialog, setValidationDialog] = useState({
    open: false,
    tool: null,
    submission: null,
    validation: null,
    loading: false,
  });
  const [rejectDialog, setRejectDialog] = useState({ open: false, tool: null, reason: '' });
  const [acting, setActing] = useState(false);

  const [searchParams] = useSearchParams();
  const editParam = searchParams.get('edit');
  const [isEditing, setIsEditing] = useState(editParam === 'true');

  // Chargement de la proposition et de l'outil
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await AdminAPI.submissions();
        const found = (data.submissions || []).find(s => s.toolId === id);
        if (found && mounted) {
          setSubmission(found);
          if (found.toolSlug) {
            const [toolData, modelsData] = await Promise.all([
              CatalogAPI.tool(found.toolSlug),
              CatalogAPI.models()
            ]);
            if (mounted) {
              setTool(toolData || null);
              setAllModels(modelsData || []);
            }
          }
          if (mounted) setLoading(false);
          return;
        }
        // Fallback : charger l'outil directement
        const toolData = await CatalogAPI.tool(id);
        if (toolData && mounted) {
          setTool(toolData);
          setSubmission({
            id: toolData.id,
            toolId: toolData.id,
            toolSlug: toolData.slug,
            toolName: toolData.name,
            toolDescription: toolData.description,
            toolLogo: toolData.logo,
            toolUrl: toolData.url,
            status: toolData.status === 'active' ? 'approved' : 'pending',
            createdAt: toolData.createdAt,
            userName: toolData.provider || 'Administration',
            userEmail: '',
            adminNote: null,
          });
          const modelsData = await CatalogAPI.models();
          if (mounted) setAllModels(modelsData || []);
        } else if (mounted) {
          setSubmission(null);
        }
      } catch (err) {
        console.error('Error loading proposal:', err);
        if (mounted) toast.error('Impossible de charger la proposition');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, end_save]);

  // Chargement des données pour le formulaire (catégories, plateformes, modèles)
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [cats, platformsData, mods] = await Promise.all([
          CatalogAPI.categories(),
          CatalogAPI.platforms(),
          CatalogAPI.models(),
        ]);
        setCategories(cats || []);
        let platformsList = [];
        if (platformsData && platformsData.platforms) platformsList = platformsData.platforms;
        else if (Array.isArray(platformsData)) platformsList = platformsData;
        setAllPlatforms(platformsList);
        setModelsList(mods || []);
      } catch (err) {
        console.error('Erreur chargement données formulaire', err);
      }
    };
    loadFormData();
  }, []);

  // Initialisation des champs d'édition
  useEffect(() => {
    if (tool) {
      setEditData({
        name: tool.name || '',
        description: tool.description || '',
        longDescription: tool.longDescription || '',
        url: tool.url || '',
        pricing: tool.pricing || 'free',
        openSource: tool.openSource || false,
      });
      setEditCategories(tool.categories || []);
      setSelectedPlatforms(tool.platforms || []);
      setEditFeatures(tool.ownFeatures?.map(f => ({ name: f, description: '' })) || []);
      setEditPerformances(Object.entries(tool.benchmarks || {}).map(([domain, score]) => ({ domain, score, description: '' })));
      setEditModels(tool.aiModels?.map(m => ({ id: m.modelId, name: m.name, provider: m.provider, accessInTool: m.accessType || 'paid' })) || []);
      setEditPricingPlans(tool.pricingPlans || []);
      setEditProvider(tool.provider || '');
      setEditReleaseDate(tool.releaseDate?.split('T')[0] || '');
      setEditLogoUrl(tool.logo || '');
      setEditPricingType(tool.pricing || 'freemium');
    }
  }, [tool]);

  // Fonctions de gestion du formulaire (inchangées)
  const addToolFeature = () => {
    if (newFeatureName.trim()) {
      setEditFeatures([...editFeatures, { name: newFeatureName, description: newFeatureDesc }]);
      setNewFeatureName('');
      setNewFeatureDesc('');
    }
  };
  const removeToolFeature = (index) => {
    setEditFeatures(editFeatures.filter((_, i) => i !== index));
  };
  const addToolPerformance = () => {
    if (perfDomain.trim() && perfScore >= 0 && perfScore <= 100) {
      setEditPerformances([...editPerformances, { domain: perfDomain, score: perfScore, description: perfDesc }]);
      setPerfDomain('');
      setPerfScore(0);
      setPerfDesc('');
    }
  };
  const removeToolPerformance = (index) => {
    setEditPerformances(editPerformances.filter((_, i) => i !== index));
  };
  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };
  const addCustomPlatform = () => {
    if (customPlatform.trim()) {
      const newPlatform = customPlatform.trim();
      if (!allPlatforms.some(p => (p.name || p) === newPlatform)) {
        setAllPlatforms([...allPlatforms, { id: `custom-${Date.now()}`, name: newPlatform }]);
      }
      if (!selectedPlatforms.includes(newPlatform)) {
        setSelectedPlatforms([...selectedPlatforms, newPlatform]);
      }
      setCustomPlatform('');
      setShowCustomPlatformInput(false);
    }
  };

  // Gestion des plans tarifaires
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
    setEditPricingPlans([...editPricingPlans, newPlan]);
    setShowPlanDialog(false);
    resetEditingPlan();
  };
  const removePricingPlan = (index) => {
    setEditPricingPlans(editPricingPlans.filter((_, i) => i !== index));
  };

  // Gestion des modèles IA
  const handleAddExistingModel = (modelId) => {
    const model = modelsList.find(m => m.id === modelId);
    if (model && !editModels.find(m => m.id === model.id)) {
      setEditModels([...editModels, {
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
  const updateModelAccessInTool = (modelId, access) => {
    setEditModels(editModels.map(m =>
      m.id === modelId ? { ...m, accessInTool: access } : m
    ));
  };
  const removeModel = (modelId) => {
    setEditModels(editModels.filter(m => m.id !== modelId));
  };
  const openNewModelDialog = () => {
    setCurrentNewModel({
      id: `new-${Date.now()}`, name: '', provider: '', providerSelected: '', description: '',
      releaseDate: '', isOpenSource: false, hasApi: false, apiUrl: '',
      capabilities: [], performances: [], pricingPlans: [],
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
    setEditModels([...editModels, { ...currentNewModel, isNew: true }]);
    setShowNewModelDialog(false);
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
      setEditCategories([...editCategories, newCat]);
      setNewCategoryName('');
      setNewCategoryDesc('');
      setShowNewCategoryForm(false);
      toast.success('Catégorie créée et ajoutée');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la création');
    }
  };

  // Sauvegarde des modifications (inchangée)
  const handleSaveEdit = async () => {
    if (!tool) return;
    setActing(true);
    try {
      const payload = {
        id: tool.id,
        name: editData.name,
        description: editData.description,
        longDescription: editData.longDescription,
        url: editData.url,
        pricing: editPricingType,
        openSource: editData.openSource,
        logoUrl: editLogoUrl,
        releaseDate: editReleaseDate,
        provider: editProvider,
        categoryIds: editCategories.map(c => c.id),
        platforms: selectedPlatforms,
        features: editFeatures.map(f => f.name),
        performances: editPerformances,
        models: editModels.map(m => ({ id: m.id, accessType: m.accessInTool })),
        pricingPlans: editPricingPlans,
      };
      await AdminAPI.updateTool(tool.id, payload);
      toast.success('Outil mis à jour avec succès');
      setIsEditing(false);
      setEndSave(!end_save);
    } catch (err) {
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setActing(false);
    }
  };

  // ============================================================
  // NOUVELLES FONCTIONS : validation par scores et refus
  // ============================================================

  const getRejectionSummary = (validation) => {
    if (!validation || !validation.fields) return '';

    const criticalFields = Object.entries(validation.fields)
      .filter(([_, field]) => field.score < 60)
      .sort((a, b) => a[1].score - b[1].score);

    if (criticalFields.length === 0) {
      return 'Aucun champ critique détecté, mais vous pouvez ajouter un motif.';
    }

    const lines = criticalFields.map(([fieldName, field]) => {
      const label = field.label || fieldName;
      const issues = field.issues?.length ? ` (${field.issues.join(', ')})` : '';
      return `- ${label} : ${field.score}/100${issues}`;
    });

    return `Validation échouée pour les champs suivants :\n${lines.join('\n')}\n\nVeuillez corriger ces points.`;
  };

  const openValidation = async (toolToValidate) => {
    setValidationDialog({
      open: true,
      tool: toolToValidate,
      submission: null,
      validation: null,
      loading: true,
    });
    try {
      const data = await AdminAPI.validateTool(toolToValidate.id);
      setValidationDialog({
        open: true,
        tool: data.tool || toolToValidate,
        submission: data.submission || null,
        validation: data.validation || null,
        loading: false,
      });
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la validation des champs');
      setValidationDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const closeValidation = () => {
    setValidationDialog({ open: false, tool: null, submission: null, validation: null, loading: false });
  };

  const handleApprove = async (toolToApprove) => {
    setActing(true);
    try {
      await AdminAPI.approveTool(toolToApprove.id, '');
      toast.success(`Outil "${toolToApprove.name}" approuvé`);
      // Mise à jour locale
      setTool(prev => prev ? { ...prev, status: 'active' } : null);
      setSubmission(prev => prev ? { ...prev, status: 'approved' } : null);
      closeValidation();
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'approbation");
    } finally {
      setActing(false);
    }
  };

  const confirmReject = async () => {
    const { tool: toolToReject, reason } = rejectDialog;
    if (!toolToReject) return;
    setActing(true);
    try {
      await AdminAPI.rejectTool(toolToReject.id, reason);
      toast.success(`Outil "${toolToReject.name}" refusé`);
      // Mise à jour locale
      setTool(prev => prev ? { ...prev, status: 'rejected' } : null);
      setSubmission(prev => prev ? { ...prev, status: 'rejected' } : null);
      setRejectDialog({ open: false, tool: null, reason: '' });
      closeValidation();
    } catch (err) {
      toast.error(err.message || "Erreur lors du refus");
    } finally {
      setActing(false);
    }
  };

  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Proposition non trouvée</h1>
        <p className="text-muted-foreground mt-2">La proposition que vous recherchez n&apos;existe pas.</p>
        <Link to="/admin/tools">
          <Button className="mt-4">Retour aux outils</Button>
        </Link>
      </div>
    );
  }

  const statusKey = submission.status || 'pending';
  const currentStatus = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const isPending = submission.status === 'pending';
  const categoriesForTool = tool?.categories || [];
  const toolBenchmarks = tool?.benchmarks || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin/tools">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux outils
        </Button>
      </Link>

      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border overflow-hidden">
          {submission.toolLogo && !imgError ? (
            <img
              src={submission.toolLogo}
              alt={submission.toolName}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-3xl font-bold text-primary">{submission.toolName?.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className={currentStatus.className}>{currentStatus.label}</Badge>
            {tool?.pricing && (
              <Badge variant="outline" className={pricingColors[tool.pricing]}>
                {pricingLabels[tool.pricing]}
              </Badge>
            )}
            {tool?.openSource && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open Source</Badge>
            )}
            {tool?.featured && (
              <Badge className="bg-primary text-primary-foreground">En vedette</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{submission.toolName}</h1>
          <p className="text-muted-foreground mb-4">{submission.toolDescription}</p>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {tool && (
              <div className="flex items-center gap-2">
                <StarRating rating={tool.rating} />
                <span className="font-semibold">{tool.rating?.toFixed(1) || '0'}</span>
                <span className="text-muted-foreground">({tool.reviewCount || 0} avis)</span>
              </div>
            )}
            {tool?.platforms?.length > 0 && (
              <div className="flex items-center gap-1">
                {tool.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary" className="capitalize">
                    {platform}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Proposé par <span className="font-medium text-foreground">{submission.userName}</span>
            {' '}({submission.userEmail}) · {submission.createdAt && new Date(submission.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* ACTIONS : REMPLACEMENT DES BOUTONS */}
        <div className="flex gap-2 shrink-0">
          {isPending && (
            <Button
              variant="default"
              onClick={() => openValidation(tool)}
              disabled={acting}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Valider / Rejeter les champs
            </Button>
          )}
          {tool && !isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} disabled={acting}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
          )}
          {isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={acting}>
              <X className="mr-2 h-4 w-4" /> Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Onglets - reste inchangé */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Commentaires (0)
          </TabsTrigger>
          {tool?.hasApiTest && (
            <TabsTrigger value="test" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Play className="h-4 w-4 mr-1" />
              Tester
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Colonne principale - formulaire d'édition ou affichage statique (inchangé) */}
            <div className="lg:col-span-2 space-y-8">
              {isEditing ? (
                // ... (tout le formulaire d'édition, identique à celui que vous aviez)
                // Pour éviter de surcharger, je garde le contenu inchangé (il est très long)
                // Je suppose que vous conservez le même formulaire que précédemment.
                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="p-0">
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-6">
                      <Accordion type="multiple" defaultValue={["general"]}>
                        {/* Informations générales */}
                        <AccordionItem value="general" className="border rounded-lg p-4">
                          <AccordionTrigger className="text-lg font-semibold">Informations générales</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div><Label>Nom de l'outil *</Label><Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /></div>
                              <div><Label>Fournisseur</Label><Input value={editProvider} onChange={(e) => setEditProvider(e.target.value)} /></div>
                            </div>
                            <div><Label>Description courte *</Label><Input value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} maxLength={100} /></div>
                            <div><Label>Description détaillée *</Label><Textarea rows={5} value={editData.longDescription} onChange={(e) => setEditData({ ...editData, longDescription: e.target.value })} /></div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div><Label>Site officiel *</Label><Input type="url" value={editData.url} onChange={(e) => setEditData({ ...editData, url: e.target.value })} /></div>
                              <div><Label>Logo (URL)</Label><Input type="url" value={editLogoUrl} onChange={(e) => setEditLogoUrl(e.target.value)} /></div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div><Label>Date de sortie</Label><Input type="date" value={editReleaseDate} onChange={(e) => setEditReleaseDate(e.target.value)} /></div>
                              <div className="flex items-center gap-3 mt-6"><Label>Open Source</Label><Switch checked={editData.openSource} onCheckedChange={(v) => setEditData({ ...editData, openSource: v })} /></div>
                            </div>
                            <div><Label>Type de tarification</Label>
                              <Select value={editPricingType} onValueChange={setEditPricingType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Gratuit</SelectItem>
                                  <SelectItem value="freemium">Freemium</SelectItem>
                                  <SelectItem value="paid">Payant</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Catégories */}
                        <AccordionItem value="category_tags" className="border rounded-lg p-4">
                          <AccordionTrigger className="text-lg font-semibold">Catégories</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            <div className="flex flex-wrap gap-2">
                              {editCategories.map(cat => (
                                <Badge key={cat.id} variant="secondary" className="gap-1">
                                  {cat.name}
                                  <button type="button" onClick={() => setEditCategories(editCategories.filter(c => c.id !== cat.id))} className="ml-1">×</button>
                                </Badge>
                              ))}
                            </div>
                            <Input placeholder="Rechercher une catégorie..." value={categorySearchQuery} onChange={(e) => setCategorySearchQuery(e.target.value)} />
                            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                              {categories.filter(cat => !editCategories.some(c => c.id === cat.id) && cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())).map(cat => (
                                <div key={cat.id} className="flex justify-between p-2 hover:bg-muted cursor-pointer" onClick={() => setEditCategories([...editCategories, cat])}>
                                  <span>{cat.name}</span><Plus className="h-4 w-4" />
                                </div>
                              ))}
                            </div>
                            {showNewCategoryForm ? (
                              <div className="space-y-2 border p-3 rounded">
                                <Input placeholder="Nom" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                                <Input placeholder="Description" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} />
                                <div className="flex gap-2">
                                  <Button type="button" size="sm" onClick={createAndAddCategory}>Créer</Button>
                                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCategoryForm(false)}>Annuler</Button>
                                </div>
                              </div>
                            ) : (
                              <Button type="button" variant="outline" size="sm" onClick={() => setShowNewCategoryForm(true)}>+ Nouvelle catégorie</Button>
                            )}
                          </AccordionContent>
                        </AccordionItem>

                        {/* Plateformes */}
                        <AccordionItem value="platforms" className="border rounded-lg p-4">
                          <AccordionTrigger className="text-lg font-semibold">Plateformes disponibles</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            <div className="flex flex-wrap gap-2">
                              {allPlatforms.map(p => {
                                const platformName = p.name || p;
                                return (
                                  <Badge
                                    key={platformName}
                                    variant={selectedPlatforms.includes(platformName) ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => togglePlatform(platformName)}
                                  >
                                    {platformName}
                                  </Badge>
                                );
                              })}
                            </div>
                            {showCustomPlatformInput ? (
                              <div className="flex gap-2">
                                <Input placeholder="Nouvelle plateforme" value={customPlatform} onChange={(e) => setCustomPlatform(e.target.value)} />
                                <Button type="button" size="sm" onClick={addCustomPlatform}>Ajouter</Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setShowCustomPlatformInput(false)}>Annuler</Button>
                              </div>
                            ) : (
                              <Button type="button" variant="outline" size="sm" onClick={() => setShowCustomPlatformInput(true)}>+ Ajouter une plateforme</Button>
                            )}
                          </AccordionContent>
                        </AccordionItem>

                        {/* Fonctionnalités propres */}
                        <AccordionItem value="features" className="border rounded-lg p-4">
                          <AccordionTrigger className="text-lg font-semibold">Fonctionnalités propres</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            {editFeatures.map((f, idx) => (
                              <div key={idx} className="flex justify-between items-start border-b pb-2">
                                <div><span className="font-medium">{f.name}</span>{f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}</div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeToolFeature(idx)}><X className="h-4 w-4" /></Button>
                              </div>
                            ))}
                            <div className="grid gap-2">
                              <Input placeholder="Nom de la fonctionnalité" value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} />
                              <Textarea placeholder="Description (optionnel)" value={newFeatureDesc} onChange={(e) => setNewFeatureDesc(e.target.value)} rows={2} />
                              <Button type="button" size="sm" onClick={addToolFeature}>Ajouter</Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Performances */}
                        <AccordionItem value="performances" className="border rounded-lg p-4">
                          <AccordionTrigger className="text-lg font-semibold">Performances</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            {editPerformances.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center border-b pb-2">
                                <div><span className="font-medium">{p.domain}</span> : {p.score}/100{p.description && <span className="text-xs text-muted-foreground ml-2">({p.description})</span>}</div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeToolPerformance(idx)}><X className="h-4 w-4" /></Button>
                              </div>
                            ))}
                            <div className="grid gap-2 sm:grid-cols-3">
                              <Input placeholder="Domaine (ex: Génération texte)" value={perfDomain} onChange={(e) => setPerfDomain(e.target.value)} />
                              <Input type="number" min="0" max="100" placeholder="Score /100" value={perfScore} onChange={(e) => setPerfScore(Number(e.target.value))} />
                              <Input placeholder="Description (optionnel)" value={perfDesc} onChange={(e) => setPerfDesc(e.target.value)} />
                            </div>
                            <Button type="button" size="sm" onClick={addToolPerformance}>Ajouter une performance</Button>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Modèles AI utilisés */}
                        <AccordionItem value="models" className="border rounded-lg p-4">
                          <AccordionTrigger className="text-lg font-semibold">Modèles AI utilisés</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            {editModels.map((model, idx) => (
                              <Card key={idx} className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{model.name}</h4>
                                    <p className="text-sm text-muted-foreground">{model.provider}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="text-xs">Accès dans cet outil :</span>
                                      <Badge variant={model.accessInTool === 'free' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => updateModelAccessInTool(model.id, model.accessInTool === 'free' ? 'paid' : 'free')}>
                                        {model.accessInTool === 'free' ? 'Gratuit' : 'Payant'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button type="button" variant="ghost" size="sm" onClick={() => removeModel(model.id)}><X className="h-4 w-4" /></Button>
                                </div>
                              </Card>
                            ))}
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Input placeholder="Rechercher un modèle existant..." value={modelSearchQuery} onChange={(e) => setModelSearchQuery(e.target.value)} />
                                <Button type="button" variant="outline" onClick={openNewModelDialog}>+ Créer un modèle</Button>
                              </div>
                              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                                {modelsList.filter(m => !editModels.some(sm => sm.id === m.id) &&
                                  (modelSearchQuery === '' || m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) || (m.provider && m.provider.toLowerCase().includes(modelSearchQuery.toLowerCase()))))
                                  .slice(0, 20)
                                  .map(model => (
                                    <div key={model.id} className="flex justify-between p-2 hover:bg-muted cursor-pointer" onClick={() => handleAddExistingModel(model.id)}>
                                      <div><span className="font-medium">{model.name}</span><span className="text-sm text-muted-foreground ml-2">{model.provider}</span></div>
                                      <Plus className="h-4 w-4" />
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Plans tarifaires */}
                        <AccordionItem value="pricing" className="border rounded-lg p-4">
                          <AccordionTrigger className="text-lg font-semibold">Plans tarifaires</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            {editPricingPlans.map((plan, idx) => (
                              <Card key={idx} className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold">{plan.name}</h4>
                                    <p>{plan.price}{plan.currency} / {plan.period}</p>
                                    {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
                                    <div className="mt-2">
                                      <span className="text-xs font-medium">Fonctionnalités:</span>
                                      <ul className="list-disc list-inside text-xs">
                                        {plan.features?.map((f, i) => (
                                          <li key={i}>
                                            {f.name}
                                            {f.limits && Array.isArray(f.limits) && f.limits.length > 0 && (
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
                                        {plan.availableModels?.map((m, i) => (
                                          <li key={i}>
                                            {m.modelId}
                                            {m.limits && Array.isArray(m.limits) && m.limits.length > 0 && (
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
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                        <Button type="submit" disabled={acting}>
                          {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Enregistrer
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                // Affichage statique (inchangé)
                <>
                  <Card>
                    <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {tool?.longDescription || submission.toolDescription}
                      </p>
                    </CardContent>
                  </Card>

                  {tool?.aiModels?.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>Modèles AI utilisés</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {tool.aiModels.map((m) => {
                            const model = allModels.find(mod => mod.id === m.modelId);
                            const modelBenchmarks = model?.benchmarks || {};
                            return (
                              <div key={m.modelId} className="border rounded-lg p-4 space-y-3">
                                <Link to={`/models/${m.modelId}`} className="flex items-center justify-between hover:opacity-80 transition-opacity">
                                  <div>
                                    <p className="font-semibold text-foreground">{model?.name || m.modelId}</p>
                                    <p className="text-sm text-muted-foreground">{model?.provider}</p>
                                  </div>
                                  <Badge className={m.accessType === 'free' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                                    {m.accessType === 'free' ? 'Gratuit' : 'Payant'}
                                  </Badge>
                                </Link>
                                {Object.keys(modelBenchmarks).length > 0 && (
                                  <div className="pt-2 border-t">
                                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                                      <Cpu className="h-3 w-3" /> Performances du modèle
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(modelBenchmarks).map(([key, value]) => (
                                        <BenchmarkScore key={key} label={key} score={value} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {tool?.functions?.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>Fonctionnalités</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {tool.functions.map((func) => (
                            <Badge key={func} variant="secondary" className="capitalize text-sm py-1 px-3">
                              {func}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {tool?.ownFeatures && tool.ownFeatures.length > 0 && (
                    <ToolOwnFeatures features={tool.ownFeatures} />
                  )}

                  {tool?.pricingPlans && tool.pricingPlans.length > 0 && (
                    <PricingPlansSection plans={tool.pricingPlans} type="tool" />
                  )}

                  {Object.keys(toolBenchmarks).length > 0 && (
                    <Card>
                      <CardHeader className="flex flex-row items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <CardTitle>Performances</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">Scores de performance dans différents domaines (sur 100)</p>
                        <div className="space-y-2">
                          {Object.entries(toolBenchmarks).map(([key, value]) => (
                            <BenchmarkScore key={key} label={key} score={value} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Colonne de droite (inchangée) */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Tag className="h-4 w-4" />
                    Catégories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categoriesForTool.length > 0 ? (
                      categoriesForTool.map((category) => (
                        <Link key={category.id} to={`/categories/${category.slug}`}>
                          <Badge variant="secondary" className="hover:bg-muted transition-colors text-sm py-1.5 px-3">
                            <Hash className="h-3 w-3 mr-1.5" />
                            {category.name}
                          </Badge>
                        </Link>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">Aucune catégorie</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {tool && (
                <Card>
                  <CardHeader><CardTitle>Notes et avis</CardTitle></CardHeader>
                  <CardContent>
                    {tool.averageRating || tool.rating ? (
                      <>
                        <div className="text-center mb-4">
                          <div className="text-4xl font-bold text-foreground">
                            {(tool.averageRating || tool.rating).toFixed(1)}
                          </div>
                          <div className="flex justify-center">
                            <StarRating rating={tool.averageRating || tool.rating} />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Basé sur {tool.totalRatings || tool.reviewCount || 0} notation
                            {(tool.totalRatings || tool.reviewCount) > 1 ? 's' : ''}
                          </p>
                          {tool.totalUsers && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {tool.totalUsers.toLocaleString()} utilisateur
                              {tool.totalUsers > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        {tool.statsUpdatedAt && (
                          <p className="text-xs text-center text-muted-foreground border-t pt-3 mt-2">
                            Dernière mise à jour des stats : {new Date(tool.statsUpdatedAt).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">Aucune note disponible pour le moment.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {submission.toolUrl && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />Site</span>
                      <a href={submission.toolUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 truncate max-w-[180px]">
                        {submission.toolUrl}<ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  )}
                  {tool?.releaseDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Date de sortie</span>
                      <span className="font-medium">{new Date(tool.releaseDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {tool?.updatedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Dernière mise à jour</span>
                      <span className="font-medium">{new Date(tool.updatedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {tool?.status && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Statut</span>
                      <Badge variant={tool.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                        {tool.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  )}
                  {tool?.openSource !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Open Source</span>
                      <span className="font-medium">{tool.openSource ? 'Oui' : 'Non'}</span>
                    </div>
                  )}
                  {tool?.provider && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Éditeur</span>
                      <span className="font-medium">{tool.provider}</span>
                    </div>
                  )}
                  {tool?.aiModels && tool.aiModels.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Modèles IA intégrés</span>
                      <span className="font-medium">{tool.aiModels.length}</span>
                    </div>
                  )}
                  {tool?.pricingPlans && tool.pricingPlans.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Plans tarifaires</span>
                      <span className="font-medium">{tool.pricingPlans.length}</span>
                    </div>
                  )}
                  {tool?.ownFeatures && tool.ownFeatures.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Fonctionnalités</span>
                      <span className="font-medium">{tool.ownFeatures.length}</span>
                    </div>
                  )}
                  {submission.adminNote && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground font-medium">Note admin</p>
                      <p className="text-sm mt-1 italic">{submission.adminNote}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Les commentaires ne sont pas affichés dans cette vue de modération.</p>
          </div>
        </TabsContent>

        {tool?.hasApiTest && (
          <TabsContent value="test" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Play className="h-5 w-5" /> Tester {tool.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Cette fonctionnalité de test n'est pas disponible dans l'interface d'administration.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Modale de validation par scores */}
      <Dialog open={validationDialog.open} onOpenChange={(open) => !open && closeValidation()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Validation de la proposition</DialogTitle>
            <DialogDescription>Contrôle sémantique, URL, champs obligatoires et score final</DialogDescription>
          </DialogHeader>
          {validationDialog.tool && (
            <div className="space-y-6">
              <ProposalInfo tool={validationDialog.tool} submission={validationDialog.submission} />
              {validationDialog.loading ? (
                <div className="rounded-lg border p-8 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">Validation des champs...</p>
                </div>
              ) : (
                <ValidationPanel validation={validationDialog.validation} />
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const summary = getRejectionSummary(validationDialog.validation);
                setRejectDialog({
                  open: true,
                  tool: validationDialog.tool,
                  reason: summary
                });
              }}
              disabled={
                !validationDialog.tool ||
                !(validationDialog.tool.status === 'pending' || validationDialog.tool.status === 'en_attente') ||
                validationDialog.loading
              }
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rejeter
            </Button>
            <Button
              onClick={() => handleApprove(validationDialog.tool)}
              disabled={
                !validationDialog.tool ||
                !(validationDialog.tool.status === 'pending' || validationDialog.tool.status === 'en_attente') ||
                validationDialog.loading
              }
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Valider et publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de refus avec motif */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, tool: null, reason: '' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refuser l&apos;outil</DialogTitle>
            <DialogDescription>
              Indiquez le motif du refus pour &quot;{rejectDialog.tool?.name}&quot;. Ce message sera envoyé à l&apos;utilisateur.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motif du refus (optionnel)"
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
            rows={6}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, tool: null, reason: '' })}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={acting}>
              {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogues existants pour la création de modèle et plan tarifaire (inchangés) */}
      {/* Dialogue création modèle IA */}
      <Dialog open={showNewModelDialog} onOpenChange={setShowNewModelDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouveau modèle AI</DialogTitle><DialogDescription>Renseignez les caractéristiques du modèle</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nom du modèle *</Label><Input value={currentNewModel.name} onChange={(e) => setCurrentNewModel({ ...currentNewModel, name: e.target.value })} /></div>
              <div><Label>Fournisseur *</Label><Input value={currentNewModel.provider} onChange={(e) => setCurrentNewModel({ ...currentNewModel, provider: e.target.value })} /></div>
            </div>
            <div><Label>Description</Label><Textarea rows={2} value={currentNewModel.description} onChange={(e) => setCurrentNewModel({ ...currentNewModel, description: e.target.value })} /></div>
            <div className="flex gap-4">
              <div><Label>Date de sortie</Label><Input type="date" value={currentNewModel.releaseDate} onChange={(e) => setCurrentNewModel({ ...currentNewModel, releaseDate: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Label>Open Source</Label><Switch checked={currentNewModel.isOpenSource} onCheckedChange={(v) => setCurrentNewModel({ ...currentNewModel, isOpenSource: v })} /></div>
              <div className="flex items-center gap-2"><Label>Possède une API</Label><Switch checked={currentNewModel.hasApi} onCheckedChange={(v) => setCurrentNewModel({ ...currentNewModel, hasApi: v })} /></div>
            </div>
            {currentNewModel.hasApi && <Input placeholder="URL de l'API" value={currentNewModel.apiUrl} onChange={(e) => setCurrentNewModel({ ...currentNewModel, apiUrl: e.target.value })} />}
            <div><Label>Capacités</Label><div className="flex flex-wrap gap-2">{currentNewModel.capabilities.map((cap, i) => <Badge key={i} className="gap-1">{cap}<button onClick={() => removeCapability(i)}>×</button></Badge>)}</div><div className="flex gap-2 mt-1"><Input placeholder="Nouvelle capacité" value={newCapabilityInput} onChange={(e) => setNewCapabilityInput(e.target.value)} /><Button type="button" size="sm" onClick={addNewModelCapability}>Ajouter</Button></div></div>
            <div><Label>Performances</Label>{currentNewModel.performances.map((p, i) => <div key={i} className="flex justify-between"><span>{p.domain}: {p.score}/100</span><Button variant="ghost" size="sm" onClick={() => removeModelPerformance(i)}>X</Button></div>)}<div className="grid grid-cols-3 gap-2"><Input placeholder="Domaine" value={newPerfDomain} onChange={(e) => setNewPerfDomain(e.target.value)} /><Input placeholder="Score" value={newPerfScore} onChange={(e) => setNewPerfScore(e.target.value)} /><Input placeholder="Description" value={newPerfDesc} onChange={(e) => setNewPerfDesc(e.target.value)} /></div><Button type="button" size="sm" onClick={addNewModelPerformance}>Ajouter</Button></div>
            <div><Label>Accès dans cet outil</Label><Select value={currentNewModel.accessInTool} onValueChange={(v) => setCurrentNewModel({ ...currentNewModel, accessInTool: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="free">Gratuit</SelectItem><SelectItem value="paid">Payant</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowNewModelDialog(false)}>Annuler</Button><Button onClick={saveNewModel}>Ajouter le modèle</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ajouter un plan tarifaire</DialogTitle><DialogDescription>Définissez un forfait</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Nom du plan *</Label><Input placeholder="Ex: Pro" value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Prix</Label><Input type="number" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })} /></div><div><Label>Devise</Label><Input placeholder="€" value={editingPlan.currency} onChange={(e) => setEditingPlan({ ...editingPlan, currency: e.target.value })} /></div></div>
            <div><Label>Période</Label><Select value={editingPlan.period} onValueChange={(v) => setEditingPlan({ ...editingPlan, period: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="month">/ mois</SelectItem><SelectItem value="year">/ an</SelectItem><SelectItem value="one-time">unique</SelectItem></SelectContent></Select></div>
            <div><Label>Description</Label><Textarea value={editingPlan.description} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} /></div>
            <div><Label>Fonctionnalités</Label>{editingPlan.features.map((f, idx) => <div key={idx} className="border p-2 mb-2"><Input placeholder="Nom" value={f.name} onChange={(e) => updatePlanFeature(idx, 'name', e.target.value)} /><Button type="button" variant="ghost" onClick={() => removePlanFeature(idx)}>Supprimer</Button></div>)}<Button type="button" variant="outline" onClick={handleAddPlanFeature}>+ Ajouter une fonctionnalité</Button></div>
            <div><Label>Modèles accessibles</Label>{editingPlan.availableModels.map((m, idx) => <div key={idx} className="border p-2 mb-2"><Select value={m.modelId} onValueChange={(v) => updatePlanModel(idx, 'modelId', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{editModels.map(mod => <SelectItem key={mod.id} value={mod.id}>{mod.name}</SelectItem>)}</SelectContent></Select><Button type="button" variant="ghost" onClick={() => removePlanModel(idx)}>Supprimer</Button></div>)}<Button type="button" variant="outline" onClick={addPlanAvailableModel}>+ Ajouter un modèle</Button></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowPlanDialog(false)}>Annuler</Button><Button onClick={savePricingPlan}>Ajouter</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}