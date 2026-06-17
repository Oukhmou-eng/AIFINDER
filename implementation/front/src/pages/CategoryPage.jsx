import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Loader2, Search, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { ToolCard } from '../components/tools/tool-card';
import Sidebar from '../components/layout/sidebar';
import { useAuth } from '../contexts/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import CatalogAPI from '../services/catalogAPI';
import AdminAPI from '../services/adminAPI';

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [apiCategory, setApiCategory] = useState(null);
  const [apiTools, setApiTools] = useState([]);
  const [allTools, setAllTools] = useState([]);
  const [loadingAllTools, setLoadingAllTools] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingToolId, setRemovingToolId] = useState(null);
  const [searchToolQuery, setSearchToolQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState([]);
  
  // État pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const category = apiCategory;
  const categoryTools = apiTools;

  // Charger la catégorie
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const items = await CatalogAPI.categories();
        const found = items.find((cat) => cat.slug === slug || cat.id === slug);
        setApiCategory(found || null);
      } catch (err) {
        setApiCategory(null);
      }
    };
    loadCategory();
  }, [slug]);

  // Charger les outils de la catégorie
  useEffect(() => {
    if (category) {
      CatalogAPI.tools({ category: category.slug })
        .then(setApiTools)
        .catch(() => setApiTools([]));
    }
  }, [category]);

  // Charger tous les outils (uniquement quand on ouvre la modale)
  const loadAllTools = async () => {
    if (!isAdmin) return;
    setLoadingAllTools(true);
    try {
      const data = await CatalogAPI.tools({ limit: 100 });
      setAllTools(data.tools || data || []);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger la liste des outils");
    } finally {
      setLoadingAllTools(false);
    }
  };

  // Filtrer les outils en fonction de la recherche
  useEffect(() => {
    if (!allTools.length) return;
    const toolsNotInCategory = allTools.filter(
      (tool) => !categoryTools.some((ct) => ct.id === tool.id)
    );
    const query = searchToolQuery.toLowerCase().trim();
    if (!query) {
      setFilteredTools(toolsNotInCategory);
      return;
    }
    const filtered = toolsNotInCategory.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        (tool.description && tool.description.toLowerCase().includes(query)) ||
        (tool.provider && tool.provider.toLowerCase().includes(query))
    );
    setFilteredTools(filtered);
  }, [searchToolQuery, allTools, categoryTools]);

  const handleOpenAddDialog = () => {
    setSelectedToolId('');
    setSearchToolQuery('');
    setAddDialogOpen(true);
    loadAllTools();
  };

  const handleAddTool = async () => {
    if (!selectedToolId) {
      toast.error("Veuillez sélectionner un outil");
      return;
    }
    setAdding(true);
    try {
      await AdminAPI.addToolToCategory(selectedToolId, category.id);
      toast.success("Outil ajouté à la catégorie");
      const updatedTools = await CatalogAPI.tools({ category: category.slug });
      setApiTools(updatedTools);
      setAddDialogOpen(false);
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveTool = async (toolId) => {
    if (!window.confirm("Retirer cet outil de la catégorie ?")) return;
    setRemovingToolId(toolId);
    try {
      await AdminAPI.removeToolFromCategory(toolId, category.id);
      toast.success("Outil retiré de la catégorie");
      setApiTools((prev) => prev.filter((t) => t.id !== toolId));
    } catch (err) {
      toast.error(err.message || "Erreur lors du retrait");
    } finally {
      setRemovingToolId(null);
    }
  };

  const handleDeleteCategory = async () => {
    setDeleting(true);
    try {
      await AdminAPI.deleteCategory(category.id);
      toast.success("Catégorie supprimée avec succès");
      navigate("/categories");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression");
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!category && apiCategory === null) {
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
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 container mx-auto px-4 py-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredCategoryTools = isAdmin 
  ? categoryTools 
  : categoryTools.filter((tool) => tool.status === 'active');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <Link to="/categories">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Toutes les catégories
                </Button>
              </Link>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button onClick={handleOpenAddDialog} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un outil
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer la catégorie
                  </Button>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">{category.name}</h1>
              <p className="text-muted-foreground">{category.description}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {filteredCategoryTools.length} outil{filteredCategoryTools.length > 1 ? "s" : ""} dans cette catégorie
              </p>
            </div>

            {filteredCategoryTools.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                filteredCategoryTools.map((tool) => (
                  <div key={tool.id} className="relative">
                    <ToolCard tool={tool} showCategory={false} />
                    {isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 z-10 opacity-80 hover:opacity-100"
                        onClick={() => handleRemoveTool(tool.id)}
                        disabled={removingToolId === tool.id}
                      >
                        {removingToolId === tool.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
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

      {/* Dialogue d'ajout d'outil (inchangé) */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un outil à {category.name}</DialogTitle>
            <DialogDescription>
              Recherchez et sélectionnez un outil à associer à cette catégorie.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Input
                placeholder="Rechercher par nom, description ou fournisseur..."
                value={searchToolQuery}
                onChange={(e) => setSearchToolQuery(e.target.value)}
                autoFocus
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchToolQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchToolQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {loadingAllTools ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchToolQuery
                  ? "Aucun outil ne correspond à votre recherche."
                  : "Tous les outils sont déjà dans cette catégorie."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedToolId === tool.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 hover:bg-muted/20"
                    )}
                    onClick={() => setSelectedToolId(tool.id)}
                  >
                    <div className="h-10 w-10 shrink-0 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden">
                      {tool.logo ? (
                        <img
                          src={tool.logo}
                          alt={tool.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {tool.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{tool.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tool.provider || "Fournisseur inconnu"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                    {selectedToolId === tool.id && (
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddTool} disabled={adding || !selectedToolId}>
              {adding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Ajouter l'outil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la catégorie</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie <strong>"{category.name}"</strong> ?
              {categoryTools.length > 0 && (
                <span className="block mt-2 p-2 bg-destructive/10 text-destructive rounded-md">
                  Attention : Cette catégorie contient actuellement <strong>{categoryTools.length} outil(s)</strong>.
                  La suppression de la catégorie ne supprimera pas les outils, mais ils ne seront plus associés à cette catégorie.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Oui, supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}