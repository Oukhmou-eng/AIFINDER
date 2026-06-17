import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Bell,
  Send,
  Mail,
  Globe,
  Users,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
  MoreHorizontal,
  Copy,
  Eye,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminAPI } from '../../services/adminAPI';
import { cn } from '../../lib/utils';

// Composant de carte statistique amélioré
function StatCard({ title, value, icon: Icon, description, variant = 'primary', loading = false, trend }) {
  const variantClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return (
    <Card className="border-l-4" style={{ borderLeftColor: `hsl(var(--${variant}))` }}>
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
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}

const getRecipientLabel = (cible) => {
  if (!cible) return 'Non spécifié';
  const mapping = {
    all: 'Tous les utilisateurs',
    active: 'Utilisateurs actifs',
    // ajoutez ici d'autres valeurs possibles
  };
  return mapping[cible] || cible; // affiche la valeur brute si non mappée
};


// Configuration des types de notifications
const typeConfig = {
  info: { label: 'Information', icon: Info, className: 'bg-primary/10 text-primary border-primary/20' },
  success: { label: 'Succès', icon: CheckCircle2, className: 'bg-success/10 text-success border-success/20' },
  warning: { label: 'Attention', icon: AlertTriangle, className: 'bg-warning/10 text-warning border-warning/20' },
  error: { label: 'Erreur', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
};


// Options de destinataires
const recipientsConfig = {
  all: 'Tous les utilisateurs',
  active: 'Utilisateurs actifs',
  // 'recent' pourrait être ajouté si besoin
};

// Extrait le titre entre crochets et le message après
function extractNotificationParts(fullText) {
  const match = fullText.match(/^\[(.*?)\]\s*(.*)$/);
  if (match) {
    return { title: match[1], message: match[2] };
  }
  // Fallback si aucun crochet
  return { title: fullText, message: '' };
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [sending, setSending] = useState(false);
  const [deletingNotif, setDeletingNotif] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all',
  });

  // Chargement des notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await AdminAPI.notifications();
      setNotifications(data.notifications || []);
      console.log('Notifications chargées :', data.notifications);
    } catch (err) {
      toast.error(err.message || 'Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filtrage et recherche
  const filteredNotifications = useMemo(() => {
    let result = notifications;
    if (typeFilter !== 'all') {

      result = result.filter(n => n.TYPE === typeFilter);

    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        (n.title?.toLowerCase().includes(q)) ||
        (n.message?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [notifications, typeFilter, searchQuery]);


  // Extraction des types uniques (basée sur le champ 'type' ou 'TYPE')
  const uniqueTypes = useMemo(() => {
    const typesSet = new Set();
    notifications.forEach(notif => {
      const t = notif.type || notif.TYPE;
      if (t) typesSet.add(t);
    });
    return Array.from(typesSet).sort();
  }, [notifications]);

  // Statistiques
  const totalRecipients = useMemo(() =>
    notifications.reduce((sum, n) => sum + (parseInt(n.recipientCount) || 0), 0)
    , [notifications]);

  const handleSend = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast.error('Le titre et le message sont obligatoires');
      return;
    }
    setSending(true);
    try {
      await AdminAPI.sendNotification(newNotification);
      toast.success('Notification envoyée avec succès');
      setIsDialogOpen(false);
      setNewNotification({ title: '', message: '', type: 'info', recipients: 'all' });
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingNotif) return;
    setSending(true);
    try {
      await AdminAPI.deleteNotification(deletingNotif);
      toast.success('Campagne supprimée');
      setIsConfirmDeleteOpen(false);
      setDeletingNotif(null);
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setSending(false);
    }
  };

  const handleDuplicate = (notif) => {
    setNewNotification({
      title: `[Copie] ${notif.title}`,
      message: notif.message,
      type: notif.type || 'info',
      recipients: notif.cible || 'all',
    });
    setIsDialogOpen(true);
  };

  const handleViewDetails = (notif) => {
    setSelectedNotif(notif);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centre de Notifications</h1>
          <p className="text-muted-foreground mt-1">Communiquez avec les utilisateurs de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNotifications} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} size="lg" className="shadow-sm">
            <Send className="mr-2 h-4 w-4" />
            Envoyer une notification
          </Button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Notifications envoyées"
          value={notifications.length}
          description="campagnes au total"
          icon={Bell}
          variant="primary"
          loading={loading}
        />
        <StatCard
          title="Total destinataires"
          value={totalRecipients.toLocaleString()}
          description="envois individuels"
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          title="Dernière notification"
          value={notifications[0]?.createdAt ? new Date(notifications[0].createdAt).toLocaleDateString('fr-FR') : '-'}
          description={notifications[0]?.title || 'Aucune'}
          icon={Globe}
          variant="warning"
          loading={loading}
        />
      </div>

      {/* Filtres et tableau */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Historique des campagnes</CardTitle>
              <CardDescription>Liste des messages diffusés aux utilisateurs</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="warning">Attention</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground font-medium">Chargement de l&apos;historique...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-20 bg-muted/10">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-lg">
                  {searchQuery || typeFilter !== 'all' ? 'Aucune notification correspondante' : 'Aucune notification envoyée'}
                </p>
                {(searchQuery || typeFilter !== 'all') && (
                  <Button variant="link" onClick={() => { setSearchQuery(''); setTypeFilter('all'); }}>
                    Effacer les filtres
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="min-w-[250px]">Message</TableHead>
                    <TableHead className="hidden md:table-cell w-[100px]">Type</TableHead>
                    <TableHead className="hidden md:table-cell w-[140px]">Cible</TableHead>
                    <TableHead className="hidden sm:table-cell text-center w-[90px]">Impact</TableHead>
                    <TableHead className="text-center w-[110px]">Date</TableHead>
                    <TableHead className="w-20 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification, idx) => {
                    const typeKey = notification.TYPE;
                    const type = typeConfig[typeKey] || {
                      label: notification.TYPE || 'Inconnu',
                      icon: Info,
                      className: 'bg-muted/10 text-muted-foreground border-muted/20'
                    };
                    const recipientLabel = getRecipientLabel(notification.cible);

                    // Extraction du titre et du message
                    const { title: extractedTitle, message: extractedMessage } = extractNotificationParts(notification.MESSAGE || notification.title || '');
                    return (
                      <TableRow key={idx} className="hover:bg-muted/5 transition-colors group">
                        <TableCell>
                          <div className="max-w-[300px]">
                            <p className="font-bold text-foreground truncate" title={extractedTitle}>
                              {extractedTitle}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1" title={extractedMessage}>
                              {extractedMessage}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className={`flex items-center gap-1.5 w-fit font-medium ${type.className}`}>
                            <type.icon className="h-3 w-3" />
                            {type.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm font-medium text-muted-foreground capitalize">
                            {notification.CIBLE || notification.recipients || 'Non définie'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          <Badge variant="secondary" className="font-bold">
                            {notification.recipientCount} reçus
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          <div>{new Date(notification.createdAt).toLocaleDateString('fr-FR')}</div>
                          <div className="text-xs">{new Date(notification.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-70 group-hover:opacity-100">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(notification)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(notification)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Dupliquer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeletingNotif(notification);
                                  setIsConfirmDeleteOpen(true);
                                }}
                                className="text-destructive cursor-pointer focus:bg-destructive/10"
                              >
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogue d'envoi / édition */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && !sending && setIsDialogOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Nouvelle notification</DialogTitle>
            <DialogDescription>Rédigez un message qui sera envoyé aux utilisateurs sélectionnés.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notifTitle" className="font-bold">Titre du message</Label>
              <Input
                id="notifTitle"
                placeholder="Ex: Nouvelle mise à jour disponible !"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                disabled={sending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notifMessage" className="font-bold">Contenu</Label>
              <Textarea
                id="notifMessage"
                placeholder="Détaillez votre annonce ici..."
                rows={5}
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                className="resize-none"
                disabled={sending}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">Type d&apos;alerte</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}
                  disabled={sending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information (Bleu)</SelectItem>
                    <SelectItem value="success">Succès (Vert)</SelectItem>
                    <SelectItem value="warning">Avertissement (Orange)</SelectItem>
                    <SelectItem value="error">Erreur / Critique (Rouge)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">Destinataires</Label>
                <Select
                  value={newNotification.recipients}
                  onValueChange={(value) => setNewNotification({ ...newNotification, recipients: value })}
                  disabled={sending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les utilisateurs</SelectItem>
                    <SelectItem value="active">Utilisateurs actifs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={sending}>
              Annuler
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !newNotification.title || !newNotification.message}
              className="min-w-[120px]"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Diffuser
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de détails */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la notification</DialogTitle>
          </DialogHeader>
          {selectedNotif && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Titre</p>
                <p className="text-base font-semibold">
                  {extractNotificationParts(selectedNotif.MESSAGE || selectedNotif.title).title}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <p className="text-sm whitespace-pre-wrap">
                  {extractNotificationParts(selectedNotif.MESSAGE || selectedNotif.title).message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge variant="outline" className={`mt-1 ${typeConfig[selectedNotif.TYPE]?.className}`}>
                    {typeConfig[selectedNotif.TYPE]?.label || selectedNotif.TYPE}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Destinataires</p>
                  <p className="text-sm capitalize">{recipientsConfig[selectedNotif.CIBLE] || selectedNotif.CIBLE}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d&apos;envoi</p>
                  <p className="text-sm">{new Date(selectedNotif.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre de destinataires</p>
                  <p className="text-sm font-bold">{selectedNotif.recipientCount} utilisateurs</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={(open) => !open && !sending && setIsConfirmDeleteOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer cette campagne ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera la notification pour tous les destinataires (<strong>{deletingNotif?.recipientCount}</strong> utilisateurs).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">"{deletingNotif?.title}"</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{deletingNotif?.message}</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)} disabled={sending}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={sending} className="min-w-[100px]">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}