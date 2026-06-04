import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown,
  Check
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { categories, aiModels } from '../../lib/mock-data';
import { cn } from '../../lib/utils';
import CatalogAPI from '../../services/catalogAPI';

export const pricingOptions = [
  { value: 'free', label: 'Gratuit' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Payant' },
];

const platformOptions = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'api', label: 'API' },
];

const functionOptions = [
  { value: 'text', label: 'Texte' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Vidéo' },
  { value: 'code', label: 'Code' },
];

const sortOptions = [
  { value: 'trending', label: 'Tendances' },
  { value: 'rating', label: 'Mieux notés' },
  { value: 'usage', label: 'Les plus utilisés' },
  { value: 'recent', label: 'Récents' },
];

const defaultFilters = {
  query: '',
  category: '',
  pricing: [],
  platforms: [],
  functions: [],
  models: [],
  sortBy: 'trending',
};

export function SearchFilters({ 
  onSearch, 
  onFilterChange, 
  initialQuery = '',
  showAdvanced = false 
}) {
  const [filters, setFilters] = useState({
    ...defaultFilters,
    query: initialQuery,
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);
  const [searchValue, setSearchValue] = useState(initialQuery);
  const [filterCategories, setFilterCategories] = useState(categories);
  const [filterModels, setFilterModels] = useState(aiModels);

  useEffect(() => {
    CatalogAPI.categories().then((items) => {
      if (items.length) setFilterCategories(items);
    }).catch(() => {});
    CatalogAPI.models().then((items) => {
      if (items.length) setFilterModels(items);
    }).catch(() => {});
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    count += filters.pricing.length;
    count += filters.platforms.length;
    count += filters.functions.length;
    count += filters.models.length;
    return count;
  }, [filters]);

  const handleSearchSubmit = useCallback((e) => {
    e?.preventDefault();
    const newFilters = { ...filters, query: searchValue };
    setFilters(newFilters);
    onSearch?.(searchValue);
    onFilterChange?.(newFilters);
  }, [searchValue, filters, onSearch, onFilterChange]);

  const updateFilter = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const toggleArrayFilter = useCallback((key, value) => {
    const current = filters[key];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, newValue);
  }, [filters, updateFilter]);

  const clearFilters = useCallback(() => {
    const newFilters = { ...defaultFilters, query: searchValue };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [searchValue, onFilterChange]);

  const FilterContent = () => (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={['category', 'pricing', 'platform']} className="w-full">
        {/* Category */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-medium">
            Catégorie
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Button
                variant={filters.category === '' ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => updateFilter('category', '')}
              >
                Toutes les catégories
              </Button>
              {filterCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={filters.category === cat.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => updateFilter('category', cat.id)}
                >
                  {cat.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {cat.toolCount}
                  </span>
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Pricing */}
        <AccordionItem value="pricing">
          <AccordionTrigger className="text-sm font-medium">
            Tarification
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {pricingOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pricing-${option.value}`}
                    checked={filters.pricing.includes(option.value)}
                    onCheckedChange={() => toggleArrayFilter('pricing', option.value)}
                  />
                  <Label
                    htmlFor={`pricing-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Platform */}
        <AccordionItem value="platform">
          <AccordionTrigger className="text-sm font-medium">
            Plateforme
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {platformOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${option.value}`}
                    checked={filters.platforms.includes(option.value)}
                    onCheckedChange={() => toggleArrayFilter('platforms', option.value)}
                  />
                  <Label
                    htmlFor={`platform-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Functions */}
        <AccordionItem value="functions">
          <AccordionTrigger className="text-sm font-medium">
            Fonction
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {functionOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`function-${option.value}`}
                    checked={filters.functions.includes(option.value)}
                    onCheckedChange={() => toggleArrayFilter('functions', option.value)}
                  />
                  <Label
                    htmlFor={`function-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* AI Models */}
        <AccordionItem value="models">
          <AccordionTrigger className="text-sm font-medium">
            Modèle AI
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterModels.map((model) => (
                <div key={model.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`model-${model.id}`}
                    checked={filters.models.includes(model.id)}
                    onCheckedChange={() => toggleArrayFilter('models', model.id)}
                  />
                  <Label
                    htmlFor={`model-${model.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {model.name}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({model.provider})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Effacer les filtres ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un outil AI..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Rechercher</Button>
        
        {/* Mobile filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden relative">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </form>

      {/* Sort and advanced toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="hidden lg:flex"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Recherche avancée
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active filters badges */}
        {activeFilterCount > 0 && (
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                {filterCategories.find(c => c.id === filters.category)?.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('category', '')}
                />
              </Badge>
            )}
            {filters.pricing.map((p) => (
              <Badge key={p} variant="secondary" className="gap-1 capitalize">
                {pricingOptions.find(o => o.value === p)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleArrayFilter('pricing', p)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Desktop filters panel */}
      {isAdvancedOpen && (
        <div className="hidden lg:block p-4 rounded-lg border border-border bg-card">
          <FilterContent />
        </div>
      )}
    </div>
  );
}
