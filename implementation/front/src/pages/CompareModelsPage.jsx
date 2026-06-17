import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  X, Check, Minus, ArrowLeft, Plus, Brain, 
  BarChart3, Star, Cpu, Package, Award, 
  TrendingUp, Layers, Zap, Loader2
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
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
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

function CompareCell({ value, best }) {
  return (
    <TableCell className={cn('text-center', best && 'bg-success/5')}>
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

export default function CompareModelsPage() {
  const [allModels, setAllModels] = useState([]);
  const [allTools, setAllTools] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [modelToAdd, setModelToAdd] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({
    general: true,
    capabilities: true,
    tools: true,
    benchmarks: true,
  });

  // Chargement des données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [modelsData, toolsData] = await Promise.all([
          CatalogAPI.models(),
          CatalogAPI.tools()
        ]);
        setAllModels(modelsData);
        setAllTools(toolsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addModel = (modelId) => {
    if (selectedModels.length >= 4) return;
    const model = allModels.find(m => m.id === modelId);
    if (model && !selectedModels.find(m => m.id === modelId)) {
      setSelectedModels([...selectedModels, model]);
      setModelToAdd('');
    }
  };

  const removeModel = (modelId) => {
    setSelectedModels(selectedModels.filter(m => m.id !== modelId));
  };

  const clearModels = () => {
    setSelectedModels([]);
  };

  const getToolsUsingModel = (modelId) => {
    return allTools.filter(tool => 
      tool.aiModels?.some(model => model.modelId === modelId)
    );
  };

  const allCapabilities = ['text', 'image', 'audio', 'video', 'code', 'reasoning'];

  // Récupération des benchmarks (tous les domaines uniques)
  const allBenchmarkDomains = [...new Set(selectedModels.flatMap(m => Object.keys(m.benchmarks || {})))];

  const getBestBenchmark = (domain) => Math.max(...selectedModels.map(m => m.benchmarks?.[domain] || 0));

  const generateSummary = () => {
    if (selectedModels.length < 2) return null;
    const summaries = [];

    const providers = [...new Set(selectedModels.map(m => m.provider))];
    if (providers.length > 1) {
      summaries.push(`Cette comparaison inclut des modèles de ${providers.join(', ')}.`);
    }

    const freeModels = selectedModels.filter(m => m.pricing === 'free');
    const paidModels = selectedModels.filter(m => m.pricing === 'paid');
    if (freeModels.length > 0 && paidModels.length > 0) {
      summaries.push(`${freeModels.map(m => m.name).join(' et ')} ${freeModels.length > 1 ? 'sont gratuits' : 'est gratuit'}, alors que ${paidModels.map(m => m.name).join(' et ')} ${paidModels.length > 1 ? 'sont payants' : 'est payant'}.`);
    }

    const mostCapable = selectedModels.reduce((best, m) =>
      m.capabilities?.length > best.capabilities?.length ? m : best
    );
    summaries.push(`${mostCapable.name} offre le plus de capacités (${mostCapable.capabilities?.length || 0} types).`);

    const toolCounts = selectedModels.map(m => ({
      name: m.name,
      count: getToolsUsingModel(m.id).length
    }));
    const mostUsed = toolCounts.reduce((best, t) => t.count > best.count ? t : best, { count: 0 });
    if (mostUsed.count > 0) {
      summaries.push(`${mostUsed.name} est utilisé par le plus grand nombre d'outils (${mostUsed.count}).`);
    }

    // Résumé des benchmarks
    allBenchmarkDomains.forEach(domain => {
      const bestModel = selectedModels.reduce((best, m) => {
        const score = m.benchmarks?.[domain] || 0;
        return score > (best.score || 0) ? { model: m, score } : best;
      }, { model: null, score: 0 });
      if (bestModel.model && bestModel.score > 0) {
        summaries.push(`${bestModel.model.name} obtient le meilleur score en ${domain} (${bestModel.score}/100).`);
      }
    });

    return summaries;
  };

  const summary = generateSummary();
  const availableModels = allModels.filter(m => !selectedModels.find(s => s.id === m.id));

  const toggleSection = (section) => {
    setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (selectedModels.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              <Link to="/models">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tous les modèles
                </Button>
              </Link>

              <div className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  Comparer les modèles AI
                </h1>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Sélectionnez jusqu'à 4 modèles AI pour les comparer côte à côte.
                </p>
                <div className="max-w-xs mx-auto">
                  <Select value={modelToAdd} onValueChange={addModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un modèle..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </main>
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
          <div className="container mx-auto px-4 py-8">
            {/* Navigation */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Link to="/models">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tous les modèles
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                {selectedModels.length < 4 && (
                  <Select value={modelToAdd} onValueChange={addModel}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Ajouter un modèle..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button variant="outline" onClick={clearModels}>
                  <X className="mr-2 h-4 w-4" />
                  Effacer tout
                </Button>
              </div>
            </div>

            {/* En-tête et filtres */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Comparaison de modèles AI
                </h1>
                <p className="text-muted-foreground">
                  {selectedModels.length} modèle{selectedModels.length > 1 ? 's' : ''} en comparaison
                </p>
              </div>
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
                  variant={visibleSections.capabilities ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSection('capabilities')}
                >
                  <Cpu className="h-4 w-4 mr-2" />
                  Capacités
                </Button>
                <Button
                  variant={visibleSections.tools ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSection('tools')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Outils
                </Button>
                {allBenchmarkDomains.length > 0 && (
                  <Button
                    variant={visibleSections.benchmarks ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSection('benchmarks')}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Performances
                  </Button>
                )}
              </div>
            </div>

            {/* En-têtes des modèles */}
            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, 1fr)` }}>
              {selectedModels.map((model) => (
                <Card key={model.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => removeModel(model.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardContent className="p-4 text-center">
                    <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border mb-3">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <Link to={`/models/${model.slug || model.id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                        {model.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">{model.provider}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tableau comparatif */}
            <Card className="mb-8 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] sticky left-0 bg-card">Critère</TableHead>
                    {selectedModels.map((model) => (
                      <TableHead key={model.id} className="text-center min-w-[150px]">
                        {model.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* SECTION GÉNÉRALE */}
                  {visibleSections.general && (
                    <>
                      <TableRow className="bg-accent/30 border-t-2 border-border">
                        <TableCell colSpan={selectedModels.length + 1} className="font-semibold py-3">
                          <BarChart3 className="h-4 w-4 inline mr-2 text-primary" /> Informations générales
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Fournisseur</TableCell>
                        {selectedModels.map((model) => (
                          <TableCell key={model.id} className="text-center">{model.provider}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Tarification</TableCell>
                        {selectedModels.map((model) => (
                          <TableCell key={model.id} className="text-center">
                            <Badge variant="outline" className={pricingColors[model.pricing] || pricingColors.free}>
                              {pricingLabels[model.pricing] || 'Gratuit'}
                            </Badge>
                          </TableCell>
                        ))}
                      </TableRow>
                    </>
                  )}

                  {/* SECTION CAPACITÉS */}
                  {visibleSections.capabilities && (
                    <>
                      <TableRow className="bg-accent/30 border-t-2 border-border">
                        <TableCell colSpan={selectedModels.length + 1} className="font-semibold py-3">
                          <Cpu className="h-4 w-4 inline mr-2 text-primary" /> Capacités
                        </TableCell>
                      </TableRow>
                      {allCapabilities.map((cap) => (
                        <TableRow key={cap}>
                          <TableCell className="font-medium capitalize">
                            {cap === 'text' && 'Texte'}
                            {cap === 'image' && 'Image'}
                            {cap === 'audio' && 'Audio'}
                            {cap === 'video' && 'Vidéo'}
                            {cap === 'code' && 'Code'}
                            {cap === 'reasoning' && 'Raisonnement'}
                          </TableCell>
                          {selectedModels.map((model) => (
                            <TableCell key={model.id}>
                              <FeatureCheck has={model.capabilities?.includes(cap)} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  )}

                  {/* SECTION OUTILS */}
                  {visibleSections.tools && (
                    <>
                      <TableRow className="bg-accent/30 border-t-2 border-border">
                        <TableCell colSpan={selectedModels.length + 1} className="font-semibold py-3">
                          <Package className="h-4 w-4 inline mr-2 text-primary" /> Utilisation
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Nombre d'outils utilisant ce modèle</TableCell>
                        {selectedModels.map((model) => {
                          const toolCount = getToolsUsingModel(model.id).length;
                          const maxCount = Math.max(...selectedModels.map(m => getToolsUsingModel(m.id).length));
                          return (
                            <CompareCell
                              key={model.id}
                              value={toolCount}
                              best={toolCount === maxCount && toolCount > 0}
                            />
                          );
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Outils (exemples)</TableCell>
                        {selectedModels.map((model) => {
                          const modelTools = getToolsUsingModel(model.id);
                          return (
                            <TableCell key={model.id} className="text-center">
                              <div className="flex flex-col gap-1">
                                {modelTools.slice(0, 3).map((tool) => {
                                  const accessType = tool.aiModels?.find(m => m.modelId === model.id)?.accessType;
                                  return (
                                    <Link
                                      key={tool.id}
                                      to={`/tools/${tool.slug}`}
                                      className="inline-block"
                                    >
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'text-xs hover:bg-muted cursor-pointer',
                                          accessType === 'free' ? 'border-success/50' : 'border-warning/50'
                                        )}
                                      >
                                        {tool.name}
                                        <span className={cn(
                                          'ml-1 text-[10px]',
                                          accessType === 'free' ? 'text-success' : 'text-warning'
                                        )}>
                                          ({accessType === 'free' ? 'Gratuit' : 'Payant'})
                                        </span>
                                      </Badge>
                                    </Link>
                                  );
                                })}
                                {modelTools.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{modelTools.length - 3} autres
                                  </span>
                                )}
                                {modelTools.length === 0 && (
                                  <span className="text-xs text-muted-foreground">Aucun outil</span>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </>
                  )}

                  {/* SECTION PERFORMANCES (BENCHMARKS) */}
                  {visibleSections.benchmarks && allBenchmarkDomains.length > 0 && (
                    <>
                      <TableRow className="bg-accent/30 border-t-2 border-border">
                        <TableCell colSpan={selectedModels.length + 1} className="font-semibold py-3">
                          <Award className="h-4 w-4 inline mr-2 text-primary" /> Performances (score /100)
                        </TableCell>
                      </TableRow>
                      {allBenchmarkDomains.map(domain => (
                        <TableRow key={domain}>
                          <TableCell className="font-medium capitalize">
                            <Zap className="h-4 w-4 inline mr-2" />
                            {domain}
                          </TableCell>
                          {selectedModels.map(model => {
                            const score = model.benchmarks?.[domain] || 0;
                            const isBest = score === getBestBenchmark(domain) && score > 0;
                            return (
                              <CompareCell
                                key={model.id}
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