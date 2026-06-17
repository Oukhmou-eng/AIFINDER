import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { 
  MessageSquare, 
  Star, 
  MoreVertical, 
  Pencil, 
  Trash2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import AuthAPI from '../../services/authAPI';
import CatalogAPI from '../../services/catalogAPI';
import { toast } from 'sonner';

export default function DashboardReviews() {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const data = await AuthAPI.userComments();
        setComments(data);
      } catch (error) {
        console.error('Erreur commentaires:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, []);

  const handleEdit = (commentId, content) => {
    setEditingComment(commentId);
    setEditContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editingComment) return;
    try {
      // Pour l'instant on utilise addComment sans parentId pour "écraser" ou on pourrait avoir un updateComment
      // Mais ici on simule la mise à jour locale car l'API update_comment n'est pas encore faite.
      // Dans une version complète, on ferait CatalogAPI.updateComment(...)
      toast.info('La modification sera disponible prochainement');
      setEditingComment(null);
    } catch (error) {
      toast.error('Erreur modification');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await CatalogAPI.deleteComment(deleteId);
      setComments(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
      toast.success('Avis supprimé');
    } catch (error) {
      toast.error('Erreur suppression');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes avis</h1>
        <p className="text-muted-foreground">
          {comments.length} avis{comments.length > 1 ? 's' : ''} publié{comments.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;avis</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Liste des avis */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => {
            return (
              <Card key={comment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Vous</span>
                          <Badge variant="outline" className="text-xs">Auteur</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Sur</span>
                          <Link
                            to={`/tools/${comment.toolSlug}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            {comment.toolName}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <span className="text-muted-foreground/50">|</span>
                          <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(comment.id, comment.content)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(comment.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Note par étoiles (fictive si on n'a pas séparé Avis et Commentaires en base) */}
                  {/* <div className="flex items-center gap-1">
                    {renderStars(comment.rating || 5)}
                    <span className="ml-2 text-sm font-medium">{comment.rating || 5}/5</span>
                  </div> */}

                  {/* Contenu de l'avis (modifiable) */}
                  {editingComment === comment.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingComment(null)}>
                          Annuler
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground">{comment.content}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Aucun avis</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Vous n&apos;avez pas encore publié d&apos;avis
            </p>
            <Link to="/tools">
              <Button className="mt-4">Explorer les outils</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}