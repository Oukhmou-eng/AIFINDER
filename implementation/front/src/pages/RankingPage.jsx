import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Users, Award, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState('trending');
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      setError(null);
      try {
        let sortBy = '';
        if (activeTab === 'rating') sortBy = 'rating';
        else if (activeTab === 'usage') sortBy = 'usage';
        else sortBy = 'trending'; // par défaut

        const data = await CatalogAPI.tools({ sortBy, limit: 10 });
        setTools(data);
      } catch (err) {
        console.error('Erreur chargement classement:', err);
        setError('Impossible de charger les outils. Veuillez réessayer plus tard.');
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [activeTab]);

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Classement des outils AI
              </h1>
              <p className="text-muted-foreground">
                Les meilleurs outils selon différents critères
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Tendances</span>
                </TabsTrigger>
                <TabsTrigger value="rating" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Mieux notés</span>
                </TabsTrigger>
                <TabsTrigger value="usage" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Plus utilisés</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <div className="space-y-4">
                  {tools.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucun outil trouvé.</p>
                  ) : (
                    tools.map((tool, index) => {
                      const category = tool.categories?.[0];
                      const isTopThree = index < 3;

                      return (
                        <Link key={tool.id} to={`/tools/${tool.slug}`}>
                          <Card className={cn(
                            'hover:border-primary/50 hover:shadow-md transition-all cursor-pointer',
                            isTopThree && 'border-primary/30'
                          )}>
                            <CardContent className="p-4 md:p-6">
                              <div className="flex items-center gap-4">
                                {/* Rank */}
                                <div className={cn(
                                  'flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full font-bold text-lg',
                                  index === 0 && 'bg-yellow-500/20 text-yellow-600',
                                  index === 1 && 'bg-gray-300/30 text-gray-500',
                                  index === 2 && 'bg-orange-400/20 text-orange-500',
                                  index > 2 && 'bg-muted text-muted-foreground'
                                )}>
                                  {index === 0 && <Award className="h-6 w-6" />}
                                  {index !== 0 && (index + 1)}
                                </div>

                                {/* Logo */}
                                <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
                                  <span className="text-xl font-bold text-primary">
                                    {tool.name.charAt(0)}
                                  </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-foreground">
                                      {tool.name}
                                    </h3>
                                    {category && (
                                      <Badge variant="outline" className="text-xs">
                                        {category.name}
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className={cn('text-xs', pricingColors[tool.pricing])}>
                                      {pricingLabels[tool.pricing]}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                    {tool.description}
                                  </p>
                                </div>

                                {/* Stats */}
                                <div className="hidden md:flex items-center gap-6 shrink-0">
                                  <div className="text-center">
                                    <div className="flex items-center gap-1 text-warning">
                                      <Star className="h-4 w-4 fill-current" />
                                      <span className="font-semibold">{Number(tool.rating || 0).toFixed(1)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{tool.reviewCount || 0} avis</p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center gap-1 text-primary">
                                      <TrendingUp className="h-4 w-4" />
                                      <span className="font-semibold">{tool.trendingScore || 0}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Score</p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Users className="h-4 w-4" />
                                      <span className="font-semibold">
                                        {tool.totalUsers ? (tool.totalUsers / 1000).toFixed(0) + 'k' : '0'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Utilisations</p>
                                  </div>
                                </div>
                              </div>

                              {/* Mobile stats */}
                              <div className="flex md:hidden items-center gap-4 mt-3 pt-3 border-t">
                                <div className="flex items-center gap-1 text-warning text-sm">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span>{tool.rating?.toFixed(1) || '0'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-primary text-sm">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>{tool.trendingScore || 0}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                  <Users className="h-4 w-4" />
                                  <span>{tool.totalUsers ? (tool.totalUsers / 1000).toFixed(0) + 'k' : '0'}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}