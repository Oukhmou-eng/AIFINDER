import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Settings, Shield, Bell, Database, Save, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

const defaultSettings = {
  maintenanceMode: false,
  allowNewRegistrations: true,
  enablePromptTest: true,
  reportThreshold: 3,
  autoSuspendAfterReports: 5,
};

// Modal simple (remplace AlertDialog)
function ConfirmDialog({ open, onClose, onConfirm, title, description }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={onConfirm}>Confirmer</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [dialogState, setDialogState] = useState({ open: false, type: '', title: '', description: '' });

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('Paramètres enregistrés avec succès');
    setHasChanges(false);
  };

  const openConfirmDialog = (type, title, description) => {
    setDialogState({ open: true, type, title, description });
  };

  const handleConfirm = () => {
    if (dialogState.type === 'resetStats') {
      toast.success('Statistiques réinitialisées');
    } else if (dialogState.type === 'clearCache') {
      toast.success('Cache vidé');
    }
    setDialogState({ open: false, type: '', title: '', description: '' });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground mt-1">Configuration générale de la plateforme</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les modifications
        </Button>
      </div>

      {/* Paramètres généraux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres généraux
          </CardTitle>
          <CardDescription>Configuration de base de la plateforme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode maintenance</Label>
              <p className="text-sm text-muted-foreground">Désactive l&apos;accès public à la plateforme</p>
            </div>
            <Switch checked={settings.maintenanceMode} onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nouvelles inscriptions</Label>
              <p className="text-sm text-muted-foreground">Autorise les nouveaux utilisateurs à s&apos;inscrire</p>
            </div>
            <Switch checked={settings.allowNewRegistrations} onCheckedChange={(checked) => updateSetting('allowNewRegistrations', checked)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Test de prompt in-site</Label>
              <p className="text-sm text-muted-foreground">Active la fonction de test des outils via leur API</p>
            </div>
            <Switch checked={settings.enablePromptTest} onCheckedChange={(checked) => updateSetting('enablePromptTest', checked)} />
          </div>
        </CardContent>
      </Card>

      {/* Modération */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Modération
          </CardTitle>
          <CardDescription>Paramètres de modération et signalements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="reportThreshold">Seuil d&apos;alerte signalements</Label>
              <p className="text-xs text-muted-foreground">Nombre de signalements avant notification urgente</p>
              <Input
                id="reportThreshold"
                type="number"
                value={settings.reportThreshold}
                onChange={(e) => updateSetting('reportThreshold', parseInt(e.target.value) || 0)}
                className="max-w-[150px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="autoSuspend">Suspension automatique</Label>
              <p className="text-xs text-muted-foreground">Nombre de signalements pour suspension auto d&apos;un utilisateur</p>
              <Input
                id="autoSuspend"
                type="number"
                value={settings.autoSuspendAfterReports}
                onChange={(e) => updateSetting('autoSuspendAfterReports', parseInt(e.target.value) || 0)}
                className="max-w-[150px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications email
          </CardTitle>
          <CardDescription>Configuration des emails automatiques</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications admin</Label>
              <p className="text-sm text-muted-foreground">Recevoir des emails pour les nouveaux signalements</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertes outils en attente</Label>
              <p className="text-sm text-muted-foreground">Recevoir un email quotidien si des outils attendent validation</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Résumé hebdomadaire</Label>
              <p className="text-sm text-muted-foreground">Recevoir un rapport d&apos;activité chaque semaine</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Zone de danger */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zone de danger
          </CardTitle>
          <CardDescription>Actions irréversibles nécessitant une attention particulière</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Réinitialiser les statistiques</Label>
              <p className="text-sm text-muted-foreground">Remet à zéro toutes les métriques de la plateforme</p>
            </div>
            <Button
              variant="outline"
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
              onClick={() => openConfirmDialog('resetStats', 'Êtes-vous sûr ?', 'Cette action est irréversible. Toutes les statistiques seront remises à zéro.')}
            >
              Réinitialiser
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Vider le cache</Label>
              <p className="text-sm text-muted-foreground">Supprime tous les fichiers en cache de la plateforme</p>
            </div>
            <Button
              variant="outline"
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
              onClick={() => openConfirmDialog('clearCache', 'Vider le cache ?', 'Le site pourrait être temporairement ralenti pendant la reconstruction du cache.')}
            >
              <Database className="mr-2 h-4 w-4" />
              Vider le cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmation */}
      <ConfirmDialog
        open={dialogState.open}
        onClose={() => setDialogState({ open: false, type: '', title: '', description: '' })}
        onConfirm={handleConfirm}
        title={dialogState.title}
        description={dialogState.description}
      />
    </div>
  );
}