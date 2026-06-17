import { Heart, Star, Scale, Check, Sparkles, FolderHeart, Flag, Edit, Plus, X, Search, Loader2, CheckCircle } from 'lucide-react';
import { AddToCollectionDialog } from '../ui/add-to-collection-dialog';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/auth-context';
import { useCompare } from '../../contexts/compare-context';
import { useState, useEffect } from 'react';
import { getCategoryById } from '../../lib/mock-data';
import { cn } from '../../lib/utils';
import { AuthModal } from '../ui/auth-modal';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import CatalogAPI from '../../services/catalogAPI';
import AdminAPI from '../../services/adminAPI';

export function ToolCard({ tool, showCategory = true }) {
  const { isAuthenticated, isAdmin, isFavorite, addFavorite, removeFavorite } = useAuth();
  const { addToolToCompare, removeToolFromCompare, isToolInCompare, canAddTool } = useCompare();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // État pour la gestion admin des catégories
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [searchCategoryQuery, setSearchCategoryQuery] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [savingCategories, setSavingCategories] = useState(false);

  // Récupération des catégories existantes
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await CatalogAPI.categories();
      setAllCategories(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les catégories");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Initialisation des catégories sélectionnées de l'outil
  useEffect(() => {
    if (categoriesDialogOpen) {
      fetchCategories();
      const currentCategoryIds = tool.categories?.map(c => c.id) || [];
      setSelectedCategoryIds(currentCategoryIds);
    }
  }, [categoriesDialogOpen, tool.categories]);

  const categoriesForTool = tool.categories?.length
    ? tool.categories
    : tool.categoryIds?.map(id => getCategoryById(id)).filter(cat => cat !== undefined) || [];

  const isInCompare = isToolInCompare(tool.id);
  const isFav = isFavorite(tool.id);

  // Filtrage des catégories pour la recherche
  const filteredCategories = allCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchCategoryQuery.toLowerCase()) ||
    (cat.slug && cat.slug.toLowerCase().includes(searchCategoryQuery.toLowerCase()))
  );

  const toggleCategory = (categoryId) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Le nom de la catégorie est obligatoire");
      return;
    }
    setIsCreatingCategory(true);
    try {
      const newCat = await AdminAPI.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
        icon: 'Layers'
      });
      setAllCategories(prev => [...prev, newCat.category]);
      setSelectedCategoryIds(prev => [...prev, newCat.category.id]);
      setNewCategoryName('');
      setNewCategoryDesc('');
      toast.success("Catégorie créée et ajoutée à l'outil");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la création de la catégorie");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSaveCategories = async () => {
    setSavingCategories(true);
    try {
      const currentIds = tool.categories?.map(c => c.id) || [];
      const toAdd = selectedCategoryIds.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !selectedCategoryIds.includes(id));
      
      for (const catId of toAdd) {
        await AdminAPI.addToolToCategory(tool.id, catId);
      }
      for (const catId of toRemove) {
        await AdminAPI.removeToolFromCategory(tool.id, catId);
      }
      toast.success("Catégories mises à jour");
      setCategoriesDialogOpen(false);
      // Recharge la page pour refléter les changements (ou utilisez un callback)
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Erreur lors de la mise à jour des catégories");
    } finally {
      setSavingCategories(false);
    }
  };

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
    if (isFav) removeFavorite(tool.id);
    else addFavorite(tool.id);
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

  const handleReportClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setReportDialogOpen(true);
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/proposals/${tool.id}`);
  };

  const handleManageCategoriesClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCategoriesDialogOpen(true);
  };

  const submitReport = async () => {
    if (!reportReason) {
      toast.error('Veuillez sélectionner un motif');
      return;
    }
    setIsReporting(true);
    try {
      await CatalogAPI.report({ idOut: tool.id, motif: reportReason, description: reportDetails });
      toast.success('Signalement envoyé avec succès');
      setReportDialogOpen(false);
      setReportReason('');
      setReportDetails('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du signalement');
    } finally {
      setIsReporting(false);
    }
  };

  const pricingColors = {
    free: 'bg-success/10 text-success border-success/20',
    freemium: 'bg-info/10 text-info border-info/20',
    paid: 'bg-warning/10 text-warning border-warning/20'
  };
  const pricingLabels = { free: 'Gratuit', freemium: 'Freemium', paid: 'Payant' };

  const renderCategories = () => {
    if (!showCategory) return null;
    if (categoriesForTool.length === 0) return null;
    const maxDisplay = 2;
    const visibleCategories = categoriesForTool.slice(0, maxDisplay);
    const remainingCount = categoriesForTool.length - maxDisplay;
    return (
      <div className="flex flex-wrap items-center gap-1 mt-1">
        {visibleCategories.map(cat => (
          <Badge key={cat.id} variant="outline" className="text-[10px] py-0 px-1.5 font-normal bg-muted/50">
            {cat.name}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal bg-muted/50">
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
            <Sparkles className="h-3 w-3" /> En vedette
          </Badge>
        </div>
      )}

      <Link to={isAdmin ? `/admin/proposals/${tool.id}` : `/tools/${tool.slug}`} className="block">
        <CardContent className="p-5 pb-2">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border border-border shadow-sm transition-all group-hover:shadow-md group-hover:border-primary/30">
              {tool.logo && !imgError ? (
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-3xl font-bold text-primary">{tool.name?.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 text-base">
                  {tool.name}
                </h3>
                {showCategory && categoriesForTool.length > 0 && <div className="mt-0.5">{renderCategories()}</div>}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <div className="flex items-center gap-1 text-warning">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">{Number(tool.rating || 0).toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground text-xs">({tool.reviewCount} avis)</span>
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
            {(tool.platforms || []).map(platform => (
              <Badge key={platform} variant="secondary" className="text-xs capitalize font-normal">
                {platform}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-0.5">
            <TooltipProvider delayDuration={200}>
              {isAdmin ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-primary" onClick={handleEditClick}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Modifier l'outil</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-primary" onClick={handleManageCategoriesClick}>
                        <FolderHeart className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Gérer les catégories</TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-8 w-8 rounded-full', isInCompare && 'text-primary bg-primary/10')}
                        onClick={handleCompareClick}
                      >
                        {isInCompare ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
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
                        className={cn('h-8 w-8 rounded-full', isFav && 'text-destructive bg-destructive/10')}
                        onClick={handleFavoriteClick}
                      >
                        <Heart className={cn('h-4 w-4', isFav && 'fill-current scale-110')} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {!isAuthenticated ? 'Connectez-vous' : (isFav ? 'Retirer des favoris' : 'Ajouter aux favoris')}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-warning hover:bg-warning/10" onClick={handleReportClick}>
                        <Flag className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Signaler</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleAddToCollection}>
                        <FolderHeart className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Ajouter à une collection</TooltipContent>
                  </Tooltip>
                </>
              )}
            </TooltipProvider>
          </div>
        </CardFooter>
      </Link>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="login" />
      <AddToCollectionDialog open={showAddToCollection} onOpenChange={setShowAddToCollection} tool={tool} />

      {/* Dialog de signalement (non admin) */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Signaler {tool.name}</DialogTitle>
            <DialogDescription>Aidez-nous à maintenir la qualité du catalogue.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motif</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez un motif" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deprecated">Version dépréciée</SelectItem>
                  <SelectItem value="outdated">Informations non à jour</SelectItem>
                  <SelectItem value="unavailable">Outil indisponible</SelectItem>
                  <SelectItem value="incorrect">Information erronée</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Détails (optionnel)</label>
              <Textarea placeholder="Précisez le problème..." value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>Annuler</Button>
            <Button onClick={submitReport} disabled={!reportReason || isReporting}>
              {isReporting ? 'Envoi...' : 'Envoyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de gestion des catégories (admin) */}
      <Dialog open={categoriesDialogOpen} onOpenChange={setCategoriesDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gérer les catégories de {tool.name}</DialogTitle>
            <DialogDescription>Sélectionnez les catégories auxquelles cet outil appartient.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Input
                placeholder="Rechercher une catégorie..."
                value={searchCategoryQuery}
                onChange={(e) => setSearchCategoryQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchCategoryQuery && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchCategoryQuery('')}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Grille des catégories existantes */}
            {loadingCategories ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                {filteredCategories.map(cat => (
                  <div
                    key={cat.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all",
                      selectedCategoryIds.includes(cat.id)
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30 hover:bg-muted/20"
                    )}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <CheckCircle className={cn("h-4 w-4 shrink-0", selectedCategoryIds.includes(cat.id) ? "text-primary" : "text-muted-foreground/30")} />
                    <span className="text-sm truncate">{cat.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Création nouvelle catégorie */}
            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-medium mb-2">Créer une nouvelle catégorie</p>
              <div className="grid gap-3">
                <Input placeholder="Nom de la nouvelle catégorie" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                <Textarea placeholder="Description (optionnelle)" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} rows={2} />
                <Button variant="outline" onClick={handleCreateCategory} disabled={isCreatingCategory || !newCategoryName.trim()} className="w-full">
                  {isCreatingCategory ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Créer et ajouter cette catégorie
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoriesDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveCategories} disabled={savingCategories}>
              {savingCategories && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}