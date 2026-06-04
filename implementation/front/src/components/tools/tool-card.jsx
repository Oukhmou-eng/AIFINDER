import { Heart, Star, ExternalLink, Scale, Check, Sparkles, FolderHeart } from 'lucide-react';
import { AddToCollectionDialog } from '../ui/add-to-collection-dialog';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAuth } from '../../contexts/auth-context';
import { useCompare } from '../../contexts/compare-context';
import { useState } from 'react';
import { getCategoryById } from '../../lib/mock-data';
import { cn } from '../../lib/utils';
import { AuthModal } from '../ui/auth-modal';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function ToolCard({ tool, showCategory = true }) {
  const { isAuthenticated, isFavorite, addFavorite, removeFavorite } = useAuth();
  const { addToolToCompare, removeToolFromCompare, isToolInCompare, canAddTool } = useCompare();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);

  // Récupération de toutes les catégories associées à l'outil
  const categoriesForTool = tool.categories?.length
    ? tool.categories
    : tool.categoryIds?.map(id => getCategoryById(id)).filter(cat => cat !== undefined) || [];

  const isInCompare = isToolInCompare(tool.id);
  const isFav = isFavorite(tool.id);

  const handleAddToCollection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setShowAddToCollection(true);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (isFav) {
      removeFavorite(tool.id);
    } else {
      addFavorite(tool.id);
    }
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare) {
      removeToolFromCompare(tool.id);
    } else if (canAddTool) {
      addToolToCompare(tool);
    } else {
      toast.error('Limite atteinte : maximum 3 outils en comparaison');
    }
  };

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

  // Fonction pour afficher jusqu'à 2 catégories, avec un badge +X pour les suivantes
  const renderCategories = () => {
    if (!showCategory) return null;
    if (categoriesForTool.length === 0) return null;

    const maxDisplay = 2;
    const visibleCategories = categoriesForTool.slice(0, maxDisplay);
    const remainingCount = categoriesForTool.length - maxDisplay;

    return (
      <div className="flex flex-wrap items-center gap-1 mt-1">
        {visibleCategories.map((category) => (
          <Badge
            key={category.id}
            variant="outline"
            className="text-[10px] py-0 px-1.5 font-normal bg-muted/50"
          >
            {category.name}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge
            variant="outline"
            className="text-[10px] py-0 px-1.5 font-normal bg-muted/50"
          >
            +{remainingCount}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40">
      {tool.featured && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm gap-1">
            <Sparkles className="h-3 w-3" />
            En vedette
          </Badge>
        </div>
      )}

      <Link to={`/tools/${tool.slug}`} className="block">
        <CardContent className="p-5 pb-2">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border border-border shadow-sm transition-all group-hover:shadow-md group-hover:border-primary/30">
              <span className="text-xl font-bold text-primary">
                {tool.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 text-base">
                    {tool.name}
                  </h3>
                  {showCategory && categoriesForTool.length > 0 && (
                    <div className="mt-0.5">
                      {renderCategories()}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <div className="flex items-center gap-1 text-warning">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium text-foreground">{Number(tool.rating || 0).toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  ({tool.reviewCount} avis)
                </span>
                <Badge variant="outline" className={cn('text-xs', pricingColors[tool.pricing])}>
                  {pricingLabels[tool.pricing]}
                </Badge>
              </div>

              <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {tool.description}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 mt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(tool.platforms || []).map((platform) => (
              <Badge key={platform} variant="secondary" className="text-xs capitalize font-normal">
                {platform}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-0.5">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 rounded-full transition-all',
                      isInCompare && 'text-primary bg-primary/10 hover:bg-primary/20'
                    )}
                    onClick={handleCompareClick}
                  >
                    {isInCompare ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Scale className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {isInCompare ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 rounded-full transition-all',
                      isFav && 'text-destructive bg-destructive/10 hover:bg-destructive/20'
                    )}
                    onClick={handleFavoriteClick}
                  >
                    <Heart className={cn('h-4 w-4 transition-transform', isFav && 'fill-current scale-110')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {!isAuthenticated
                    ? 'Connectez-vous pour ajouter aux favoris'
                    : isFav
                      ? 'Retirer des favoris'
                      : 'Ajouter aux favoris'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleAddToCollection}
                  >
                    <FolderHeart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Ajouter à une collection
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Link>
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="login" />
      <AddToCollectionDialog
        open={showAddToCollection}
        onOpenChange={setShowAddToCollection}
        tool={tool}
      />
    </Card>
  );
}
