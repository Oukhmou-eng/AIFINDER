import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { PlusCircle, Clock, CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';
import { mockProposedTools, tools as mockTools, categories, aiModels } from '../../lib/mock-data';
import { toast } from 'sonner';
import { FullProposalEditor } from '../../components/dashboard/FullProposalEditor'; // à créer

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

// Composant d'affichage des détails (avec motif de rejet et bouton de modification)
function ProposalDetailDialog({ proposal, open, onOpenChange, onEdit }) {
  if (!proposal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la proposition : {proposal.name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
            <TabsTrigger value="models">Modèles AI</TabsTrigger>
            <TabsTrigger value="pricing">Tarifs & Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div><strong>Nom :</strong> {proposal.name}</div>
              <div><strong>Fournisseur :</strong> {proposal.provider || 'Non spécifié'}</div>
              <div><strong>URL :</strong> <a href={proposal.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{proposal.url}</a></div>
              <div><strong>Logo URL :</strong> {proposal.logoUrl || '-'}</div>
              <div><strong>Date de sortie :</strong> {proposal.releaseDate ? new Date(proposal.releaseDate).toLocaleDateString('fr-FR') : '-'}</div>
              <div><strong>Open Source :</strong> {proposal.isOpenSource ? 'Oui' : 'Non'}</div>
              <div><strong>Catégorie :</strong> {proposal.categoryId} {proposal.newCategoryDesc && `(Nouvelle: ${proposal.newCategoryDesc})`}</div>
              <div><strong>Tags :</strong> {proposal.tags?.map(t => t.name).join(', ') || '-'}</div>
              <div><strong>Plateformes :</strong> {proposal.platforms?.join(', ') || '-'}</div>
            </div>
            <div><strong>Description courte :</strong> {proposal.shortDescription || proposal.description}</div>
            <div><strong>Description détaillée :</strong> <p className="mt-1 whitespace-pre-line">{proposal.longDescription || proposal.description}</p></div>
            {proposal.status === 'rejected' && proposal.rejectionReason && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <strong className="text-destructive">Motif du rejet :</strong>
                <p className="mt-1 text-destructive/80">{proposal.rejectionReason}</p>
                {proposal.suggestions && (
                  <div className="mt-2 text-sm">
                    <strong className="text-destructive">Suggestions de rectification :</strong>
                    <ul className="list-disc list-inside mt-1">
                      {proposal.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div>
              <strong>Fonctionnalités propres :</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {proposal.features?.map(f => <Badge key={f.name}>{f.name}</Badge>) || '-'}
              </div>
            </div>
            <div>
              <strong>Performances (benchmarks) :</strong>
              <div className="space-y-1 mt-1">
                {proposal.performances?.map(p => (
                  <div key={p.domain}>{p.domain}: {p.score}/100 {p.description && `(${p.description})`}</div>
                )) || '-'}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            {proposal.models?.length > 0 ? (
              proposal.models.map(model => (
                <Card key={model.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{model.name} ({model.provider})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>{model.description}</p>
                    <div><strong>Accès dans l'outil :</strong> {model.accessInTool === 'free' ? 'Gratuit' : 'Payant'}</div>
                    <div><strong>Capacités :</strong> {model.capabilities?.join(', ') || '-'}</div>
                    <div><strong>Performances :</strong> {model.performances?.map(p => `${p.domain}:${p.score}`).join(', ') || '-'}</div>
                    <div><strong>Tags :</strong> {model.tags?.map(t => t.name).join(', ') || '-'}</div>
                    {model.hasApi && <div><strong>API URL :</strong> <a href={model.apiUrl} className="text-primary">{model.apiUrl}</a></div>}
                    {model.pricingPlans?.length > 0 && (
                      <div><strong>Plans API :</strong>
                        {model.pricingPlans.map(plan => (
                          <div key={plan.name} className="ml-2 text-sm">{plan.name}: {plan.price}{plan.currency}/{plan.period}</div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>Aucun modèle associé</p>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div><strong>Type de tarification global :</strong> {proposal.pricingType || proposal.pricing}</div>
            {proposal.pricingPlans?.length > 0 && (
              <div>
                <strong>Plans de l'outil :</strong>
                {proposal.pricingPlans.map(plan => (
                  <Card key={plan.name} className="mt-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div>Prix : {plan.price}{plan.currency}/{plan.period}</div>
                      <div>Fonctionnalités : {plan.features?.map(f => f.name).join(', ') || '-'}</div>
                      <div>Modèles accessibles : {plan.availableModels?.map(m => m.modelId).join(', ') || '-'}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

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

  const userProposals = mockProposedTools.filter(prop => prop.userId === user?.id);
  const proposalsWithTool = userProposals.map(prop => ({
    ...prop,
    existingTool: mockTools.find(t => t.id === prop.id || t.name === prop.name)
  }));

  const pendingCount = proposalsWithTool.filter(p => p.status === 'pending').length;
  const approvedCount = proposalsWithTool.filter(p => p.status === 'approved').length;
  const rejectedCount = proposalsWithTool.filter(p => p.status === 'rejected').length;

  const [selectedProposal, setSelectedProposal] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);

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
  }, [location.search]);

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
        <CardHeader><CardTitle>Historique des propositions</CardTitle></CardHeader>
        <CardContent>
          {proposalsWithTool.length > 0 ? (
            <div className="space-y-4">
              {proposalsWithTool.map((proposal) => {
                const statusConfig = getStatusConfig(proposal.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div
                    key={proposal.id}
                    id={`proposal-${proposal.id}`}
                    onClick={() => setSelectedProposal(proposal)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border gap-3 transition-all cursor-pointer hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{proposal.name}</h3>
                        <Badge variant="outline" className={statusConfig.className}>
                          <StatusIcon className="mr-1 h-3 w-3" /> {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proposal.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Catégorie : {proposal.categoryId}</span>
                        <span>Tarification : {proposal.pricing}</span>
                        <span>Proposé le : {new Date(proposal.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {proposal.status === 'pending' && (
                        <Button variant="outline" size="sm" disabled>En cours d'examen</Button>
                      )}
                      {proposal.status === 'approved' && (
                        <Link to={`/tools/${proposal.id}`}>
                          <Button variant="outline" size="sm">Voir l'outil</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune proposition</h3>
              <p className="text-muted-foreground mb-4">Vous n'avez pas encore proposé d'outil.</p>
              <Link to="/propose-tool"><Button>Proposer un outil</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>

      <ProposalDetailDialog
        proposal={selectedProposal}
        open={!!selectedProposal}
        onOpenChange={() => setSelectedProposal(null)}
        onEdit={(prop) => setEditingProposal(prop)}
      />

      {editingProposal && (
        <Dialog open={!!editingProposal} onOpenChange={() => setEditingProposal(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier la proposition : {editingProposal.name}</DialogTitle>
            </DialogHeader>
            <FullProposalEditor
              initialData={editingProposal}
              onSave={(updatedProposal) => {
                // Mettre à jour la proposition dans le mock (ou envoyer à l'API)
                toast.success('Proposition modifiée et renvoyée pour examen');
                setEditingProposal(null);
                // Recharger les données (dans une vraie app, on rafraîchirait la liste)
              }}
              onCancel={() => setEditingProposal(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}