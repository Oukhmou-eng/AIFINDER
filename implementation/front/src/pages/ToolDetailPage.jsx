import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Heart,
  Scale,
  ExternalLink,
  Share2,
  FileDown,
  Flag,
  Check,
  Play,
  Send,
  MessageSquare,
  Award,
  Cpu,
  FolderHeart,
  Tag,
  Hash
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { AddToCollectionDialog } from '../components/ui/add-to-collection-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ToolOwnFeatures } from '../components/ui/tool-own-features';
import { PricingPlansSection } from '../components/ui/pricing-plans';
import { toast } from 'sonner';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { useAuth } from '../contexts/auth-context';
import { useCompare } from '../contexts/compare-context';
import {
  getModelById
} from '../lib/mock-data';
import { cn } from '../lib/utils';
import Sidebar from '../components/layout/sidebar';
import CatalogAPI from '../services/catalogAPI';

const pricingColors = {
  free: 'bg-success/10 text-success border-success/20',
  freemium: 'bg-info/10 text-info border-info/20',
  paid: 'bg-warning/10 text-warning border-warning/20'
};

const pricingLabels = {
  free: 'Gratuit',
  freemium: 'Freemium',
  paid: 'Payant'
};

function StarRating({ rating, size = 'default' }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className={cn(
            'fill-warning text-warning',
            size === 'small' ? 'h-3 w-3' : 'h-4 w-4'
          )}
        />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <Star
          key={i}
          className={cn(
            'text-warning',
            size === 'small' ? 'h-3 w-3' : 'h-4 w-4'
          )}
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          className={cn(
            'text-muted-foreground/30',
            size === 'small' ? 'h-3 w-3' : 'h-4 w-4'
          )}
        />
      );
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

function BenchmarkScore({ label, score, maxScore = 100 }) {
  const percentage = (score / maxScore) * 100;
  let colorClass = 'bg-success';
  if (score < 60) colorClass = 'bg-destructive';
  else if (score < 80) colorClass = 'bg-warning';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{score}/{maxScore}</span>
      </div>
      <Progress value={percentage} className={cn('h-2', colorClass)} />
    </div>
  );
}

export default function ToolDetailPage() {
  const { slug } = useParams();
  const [apiTool, setApiTool] = useState(null);
  const [apiReviews, setApiReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const tool = apiTool;
  const { isAuthenticated, isFavorite, addFavorite, removeFavorite } = useAuth();
  const { addToolToCompare, removeToolFromCompare, isToolInCompare, canAddTool } = useCompare();
  const [showAddToCollection, setShowAddToCollection] = useState(false);

  const [promptInput, setPromptInput] = useState('');
  const [promptResponse, setPromptResponse] = useState('');
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    CatalogAPI.tool(slug)
      .then((item) => {
        setApiTool(item);
        if (item) {
          return CatalogAPI.reviews(item.id);
        }
        return [];
      })
      .then(setApiReviews)
      .catch((error) => {
        console.error("Error fetching tool details:", error);
        setApiTool(null);
        setApiReviews([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  const reviews = apiReviews;
  const categoriesForTool = tool?.categories || [];

  const isInCompare = tool ? isToolInCompare(tool.id) : false;
  const isFav = tool ? isFavorite(tool.id) : false;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reviewId = params.get('highlight');
    if (reviewId) {
      const element = document.getElementById(`review-${reviewId}`);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground animate-pulse">Chargement des détails de l'outil...</p>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold">Outil non trouvé</h1>
              <p className="text-muted-foreground mt-2">
                L'outil que vous recherchez n'existe pas.
              </p>
              <Link to="/tools">
                <Button className="mt-4">Voir tous les outils</Button>
              </Link>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCollection = () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux collections');
      return;
    }
    setShowAddToCollection(true);
  };

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }
    if (isFav) {
      removeFavorite(tool.id);
      toast.success('Retiré des favoris');
    } else {
      addFavorite(tool.id);
      toast.success('Ajouté aux favoris');
    }
  };

  const handleCompareClick = () => {
    if (isInCompare) {
      removeToolFromCompare(tool.id);
      toast.success('Retiré de la comparaison');
    } else if (canAddTool) {
      addToolToCompare(tool);
      toast.success('Ajouté à la comparaison');
    } else {
      toast.error('Maximum 3 outils en comparaison');
    }
  };

  const handlePromptTest = async () => {
    if (!promptInput.trim()) return;
    setIsPromptLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPromptResponse(`Réponse simulée pour: "${promptInput}"\n\nCeci est une démonstration de l'API de test. Dans une vraie implémentation, la requête serait envoyée à l'API de l'outil.`);
    setIsPromptLoading(false);
  };

  const handleGeneratePDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(tool.name, 20, 20);
    doc.setFontSize(12);
    const categoriesNames = categoriesForTool.map(cat => cat.name).join(', ') || 'N/A';
    doc.text(`Catégories: ${categoriesNames}`, 20, 35);
    doc.text(`Note: ${tool.rating}/5 (${tool.reviewCount} avis)`, 20, 45);
    doc.text(`Tarification: ${pricingLabels[tool.pricing]}${tool.priceDetails ? ` - ${tool.priceDetails}` : ''}`, 20, 55);
    doc.setFontSize(14);
    doc.text('Description', 20, 70);
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(tool.longDescription, 170);
    doc.text(descLines, 20, 80);
    const platformsY = 80 + descLines.length * 5 + 10;
    doc.setFontSize(14);
    doc.text('Plateformes', 20, platformsY);
    doc.setFontSize(10);
    doc.text(tool.platforms.join(', '), 20, platformsY + 10);
    doc.setFontSize(14);
    doc.text('Modèles AI utilisés', 20, platformsY + 25);
    doc.setFontSize(10);
    tool.aiModels.forEach((m, i) => {
      doc.text(`• ${m.name || m.modelId} (${m.accessType === 'free' ? 'Gratuit' : 'Payant'})`, 25, platformsY + 35 + i * 7);
    });
    doc.setFontSize(10);
    doc.text(`URL: ${tool.url}`, 20, 280);
    doc.save(`${tool.slug}-info.pdf`);
    toast.success('PDF généré avec succès');
  };

  const handleReport = () => {
    if (!reportReason) {
      toast.error('Veuillez sélectionner un motif');
      return;
    }
    toast.success('Signalement envoyé');
    setReportDialogOpen(false);
    setReportReason('');
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: tool.name,
        text: tool.description,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const ratingDistribution = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 10 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

  const toolBenchmarks = tool.benchmarks || {};

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Link to="/tools">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tous les outils
              </Button>
            </Link>

            {/* Header - sans les badges de catégories */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
                <span className="text-3xl font-bold text-primary">
                  {tool.name.charAt(0)}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Seulement le badge de pricing et "En vedette" ici */}
                  <Badge variant="outline" className={pricingColors[tool.pricing]}>
                    {pricingLabels[tool.pricing]}
                  </Badge>
                  {tool.featured && (
                    <Badge className="bg-primary text-primary-foreground">
                      En vedette
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {tool.name}
                </h1>

                <p className="text-muted-foreground mb-4">
                  {tool.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <StarRating rating={tool.rating} />
                    <span className="font-semibold">{tool.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({tool.reviewCount} avis)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {tool.platforms.map((platform) => (
                      <Badge key={platform} variant="secondary" className="capitalize">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions - inchangé */}
                <div className="flex flex-wrap items-center gap-2">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer">
                    <Button>
                      Visiter le site
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                  <Button
                    variant={isInCompare ? 'secondary' : 'outline'}
                    onClick={handleCompareClick}
                  >
                    {isInCompare ? <Check className="mr-2 h-4 w-4" /> : <Scale className="mr-2 h-4 w-4" />}
                    {isInCompare ? 'Dans la comparaison' : 'Comparer'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleFavoriteClick}
                    className={cn(isFav && 'text-destructive border-destructive/50')}
                  >
                    <Heart className={cn('mr-2 h-4 w-4', isFav && 'fill-current')} />
                    {isFav ? 'Favori' : 'Ajouter aux favoris'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddToCollection}
                  >
                    <FolderHeart className="mr-2 h-4 w-4" />
                    Ajouter à une collection
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleGeneratePDF}>
                    <FileDown className="h-4 w-4" />
                  </Button>
                  <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Signaler cet outil</DialogTitle>
                        <DialogDescription>
                          Pourquoi souhaitez-vous signaler cet outil ?
                        </DialogDescription>
                      </DialogHeader>
                      <Select value={reportReason} onValueChange={setReportReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un motif" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deprecated">Version dépréciée</SelectItem>
                          <SelectItem value="outdated">Informations non à jour</SelectItem>
                          <SelectItem value="unavailable">Outil indisponible</SelectItem>
                          <SelectItem value="incorrect">Information erronée</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea placeholder="Détails supplémentaires (optionnel)" />
                      <Button onClick={handleReport}>Envoyer le signalement</Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Avis ({reviews.length})
                </TabsTrigger>
                {tool.hasApiTest && (
                  <TabsTrigger
                    value="test"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Tester
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {tool.longDescription}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Modèles AI utilisés</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {tool.aiModels.map((m) => {
                            const model = getModelById(m.modelId);
                            const modelBenchmarks = model?.benchmarks || {};
                            return (
                              <div key={m.modelId} className="border rounded-lg p-4 space-y-3">
                                <Link
                                  to={`/models/${m.modelId}`}
                                  className="flex items-center justify-between hover:opacity-80 transition-opacity"
                                >
                                  <div>
                                    <p className="font-semibold text-foreground">{m.name || model?.name || m.modelId}</p>
                                    <p className="text-sm text-muted-foreground">{model?.provider}</p>
                                  </div>
                                  <Badge
                                    className={m.accessType === 'free' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}
                                  >
                                    {m.accessType === 'free' ? 'Gratuit' : 'Payant'}
                                  </Badge>
                                </Link>
                                {Object.keys(modelBenchmarks).length > 0 && (
                                  <div className="pt-2 border-t">
                                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                                      <Cpu className="h-3 w-3" /> Performances du modèle
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(modelBenchmarks).map(([key, value]) => (
                                        <BenchmarkScore key={key} label={key} score={value} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Fonctionnalités</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {tool.functions.map((func) => (
                            <Badge key={func} variant="secondary" className="capitalize text-sm py-1 px-3">
                              {func === 'text' && 'Texte'}
                              {func === 'image' && 'Image'}
                              {func === 'audio' && 'Audio'}
                              {func === 'video' && 'Vidéo'}
                              {func === 'code' && 'Code'}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {tool.ownFeatures && tool.ownFeatures.length > 0 && (
                      <ToolOwnFeatures features={tool.ownFeatures} />
                    )}
                    {tool.pricingPlans && tool.pricingPlans.length > 0 && (
                      <PricingPlansSection plans={tool.pricingPlans} type="tool" />
                    )}

                    {Object.keys(toolBenchmarks).length > 0 && (
                      <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          <CardTitle>Performances</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Scores de performance dans différents domaines (sur 100)
                          </p>
                          <div className="space-y-2">
                            {Object.entries(toolBenchmarks).map(([key, value]) => (
                              <BenchmarkScore key={key} label={key} score={value} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Colonne de droite - ajout d'une carte "Catégories" */}
                  <div className="space-y-6">
                    {/* Nouvelle carte pour les catégories */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Tag className="h-4 w-4" />
                          Catégories
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {categoriesForTool.length > 0 ? (
                            categoriesForTool.map((category) => (
                              <Link key={category.id} to={`/categories/${category.slug}`}>
                                <Badge 
                                  variant="secondary" 
                                  className="hover:bg-muted transition-colors text-sm py-1.5 px-3"
                                >
                                  <Hash className="h-3 w-3 mr-1.5" />
                                  {category.name}
                                </Badge>
                              </Link>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">Aucune catégorie</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notes et avis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-4">
                          <div className="text-4xl font-bold text-foreground">
                            {tool.rating.toFixed(1)}
                          </div>
                          <StarRating rating={tool.rating} />
                          <p className="text-sm text-muted-foreground mt-1">
                            {tool.reviewCount} avis
                          </p>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          {ratingDistribution.map((r) => (
                            <div key={r.stars} className="flex items-center gap-2">
                              <span className="text-sm w-3">{r.stars}</span>
                              <Star className="h-3 w-3 fill-warning text-warning" />
                              <Progress value={r.percentage} className="flex-1 h-2" />
                              <span className="text-xs text-muted-foreground w-8">
                                {r.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Statistiques</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Score tendance</span>
                          <span className="font-medium">{tool.trendingScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Utilisations</span>
                          <span className="font-medium">{tool.usageCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ajouté le</span>
                          <span className="font-medium">
                            {new Date(tool.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mis à jour le</span>
                          <span className="font-medium">
                            {new Date(tool.updatedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {isAuthenticated ? (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <MessageSquare className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">Partagez votre expérience</p>
                            <p className="text-sm text-muted-foreground">
                              Aidez les autres utilisateurs en laissant un avis
                            </p>
                          </div>
                          <Button>Écrire un avis</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <MessageSquare className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-muted-foreground">
                              <Link to="/login" className="text-primary hover:underline">
                                Connectez-vous
                              </Link>{' '}
                              pour laisser un avis
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id} id={`review-${review.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarImage src={review.userAvatar} />
                                <AvatarFallback>
                                  {review.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{review.userName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                                <StarRating rating={review.rating} size="small" />
                                <p className="mt-2 text-muted-foreground">
                                  {review.comment}
                                </p>

                                {review.replies.length > 0 && (
                                  <div className="mt-4 pl-4 border-l-2 space-y-3">
                                    {review.replies.map((reply) => (
                                      <div key={reply.id} className="flex items-start gap-3">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={reply.userAvatar} />
                                          <AvatarFallback className="text-xs">
                                            {reply.userName.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                              {reply.userName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                          </div>
                                          <p className="text-sm text-muted-foreground">
                                            {reply.comment}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        Aucun avis pour le moment. Soyez le premier à partager votre expérience !
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {tool.hasApiTest && (
                <TabsContent value="test" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Tester {tool.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Essayez l'outil directement avec un prompt de test. Cette fonctionnalité
                        utilise l'API gratuite de {tool.name} si disponible.
                      </p>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Entrez votre prompt ici..."
                          value={promptInput}
                          onChange={(e) => setPromptInput(e.target.value)}
                          rows={4}
                        />
                        <Button
                          onClick={handlePromptTest}
                          disabled={!promptInput.trim() || isPromptLoading}
                        >
                          {isPromptLoading ? (
                            <>Génération en cours...</>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Envoyer
                            </>
                          )}
                        </Button>

                        {promptResponse && (
                          <div className="p-4 rounded-lg bg-muted">
                            <h4 className="font-medium mb-2">Réponse :</h4>
                            <p className="text-muted-foreground whitespace-pre-line">
                              {promptResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
          <AddToCollectionDialog
            open={showAddToCollection}
            onOpenChange={setShowAddToCollection}
            tool={tool}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
}
