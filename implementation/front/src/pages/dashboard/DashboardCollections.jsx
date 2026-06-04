import { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { tools as mockTools } from '../../lib/mock-data';
import { useAuth } from '../../contexts/auth-context';

// Données mock par défaut (au cas où l'utilisateur n'aurait pas de collections)
const defaultCollections = [
  {
    id: 'col1',
    name: 'Outils IA pour le développement',
    description: 'Les meilleurs assistants de code et outils de programmation',
    toolIds: ['github-copilot', 'cursor', 'chatgpt'],
    createdAt: '2024-01-15',
  },
  {
    id: 'col2',
    name: 'Création visuelle',
    description: 'Génération d’images et design',
    toolIds: ['midjourney', 'dall-e'],
    createdAt: '2024-02-10',
  },
];

export default function DashboardCollections() {
  const { user } = useAuth();

  // Normalisation : s'assurer que chaque collection a un tableau toolIds
  const normalizeCollection = (col) => ({
    ...col,
    toolIds: col.toolIds || [],
  });

  const initialCollections = (user?.collections || []).map(normalizeCollection);
  const [collections, setCollections] = useState(
    initialCollections.length ? initialCollections : defaultCollections.map(normalizeCollection)
  );
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showAddTool, setShowAddTool] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [selectedToolToAdd, setSelectedToolToAdd] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const [editCollection, setEditCollection] = useState({ id: '', name: '', description: '' });

  // Récupération des outils correspondant aux IDs de la collection
  const getCollectionTools = (collection) => {
    if (!collection || !collection.toolIds) return [];
    return mockTools.filter(tool => collection.toolIds.includes(tool.id));
  };

  // Fonction pour ajouter un outil à la collection sélectionnée
  const addToolToSelectedCollection = () => {
    if (!selectedToolToAdd || !selectedCollection) return;
    const updatedToolIds = [...(selectedCollection.toolIds || []), selectedToolToAdd.id];
    const updatedCollection = { ...selectedCollection, toolIds: updatedToolIds };
    setCollections(collections.map(c => c.id === selectedCollection.id ? updatedCollection : c));
    setSelectedCollection(updatedCollection);
    setShowAddTool(false);
    setAddSearchQuery('');
    setSelectedToolToAdd(null);
    toast.success('Outil ajouté à la collection');
  };
  // Outils disponibles (non déjà présents dans la collection)
  const availableTools = mockTools.filter(t =>
    !selectedCollection?.toolIds?.includes(t.id) &&
    (t.name.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(addSearchQuery.toLowerCase()))
  );

  const handleCreateCollection = () => {
    if (!newCollection.name.trim()) return;
    const collection = {
      id: Date.now().toString(),
      name: newCollection.name,
      description: newCollection.description,
      toolIds: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCollections([...collections, collection]);
    setNewCollection({ name: '', description: '' });
    setIsCreateOpen(false);
  };

  const handleEditCollection = () => {
    if (!editCollection.name.trim()) return;
    setCollections(collections.map(c =>
      c.id === editCollection.id
        ? { ...c, name: editCollection.name, description: editCollection.description }
        : c
    ));
    setIsEditOpen(false);
    if (selectedCollection?.id === editCollection.id) {
      setSelectedCollection({
        ...selectedCollection,
        name: editCollection.name,
        description: editCollection.description,
      });
    }
  };

  const handleDeleteCollection = (id) => {
    setCollections(collections.filter(c => c.id !== id));
    if (selectedCollection?.id === id) {
      setSelectedCollection(null);
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

  const removeFromCollection = (toolId) => {
    if (!selectedCollection) return;
    const updatedToolIds = (selectedCollection.toolIds || []).filter(id => id !== toolId);
    const updatedCollection = {
      ...selectedCollection,
      toolIds: updatedToolIds,
    };
    setCollections(collections.map(c =>
      c.id === selectedCollection.id ? updatedCollection : c
    ));
    setSelectedCollection(updatedCollection);
  };

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
                {collectionTools.length > 0 ? (
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
                          {availableTools.slice(0, 10).map(tool => (
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
                          ))}
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