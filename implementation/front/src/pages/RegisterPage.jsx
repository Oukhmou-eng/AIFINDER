import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { useAuth } from "../contexts/auth-context";
import { GoogleLogin } from "@react-oauth/google";
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Star, 
  Folder, 
  Edit, 
  MessageSquare,
  Globe,
  ArrowLeft
} from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (formData.password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères");
      return;
    }
    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return;
    }
    setLoading(true);
    try {
      // Correction de l'ordre des paramètres : email, password, name (comme défini dans auth-context)
      const success = await register(formData.email, formData.password, formData.name);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Impossible de créer le compte. Cet email est peut-être déjà utilisé.");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'inscription");
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
        navigate("/dashboard");
      } else {
        setError("Échec de l'inscription avec Google");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription Google");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Star, color: "text-yellow-600", title: "Sauvegardez vos favoris", desc: "Retrouvez vos outils préférés à tout moment" },
    { icon: Folder, color: "text-blue-600", title: "Créez des collections", desc: "Organisez vos outils par thème ou projet" },
    { icon: Edit, color: "text-green-600", title: "Notez et commentez", desc: "Partagez votre expérience avec la communauté" },
    { icon: MessageSquare, color: "text-red-600", title: "Faites des demandes", desc: "Proposez des modifications ou signalez des problèmes" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
        {/* Colonne gauche : avantages */}
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 md:p-10">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">AIFinder</span>
            </Link>
            <h2 className="text-2xl font-bold text-foreground mb-2">Rejoignez AIFinder</h2>
            <p className="text-muted-foreground">Créez votre compte et découvrez les meilleurs outils IA.</p>
          </div>
          <div className="space-y-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="shrink-0">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite : formulaire */}
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex gap-2">
              <Button variant="default" className="bg-primary text-primary-foreground">
                Créer un compte
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>

          <div className="max-w-sm mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-1">Créer un compte</h3>
            <p className="text-muted-foreground mb-6">Rejoignez la communauté AIFinder</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8 caractères minimum"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked)}
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                  J'accepte les{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    politique de confidentialité
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création..." : "Créer mon compte →"}
              </Button>

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
                  text="signup_with"
                  shape="rectangular"
                />
              </div>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Déjà un compte ?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Se connecter
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}