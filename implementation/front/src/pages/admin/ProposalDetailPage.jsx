import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, DollarSign, ExternalLink, Globe, Tag, Cpu, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import AdminAPI from '../../services/adminAPI';
import CatalogAPI from '../../services/catalogAPI';

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

const STATUS_CONFIG = {
  pending:   { label: 'En attente', className: 'bg-warning/10 text-warning border-warning/20' },
  approved:  { label: 'Approuvé',   className: 'bg-success/10 text-success border-success/20' },
  approved_tool: { label: 'Approuvé', className: 'bg-success/10 text-success border-success/20' },
  rejected:  { label: 'Refusé',     className: 'bg-destructive/10 text-destructive border-destructive/20' },
  en_attente:{ label: 'En attente', className: 'bg-warning/10 text-warning border-warning/20' },
  actif:     { label: 'Approuvé',   className: 'bg-success/10 text-success border-success/20' },
};

export default function ProposalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [tool, setTool]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [rejectDialog, setRejectDialog] = useState({ open: false, reason: '' });
  const [acting, setActing]         = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await AdminAPI.submissions();
        const found = (data.submissions || []).find(s => s.id === id);
        if (!found) { setLoading(false); return; }
        setSubmission(found);
        if (found.toolId) {
          const toolData = await CatalogAPI.tool(found.toolId);
          setTool(toolData.tool || null);
        }
      } catch (err) {
        toast.error('Impossible de charger la proposition');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    setActing(true);
    try {
      await AdminAPI.approveTool(submission.toolId);
      toast.success(`Outil "${submission.toolName}" approuvé`);
      setSubmission(prev => ({ ...prev, status: 'approved' }));
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'approbation");
    } finally {
      setActing(false);
    }
  };

  const confirmReject = async () => {
    setActing(true);
    try {
      await AdminAPI.rejectTool(submission.toolId, rejectDialog.reason);
      toast.success(`Outil "${submission.toolName}" refusé`);
      setSubmission(prev => ({ ...prev, status: 'rejected' }));
      setRejectDialog({ open: false, reason: '' });
    } catch (err) {
      toast.error(err.message || 'Erreur lors du refus');
    } finally {
      setActing(false);
    }
  };

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
  const benchmarks = tool?.benchmarks || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin/tools">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux outils
        </Button>
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border overflow-hidden">
          {submission.toolLogo
            ? <img src={submission.toolLogo} alt={submission.toolName} className="h-full w-full object-cover" />
            : <span className="text-3xl font-bold text-primary">{submission.toolName?.charAt(0)}</span>
          }
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className={currentStatus.className}>{currentStatus.label}</Badge>
            {tool?.pricing && <Badge variant="secondary"><DollarSign className="h-3 w-3 mr-1" />{tool.pricing}</Badge>}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{submission.toolName}</h1>
          <p className="text-muted-foreground mb-3">{submission.toolDescription}</p>
          <p className="text-sm text-muted-foreground">
            Proposé par <span className="font-medium text-foreground">{submission.userName}</span>
            {' '}({submission.userEmail}) · {submission.createdAt && new Date(submission.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {isPending && (
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={() => setRejectDialog({ open: true, reason: '' })} disabled={acting}>
              <XCircle className="mr-2 h-4 w-4" />Refuser
            </Button>
            <Button onClick={handleApprove} disabled={acting}>
              {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Approuver
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Description détaillée</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {tool?.longDescription || submission.toolDescription}
              </p>
            </CardContent>
          </Card>

          {tool?.aiModels?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5" />Modèles AI</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tool.aiModels.map((m, idx) => (
                    <Badge key={idx} variant="outline">{m.name || m.modelId}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(benchmarks).length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle>Performances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(benchmarks).map(([key, value]) => (
                    <BenchmarkScore key={key} label={key} score={value} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {submission.toolUrl && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />Site</span>
                  <a href={submission.toolUrl} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 truncate max-w-[180px]">
                    {submission.toolUrl}<ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}
              {submission.toolPricing && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarification</span>
                  <span className="capitalize">{submission.toolPricing}</span>
                </div>
              )}
              {tool?.platforms?.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">Plateformes</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.platforms.map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                  </div>
                </div>
              )}
              {tool?.ownFeatures?.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center gap-1"><Tag className="h-3 w-3" />Fonctionnalités</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.ownFeatures.map(f => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}
                  </div>
                </div>
              )}
              {submission.adminNote && (
                <div>
                  <p className="text-muted-foreground">Note admin</p>
                  <p className="text-sm mt-1">{submission.adminNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog refus */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, reason: '' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refuser l&apos;outil</DialogTitle>
            <DialogDescription>
              Motif envoyé à l&apos;utilisateur pour &quot;{submission.toolName}&quot;
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motif du refus (optionnel)"
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, reason: '' })}>Annuler</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={acting}>
              {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
