import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { ToolCard } from '../components/tools/tool-card';
import { getToolsByCategory, getCategoryById } from '../lib/mock-data';
import Sidebar from '../components/layout/sidebar';
import CatalogAPI from '../services/catalogAPI';

export default function CategoryPage() {
  const { slug } = useParams();
  const [apiCategory, setApiCategory] = useState(null);
  const [apiTools, setApiTools] = useState([]);
  const category = apiCategory || getCategoryById(slug);
  const categoryTools = apiTools.length ? apiTools : category ? getToolsByCategory(category.id) : [];

  useEffect(() => {
    CatalogAPI.categories()
      .then((items) => setApiCategory(items.find((cat) => cat.slug === slug || cat.id === slug) || null))
      .catch(() => setApiCategory(null));
    CatalogAPI.tools({ category: slug })
      .then(setApiTools)
      .catch(() => setApiTools([]));
  }, [slug]);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Catégorie non trouvée</h1>
              <p className="text-muted-foreground mt-2">La catégorie que vous recherchez n'existe pas.</p>
              <Link to="/categories">
                <Button className="mt-4">Voir toutes les catégories</Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
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
            <Link to="/categories">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Toutes les catégories
              </Button>
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {category.name}
              </h1>
              <p className="text-muted-foreground">
                {category.description}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {categoryTools.length} outil{categoryTools.length > 1 ? 's' : ''} dans cette catégorie
              </p>
            </div>

            {categoryTools.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} showCategory={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Aucun outil dans cette catégorie pour le moment.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
