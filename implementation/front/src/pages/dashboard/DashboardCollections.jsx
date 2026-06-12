import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { ToolCard } from '../../components/tools/tool-card';
import {
  FolderHeart,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronRight,
  Search,
  X,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { CatalogAPI } from '../../services/catalogAPI';
import { toast } from 'sonner';

export default function DashboardCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionTools, setCollectionTools] = useState([]);
  const [loadingTools, setLoadingTools] = useState(false);
  
  const [showAddTool, setShowAddTool] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [availableTools, setAvailableTools] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [selectedToolToAdd, setSelectedToolToAdd] = useState(null);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const [editCollection, setEditCollection] = useState({ id: '', name: '', description: '' });

  // Chargement initial des collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const data = await CatalogAPI.collections();
        setCollections(data);
      } catch (error) {
        console.error('Erreur lors du chargement des collections:', error);
        toast.error('Impossible de charger vos collections');
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  // Chargement des outils de la collection sélectionnée
  useEffect(() => {
    const fetchCollectionTools = async () => {
      if (!selectedCollection || !selectedCollection.toolIds || selectedCollection.toolIds.length === 0) {
        setCollectionTools([]);
        return;
      }
      try {
        setLoadingTools(true);
        const tools = await CatalogAPI.tools({ ids: selectedCollection.toolIds });
        setCollectionTools(tools);
      } catch (error) {
        console.error('Erreur lors du chargement des outils de la collection:', error);
        toast.error('Erreur lors du chargement des outils');
      } finally {
        setLoadingTools(false);
      }
    };
    fetchCollectionTools();
  }, [selectedCollection]);

  // Recherche d'outils à ajouter
  useEffect(() => {
    const searchAvailableTools = async () => {
      if (!addSearchQuery.trim()) {
        setAvailableTools([]);
        return;
      }
      try {
        setLoadingAvailable(true);
        const data = await CatalogAPI.tools({ q: addSearchQuery, limit: 10 });
        // Filtrer les outils déjà présents
        const filtered = data.filter(t => !selectedCollection?.toolIds?.includes(t.id));
        setAvailableTools(filtered);
      } catch (error) {
        console.error('Erreur lors de la recherche d\'outils:', error);
      } finally {
        setLoadingAvailable(false);
      }
    };

    const timer = setTimeout(searchAvailableTools, 300);
    return () => clearTimeout(timer);
  }, [addSearchQuery, selectedCollection]);

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) return;
    try {
      const updatedCollections = await CatalogAPI.createCollection(newCollection.name, newCollection.description);
      setCollections(updatedCollections);
      setNewCollection({ name: '', description: '' });
      setIsCreateOpen(false);
      toast.success('Collection créée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création de la collection');
    }
  };

  const handleEditCollection = async () => {
    if (!editCollection.name.trim()) return;
    try {
      const updatedCollections = await CatalogAPI.updateCollection(editCollection.id, editCollection.name, editCollection.description);
      setCollections(updatedCollections);
      
      if (selectedCollection?.id === editCollection.id) {
        const updated = updatedCollections.find(c => c.id === editCollection.id);
        setSelectedCollection(updated);
      }
      
      setIsEditOpen(false);
      toast.success('Collection mise à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteCollection = async (id) => {
    try {
      const updatedCollections = await CatalogAPI.deleteCollection(id);
      setCollections(updatedCollections);
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
      }
      toast.success('Collection supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const openEditDialog = (collection) => {
    setEditCollection({
      id: collection.id,
      name: collection.name,
      description: collection.description || '',
    });
    setIsEditOpen(true);
  };

  const addToolToSelectedCollection = async () => {
    if (!selectedToolToAdd || !selectedCollection) return;
    try {
      const updatedCollections = await CatalogAPI.addToolToCollection(selectedCollection.id, selectedToolToAdd.id);
      setCollections(updatedCollections);
      
      const updated = updatedCollections.find(c => c.id === selectedCollection.id);
      setSelectedCollection(updated);
      
      setShowAddTool(false);
      setAddSearchQuery('');
      setSelectedToolToAdd(null);
      toast.success('Outil ajouté à la collection');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'outil');
    }
  };

  const removeFromCollection = async (toolId) => {
    if (!selectedCollection) return;
    try {
      const updatedCollections = await CatalogAPI.removeToolFromCollection(selectedCollection.id, toolId);
      setCollections(updatedCollections);
      
      const updated = updatedCollections.find(c => c.id === selectedCollection.id);
      setSelectedCollection(updated);
      
      toast.success('Outil retiré de la collection');
    } catch (error) {
      toast.error('Erreur lors du retrait de l\'outil');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En‑tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes collections</h1>
          <p className="text-muted-foreground">
            Organisez vos outils favoris en collections personnalisées
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une collection</DialogTitle>
              <DialogDescription>
                Donnez un nom et une description à votre nouvelle collection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder="Ma collection"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Une brève description de cette collection..."
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateCollection}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialogue d’édition */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la collection</DialogTitle>
            <DialogDescription>
              Modifiez le nom et la description de votre collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                value={editCollection.name}
                onChange={(e) => setEditCollection({ ...editCollection, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optionnel)</Label>
              <Textarea
                id="edit-description"
                value={editCollection.description}
                onChange={(e) => setEditCollection({ ...editCollection, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
            <Button onClick={handleEditCollection}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Liste des collections */}
        <div className="space-y-4 lg:col-span-1">
          {collections.length > 0 ? (
            collections.map((collection) => (
              <Card
                key={collection.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedCollection?.id === collection.id ? 'ring-2 ring-primary' : ''
                  }`}
                onClick={() => setSelectedCollection(collection)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderHeart className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{collection.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(collection); }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDeleteCollection(collection.id); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {collection.description && (
                    <CardDescription className="line-clamp-2 text-xs">
                      {collection.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{collection.toolIds?.length || 0} outil{(collection.toolIds?.length || 0) > 1 ? 's' : ''}</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="py-8">
              <CardContent className="text-center">
                <FolderHeart className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Vous n&apos;avez pas encore de collection
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Détail de la collection sélectionnée */}
        <div className="lg:col-span-2">
          {selectedCollection ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedCollection.name}</CardTitle>
                    {selectedCollection.description && (
                      <CardDescription>{selectedCollection.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedCollection.toolIds?.length || 0} outil{(selectedCollection.toolIds?.length || 0) > 1 ? 's' : ''}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setShowAddTool(true)}>
                      <Plus className="mr-1 h-3 w-3" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTools ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : collectionTools.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {collectionTools.map((tool) => (
                      <div key={tool.id} className="relative group">
                        <ToolCard tool={tool} showCategory={false} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFromCollection(tool.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {showAddTool && (
                      <div className="mt-4 p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher un outil..."
                            value={addSearchQuery}
                            onChange={(e) => setAddSearchQuery(e.target.value)}
                            className="flex-1"
                          />
                          <Button variant="outline" size="sm" onClick={() => setShowAddTool(false)}>Annuler</Button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {loadingAvailable ? (
                            <div className="flex py-4 justify-center">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          ) : availableTools.length > 0 ? (
                            availableTools.map(tool => (
                              <div
                                key={tool.id}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted ${selectedToolToAdd?.id === tool.id ? 'bg-primary/10' : ''
                                  }`}
                                onClick={() => setSelectedToolToAdd(tool)}
                              >
                                <div>
                                  <p className="font-medium text-sm">{tool.name}</p>
                                  <p className="text-xs text-muted-foreground">{tool.description.slice(0, 60)}...</p>
                                </div>
                                {selectedToolToAdd?.id === tool.id && <CheckCircle className="h-4 w-4 text-primary" />}
                              </div>
                            ))
                          ) : addSearchQuery.trim() !== '' ? (
                            <p className="text-xs text-center py-2 text-muted-foreground">Aucun outil trouvé</p>
                          ) : (
                            <p className="text-xs text-center py-2 text-muted-foreground">Tapez pour rechercher des outils</p>
                          )}
                        </div>
                        <Button
                          className="w-full mt-3"
                          disabled={!selectedToolToAdd}
                          onClick={addToolToSelectedCollection}
                        >
                          Ajouter à la collection
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Cette collection est vide
                    </p>
                    {showAddTool ? (
                      <div className="mt-4 max-w-sm mx-auto p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher un outil..."
                            value={addSearchQuery}
                            onChange={(e) => setAddSearchQuery(e.target.value)}
                            className="flex-1"
                          />
                          <Button variant="outline" size="sm" onClick={() => setShowAddTool(false)}>Annuler</Button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {loadingAvailable ? (
                            <div className="flex py-4 justify-center">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          ) : availableTools.length > 0 ? (
                            availableTools.map(tool => (
                              <div
                                key={tool.id}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted ${selectedToolToAdd?.id === tool.id ? 'bg-primary/10' : ''
                                  }`}
                                onClick={() => setSelectedToolToAdd(tool)}
                              >
                                <div className="text-left">
                                  <p className="font-medium text-sm">{tool.name}</p>
                                  <p className="text-xs text-muted-foreground">{tool.description.slice(0, 60)}...</p>
                                </div>
                                {selectedToolToAdd?.id === tool.id && <CheckCircle className="h-4 w-4 text-primary" />}
                              </div>
                            ))
                          ) : addSearchQuery.trim() !== '' ? (
                            <p className="text-xs text-center py-2 text-muted-foreground">Aucun outil trouvé</p>
                          ) : (
                            <p className="text-xs text-center py-2 text-muted-foreground">Tapez pour rechercher des outils</p>
                          )}
                        </div>
                        <Button
                          className="w-full mt-3"
                          disabled={!selectedToolToAdd}
                          onClick={addToolToSelectedCollection}
                        >
                          Ajouter à la collection
                        </Button>
                      </div>
                    ) : (
                      <Link to="/tools">
                        <Button className="mt-4">Explorer les outils</Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex h-full items-center justify-center py-16">
              <CardContent className="text-center">
                <FolderHeart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Sélectionnez une collection pour voir son contenu
                </p>
              </CardContent>
            </Card>
          )}


        </div>
      </div>
    </div>
  );
}