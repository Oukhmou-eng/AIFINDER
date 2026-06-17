import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ToolOwnFeatures } from '../../components/ui/tool-own-features';
import { PricingPlansSection } from '../../components/ui/pricing-plans';
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
import { 
  Search, Wrench, Clock, CheckCircle, XCircle, Plus, Star, MoreHorizontal, Eye, Trash2, Loader2, ShieldCheck,
  Info, Building, Users, FileText, Layers, Zap, CreditCard, Award, Flag, Calendar, LinkIcon, Globe, Tag, Cpu
} from 'lucide-react';
import { getModelById } from '../../lib/mock-data';
import { toast } from 'sonner';
import api from '../../services/api';
import { AdminAPI } from '../../services/adminAPI';
import { ToolForm } from '../../components/tools/tool-form';
import { Textarea } from '../../components/ui/textarea';

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

// ============================================================
// Validation de proposition (scores par champ) - AJOUT
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

const pricingLabels = {
  free: 'Gratuit',
  freemium: 'Freemium',
  paid: 'Payant'
};

// Panneau du score final + scores par champ
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

// Composant ToolsTable local
function ToolsTable({ tools, onView, onValidate, onApprove, onReject, onDelete, loading = false }) {

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
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Note</TableHead>
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
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/admin/proposals/${tool.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </DropdownMenuItem>
                    {(tool.status === 'pending' || tool.status === 'en_attente') && (
                      <>
                        <DropdownMenuItem onClick={() => onValidate(tool)}>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          valider / rejeter les champs
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
  const [rejectDialog, setRejectDialog] = useState({ open: false, tool: null, reason: '' });
  const [validationDialog, setValidationDialog] = useState({
    open: false,
    tool: null,
    submission: null,
    validation: null,
    loading: false,
  });

  const navigate = useNavigate();



  // Lance la validation des champs via l'API (action: admin_validate_tool)
  const openValidation = async (tool) => {
    setValidationDialog({ open: true, tool, submission: null, validation: null, loading: true });
    try {
      const data = await AdminAPI.validateTool(tool.id);
      setValidationDialog({
        open: true,
        tool: data.tool || tool,
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

  const location = useLocation();

  const fetchTools = async () => {
    setLoading(true);
    try {
      const data = await AdminAPI.tools();
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
      await AdminAPI.createTool(formData);
      toast.success("Outil ajouté avec succès");
      setIsAddDialogOpen(false);
      fetchTools();
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout de l'outil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (tool) => {
    try {
      await AdminAPI.approveTool(tool.id);
      toast.success(`Outil "${tool.name}" approuvé`);
      setTools(tools.map(t => t.id === tool.id ? { ...t, status: 'active' } : t));
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'approbation");
    }
  };

  const handleReject = (tool) => {
    setRejectDialog({ open: true, tool, reason: '' });
  };

  const confirmReject = async () => {
    const { tool, reason } = rejectDialog;
    try {
      await AdminAPI.rejectTool(tool.id, reason);
      toast.success(`Outil "${tool.name}" refusé`);
      setTools(tools.map(t => t.id === tool.id ? { ...t, status: 'refusé' } : t));
      setRejectDialog({ open: false, tool: null, reason: '' });
      setSelectedTool(null);
      closeValidation();
    } catch (err) {
      toast.error(err.message || "Erreur lors du refus");
    }
  };

  const handleDelete = async (tool) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'outil "${tool.name}" ?`)) {
      try {
        await AdminAPI.deleteTool(tool.id);
        toast.success(`Outil "${tool.name}" supprimé`);
        setTools(tools.filter(t => t.id !== tool.id));
        setSelectedTool(null);
      } catch (err) {
        toast.error(err.message || "Erreur lors de la suppression");
      }
    }
  };

  // Génère un résumé des scores critiques (< 60) pour pré-remplir le motif de refus
  const getRejectionSummary = (validation) => {
    if (!validation || !validation.fields) return '';

    const criticalFields = Object.entries(validation.fields)
      .filter(([_, field]) => field.score < 60)
      .sort((a, b) => a[1].score - b[1].score); // du plus faible au moins faible

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



  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des outils AI</h1>
          <p className="text-muted-foreground mt-1">Validez et gérez les outils de la plateforme</p>
        </div>
        <Button onClick={() => navigate('/propose-tool')}>
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
            onValidate={openValidation}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modale de détails de l'outil */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;outil</DialogTitle>
            <DialogDescription>Informations complètes et options de gestion</DialogDescription>
          </DialogHeader>
          {selectedTool && (
            <div className="space-y-6">
              {/* En-tête */}
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
                    <Badge variant={selectedTool.status === 'active' ? 'default' : 'secondary'}>
                      {selectedTool.status === 'active' ? 'Actif' : selectedTool.status === 'pending' ? 'En attente' : 'Refusé'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      {selectedTool.rating} ({selectedTool.reviewCount || 0} avis)
                    </div>
                  </div>
                </div>
              </div>

              {/* Onglets */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="models">Modèles IA</TabsTrigger>
                  <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
                  <TabsTrigger value="pricing">Tarifs</TabsTrigger>
                </TabsList>

                {/* Onglet Détails */}
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-medium mb-1">Description complète</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {selectedTool.longDescription || selectedTool.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-muted-foreground">Fournisseur :</span> {selectedTool.provider || '-'}</div>
                    <div><span className="text-muted-foreground">URL :</span> <a href={selectedTool.url} target="_blank" className="text-primary hover:underline">{selectedTool.url}</a></div>
                    <div><span className="text-muted-foreground">Date de sortie :</span> {selectedTool.releaseDate ? new Date(selectedTool.releaseDate).toLocaleDateString('fr-FR') : '-'}</div>
                    <div><span className="text-muted-foreground">Open Source :</span> {selectedTool.openSource ? 'Oui' : 'Non'}</div>
                    <div><span className="text-muted-foreground">Tarification :</span> {pricingLabels[selectedTool.pricing] || selectedTool.pricing}</div>
                    <div><span className="text-muted-foreground">Créé le :</span> {selectedTool.createdAt ? new Date(selectedTool.createdAt).toLocaleDateString('fr-FR') : '-'}</div>
                    <div><span className="text-muted-foreground">Dernière mise à jour :</span> {selectedTool.updatedAt ? new Date(selectedTool.updatedAt).toLocaleDateString('fr-FR') : '-'}</div>
                    <div><span className="text-muted-foreground">Stats mises à jour :</span> {selectedTool.statsUpdatedAt ? new Date(selectedTool.statsUpdatedAt).toLocaleDateString('fr-FR') : '-'}</div>
                    <div><span className="text-muted-foreground">Total utilisateurs :</span> {selectedTool.totalUsers?.toLocaleString() || 0}</div>
                    <div><span className="text-muted-foreground">Favoris :</span> {selectedTool.usageCount || 0}</div>
                    <div><span className="text-muted-foreground">Score tendance :</span> {selectedTool.trendingScore || 0}</div>
                  </div>

                  {selectedTool.benchmarks && Object.keys(selectedTool.benchmarks).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Performances (benchmarks)</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedTool.benchmarks).map(([key, value]) => (
                          <BenchmarkScore key={key} label={key} score={value} />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTool.tentativesMax > 0 && (
                    <div>
                      <h4 className="font-medium mb-1">Tentatives de soumission</h4>
                      <p className="text-sm">Utilisées : {selectedTool.tentativesEffectuees} / {selectedTool.tentativesMax}</p>
                      {selectedTool.tentativesEffectuees >= selectedTool.tentativesMax && (
                        <p className="text-xs text-destructive">Maximum atteint, plus de modifications possibles.</p>
                      )}
                    </div>
                  )}

                  {selectedTool.adminNote && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <h4 className="font-medium text-destructive">Note administrative</h4>
                      <p className="text-sm mt-1">{selectedTool.adminNote}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Onglet Modèles IA */}
                <TabsContent value="models" className="space-y-4 mt-4">
                  {selectedTool.aiModels?.length > 0 ? (
                    selectedTool.aiModels.map((m) => (
                      <div key={m.modelId} className="border rounded-lg p-3">
                        <p className="font-medium">{m.name || m.modelId}</p>
                        <Badge className={m.accessType === 'free' ? 'bg-success' : 'bg-warning'}>
                          {m.accessType === 'free' ? 'Gratuit' : 'Payant'}
                        </Badge>
                      </div>
                    ))
                  ) : <p className="text-muted-foreground">Aucun modèle associé</p>}
                </TabsContent>

                {/* Onglet Fonctionnalités */}
                <TabsContent value="features" className="space-y-4 mt-4">
                  {selectedTool.ownFeatures?.length > 0 && (
                    <ToolOwnFeatures features={selectedTool.ownFeatures} />
                  )}
                  <div>
                    <h4 className="font-medium mb-2">Fonctionnalités détectées</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTool.functions?.map(func => <Badge key={func} variant="secondary">{func}</Badge>)}
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Plans tarifaires */}
                <TabsContent value="pricing" className="space-y-4 mt-4">
                  {selectedTool.pricingPlans?.length > 0 ? (
                    <PricingPlansSection plans={selectedTool.pricingPlans} type="tool" />
                  ) : <p className="text-muted-foreground">Aucun plan tarifaire défini</p>}
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <DialogFooter className="flex-col sm:flex-row gap-2">
                {(selectedTool.status === 'pending' || selectedTool.status === 'en_attente') && (
                  <>
                    <Button variant="outline" onClick={() => { handleReject(selectedTool); setSelectedTool(null); }}>
                      Refuser
                    </Button>
                    <Button onClick={() => { handleApprove(selectedTool); setSelectedTool(null); }}>
                      Approuver
                    </Button>
                  </>
                )}
                <Button variant="destructive" onClick={() => { handleDelete(selectedTool); setSelectedTool(null); }}>
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

      {/* Modale de validation de la proposition (scores par champ) */}
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
              onClick={() => {
                handleApprove(validationDialog.tool);
                closeValidation();
              }}
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
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, tool: null, reason: '' })}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              <XCircle className="mr-2 h-4 w-4" />
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
