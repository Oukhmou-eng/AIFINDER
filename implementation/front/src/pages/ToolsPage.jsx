import { useEffect, useState, useMemo } from 'react';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { ToolCard } from '../components/tools/tool-card';
import { SearchFilters } from '../components/tools/search-filters';
import { tools, filterTools } from '../lib/mock-data';
import Sidebar from '../components/layout/sidebar';
import CatalogAPI from '../services/catalogAPI';

export default function ToolsPage() {
  const [apiTools, setApiTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    pricing: [],
    platforms: [],
    functions: [],
    models: [],
    sortBy: 'trending',
  });

  useEffect(() => {
    setLoading(true);
    CatalogAPI.tools({
      q: filters.query,
      category: filters.category,
      pricing: filters.pricing[0],
      sortBy: filters.sortBy,
    })
      .then(setApiTools)
      .catch(() => setApiTools([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const filteredTools = useMemo(() => {
    if (apiTools.length > 0) {
      return apiTools;
    }

    let result = filterTools({
      category: filters.category || undefined,
      pricing: filters.pricing.length > 0 ? filters.pricing : undefined,
      platforms: filters.platforms.length > 0 ? filters.platforms : undefined,
      functions: filters.functions.length > 0 ? filters.functions : undefined,
      models: filters.models.length > 0 ? filters.models : undefined,
      sortBy: filters.sortBy,
    });

    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [filters, apiTools]);

  const totalTools = apiTools.length > 0 ? apiTools.length : tools.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Tous les outils AI
              </h1>
              <p className="text-muted-foreground">
                Explorez notre collection de {totalTools} outils d&apos;intelligence artificielle
              </p>
            </div>

            <SearchFilters onFilterChange={setFilters} />

            <div className="mt-8">
              <p className="text-sm text-muted-foreground mb-4">
                {loading ? 'Chargement...' : `${filteredTools.length} outil${filteredTools.length > 1 ? 's' : ''} trouvé${filteredTools.length > 1 ? 's' : ''}`}
              </p>

              {filteredTools.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTools.filter((tool) => tool.status === 'active').map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    Aucun outil trouvé pour vos critères.
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
