import { useState } from 'react';
import { useNavigate,Link  } from 'react-router-dom';
import { X, Mail, Lock, User, Sparkles, Eye, EyeOff, Globe } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { useAuth } from '../../contexts/auth-context';
import { toast } from 'sonner';

import { GoogleLogin } from "@react-oauth/google";

export function AuthModal({ open, onClose, defaultTab = 'login' }) {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('Connecté avec succès');
        onClose();
        // navigate('/dashboard');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const success = await loginWithGoogle(credentialResponse.credential);
      if (success) {
        (success === "admin" ? navigate("/admin") : navigate("/dashboard"));
      } else {
        setError("Échec de la connexion avec Google");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la connexion Google");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      const success = await register(formData.name, formData.email, formData.password);
      if (success) {
        toast.success('Compte créé avec succès');
        onClose();
        // navigate('/dashboard');
      } else {
        setError('Cet email est déjà utilisé');
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">
              {activeTab === 'login' ? 'Connexion rapide' : 'Créer un compte'}
            </DialogTitle>

          </div>
        </DialogHeader>

        {/* Onglets */}
        <div className="flex border-b border-border px-6">
          <button
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'login'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
          >
            Se connecter
          </button>
          <button
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'register'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
          >
            Créer un compte
          </button>
        </div>

        <div className="p-6 pt-4">
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="modal-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="modal-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-name">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="modal-name"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="modal-reg-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="modal-reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8 caractères minimum"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-confirm-password">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="modal-confirm-password"
                    type="password"
                    placeholder="Confirmez"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Échec de l'authentification Google")}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              shape="rectangular"
            />
          </div>


          {activeTab === 'login' && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-primary hover:underline"
              >
                Inscrivez-vous
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}