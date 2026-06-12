// src/components/ui/add-to-collection-dialog.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Plus, FolderHeart, Check } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { toast } from 'sonner';

export function AddToCollectionDialog({ open, onOpenChange, tool, onAdded }) {
  const { user, addToCollection, createCollection } = useAuth();
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const collections = user?.collections || [];

  const handleAddToExisting = async () => {
    if (!selectedCollectionId) return;
    const collection = collections.find(c => c.id === selectedCollectionId);
    
    if (collection && collection.toolIds.includes(tool.id)) {
      toast.error('Cet outil est déjà dans cette collection');
      return;
    }

    try {
      setIsLoading(true);
      await addToCollection(selectedCollectionId, tool.id);
      toast.success(`"${tool.name}" ajouté à ${collection.name}`);
      onAdded?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de l'ajout à la collection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newCollectionName.trim()) return;
    try {
      setIsLoading(true);
      const updatedCollections = await createCollection(newCollectionName, newCollectionDesc);
      
      // La nouvelle collection est la première car triée par date décroissante dans le backend
      const newlyCreated = updatedCollections[0];
      
      if (newlyCreated) {
        await addToCollection(newlyCreated.id, tool.id);
      }
      
      toast.success(`Collection "${newCollectionName}" créée et outil ajouté`);
      setNewCollectionName('');
      setNewCollectionDesc('');
      onAdded?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de la création de la collection");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter à une collection</DialogTitle>
          <DialogDescription>
            Choisissez une collection existante ou créez-en une nouvelle pour {tool.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {collections.length > 0 && (
            <div className="space-y-2">
              <Label>Collections existantes</Label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {collections.map(col => (
                  <div
                    key={col.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-colors ${
                      selectedCollectionId === col.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => setSelectedCollectionId(col.id)}
                  >
                    <div className="flex items-center gap-2">
                      <FolderHeart className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{col.name}</span>
                    </div>
                    {selectedCollectionId === col.id && <Check className="h-4 w-4 text-primary" />}
                  </div>
                ))}
              </div>
              {selectedCollectionId && (
                <Button onClick={handleAddToExisting} className="w-full mt-2">
                  Ajouter à cette collection
                </Button>
              )}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Nouvelle collection</Label>
            <Input
              placeholder="Nom de la nouvelle collection"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
            <Textarea
              placeholder="Description (optionnel)"
              value={newCollectionDesc}
              onChange={(e) => setNewCollectionDesc(e.target.value)}
              rows={2}
            />
            <Button
              onClick={handleCreateAndAdd}
              disabled={!newCollectionName.trim() || isLoading}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer et ajouter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}