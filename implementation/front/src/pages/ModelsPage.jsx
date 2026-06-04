import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink, Check, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { aiModels, getToolsByModel } from '../lib/mock-data';
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

export default function ModelsPage() {
  const [apiModels, setApiModels] = useState([]);
  const [apiTools, setApiTools] = useState([]);
  const modelList = apiModels.length ? apiModels : aiModels;

  useEffect(() => {
    CatalogAPI.models().then(setApiModels).catch(() => setApiModels([]));
    CatalogAPI.tools().then(setApiTools).catch(() => setApiTools([]));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Modèles AI
                  </h1>
                  <p className="text-muted-foreground">
                    Découvrez les modèles d&apos;intelligence artificielle et les outils qui les utilisent
                  </p>
                </div>
                <Link to="/compare/models">
                  <Button>
                    <Scale className="mr-2 h-4 w-4" />
                    Comparer les modèles
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelList.map((model) => {
                const toolsUsingModel = apiTools.length
                  ? apiTools.filter((tool) => tool.aiModels?.some((item) => item.modelId === model.id))
                  : getToolsByModel(model.id);
                return (
                  <Link key={model.id} to={`/models/${model.id}`}>
                    <Card className="group hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge variant="outline" className="text-xs">
                            {model.provider}
                          </Badge>
                          <Badge variant="outline" className={pricingColors[model.pricing]}>
                            {pricingLabels[model.pricing]}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                          {model.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {model.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {(model.capabilities || []).map((cap) => (
                            <Badge key={cap} variant="secondary" className="text-xs capitalize">
                              {cap}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {toolsUsingModel.length} outil{toolsUsingModel.length > 1 ? 's' : ''}
                          </span>
                          <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
                            Voir les outils
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
