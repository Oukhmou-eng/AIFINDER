import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, Send, Loader2, KeyRound } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!email.trim()) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }
    if (!isValidEmail(email)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  // État après soumission
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] dark:bg-grid-slate-700/20" />
        <Card className="w-full max-w-md text-center shadow-2xl border-0 relative backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
          <CardContent className="pt-8 pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 animate-in fade-in zoom-in duration-500">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Email envoyé !</h2>
            <p className="text-muted-foreground mt-2">
              Si un compte existe avec <strong className="text-foreground">{email}</strong>, vous recevrez un email contenant un lien pour réinitialiser votre mot de passe.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 my-6 border border-amber-200 dark:border-amber-800/50">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                🔒 Le lien expirera dans 1 heure
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full transition-all hover:scale-[1.02]">
              Renvoyer l'email
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors group flex items-center gap-1">
              Retour à la connexion
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const showEmailError = touched && email && !isValidEmail(email);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Dégradés animés en arrière-plan */}
      <div className="absolute inset-0 bg-grid-slate-100/40 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] dark:bg-grid-slate-700/20"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-100/40 dark:bg-indigo-900/20 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Bouton retour avec animation */}
        

        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 transition-all duration-300 hover:shadow-primary/5">
          <CardHeader className="text-center pb-2">
            {/* Icone en haut */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Mot de passe oublié ?</CardTitle>
            <CardDescription className="text-sm mt-2 px-4">
              Saisissez votre email, nous vous enverrons un lien de réinitialisation.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Adresse email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all group-focus-within:text-primary group-focus-within:scale-110" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    className={`pl-10 transition-all duration-200 ${
                      showEmailError 
                        ? 'border-destructive focus-visible:ring-destructive/50' 
                        : 'focus-visible:ring-primary/20 focus-visible:border-primary/50'
                    }`}
                    required
                  />
                </div>
                {showEmailError && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1 animate-in slide-in-from-top-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>
                    Format d'email invalide
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button 
                type="submit" 
                size="lg"
                className="w-full group transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.98]" 
                disabled={isSubmitting || (touched && email && !isValidEmail(email))}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    Envoyer le lien
                  </>
                )}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Link to="/login" className="text-center text-sm text-muted-foreground hover:text-primary transition-colors w-full">
                ← Retour à la page de connexion
              </Link>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-xs text-muted-foreground mt-8 animate-in fade-in duration-700">
          <span>Besoin d'aide ? </span>
          <Link to="/contact" className="text-primary underline-offset-2 hover:underline">Contactez le support</Link>
        </div>
      </div>
    </div>
  );
}