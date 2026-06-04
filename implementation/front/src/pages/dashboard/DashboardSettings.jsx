import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { Bell } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    toolApproved: true,
    toolRejected: true,
    newReply: true,
    reportUpdate: true,
    newsletter: false,
    marketing: false,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos préférences de notification</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choisissez les notifications que vous souhaitez recevoir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-4 font-medium">Activité</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Outil approuvé</p>
                  <p className="text-sm text-muted-foreground">
                    Recevez une notification quand votre outil est validé
                  </p>
                </div>
                <Switch
                  checked={notifications.toolApproved}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, toolApproved: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Outil refusé</p>
                  <p className="text-sm text-muted-foreground">
                    Recevez une notification quand votre outil est refusé
                  </p>
                </div>
                <Switch
                  checked={notifications.toolRejected}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, toolRejected: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nouvelles réponses</p>
                  <p className="text-sm text-muted-foreground">
                    Recevez une notification quand quelqu&apos;un répond à votre commentaire
                  </p>
                </div>
                <Switch
                  checked={notifications.newReply}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newReply: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mise à jour des signalements</p>
                  <p className="text-sm text-muted-foreground">
                    Recevez une notification quand votre signalement est traité
                  </p>
                </div>
                <Switch
                  checked={notifications.reportUpdate}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, reportUpdate: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-4 font-medium">Email</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Newsletter</p>
                  <p className="text-sm text-muted-foreground">
                    Recevez les dernières actualités et nouveautés
                  </p>
                </div>
                <Switch
                  checked={notifications.newsletter}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newsletter: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Offres et promotions</p>
                  <p className="text-sm text-muted-foreground">
                    Recevez des offres exclusives de nos partenaires
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, marketing: checked })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}