import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Award, Cpu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { ToolCard } from '../components/tools/tool-card';
import { aiModels, getToolsByModel, getModelById } from '../lib/mock-data';
import { cn } from '../lib/utils';
import Sidebar from '../components/layout/sidebar';
//import ModelCapabilities from '../components/ui/ModelCapabilities';
//import PricingPlansSection from '../components/ui/PricingPlansSection';
import { ModelCapabilities } from '../components/ui/model-capabilities';
import { PricingPlansSection } from '../components/ui/pricing-plans';
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

// Composant pour afficher un score de benchmark (identique à celui de ToolDetailPage)
function BenchmarkScore({ label, score, maxScore = 100 }) {
  const percentage = (score / maxScore) * 100;
  let colorClass = 'bg-success';
  if (score < 60) colorClass = 'bg-destructive';
  else if (score < 80) colorClass = 'bg-warning';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium capitalize">{label}</span>
        <span className="text-muted-foreground">{score}/{maxScore}</span>
      </div>
      <Progress value={percentage} className={cn('h-2', colorClass)} />
    </div>
  );
}

export default function ModelDetailPage() {
  const { id } = useParams();
  const model = getModelById(id);

  if (!model) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Modèle non trouvé</h1>
              <p className="text-muted-foreground mt-2">Le modèle que vous recherchez n'existe pas.</p>
              <Link to="/models">
                <Button className="mt-4">Voir tous les modèles</Button>
              </Link>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const toolsUsingModel = getToolsByModel(model.id);
  const modelBenchmarks = model.benchmarks || {};

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

            {/* Model Info Card avec performances */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{model.provider}</Badge>
                      <Badge variant="outline" className={pricingColors[model.pricing]}>
                        {pricingLabels[model.pricing]}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {model.name}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                      {model.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {model.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="capitalize">
                        <Check className="h-3 w-3 mr-1" />
                        {cap}
                      </Badge>
                    ))}
                  </div>



                </div>

                {/* Section Performances (benchmarks) */}
                {Object.keys(modelBenchmarks).length > 0 && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Performances</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(modelBenchmarks).map(([key, value]) => (
                        <BenchmarkScore key={key} label={key} score={value} />
                      ))}
                    </div>
                  </div>
                )}

                
              </CardContent>
            </Card>

            <ModelCapabilities capabilities={model.capabilities} />

            {model.pricingPlans && model.pricingPlans.length > 0 && (
                  <PricingPlansSection plans={model.pricingPlans} type="model" />
                )}

            {/* Tools using this model */}
            <div className="mb-8 mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Outils utilisant {model.name}
              </h2>
              <p className="text-muted-foreground mb-6">
                {toolsUsingModel.length} outil{toolsUsingModel.length > 1 ? 's' : ''} utilisent ce modèle
              </p>

              {toolsUsingModel.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {toolsUsingModel.map((tool) => {
                    const modelAccess = tool.aiModels.find(m => m.modelId === model.id);
                    return (
                      <div key={tool.id} className="relative">
                        <ToolCard tool={tool} />
                        {modelAccess && (
                          <Badge
                            className={cn(
                              'absolute top-3 left-3 z-10',
                              modelAccess.accessType === 'free'
                                ? 'bg-success text-success-foreground'
                                : 'bg-warning text-warning-foreground'
                            )}
                          >
                            Accès {modelAccess.accessType === 'free' ? 'gratuit' : 'payant'}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    Aucun outil n&apos;utilise ce modèle pour le moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}