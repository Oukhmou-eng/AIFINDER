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
import CatalogAPI from '../../services/catalogAPI';
import { toast } from 'sonner';

export default function DashboardCollections() {
  const { user, addToCollection, removeFromCollection, createCollection, deleteCollection } = useAuth();
  const [tools, setTools] = useState([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);

  const collections = user?.collections || [];

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showAddTool, setShowAddTool] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [selectedToolToAdd, setSelectedToolToAdd] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const [editCollection, setEditCollection] = useState({ id: '', name: '', description: '' });

  useEffect(() => {
    const fetchTools = async () => {
      setIsLoadingTools(true);
      try {
        const data = await CatalogAPI.tools();
        setTools(data);
      } catch (error) {
        console.error('Erreur outils:', error);
      } finally {
        setIsLoadingTools(false);
      }
    };
    fetchTools();
  }, []);

  // Mettre à jour la collection sélectionnée si les collections de l'utilisateur changent
  useEffect(() => {
    if (selectedCollection) {
      const updated = collections.find(c => String(c.id) === String(selectedCollection.id));
      if (updated) {
        setSelectedCollection(updated);
      } else {
        setSelectedCollection(null);
      }
    }
  }, [collections]);

  // Récupération des outils correspondant aux IDs de la collection
  const getCollectionTools = (collection) => {
    if (!collection || !collection.toolIds) return [];
    const toolIdsStr = collection.toolIds.map(String);
    return tools.filter(tool => toolIdsStr.includes(String(tool.id)));
  };

  // Fonction pour ajouter un outil à la collection sélectionnée
  const handleAddToolToSelectedCollection = async () => {
    if (!selectedToolToAdd || !selectedCollection) return;
    try {
      await addToCollection(selectedCollection.id, selectedToolToAdd.id);
      toast.success('Outil ajouté à la collection');
      setShowAddTool(false);
      setAddSearchQuery('');
      setSelectedToolToAdd(null);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  // Outils disponibles (non déjà présents dans la collection)
  const availableTools = tools.filter(t => {
    const toolIdStr = String(t.id);
    const alreadyIn = selectedCollection?.toolIds?.map(String).includes(toolIdStr);
    const matchesSearch = t.name.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(addSearchQuery.toLowerCase());
    return !alreadyIn && matchesSearch;
  });

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) return;
    try {
      await createCollection(newCollection.name, newCollection.description);
      setNewCollection({ name: '', description: '' });
      setIsCreateOpen(false);
      toast.success('Collection créée');
    } catch (error) {
      toast.error('Erreur création collection');
    }
  };

  const handleEditCollection = () => {
    // Note: Le backend n'a pas encore d'endpoint spécifique pour éditer une collection (nom/desc)
    // On pourrait l'ajouter plus tard. Pour l'instant on affiche un toast.
    toast.info('La modification du nom sera disponible prochainement');
    setIsEditOpen(false);
  };

  const handleDeleteCollection = async (id) => {
    try {
      await deleteCollection(id);
      toast.success('Collection supprimée');
    } catch (error) {
      toast.error('Erreur suppression');
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

  const handleRemoveFromCollection = async (toolId) => {
    if (!selectedCollection) return;
    try {
      await removeFromCollection(selectedCollection.id, toolId);
      toast.success('Outil retiré');
    } catch (error) {
      toast.error('Erreur retrait');
    }
  };

  if (isLoadingTools) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const collectionTools = selectedCollection ? getCollectionTools(selectedCollection) : [];

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
                      <Button variant="outline" size="sm" onClick={() => setShowAddTool(false)}>
                        Annuler
                      </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {availableTools.slice(0, 10).map(tool => (
                        <div
                          key={tool.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted ${selectedToolToAdd?.id === tool.id ? 'bg-primary/10' : ''
                            }`}
                          onClick={() => setSelectedToolToAdd(tool)}
                        >
                          <div>
                            <p className="font-medium text-sm">{tool.name}</p>
                            <p className="text-xs text-muted-foreground">{tool.description?.slice(0, 60)}...</p>
                          </div>
                          {selectedToolToAdd?.id === tool.id && <CheckCircle className="h-4 w-4 text-primary" />}
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full mt-3"
                      disabled={!selectedToolToAdd}
                      onClick={handleAddToolToSelectedCollection}
                    >
                      Ajouter à la collection
                    </Button>
                  </div>
                )}
                {collectionTools.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {collectionTools.map((tool) => (
                      <div key={tool.id} className="relative group">
                        <ToolCard tool={tool} showCategory={false} />
                        <button
                          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromCollection(tool.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Cette collection est vide
                    </p>
                    <Link to="/tools">
                      <Button className="mt-4">Ajouter des outils</Button>
                    </Link>
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