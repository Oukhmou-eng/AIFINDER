import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { ToolCard } from '../components/tools/tool-card';
import { SearchFilters } from '../components/tools/search-filters';
import Sidebar from '../components/layout/sidebar';
import { searchTools } from '../services/api';
import { filterTools } from '../lib/mock-data'; // Ajout du fallback vers les données locales

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
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
      // Tentative de récupération via l'API
      const data = await searchTools({
        q: filters.query,
        category: filters.category,
        pricing: filters.pricing,
        platforms: filters.platforms,
        functions: filters.functions,
        models: filters.models,
        sortBy: filters.sortBy,
      });

      // Gestion du format de réponse (objet avec .tools ou tableau direct)
      let toolsFound = data.tools || (Array.isArray(data) ? data : []);
      
      // Normalisation des données (ex: idOut -> id)
      toolsFound = toolsFound.map(t => ({
        ...t,
        id: t.id || t.idOut // Assure que ToolCard reçoive un id
      }));

      const totalFound = data.total !== undefined ? data.total : toolsFound.length;

      if (toolsFound.length > 0) {
        setTools(toolsFound);
        setTotal(totalFound);
      } else {
        // Fallback si l'API ne retourne rien
        throw new Error('No data from API');
      }
    } catch (error) {
      console.error('Erreur de recherche API, utilisation des données locales', error);
      
      // Moyen alternatif : Récupération depuis les données de test locales (mock-data)
      let localResults = filterTools({
        category: filters.category || undefined,
        pricing: filters.pricing.length > 0 ? filters.pricing : undefined,
        platforms: filters.platforms.length > 0 ? filters.platforms : undefined,
        functions: filters.functions.length > 0 ? filters.functions : undefined,
        models: filters.models.length > 0 ? filters.models : undefined,
        sortBy: filters.sortBy,
      });

      // Application manuelle du filtre de recherche textuelle si nécessaire
      if (filters.query) {
        const q = filters.query.toLowerCase();
        localResults = localResults.filter(t => 
          t.name.toLowerCase().includes(q) || 
          t.description.toLowerCase().includes(q)
        );
      }

      setTools(localResults);
      setTotal(localResults.length);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTools();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchTools]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {filters.query ? `Résultats pour "${filters.query}"` : 'Rechercher des outils IA'}
              </h1>
              <p className="text-muted-foreground">
                {loading ? 'Chargement...' : `${total} outil${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="grid lg:grid-cols-[280px_1fr] gap-8">
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <SearchFilters
                    initialQuery={initialQuery}
                    showAdvanced={true}
                    onFilterChange={setFilters}
                  />
                </div>
              </aside>

              <div>
                <div className="lg:hidden mb-6">
                  <SearchFilters
                    initialQuery={initialQuery}
                    onFilterChange={setFilters}
                  />
                </div>

                {loading && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Recherche en cours...</p>
                  </div>
                )}

                {!loading && tools.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {tools.map((tool) => (
                      <ToolCard key={tool.idOut || tool.id} tool={tool} /> // Supporte idOut ou id
                    ))}
                  </div>
                ) : (
                  !loading && (
                    <div className="text-center py-12">
                      <p className="text-lg text-muted-foreground">
                        Aucun outil trouvé pour votre recherche.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Essayez de modifier vos filtres ou votre recherche.
                      </p>
                    </div>
                  )
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