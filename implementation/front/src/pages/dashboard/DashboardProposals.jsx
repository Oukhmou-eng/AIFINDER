import { useState, useEffect, useMemo  } from 'react';
import { Link, useLocation, useNavigate  } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { PlusCircle, Clock, CheckCircle, XCircle, AlertCircle, Edit, Loader2, ExternalLink,Search  } from 'lucide-react';
import { CatalogAPI } from '../../services/catalogAPI';
import { toast } from 'sonner';
import { FullProposalEditor } from '../../components/dashboard/FullProposalEditor';

// StatCard (inchangé)
function StatCard({ title, value, icon: Icon, variant }) {
  const colors = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    default: 'bg-muted/50 text-foreground',
  };
  return (
    <Card className={colors[variant] || colors.default}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// Composant d'affichage des détails (adapté aux données réelles)
function ProposalDetailDialog({ proposal, open, onOpenChange, onEdit }) {
  const [fullTool, setFullTool] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && proposal?.toolId) {
      setLoading(true);
      CatalogAPI.tool(proposal.toolId)
        .then(setFullTool)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setFullTool(null);
    }
  }, [open, proposal]);

  if (!proposal) return null;

  const data = fullTool || proposal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la proposition : {proposal.toolName || proposal.name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="general">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
              <TabsTrigger value="models">Modèles AI</TabsTrigger>
              <TabsTrigger value="pricing">Tarifs & Plans</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Nom :</strong> {data.toolName || data.name}</div>
                <div><strong>Fournisseur :</strong> {data.provider || 'Non spécifié'}</div>
                <div><strong>URL :</strong> <a href={data.toolUrl || data.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{data.toolUrl || data.url}</a></div>
                <div><strong>Logo URL :</strong> {data.toolLogo || data.logo || '-'}</div>
                <div><strong>Date de sortie :</strong> {data.releaseDate ? new Date(data.releaseDate).toLocaleDateString('fr-FR') : '-'}</div>
                <div><strong>Open Source :</strong> {data.openSource ? 'Oui' : 'Non'}</div>
                <div><strong>Catégories :</strong> {data.categories?.map(c => c.name).join(', ') || '-'}</div>
              </div>
              <div><strong>Description courte :</strong> {data.toolDescription || data.description}</div>
              <div><strong>Description détaillée :</strong> <p className="mt-1 whitespace-pre-line">{data.longDescription || data.description}</p></div>
              {proposal.status === 'rejected' && proposal.adminNote && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <strong className="text-destructive">Motif du rejet :</strong>
                  <p className="mt-1 text-destructive/80">{proposal.adminNote}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div>
                <strong>Fonctionnalités propres :</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.ownFeatures?.map(f => <Badge key={f}>{f}</Badge>) || '-'}
                </div>
              </div>
              <div>
                <strong>Performances (benchmarks) :</strong>
                <div className="space-y-1 mt-1">
                  {data.benchmarks ? Object.entries(data.benchmarks).map(([domain, score]) => (
                    <div key={domain}>{domain}: {score}/100</div>
                  )) : '-'}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-4">
              {data.aiModels?.length > 0 ? (
                data.aiModels.map(model => (
                  <Card key={model.modelId}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{model.name} ({model.provider})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Accès dans l'outil :</strong> {model.accessType === 'free' ? 'Gratuit' : 'Payant'}</div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>Aucun modèle associé</p>
              )}
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div><strong>Type de tarification global :</strong> {data.toolPricing || data.pricing}</div>
              {data.pricingPlans?.length > 0 && (
                <div>
                  <strong>Plans de l'outil :</strong>
                  {data.pricingPlans.map(plan => (
                    <Card key={plan.id} className="mt-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <div>Prix : {plan.price} {plan.currency} / {plan.period}</div>
                        <div>Type : {plan.type}</div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {proposal.status === 'rejected' && (
          <div className="flex justify-end mt-4 pt-4 border-t">
            <Button onClick={() => onEdit(proposal)} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Modifier et renvoyer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardProposals() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);

  // États pour la recherche et le filtre
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const data = await CatalogAPI.myProposals();
      setSubmissions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des propositions:', error);
      toast.error('Impossible de charger vos propositions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  // Filtrage des propositions
  const filteredProposals = useMemo(() => {
    let result = submissions;
    
    // Filtre par statut
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    
    // Filtre par recherche (nom ou description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.toolName?.toLowerCase().includes(query) ||
        p.toolDescription?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [submissions, statusFilter, searchQuery]);

  const pendingCount = submissions.filter(p => p.status === 'pending').length;
  const approvedCount = submissions.filter(p => p.status === 'approved').length;
  const rejectedCount = submissions.filter(p => p.status === 'rejected').length;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente', icon: Clock, className: 'bg-warning/10 text-warning border-warning/20' };
      case 'approved':
        return { label: 'Approuvé', icon: CheckCircle, className: 'bg-success/10 text-success border-success/20' };
      case 'rejected':
        return { label: 'Refusé', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' };
      default:
        return { label: 'Inconnu', icon: AlertCircle, className: 'bg-muted/10 text-muted-foreground' };
    }
  };

  // Surbrillance via paramètre highlight
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');
    if (highlightId) {
      const element = document.getElementById(`proposal-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-primary/10', 'transition-colors', 'duration-500');
        setTimeout(() => element.classList.remove('bg-primary/10'), 2000);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [location.search, submissions]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

    return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes propositions</h1>
          <p className="text-muted-foreground">Suivez l'état des outils que vous avez proposés</p>
        </div>
        <Link to="/propose-tool">
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Proposer un outil</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="En attente" value={pendingCount} icon={Clock} variant="pending" />
        <StatCard title="Approuvés" value={approvedCount} icon={CheckCircle} variant="approved" />
        <StatCard title="Refusés" value={rejectedCount} icon={XCircle} variant="rejected" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des propositions</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>Tous</Button>
              <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('pending')}>En attente</Button>
              <Button variant={statusFilter === 'approved' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('approved')}>Approuvés</Button>
              <Button variant={statusFilter === 'rejected' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('rejected')}>Refusés</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProposals.length > 0 ? (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => {
                const statusConfig = getStatusConfig(proposal.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div
                    key={proposal.id}
                    id={`proposal-${proposal.id}`}
                    onClick={() => {
                      if (proposal.status === 'approved' && proposal.toolSlug) {
                        navigate(`/tools/${proposal.toolSlug}`);
                      } else {
                        {/*setSelectedProposal(proposal);*/}
                        navigate(`/tools/${proposal.toolSlug}`);
                      }
                    }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border gap-3 transition-all cursor-pointer hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{proposal.toolName}</h3>
                        <Badge variant="outline" className={statusConfig.className}>
                          <StatusIcon className="mr-1 h-3 w-3" /> {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proposal.toolDescription}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Tarification : {proposal.toolPricing}</span>
                        <span>Proposé le : {new Date(proposal.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    {/* Le bouton "Voir l'outil" a été supprimé car la carte redirige directement */}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              {searchQuery || statusFilter !== 'all' ? (
                <>
                  <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
                  <p className="text-muted-foreground mb-4">Aucune proposition ne correspond à vos critères.</p>
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                    Réinitialiser les filtres
                  </Button>
                </>
              ) : (
                <>
                  <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune proposition</h3>
                  <p className="text-muted-foreground mb-4">Vous n'avez pas encore proposé d'outil.</p>
                  <Link to="/propose-tool"><Button>Proposer un outil</Button></Link>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ProposalDetailDialog
        proposal={selectedProposal}
        open={!!selectedProposal}
        onOpenChange={() => setSelectedProposal(null)}
        onEdit={(prop) => {
          setEditingProposal(prop);
          setSelectedProposal(null);
        }}
      />

      {editingProposal && (
        <Dialog open={!!editingProposal} onOpenChange={() => setEditingProposal(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier la proposition : {editingProposal.toolName}</DialogTitle>
            </DialogHeader>
            <FullProposalEditor
              initialData={editingProposal}
              onSave={async (updatedProposal) => {
                toast.success('Proposition modifiée et renvoyée pour examen');
                setEditingProposal(null);
                fetchProposals();
              }}
              onCancel={() => setEditingProposal(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}