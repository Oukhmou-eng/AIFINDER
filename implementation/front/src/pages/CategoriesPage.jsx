import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  PenLine,
  Image as ImageIcon,
  Code,
  Mic,
  Video,
  Zap,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
  Palette
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { categories } from '../lib/mock-data';
import Sidebar from '../components/layout/sidebar';
import CatalogAPI from '../services/catalogAPI';

const iconMap = {
  PenLine,
  Image: ImageIcon,
  Code,
  Mic,
  Video,
  Zap,
  MessageSquare,
  Search,
  Palette,
  TrendingUp,
};

export default function CategoriesPage() {
  const [apiCategories, setApiCategories] = useState([]);

  useEffect(() => {
    CatalogAPI.categories().then(setApiCategories).catch(() => setApiCategories([]));
  }, []);

  const categoryList = apiCategories.length ? apiCategories : categories;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Catégories d&apos;outils AI
              </h1>
              <p className="text-muted-foreground">
                Explorez les outils AI par domaine d&apos;application
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryList.map((category) => {
                const IconComponent = iconMap[category.icon] || Sparkles;
                return (
                  <Link key={category.id} to={`/categories/${category.slug}`}>
                    <Card className="group hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <Badge variant="secondary">
                            {category.toolCount} outils
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {category.description}
                        </p>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
                          Explorer
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
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
