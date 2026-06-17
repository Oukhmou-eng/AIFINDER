import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Bell, 
  Check, 
  CheckCheck,
  Info,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';

export default function DashboardNotifications() {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification 
  } = useAuth();
  const [loading, setLoading] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      toast.success('Notification marquée comme lue');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success('Toutes les notifications sont marquées comme lues');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      toast.success('Notification supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'tool_approved':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
      case 'tool_rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
      case 'new_tool':
        return <Bell className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const NotificationItem = ({ notification }) => (
    <div
      className={`flex items-start gap-4 rounded-lg border border-border p-4 transition-colors ${
        !notification.read ? 'bg-accent/30' : ''
      }`}
    >
      <div className="shrink-0">{getNotificationIcon(notification.type)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDate(notification.createdAt)}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {notification.link && (
            <Link to={notification.link}>
              <Button variant="outline" size="sm">Voir</Button>
            </Link>
          )}
          {!notification.read && (
            <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
              <Check className="mr-1 h-4 w-4" />
              Marquer comme lu
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDeleteNotification(notification.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* En-tête de la page */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadNotifications.length > 0
                ? `${unreadNotifications.length} notification${unreadNotifications.length > 1 ? 's' : ''} non lue${unreadNotifications.length > 1 ? 's' : ''}`
                : 'Toutes vos notifications sont lues'}
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Onglets */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              Toutes
              <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-2">{unreadNotifications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">
              Lues
              <Badge variant="secondary" className="ml-2">{readNotifications.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-4">
            {unreadNotifications.length > 0 ? (
              <div className="space-y-3">
                {unreadNotifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <CheckCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Tout est lu !</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Vous n&apos;avez aucune notification non lue
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="read" className="mt-4">
            {readNotifications.length > 0 ? (
              <div className="space-y-3">
                {readNotifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Aucune notification lue</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Vos notifications lues apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="py-12">
      <CardContent className="text-center">
        <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">Aucune notification</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Vous recevrez des notifications concernant vos outils proposés, vos signalements, et les actualités de la plateforme.
        </p>
      </CardContent>
    </Card>
  );
}