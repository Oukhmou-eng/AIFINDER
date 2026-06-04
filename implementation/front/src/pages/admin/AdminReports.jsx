import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
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
import { Flag, Clock, CheckCircle, XCircle, MessageSquare, Wrench, MoreHorizontal, Eye } from 'lucide-react';
import { mockReports, tools, reviews } from '../../lib/mock-data';

// Composant StatCard local
function StatCard({ title, value, icon: Icon, variant = 'primary' }) {
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
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// Composant ReportsTable local
function ReportsTable({ reports, onView, onResolve, onReject }) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun signalement trouvé</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cible</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Motif</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id} id={`report-row-${report.id}`}>
            <TableCell className="font-medium">{report.targetName}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {report.type === 'tool' ? 'Outil' : 'Commentaire'}
              </Badge>
            </TableCell>
            <TableCell>{report.reason}</TableCell>
            <TableCell>{new Date(report.createdAt).toLocaleDateString('fr-FR')}</TableCell>
            <TableCell>
              <Badge
                variant={
                  report.status === 'pending'
                    ? 'secondary'
                    : report.status === 'resolved'
                      ? 'default'
                      : 'outline'
                }
              >
                {report.status === 'pending'
                  ? 'En attente'
                  : report.status === 'resolved'
                    ? 'Résolu'
                    : 'Rejeté'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(report)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </DropdownMenuItem>
                  {report.status === 'pending' && (
                    <>
                      <DropdownMenuItem onClick={() => onResolve(report)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Résoudre
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReject(report)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeter
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminReports() {
  // Enrichissement des signalements mock avec des noms affichables
  const initialReports = mockReports.map((report) => {
    let targetName = report.targetId;
    if (report.type === 'tool') {
      const tool = tools.find(t => t.id === report.targetId);
      targetName = tool?.name || report.targetId;
    } else if (report.type === 'comment') {
      const review = reviews.find(r => r.id === report.targetId);
      targetName = review ? `Commentaire sur ${review.toolId}` : report.targetId;
    }
    return {
      ...report,
      targetName,
      reporterName: `Utilisateur ${report.userId.slice(-4)}`, // simplifié
    };
  });

  const location = useLocation();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState(initialReports);

  const filteredReports = reports.filter((report) => {
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const rejectedCount = reports.filter((r) => r.status === 'rejected').length;

  useEffect(() => {
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
            row.classList.add('bg-primary/10', 'transition-colors', 'duration-500');
            setTimeout(() => row.classList.remove('bg-primary/10'), 2000);
          }
        }, 100);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [location.search, reports]);

  const handleResolve = (report) => {
    setReports(reports.map(r =>
      r.id === report.id
        ? { ...r, status: 'resolved', resolvedAt: new Date().toISOString() }
        : r
    ));
  };

  const handleReject = (report) => {
    setReports(reports.map(r =>
      r.id === report.id
        ? { ...r, status: 'rejected', resolvedAt: new Date().toISOString() }
        : r
    ));
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des signalements</h1>
        <p className="text-muted-foreground mt-1">Traitez les signalements d&apos;outils et de commentaires</p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total signalements" value={reports.length} icon={Flag} variant="primary" />
        <StatCard title="En attente" value={pendingCount} icon={Clock} variant="warning" />
        <StatCard title="Résolus" value={resolvedCount} icon={CheckCircle} variant="success" />
        <StatCard title="Rejetés" value={rejectedCount} icon={XCircle} variant="destructive" />
      </div>

      {/* Filtres et tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des signalements</CardTitle>
          <CardDescription>
            {filteredReports.length} signalement{filteredReports.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="tool">Outils</SelectItem>
                <SelectItem value="comment">Commentaires</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ReportsTable
            reports={filteredReports}
            onView={setSelectedReport}
            onResolve={handleResolve}
            onReject={handleReject}
          />
        </CardContent>
      </Card>

      {/* Modale de détails */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du signalement</DialogTitle>
            <DialogDescription>Informations et actions disponibles</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  {selectedReport.type === 'tool' ? (
                    <Wrench className="h-6 w-6 text-warning" />
                  ) : (
                    <MessageSquare className="h-6 w-6 text-warning" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedReport.targetName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.type === 'tool' ? 'Outil' : 'Commentaire'} signalé
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Motif</p>
                  <Badge variant="outline" className="mt-1">{selectedReport.reason}</Badge>
                </div>

                {selectedReport.details && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm mt-1">{selectedReport.details}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Signalé par</p>
                    <p className="text-sm mt-1">{selectedReport.reporterName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                    <p className="text-sm mt-1">
                      {new Date(selectedReport.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut actuel</p>
                  <Badge
                    variant={
                      selectedReport.status === 'pending'
                        ? 'secondary'
                        : selectedReport.status === 'resolved'
                          ? 'default'
                          : 'outline'
                    }
                    className="mt-1"
                  >
                    {selectedReport.status === 'pending'
                      ? 'En attente'
                      : selectedReport.status === 'resolved'
                        ? 'Résolu'
                        : 'Rejeté'}
                  </Badge>
                </div>
              </div>

              {selectedReport.status === 'pending' && (
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleReject(selectedReport);
                      setSelectedReport(null);
                    }}
                  >
                    Rejeter le signalement
                  </Button>
                  <Button
                    onClick={() => {
                      handleResolve(selectedReport);
                      setSelectedReport(null);
                    }}
                  >
                    Marquer comme résolu
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}