import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, Star, Check, Minus, ArrowLeft, Plus, 
  Filter, Eye, EyeOff, TrendingUp, Award, 
  BarChart3, Cpu, Globe, Smartphone, Monitor, 
  Code, Image, Mic, Video, FileText, Brain
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { useCompare } from '../contexts/compare-context';
import { getModelById, getCategoryById, tools } from '../lib/mock-data';
import { cn } from '../lib/utils';
import Sidebar from '../components/layout/sidebar';

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

function CompareCell({ value, best, className }) {
  return (
    <TableCell className={cn('text-center', best && 'bg-success/5', className)}>
      {value}
    </TableCell>
  );
}

function FeatureCheck({ has }) {
  return has ? (
    <Check className="h-5 w-5 text-success mx-auto" />
  ) : (
    <Minus className="h-5 w-5 text-muted-foreground/50 mx-auto" />
  );
}

export default function ComparePage() {
  const { compareTools, addToolToCompare, removeToolFromCompare, clearToolCompare, canAddTool } = useCompare();
  const [visibleSections, setVisibleSections] = useState({
    general: true,
    functions: true,
    platforms: true,
    models: true,
    benchmarks: true,
  });
  const [showAddToolSheet, setShowAddToolSheet] = useState(false);
  const [selectedToolToAdd, setSelectedToolToAdd] = useState('');

  // Outils disponibles (non déjà dans la comparaison)
  const availableTools = tools.filter(t => !compareTools.some(ct => ct.id === t.id));

  const handleAddTool = () => {
    if (selectedToolToAdd && canAddTool) {
      const tool = tools.find(t => t.id === selectedToolToAdd);
      if (tool) {
        addToolToCompare(tool);
        setSelectedToolToAdd('');
        setShowAddToolSheet(false);
      }
    }
  };

  if (compareTools.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Aucun outil à comparer</h1>
              <p className="text-muted-foreground mb-6">
                Ajoutez des outils à la comparaison depuis les pages de détails ou via le bouton ci-dessous.
              </p>
              <div className="flex gap-4 justify-center">
                <Sheet open={showAddToolSheet} onOpenChange={setShowAddToolSheet}>
                  <SheetTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un outil
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Ajouter un outil</SheetTitle>
                      <SheetDescription>
                        Choisissez un outil à ajouter à la comparaison.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <Select value={selectedToolToAdd} onValueChange={setSelectedToolToAdd}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un outil" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTools.map(tool => (
                            <SelectItem key={tool.id} value={tool.id}>
                              {tool.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddTool} className="w-full" disabled={!selectedToolToAdd}>
                        Ajouter
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <Link to="/tools">
                  <Button variant="outline">Parcourir les outils</Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  // Calcul des meilleures valeurs pour les critères standards
  const bestRating = Math.max(...compareTools.map(t => t.rating));
  const bestReviewCount = Math.max(...compareTools.map(t => t.reviewCount));
  const bestTrending = Math.max(...compareTools.map(t => t.trendingScore));

  // Domaines de benchmarks (tous les domaines uniques)
  const allBenchmarkDomains = [...new Set(compareTools.flatMap(t => Object.keys(t.benchmarks || {})))];

  // Meilleur score par domaine
  const getBestScore = (domain) => Math.max(...compareTools.map(t => t.benchmarks?.[domain] || 0));

  // Fonctions et plateformes prédéfinies
  const allFunctions = ['text', 'image', 'audio', 'video', 'code'];
  const allPlatforms = ['web', 'mobile', 'desktop', 'api'];

  // Génération du résumé enrichi
  const generateSummary = () => {
    if (compareTools.length < 2) return null;
    const summaries = [];

    // Note
    const highestRated = compareTools.reduce((best, t) => t.rating > best.rating ? t : best);
    const lowestRated = compareTools.reduce((worst, t) => t.rating < worst.rating ? t : worst);
    if (highestRated.rating !== lowestRated.rating) {
      summaries.push(`${highestRated.name} a la meilleure note (${highestRated.rating}/5) tandis que ${lowestRated.name} a la note la plus basse (${lowestRated.rating}/5).`);
    }

    // Tarification
    const freeTools = compareTools.filter(t => t.pricing === 'free');
    const paidTools = compareTools.filter(t => t.pricing === 'paid');
    if (freeTools.length > 0 && paidTools.length > 0) {
      summaries.push(`${freeTools.map(t => t.name).join(' et ')} ${freeTools.length > 1 ? 'sont gratuits' : 'est gratuit'}, alors que ${paidTools.map(t => t.name).join(' et ')} ${paidTools.length > 1 ? 'sont payants' : 'est payant'}.`);
    }

    // Fonctionnalités
    const hasMoreFunctions = compareTools.reduce((best, t) => t.functions.length > best.functions.length ? t : best);
    summaries.push(`${hasMoreFunctions.name} offre le plus de fonctionnalités (${hasMoreFunctions.functions.length} types de contenu).`);

    // Benchmarks
    allBenchmarkDomains.forEach(domain => {
      const bestTool = compareTools.reduce((best, t) => {
        const score = t.benchmarks?.[domain] || 0;
        return score > (best.score || 0) ? { tool: t, score } : best;
      }, { tool: null, score: 0 });
      if (bestTool.tool && bestTool.score > 0) {
        summaries.push(`${bestTool.tool.name} est le meilleur en ${domain} avec un score de ${bestTool.score}/100.`);
      }
    });

    return summaries;
  };

  const summary = generateSummary();

  const toggleSection = (section) => {
    setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Navigation et titre */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <Link to="/tools">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux outils
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" disabled={!canAddTool}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un outil
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Ajouter un outil</SheetTitle>
                      <SheetDescription>Choisissez un outil à ajouter à la comparaison.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <Select value={selectedToolToAdd} onValueChange={setSelectedToolToAdd}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un outil" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTools.map(tool => (
                            <SelectItem key={tool.id} value={tool.id}>
                              {tool.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddTool} className="w-full" disabled={!selectedToolToAdd}>
                        Ajouter
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" size="sm" onClick={clearToolCompare}>
                  <X className="mr-2 h-4 w-4" />
                  Effacer tout
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Comparaison d'outils</h1>
                <p className="text-muted-foreground">
                  {compareTools.length} outil{compareTools.length > 1 ? 's' : ''} en comparaison
                </p>
              </div>
              {/* Filtres (toggle sections) */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={visibleSections.general ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSection('general')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Général
                </Button>
                <Button
                  variant={visibleSections.functions ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSection('functions')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Fonctions
                </Button>
                <Button
                  variant={visibleSections.platforms ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSection('platforms')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Plateformes
                </Button>
                <Button
                  variant={visibleSections.models ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSection('models')}
                >
                  <Cpu className="h-4 w-4 mr-2" />
                  Modèles IA
                </Button>
                <Button
                  variant={visibleSections.benchmarks ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSection('benchmarks')}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Performances
                </Button>
              </div>
            </div>

            {/* En-têtes des outils */}
            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `repeat(${compareTools.length}, 1fr)` }}>
              {compareTools.map((tool) => {
                const category = getCategoryById(tool.categoryId);
                return (
                  <Card key={tool.id} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => removeToolFromCompare(tool.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardContent className="p-4 text-center">
                      <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border mb-3">
                        <span className="text-2xl font-bold text-primary">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                      <Link to={`/tools/${tool.slug}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                      </Link>
                      {category && (
                        <p className="text-xs text-muted-foreground mt-1">{category.name}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Tableau comparatif */}
            <Card className="mb-8 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] sticky left-0 bg-card">Critère</TableHead>
                    {compareTools.map((tool) => (
                      <TableHead key={tool.id} className="text-center min-w-[150px]">
                        {tool.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Section Générale */}
                  {visibleSections.general && (
                    <>
                      <TableRow className="bg-accent/30 border-t-2 border-border">
                        <TableCell colSpan={compareTools.length + 1} className="font-semibold py-3">
                          <BarChart3 className="h-4 w-4 inline mr-2 text-primary" /> Informations générales
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Note</TableCell>
                        {compareTools.map((tool) => (
                          <CompareCell
                            key={tool.id}
                            value={
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 fill-warning text-warning" />
                                <span className="font-semibold">{tool.rating.toFixed(1)}</span>
                              </div>
                            }
                            best={tool.rating === bestRating}
                          />
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Nombre d'avis</TableCell>
                        {compareTools.map((tool) => (
                          <CompareCell
                            key={tool.id}
                            value={tool.reviewCount.toLocaleString()}
                            best={tool.reviewCount === bestReviewCount}
                          />
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Score tendance</TableCell>
                        {compareTools.map((tool) => (
                          <CompareCell
                            key={tool.id}
                            value={`${tool.trendingScore}/100`}
                            best={tool.trendingScore === bestTrending}
                          />
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Tarification</TableCell>
                        {compareTools.map((tool) => (
                          <TableCell key={tool.id} className="text-center">
                            <Badge variant="outline" className={pricingColors[tool.pricing]}>
                              {pricingLabels[tool.pricing]}
                            </Badge>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Détails prix</TableCell>
                        {compareTools.map((tool) => (
                          <TableCell key={tool.id} className="text-center text-sm text-muted-foreground">
                            {tool.priceDetails || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Test API disponible</TableCell>
                        {compareTools.map((tool) => (
                          <TableCell key={tool.id}>
                            <FeatureCheck has={tool.hasApiTest} />
                          </TableCell>
                        ))}
                      </TableRow>
                    </>
                  )}

                  {/* Section Fonctions */}
                  {visibleSections.functions && (
                    <>
                      <TableRow className="bg-accent/30 border-t-2 border-border">
                        <TableCell colSpan={compareTools.length + 1} className="font-semibold py-3">
                          <Star className="h-4 w-4 inline mr-2 text-primary" /> Fonctionnalités
                        </TableCell>
                      </TableRow>
                      {allFunctions.map((func) => (
                        <TableRow key={func}>
                          <TableCell className="font-medium capitalize">
                            {func === 'text' && <FileText className="h-4 w-4 inline mr-2" />}
                            {func === 'image' && <Image className="h-4 w-4 inline mr-2" />}
                            {func === 'audio' && <Mic className="h-4 w-4 inline mr-2" />}
                            {func === 'video' && <Video className="h-4 w-4 inline mr-2" />}
                            {func === 'code' && <Code className="h-4 w-4 inline mr-2" />}
                            {func === 'text' && 'Texte'}
                            {func === 'image' && 'Image'}
                            {func === 'audio' && 'Audio'}
                            {func === 'video' && 'Vidéo'}
                            {func === 'code' && 'Code'}
                          </TableCell>
                          {compareTools.map((tool) => (
                            <TableCell key={tool.id}>
                              <FeatureCheck has={tool.functions.includes(func)} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  )}

                  {/* Section Plateformes */}
                  {visibleSections.platforms && (
                    <>
                      <TableRow className="bg-accent/30 border-t-2 border-border">
                        <TableCell colSpan={compareTools.length + 1} className="font-semibold py-3">
                          <Globe className="h-4 w-4 inline mr-2 text-primary" /> Plateformes
                        </TableCell>
                      </TableRow>
                      {allPlatforms.map((platform) => (
                        <TableRow key={platform}>
                          <TableCell className="font-medium capitalize">
                            {platform === 'web' && <Globe className="h-4 w-4 inline mr-2 text-primary" />}
                            {platform === 'mobile' && <Smartphone className="h-4 w-4 inline mr-2 text-primary" />}
                            {platform === 'desktop' && <Monitor className="h-4 w-4 inline mr-2 text-primary" />}
                            {platform === 'api' && <Code className="h-4 w-4 inline mr-2 text-primary" />}
                            {platform}
                          </TableCell>
                          {compareTools.map((tool) => (
                            <TableCell key={tool.id}>
                              <FeatureCheck has={tool.platforms.includes(platform)} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  )}

                  {/* Section Modèles AI */}
                  {visibleSections.models && (
                    <>
                      <TableRow className="bg-accent/30 border-t-2 border-border">
                        <TableCell colSpan={compareTools.length + 1} className="font-semibold py-3">
                          <Cpu className="h-4 w-4 inline mr-2 text-primary" /> Modèles AI utilisés
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Modèles</TableCell>
                        {compareTools.map((tool) => (
                          <TableCell key={tool.id} className="text-center">
                            <div className="flex flex-col gap-1">
                              {tool.aiModels.map((m) => {
                                const model = getModelById(m.modelId);
                                return (
                                  <Badge
                                    key={m.modelId}
                                    variant="outline"
                                    className={cn(
                                      'text-xs justify-center',
                                      m.accessType === 'free'
                                        ? 'border-success/50 text-success'
                                        : 'border-warning/50 text-warning'
                                    )}
                                  >
                                    {model?.name || m.modelId}
                                  </Badge>
                                );
                              })}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    </>
                  )}

                  {/* Section Performances (benchmarks) */}
                  {visibleSections.benchmarks && allBenchmarkDomains.length > 0 && (
                    <>
                      <TableRow className="bg-accent/30 border-t-2 border-border">
                        <TableCell colSpan={compareTools.length + 1} className="font-semibold py-3">
                          <Award className="h-4 w-4 inline mr-2 text-primary" /> Performances avancées (score /100)
                        </TableCell>
                      </TableRow>
                      {allBenchmarkDomains.map(domain => (
                        <TableRow key={domain}>
                          <TableCell className="font-medium capitalize">
                            <Brain className="h-4 w-4 inline mr-2 text-primary" />
                            {domain}
                          </TableCell>
                          {compareTools.map(tool => {
                            const score = tool.benchmarks?.[domain] || 0;
                            const isBest = score === getBestScore(domain) && score > 0;
                            return (
                              <CompareCell
                                key={tool.id}
                                value={
                                  score > 0 ? (
                                    <div className="flex flex-col items-center">
                                      <span className="font-bold text-lg">{score}</span>
                                      <span className="text-xs text-muted-foreground">/100</span>
                                    </div>
                                  ) : <span className="text-muted-foreground">—</span>
                                }
                                best={isBest}
                              />
                            );
                          })}
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* Résumé */}
            {summary && summary.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Résumé de la comparaison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {summary.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary font-bold">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}