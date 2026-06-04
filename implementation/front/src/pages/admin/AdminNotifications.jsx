import { useState } from 'react';
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
import { Bell, Send, Mail, Globe, Users } from 'lucide-react';
import { mockNotifications } from '../../lib/mock-data';

// Composant StatCard local
function StatCard({ title, value, icon: Icon, description, variant = 'primary' }) {
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
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all',
    channel: 'platform',
  });

  const handleSend = () => {
    const notification = {
      id: Date.now().toString(),
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      recipients: newNotification.recipients,
      channel: newNotification.channel,
      createdAt: new Date().toISOString(),
      read: false,
      userId: 'admin', // simplification
    };
    setNotifications([notification, ...notifications]);
    setIsDialogOpen(false);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      recipients: 'all',
      channel: 'platform',
    });
  };

  const typeConfig = {
    info: { label: 'Info', className: 'bg-primary/10 text-primary border-primary/20' },
    success: { label: 'Succès', className: 'bg-success/10 text-success border-success/20' },
    warning: { label: 'Avertissement', className: 'bg-warning/10 text-warning border-warning/20' },
    error: { label: 'Erreur', className: 'bg-destructive/10 text-destructive border-destructive/20' },
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
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Envoyez des notifications aux utilisateurs</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Send className="mr-2 h-4 w-4" />
          Nouvelle notification
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Notifications envoyées"
          value={notifications.length}
          description="au total"
          icon={Bell}
          variant="primary"
        />
        <StatCard
          title="Par email"
          value={notifications.filter((n) => n.channel === 'email' || n.channel === 'both').length}
          icon={Mail}
        />
        <StatCard
          title="Utilisateurs notifiés"
          value="1 247"
          description="cette semaine"
          icon={Users}
        />
      </div>

      {/* Tableau historique */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des notifications</CardTitle>
          <CardDescription>Liste des notifications envoyées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Notification</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Destinataires</TableHead>
                  <TableHead className="hidden sm:table-cell">Canal</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => {
                  const ChannelIcon = channelConfig[notification.channel]?.icon || Bell;
                  return (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1 max-w-[250px]">
                            {notification.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={typeConfig[notification.type]?.className || typeConfig.info.className}
                        >
                          {typeConfig[notification.type]?.label || 'Info'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {recipientsConfig[notification.recipients] || notification.recipients}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {channelConfig[notification.channel]?.label || 'Plateforme'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogue d'envoi de notification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Envoyer une notification</DialogTitle>
            <DialogDescription>Créez et envoyez une notification aux utilisateurs</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notifTitle">Titre</Label>
              <Input
                id="notifTitle"
                placeholder="Titre de la notification..."
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notifMessage">Message</Label>
              <Textarea
                id="notifMessage"
                placeholder="Contenu de la notification..."
                rows={4}
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="warning">Avertissement</SelectItem>
                    <SelectItem value="error">Erreur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Canal</Label>
                <Select
                  value={newNotification.channel}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, channel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">Plateforme uniquement</SelectItem>
                    <SelectItem value="email">Email uniquement</SelectItem>
                    <SelectItem value="both">Plateforme + Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Destinataires</Label>
              <Select
                value={newNotification.recipients}
                onValueChange={(value) =>
                  setNewNotification({ ...newNotification, recipients: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  <SelectItem value="active">Utilisateurs actifs uniquement</SelectItem>
                  <SelectItem value="recent">Connectés récemment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={!newNotification.title || !newNotification.message}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}