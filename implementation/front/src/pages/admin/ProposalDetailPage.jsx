// src/pages/admin/ProposalDetailPage.jsx
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { cn } from '../../lib/utils';
import { mockProposedTools, getCategoryById } from '../../lib/mock-data';

function BenchmarkScore({ label, score, maxScore = 100 }) {
  const percentage = (score / maxScore) * 100;
  let colorClass = 'bg-success';
  if (score < 60) colorClass = 'bg-destructive';
  else if (score < 80) colorClass = 'bg-warning';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{score}/{maxScore}</span>
      </div>
      <Progress value={percentage} className={cn('h-2', colorClass)} />
    </div>
  );
}

export default function ProposalDetailPage() {
  const { id } = useParams();
  const proposal = mockProposedTools.find(p => p.id === id);

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Proposition non trouvée</h1>
        <p className="text-muted-foreground mt-2">
          La proposition que vous recherchez n'existe pas.
        </p>
        <Link to="/admin/users">
          <Button className="mt-4">Retour aux utilisateurs</Button>
        </Link>
      </div>
    );
  }

  const category = getCategoryById(proposal.categoryId);
  const statusConfig = {
    pending: { label: 'En attente', className: 'bg-warning/10 text-warning border-warning/20' },
    approved: { label: 'Approuvé', className: 'bg-success/10 text-success border-success/20' },
    rejected: { label: 'Refusé', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  };
  const currentStatus = statusConfig[proposal.status] || statusConfig.pending;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin/users">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux utilisateurs
        </Button>
      </Link>

      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
          <span className="text-3xl font-bold text-primary">{proposal.name.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {category && (
              <Badge variant="outline" className="hover:bg-muted">{category.name}</Badge>
            )}
            <Badge variant="outline" className={currentStatus.className}>
              {currentStatus.label}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{proposal.name}</h1>
          <p className="text-muted-foreground mb-4">{proposal.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              <DollarSign className="h-3 w-3 mr-1" />
              {proposal.pricing}
            </Badge>
            {proposal.priceDetails && (
              <Badge variant="outline">{proposal.priceDetails}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Détails complets */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description détaillée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {proposal.longDescription || proposal.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modèles AI proposés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proposal.aiModels.map((m, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="font-medium">{m.modelId}</div>
                    <Badge className={m.accessType === 'free' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                      Accès {m.accessType === 'free' ? 'gratuit' : 'payant'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {proposal.benchmarks && Object.keys(proposal.benchmarks).length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle>Performances (benchmarks)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(proposal.benchmarks).map(([key, value]) => (
                    <BenchmarkScore key={key} label={key} score={value} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">URL</span>
                <a href={proposal.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[200px]">
                  {proposal.url}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date de proposition</span>
                <span>{new Date(proposal.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              {proposal.reviewedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date de traitement</span>
                  <span>{new Date(proposal.reviewedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              {proposal.rejectionReason && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Motif du refus</span>
                  <span className="text-destructive">{proposal.rejectionReason}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}