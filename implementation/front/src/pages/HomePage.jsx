import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { ToolCard } from '../components/tools/tool-card';
import {
  getFeaturedTools,
  getTrendingTools,
  categories,
  tools,
} from '../lib/mock-data';
import Sidebar from '../components/layout/sidebar';
import CatalogAPI from '../services/catalogAPI';

// Map des icônes (identique)
const toPascalCase = (str) =>
  str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

const getIcon = (iconName) => {
  if (!iconName) return Icons.HelpCircle;
  const pascal = toPascalCase(iconName);
  return Icons[pascal] || Icons.HelpCircle;
};

export default function HomePage() {
  const [apiTools, setApiTools] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);

  useEffect(() => {
    CatalogAPI.featuredTools(6).then(setApiTools).catch(() => setApiTools([]));
    CatalogAPI.categories().then(setApiCategories).catch(() => setApiCategories([]));
  }, []);

  const featuredTools = apiTools.length ? apiTools.slice(0, 6) : getFeaturedTools();
  const trendingTools = apiTools.length ? [...apiTools].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 6) : getTrendingTools(6);
  const topCategories = (apiCategories.length ? apiCategories : categories).slice(0, 6);
  const totalTools = apiTools.length || tools.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

            <div className="container mx-auto px-4 py-20 md:py-28 relative">
              <div className="max-w-3xl mx-auto text-center">
                <Badge variant="secondary" className="mb-4">
                  <Icons.Sparkles className="h-3 w-3 mr-1" />
                  Plus de {totalTools} outils AI répertoriés
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
                  Découvrez les meilleurs{' '}
                  <span className="text-primary">outils AI</span>{' '}
                  pour votre travail
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
                  Explorez, comparez et trouvez les outils d'intelligence artificielle
                  parfaits pour booster votre productivité et votre créativité.
                </p>

                {/* Search Bar */}
                <form action="/search" method="get" className="max-w-2xl mx-auto">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="search"
                        name="q"
                        placeholder="Rechercher un outil AI (ex: génération d'images, chatbot, code...)"
                        className="pl-12 h-12 text-base"
                      />
                    </div>
                    <Button type="submit" size="lg" className="h-12 px-6">
                      Rechercher
                    </Button>
                  </div>
                </form>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
                  <span className="text-muted-foreground">Populaires :</span>
                  {['ChatGPT', 'Midjourney', 'GitHub Copilot', 'Claude'].map(
                    (term) => (
                      <a
                        key={term}
                        href={`/search?q=${encodeURIComponent(term)}`}
                      >
                        <Badge variant="outline" className="hover:bg-primary/10 cursor-pointer">
                          {term}
                        </Badge>
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Catégories populaires
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Explorez les outils par domaine d'application
                  </p>
                </div>
                <Link to="/categories">
                  <Button variant="ghost" className="hidden sm:flex">
                    Voir toutes
                    <Icons.ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {topCategories.map((category) => {
                  const IconComponent = getIcon(category.icon);
                  return (
                    <Link key={category.id} to={`/categories/${category.slug}`}>
                      <Card className="group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="font-medium text-foreground text-sm">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.toolCount} outils
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 text-center sm:hidden">
                <Link to="/categories">
                  <Button variant="outline">
                    Voir toutes les catégories
                    <Icons.ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Featured Tools Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                    <Icons.Sparkles className="h-6 w-6 text-primary" />
                    Outils en vedette
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Les outils les plus populaires et recommandés
                  </p>
                </div>
                <Link to="/tools?featured=true">
                  <Button variant="ghost" className="hidden sm:flex">
                    Voir tous
                    <Icons.ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTools.slice(0, 6).map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          </section>

          {/* Trending Section */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                    <Icons.TrendingUp className="h-6 w-6 text-primary" />
                    Tendances
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Les outils qui montent en ce moment
                  </p>
                </div>
                <Link to="/ranking">
                  <Button variant="ghost" className="hidden sm:flex">
                    Voir le classement
                    <Icons.ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>

              <div className="mt-6 text-center sm:hidden">
                <Link to="/ranking">
                  <Button variant="outline">
                    Voir le classement complet
                    <Icons.ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: `${totalTools}+`, label: 'Outils répertoriés', icon: Icons.Zap },
                  { value: '10+', label: 'Catégories', icon: Icons.Search },
                  { value: '15+', label: 'Modèles AI', icon: Icons.Sparkles },
                  { value: '4.5', label: 'Note moyenne', icon: Icons.Star },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Vous connaissez un outil AI qui manque ?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Proposez-le à notre communauté et aidez les autres à découvrir
                de nouveaux outils pour améliorer leur productivité.
              </p>
              <Link to="/propose-tool">
                <Button size="lg">
                  Proposer un outil
                  <Icons.ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}