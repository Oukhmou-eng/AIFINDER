import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { User, Mail, Lock, Camera, Save, Trash2, X, Upload, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(user?.name || 'user');
  const [avatarGender, setAvatarGender] = useState('female');

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProfile({ name: profile.name, email: profile.email, bio: profile.bio, avatar: avatarUrl });
    setIsSaving(false);
    toast.success('Profil mis à jour avec succès !');
  };

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.new.length < 8) {
      toast.error('Le mot de passe doit comporter au moins 8 caractères');
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setPassword({ current: '', new: '', confirm: '' });
    toast.success('Mot de passe modifié avec succès !');
  };

  const handleDeleteAccount = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Compte supprimé');
    setShowDeleteConfirm(false);
    // logout(); // À décommenter si la fonction logout est disponible dans le contexte
    navigate('/');
  };

  // Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      if (file.size <= 2 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarUrl(reader.result);
          setShowAvatarDialog(false);
          toast.success('Avatar mis à jour !');
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Le fichier ne doit pas dépasser 2 Mo');
      }
    } else {
      toast.error('Format non supporté (JPG, PNG, GIF uniquement)');
    }
  };

  // Génération avec seed
  const generateDiceBearAvatar = () => {
    const seed = avatarSeed.trim() || 'user';
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;
    setAvatarUrl(url);
    setShowAvatarDialog(false);
    toast.success('Avatar généré !');
  };

  // Sélection depuis la galerie
  const selectPredefinedAvatar = (avatarId) => {
    // Utilise un seed basé sur le genre et un identifiant unique
    const seed = `${avatarGender}_${avatarId}`;
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`;
    setAvatarUrl(url);
    setShowAvatarDialog(false);
    toast.success('Avatar sélectionné !');
  };

  const predefinedAvatars = [1, 2, 3, 4, 5, 6];

  const getInitials = () => profile.name.charAt(0).toUpperCase() || 'U';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>Vos données publiques et privées</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar row */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={profile.name} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" onClick={() => setShowAvatarDialog(true)}>
                <Camera className="mr-2 h-4 w-4" />
                Changer l&apos;avatar
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG ou GIF. Max 2MB.
              </p>
            </div>
          </div>

          {/* Reste du formulaire (inchangé) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" className="pl-10" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Parlez-nous de vous..." value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
            <p className="text-xs text-muted-foreground">Visible sur votre profil public</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Enregistrement...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Enregistrer</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mot de passe (inchangé) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Mot de passe</CardTitle>
          <CardDescription>Modifiez votre mot de passe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Mot de passe actuel</Label>
            <Input id="current-password" type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer</Label>
              <Input id="confirm-password" type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleChangePassword} disabled={!password.current || !password.new || !password.confirm}>Changer le mot de passe</Button>
          </div>
        </CardContent>
      </Card>

      {/* Zone de danger (inchangé) */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" />Zone de danger</CardTitle>
          <CardDescription>Actions irréversibles sur votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="font-medium">Supprimer mon compte</p>
              <p className="text-sm text-muted-foreground">Cette action supprimera définitivement votre compte et toutes vos données.</p>
            </div>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Supprimer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal suppression compte (inchangé) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Êtes-vous absolument sûr ?</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Cette action est irréversible. Cela supprimera définitivement votre compte et toutes les données associées : favoris, collections, commentaires et outils proposés.</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>Supprimer mon compte</Button>
            </div>
          </div>
        </div>
      )}

      {/* NOUVEAU : Dialog pour changer l'avatar */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer votre avatar</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">📁 Importer</TabsTrigger>
              <TabsTrigger value="generate">✨ Générer</TabsTrigger>
              <TabsTrigger value="gallery">🎨 Choisir</TabsTrigger>
            </TabsList>

            {/* Onglet 1 : Importer une image */}
            <TabsContent value="upload" className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/50 transition-colors hover:bg-muted" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">Cliquez pour sélectionner</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleImageUpload} />
                <p className="text-xs text-muted-foreground">Formats acceptés : JPG, PNG, GIF (max 2 Mo)</p>
              </div>
            </TabsContent>

            {/* Onglet 2 : Générer avec une graine */}
            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-2 py-2">
                <Label htmlFor="avatar-seed">Nom / identifiant</Label>
                <Input id="avatar-seed" placeholder="Entrez un nom ou un pseudo" value={avatarSeed} onChange={(e) => setAvatarSeed(e.target.value)} />
                <p className="text-xs text-muted-foreground">Utilisé pour créer un avatar unique et cohérent. Si vide, "user" sera utilisé.</p>
                <div className="mt-4 flex justify-center">
                  <div className="h-24 w-24 overflow-hidden rounded-full border border-border">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed || 'user')}&backgroundColor=b6e3f4`} alt="Aperçu" className="h-full w-full object-cover" />
                  </div>
                </div>
                <Button onClick={generateDiceBearAvatar} className="w-full"><RefreshCw className="mr-2 h-4 w-4" />Générer et utiliser</Button>
              </div>
            </TabsContent>

            {/* Onglet 3 : Galerie d'avatars avec sélection de genre */}
            <TabsContent value="gallery" className="space-y-4">
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-center gap-6">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                    <input type="radio" name="avatarGender" value="female" checked={avatarGender === 'female'} onChange={(e) => setAvatarGender(e.target.value)} className="sr-only" />
                    <span className="text-sm font-medium">♀ Féminin</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                    <input type="radio" name="avatarGender" value="male" checked={avatarGender === 'male'} onChange={(e) => setAvatarGender(e.target.value)} className="sr-only" />
                    <span className="text-sm font-medium">♂ Masculin</span>
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {predefinedAvatars.map((id) => (
                    <div key={id} className="flex cursor-pointer justify-center rounded-lg border border-border p-2 transition-all hover:border-primary hover:shadow-md" onClick={() => selectPredefinedAvatar(id)}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarGender}_${id}&backgroundColor=b6e3f4`} alt={`Avatar ${id}`} className="h-16 w-16 rounded-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-muted-foreground">Cliquez sur un avatar pour l&apos;utiliser</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}