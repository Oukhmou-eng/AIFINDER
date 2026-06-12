import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { User, Mail, Lock, Camera, Save, Trash2, X, Upload, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { toast } from 'sonner';
import AuthAPI from '../../services/authAPI';

export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: '',
    prenom: '',
    email: '',
  });
  
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState('');
  const [avatarGender, setAvatarGender] = useState('female');

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
      });
      setAvatarUrl(user.avatar_url || '');
      setAvatarSeed(user.prenom || 'user');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const data = await AuthAPI.updateProfile({
        nom: profile.name,
        prenom: profile.prenom,
        email: profile.email,
        avatar_url: avatarUrl
      });
      updateProfile(data.user);
      toast.success('Profil mis à jour avec succès !');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
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
    
    setIsChangingPassword(true);
    try {
      await AuthAPI.changePassword(password.current, password.new);
      setPassword({ current: '', new: '', confirm: '' });
      toast.success('Mot de passe modifié avec succès !');
    } catch (err) {
      toast.error(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success('Votre compte a été supprimé');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
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
          toast.success('Avatar mis à jour (Sauvegardez pour confirmer)');
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
    toast.info('Nouvel avatar généré ! Pensez à enregistrer vos modifications.');
  };

  const selectPredefinedAvatar = (avatarId) => {
    const seed = `${avatarGender}_${avatarId}`;
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`;
    setAvatarUrl(url);
    setShowAvatarDialog(false);
  };

  const predefinedAvatars = [1, 2, 3, 4, 5, 6];
  const getInitials = () => (profile.prenom?.charAt(0) || '') + (profile.name?.charAt(0) || '') || 'U';

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et votre compte</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informations personnelles
          </CardTitle>
          <CardDescription>Mettez à jour vos données publiques</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Avatar section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-md">
                <AvatarImage src={avatarUrl} alt={profile.name} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg border border-background"
                onClick={() => setShowAvatarDialog(true)}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h3 className="font-bold text-lg">{profile.prenom} {profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Inscrit le {user?.date_inscription ? new Date(user.date_inscription).toLocaleDateString('fr-FR') : '-'}</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prenom" className="font-bold">Prénom</Label>
              <Input id="prenom" value={profile.prenom} onChange={(e) => setProfile({ ...profile, prenom: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">Nom</Label>
              <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email" className="font-bold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" className="pl-10" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button onClick={handleSaveProfile} disabled={isSaving} className="min-w-[120px]">
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Enregistrer</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Sécurité
          </CardTitle>
          <CardDescription>Modifiez votre mot de passe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
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
              <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
              <Input id="confirm-password" type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button 
              variant="outline" 
              onClick={handleChangePassword} 
              disabled={isChangingPass || !password.current || !password.new || !password.confirm}
            >
              {isChangingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour le mot de passe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zone de danger */}
      <Card className="border-destructive/30 shadow-sm overflow-hidden">
        <CardHeader className="bg-destructive/5 border-b">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Zone de danger
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div>
              <p className="font-bold text-destructive">Supprimer mon compte</p>
              <p className="text-sm text-muted-foreground">Attention, cette action est irréversible et supprimera toutes vos données.</p>
            </div>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Supprimer le compte</Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Avatar */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer votre avatar</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Importer</TabsTrigger>
              <TabsTrigger value="generate">Générer</TabsTrigger>
              <TabsTrigger value="gallery">Galerie</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 py-4 text-center">
              <div 
                className="flex h-32 w-32 mx-auto cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-[10px] text-muted-foreground uppercase font-bold">Sélectionner</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleImageUpload} />
              <p className="text-xs text-muted-foreground italic">JPG, PNG, GIF (max 2 Mo)</p>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="avatar-seed" className="text-xs font-bold uppercase">Seed / Identifiant</Label>
                <Input id="avatar-seed" placeholder="Ex: mon-pseudo" value={avatarSeed} onChange={(e) => setAvatarSeed(e.target.value)} />
                <div className="mt-4 flex justify-center">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20 p-1 bg-background">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed || 'user')}&backgroundColor=b6e3f4`} alt="Preview" className="h-full w-full rounded-full object-cover" />
                  </div>
                </div>
                <Button onClick={generateDiceBearAvatar} className="w-full mt-2">
                  <RefreshCw className="mr-2 h-4 w-4" /> Utiliser cet avatar
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4 py-4">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button 
                  variant={avatarGender === 'female' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setAvatarGender('female')}
                >♀ Femme</Button>
                <Button 
                  variant={avatarGender === 'male' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setAvatarGender('male')}
                >♂ Homme</Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {predefinedAvatars.map((id) => (
                  <div 
                    key={id} 
                    className="cursor-pointer rounded-xl border-2 border-transparent hover:border-primary p-1 transition-all" 
                    onClick={() => selectPredefinedAvatar(id)}
                  >
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarGender}_${id}&backgroundColor=b6e3f4`} alt="Avatar" className="h-16 w-16 rounded-full mx-auto" />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Confirmation Suppression */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Suppression définitive du compte</DialogTitle>
          </DialogHeader>
          <div className="py-4">
             <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive mb-4">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-bold">Cette action ne peut pas être annulée.</p>
             </div>
             <p className="text-sm text-muted-foreground leading-relaxed">
               En confirmant, vous perdrez l'accès à votre compte ainsi qu'à toutes vos données personnelles : 
               <strong> favoris, collections, avis et outils proposés</strong>.
             </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmer la suppression'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
