import { useEffect, useState } from 'react';
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
  MoreHorizontal 
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminAPI } from '../../services/adminAPI';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

function StatCard({ title, value, icon: Icon, description, variant = 'primary', loading = false }) {
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
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all',
    channel: 'platform',
  });

  const [deletingNotif, setDeletingNotif] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await AdminAPI.notifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      toast.error(err.message || 'Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        recipients: 'all',
        channel: 'platform',
      });
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

  const typeConfig = {
    info: { label: 'Info', icon: Info, className: 'bg-primary/10 text-primary border-primary/20' },
    success: { label: 'Succès', icon: CheckCircle2, className: 'bg-success/10 text-success border-success/20' },
    warning: { label: 'Attention', icon: AlertTriangle, className: 'bg-warning/10 text-warning border-warning/20' },
    error: { label: 'Erreur', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  };

  const channelConfig = {
    platform: { label: 'Plateforme', icon: Globe },
    email: { label: 'Email', icon: Mail },
    both: { label: 'Les deux', icon: Bell },
  };

  const recipientsConfig = {
    all: 'Tous les utilisateurs',
    active: 'Utilisateurs actifs',
    recent: 'Connectés récemment',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centre de Notifications</h1>
          <p className="text-muted-foreground mt-1 text-lg">Communiquez avec les utilisateurs de la plateforme</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="lg" className="shadow-sm">
          <Send className="mr-2 h-4 w-4" />
          Envoyer une notification
        </Button>
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
          title="Canal Email"
          value={notifications.filter((n) => n.channel === 'email' || n.channel === 'both').length}
          description="utilisant le canal email"
          icon={Mail}
          loading={loading}
        />
        <StatCard
          title="Destinataires"
          value={notifications.reduce((sum, n) => sum + (parseInt(n.recipientCount) || 0), 0)}
          description="total des envois individuels"
          icon={Users}
          variant="success"
          loading={loading}
        />
      </div>

      {/* Tableau historique */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Historique des campagnes</CardTitle>
          <CardDescription>Liste des messages diffusés aux utilisateurs</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground font-medium">Chargement de l&apos;historique...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-20 bg-muted/10">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-lg">Aucune notification envoyée</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="min-w-[200px]">Message</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Cible</TableHead>
                    <TableHead className="hidden sm:table-cell text-center">Impact</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="w-20 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification, index) => {
                    const type = typeConfig[notification.type] || typeConfig.info;
                    return (
                      <TableRow key={index} className="hover:bg-muted/5 transition-colors">
                        <TableCell>
                          <div className="max-w-[400px]">
                            <p className="font-bold text-foreground">{notification.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className={`flex items-center gap-1.5 w-fit font-medium ${type.className}`}
                          >
                            <type.icon className="h-3 w-3" />
                            {type.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm font-medium text-muted-foreground capitalize">
                            {recipientsConfig[notification.cible] || notification.cible}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          <Badge variant="secondary" className="font-bold">
                            {notification.recipientCount} reçus
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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

      {/* Dialogue d'envoi de notification */}
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
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, type: value })
                  }
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
                <Label className="font-bold">Cible des utilisateurs</Label>
                <Select
                  value={newNotification.recipients}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, recipients: value })
                  }
                  disabled={sending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les inscrits</SelectItem>
                    <SelectItem value="active">Utilisateurs actifs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
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
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)} disabled={sending}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={sending}
              className="min-w-[100px]"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
