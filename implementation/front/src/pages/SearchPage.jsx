import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { ToolCard } from '../components/tools/tool-card';
import { SearchFilters } from '../components/tools/search-filters';
import { tools, filterTools, searchTools } from '../lib/mock-data';
import Sidebar from '../components/layout/sidebar';
import CatalogAPI from '../services/catalogAPI';

export default function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';

  const [filters, setFilters] = useState({
    query: initialQuery,
    category: '',
    pricing: [],
    platforms: [],
    functions: [],
    models: [],
    sortBy: 'trending',
  });
  const [apiTools, setApiTools] = useState([]);

  useEffect(() => {
    CatalogAPI.tools({
      q: filters.query,
      category: filters.category,
      pricing: filters.pricing[0],
      sortBy: filters.sortBy,
    })
      .then(setApiTools)
      .catch(() => setApiTools([]));
  }, [filters]);

  const filteredTools = useMemo(() => {
    if (apiTools.length) return apiTools;
    let result = filters.query ? searchTools(filters.query) : [...tools];

    result = filterTools({
      category: filters.category || undefined,
      pricing: filters.pricing.length > 0 ? filters.pricing : undefined,
      platforms: filters.platforms.length > 0 ? filters.platforms : undefined,
      functions: filters.functions.length > 0 ? filters.functions : undefined,
      models: filters.models.length > 0 ? filters.models : undefined,
      sortBy: filters.sortBy,
    }).filter(tool =>
      !filters.query ||
      tool.name.toLowerCase().includes(filters.query.toLowerCase()) ||
      tool.description.toLowerCase().includes(filters.query.toLowerCase())
    );

    return result;
  }, [filters, apiTools]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {initialQuery ? `Résultats pour "${initialQuery}"` : 'Rechercher des outils AI'}
              </h1>
              <p className="text-muted-foreground">
                {filteredTools.length} outil{filteredTools.length > 1 ? 's' : ''} trouvé{filteredTools.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid lg:grid-cols-[280px_1fr] gap-8">
              {/* Filters sidebar - Desktop */}
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <SearchFilters
                    initialQuery={initialQuery}
                    showAdvanced={true}
                    onFilterChange={setFilters}
                  />
                </div>
              </aside>

              {/* Results */}
              <div>
                {/* Mobile filters */}
                <div className="lg:hidden mb-6">
                  <SearchFilters
                    initialQuery={initialQuery}
                    onFilterChange={setFilters}
                  />
                </div>

                {filteredTools.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">
                      Aucun outil trouvé pour votre recherche.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Essayez de modifier vos filtres ou votre recherche.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
