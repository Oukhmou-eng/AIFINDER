import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, X, Upload, Info, Link as LinkIcon, DollarSign, Globe, Tag, Cpu,
  Calendar, Building, Code, Star, Zap, Award, FileText, GitFork, Box, Layers, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../contexts/auth-context';
import { categories, aiModels } from '../lib/mock-data';
import { toast } from 'sonner';
import { Footer } from '../components/layout/footer';
import { Header } from '../components/layout/header';
import Sidebar from '../components/layout/sidebar';

import { ToolForm } from '../components/tools/tool-form';

export default function ProposeToolPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      console.log('Proposition envoyée:', formData);
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Votre proposition a été soumise avec succès !');
      navigate('/dashboard');
    } catch (err) {
      toast.error("Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Connexion requise</h1>
            <p className="text-muted-foreground mb-6">Vous devez être connecté pour proposer un outil.</p>
            <Link to="/login"><Button>Se connecter</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* En-tête avec retour */}
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Proposer un outil</h1>
                <p className="text-muted-foreground">
                  Soumettez un nouvel outil AI pour qu&apos;il soit ajouté à notre catalogue
                </p>
              </div>
            </div>

            {/* Bandeau d'information */}
            <Card className="border-primary/30 bg-primary/5 mb-6">
              <CardContent className="flex items-start gap-3 pt-6">
                <Info className="h-5 w-5 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Processus de validation</p>
                  <p className="mt-1 text-muted-foreground">
                    Votre proposition sera examinée par notre équipe avant d&apos;être publiée.
                    Vous serez notifié de la décision par notification et email.
                  </p>
                </div>
              </CardContent>
            </Card>

            <ToolForm 
              onSubmit={handleSubmit} 
              onCancel={() => navigate('/dashboard')}
              isSubmitting={isSubmitting}
            />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}