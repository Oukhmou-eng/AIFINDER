import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Heart, Search, SlidersHorizontal } from 'lucide-react';
import { ToolCard } from '../../components/tools/tool-card';
import { useAuth } from '../../contexts/auth-context';
import { tools as mockTools, getCategoryById } from '../../lib/mock-data';

export default function DashboardFavorites() {
  const { user } = useAuth();
  const favorites = user?.favorites || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Récupération des outils favoris
  const favoriteTools = mockTools.filter((tool) => favorites.includes(tool.id));

  // Filtrage et tri
  const filteredTools = favoriteTools
    .filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || tool.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        default: // 'recent'
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Catégories uniques parmi les favoris
  const uniqueCategories = [...new Set(favoriteTools.map((tool) => tool.categoryId))];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes favoris</h1>
        <p className="text-muted-foreground">
          {favorites.length} outil{favorites.length > 1 ? 's' : ''} enregistré{favorites.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans vos favoris..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {uniqueCategories.map((catId) => {
                const category = getCategoryById(catId);
                return (
                  <SelectItem key={catId} value={catId}>
                    {category?.name || catId}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="rating">Note</SelectItem>
              <SelectItem value="reviews">Avis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grille des outils */}
      {filteredTools.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} showCategory />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Heart className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Aucun favori trouvé</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || categoryFilter !== 'all'
              ? "Aucun outil ne correspond à vos critères de recherche."
              : "Vous n'avez pas encore ajouté d'outils à vos favoris."}
          </p>
          {!searchQuery && categoryFilter === 'all' && (
            <Link to="/tools">
              <Button className="mt-4">Explorer les outils</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}