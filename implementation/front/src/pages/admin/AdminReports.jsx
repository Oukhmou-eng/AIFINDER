import { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
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
import { Flag, Clock, CheckCircle, XCircle, MessageSquare, Wrench, MoreHorizontal, Eye, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { AdminAPI } from '../../services/adminAPI';

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
        <div className={`rounded-full p-2 ${variantClasses[variant] || variantClasses.primary}`}>
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

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  
  const location = useLocation();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await AdminAPI.reports();
      setReports(data.reports || []);
    } catch (err) {
      toast.error(err.message || 'Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return (reports || []).filter((report) => {
      const matchesType = typeFilter === 'all' || report.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [reports, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'pending').length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const rejected = reports.filter((r) => r.status === 'rejected').length;
    return { total, pending, resolved, rejected };
  }, [reports]);

  // Handle URL highlighting
  useEffect(() => {
    if (reports.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const viewId = searchParams.get('view');
      if (viewId) {
        const report = reports.find(r => r.id === viewId);
        if (report) {
          setSelectedReport(report);
          setTimeout(() => {
            const row = document.getElementById(`report-row-${viewId}`);
            if (row) {
              row.scrollIntoView({ behavior: 'smooth', block: 'center' });
              row.classList.add('bg-primary/10');
              setTimeout(() => row.classList.remove('bg-primary/10'), 3000);
            }
          }, 200);
        }
      }
    }
  }, [location.search, reports]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    setUpdating(true);
    try {
      await AdminAPI.updateReportStatus(reportId, newStatus);
      toast.success(newStatus === 'resolved' ? 'Signalement résolu' : 'Signalement rejeté');
      setReports(current => current.map(r => 
        r.id === reportId ? { ...r, status: newStatus } : r
      ));
      setSelectedReport(null);
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des signalements</h1>
        <p className="text-muted-foreground mt-1 text-lg">Traitez les alertes envoyées par les utilisateurs</p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total" value={stats.total} icon={Flag} variant="primary" loading={loading} />
        <StatCard title="En attente" value={stats.pending} icon={Clock} variant="warning" loading={loading} />
        <StatCard title="Résolus" value={stats.resolved} icon={CheckCircle} variant="success" loading={loading} />
        <StatCard title="Rejetés" value={stats.rejected} icon={XCircle} variant="destructive" loading={loading} />
      </div>

      {/* Filtres et tableau */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Liste des signalements</CardTitle>
          <CardDescription>
            {loading ? 'Chargement...' : `${filteredReports.length} signalement${filteredReports.length > 1 ? 's' : ''} trouvé${filteredReports.length > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Type de cible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="tool">Outils</SelectItem>
                <SelectItem value="comment">Commentaires</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground font-medium">Chargement des signalements...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-20 bg-muted/10">
                <Flag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-lg">Aucun signalement trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead>Cible</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} id={`report-row-${report.id}`} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-2">
                          {report.type === 'tool' ? <Wrench className="h-4 w-4 text-muted-foreground" /> : <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                          <div className="min-w-0">
                            <p className="truncate">{report.targetName}</p>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                              {report.type === 'tool' ? 'Outil' : 'Commentaire'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <Badge variant="outline" className="font-medium">{report.reason}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.status === 'pending'
                              ? 'secondary'
                              : report.status === 'resolved'
                                ? 'default'
                                : 'outline'
                          }
                          className={report.status === 'pending' ? 'bg-warning/20 text-warning-foreground border-warning/30' : ''}
                        >
                          {report.status === 'pending'
                            ? 'En attente'
                            : report.status === 'resolved'
                              ? 'Résolu'
                              : 'Rejeté'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setSelectedReport(report)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedReport(report)} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Détails complets
                              </DropdownMenuItem>
                              {report.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                    className="text-success cursor-pointer focus:bg-success/10"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Résoudre
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpdateStatus(report.id, 'rejected')}
                                    className="text-destructive cursor-pointer focus:bg-destructive/10"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Rejeter
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modale de détails */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && !updating && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[85vh]">
          {/* En-tête fixe */}
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl">Détails du signalement</DialogTitle>
            <DialogDescription>Analyse et traitement de l&apos;alerte</DialogDescription>
          </DialogHeader>

          {/* Zone défilante avec espace intérieur supplémentaire */}
          {selectedReport && (
            <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-6">
              {/* Ajout d'un petit espace en haut de la zone défilante (optionnel) */}
              <div className="pt-1"></div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  {selectedReport.type === 'tool' ? (
                    <Wrench className="h-6 w-6 text-primary" />
                  ) : (
                    <MessageSquare className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">{selectedReport.targetName}</h3>
                  <div className="flex gap-2 items-center">
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {selectedReport.type === 'tool' ? 'OUTIL SIGNALÉ' : 'COMMENTAIRE SIGNALÉ'}
                    </Badge>
                    {selectedReport.type === 'tool' && selectedReport.toolId && (
                      <a 
                        href={`/tools/${selectedReport.toolId}`} 
                        className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Voir la page <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                  <Label className="text-xs font-bold uppercase text-muted-foreground mb-1.5 block">Motif du signalement</Label>
                  <p className="font-semibold text-foreground border-l-4 border-primary pl-3 py-1 bg-primary/5 rounded-r">
                    {selectedReport.reason}
                  </p>
                </div>

                {selectedReport.details && (
                  <div>
                    <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Description détaillée</Label>
                    <div className="p-3 rounded-lg border bg-muted/20 text-sm leading-relaxed">
                      {selectedReport.details}
                    </div>
                  </div>
                )}
                
                {selectedReport.commentContent && (
                  <div>
                    <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Contenu du commentaire</Label>
                    <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 text-sm italic">
                      "{selectedReport.commentContent}"
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 pt-3">
                  <div>
                    <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Rapporté par</Label>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      {selectedReport.reporterName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Date du rapport</Label>
                    <p className="text-sm font-medium">
                      {new Date(selectedReport.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-2 pb-1">
                  <Label className="text-xs font-bold uppercase text-muted-foreground mb-1.5 block">Statut actuel</Label>
                  <Badge
                    variant={
                      selectedReport.status === 'pending'
                        ? 'secondary'
                        : selectedReport.status === 'resolved'
                          ? 'default'
                          : 'outline'
                    }
                    className={`h-7 px-3 ${selectedReport.status === 'pending' ? 'bg-warning/20 text-warning-foreground border-warning/30' : ''}`}
                  >
                    {selectedReport.status === 'pending'
                      ? 'Action admin requise'
                      : selectedReport.status === 'resolved'
                        ? 'Traité et résolu'
                        : 'Signalement rejeté'}
                  </Badge>
                </div>
              </div>
              
              {/* Petit espace en bas de la zone défilante */}
              <div className="pb-2"></div>
            </div>
          )}

          {/* Pied fixe – avec un peu plus d'espace intérieur */}
          {selectedReport?.status === 'pending' && (
            <DialogFooter className="px-6 pb-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleUpdateStatus(selectedReport.id, 'rejected')}
                disabled={updating}
                className="flex-1"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rejeter l\'alerte'}
              </Button>
              <Button
                onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                disabled={updating}
                className="flex-1"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Marquer comme résolu'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}