import { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { reviews, tools } from '../../lib/mock-data';

export default function DashboardReviews() {
  const { user } = useAuth();
  // Filtrer les avis de l'utilisateur connecté (comparaison par email ou id)
  const userReviews = reviews.filter(r => r.userId === user?.id || r.userEmail === user?.email);
  const [comments, setComments] = useState(userReviews);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const handleEdit = (commentId, content) => {
    setEditingComment(commentId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (!editingComment) return;
    setComments(prev => prev.map(c =>
      c.id === editingComment
        ? { ...c, comment: editContent, updatedAt: new Date().toISOString().split('T')[0] }
        : c
    ));
    setEditingComment(null);
    setEditContent('');
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setComments(prev => prev.filter(c => c.id !== deleteId));
    setDeleteId(null);
  };

  const getToolInfo = (toolId) => {
    const tool = tools.find(t => t.id === toolId);
    return tool ? { name: tool.name, slug: tool.slug } : { name: 'Outil inconnu', slug: '#' };
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`}
      />
    ));
  };

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
            const toolInfo = getToolInfo(comment.toolId);
            return (
              <Card key={comment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                        <AvatarFallback>{comment.userName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.userName}</span>
                          <Badge variant="outline" className="text-xs">Vous</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Sur</span>
                          <Link
                            to={`/tools/${toolInfo.slug}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            {toolInfo.name}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <span className="text-muted-foreground/50">|</span>
                          <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                            <span className="text-muted-foreground/50">(modifié)</span>
                          )}
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
                        <DropdownMenuItem onClick={() => handleEdit(comment.id, comment.comment)}>
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
                  {/* Note par étoiles */}
                  <div className="flex items-center gap-1">
                    {renderStars(comment.rating)}
                    <span className="ml-2 text-sm font-medium">{comment.rating}/5</span>
                  </div>

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
                    <p className="text-sm text-foreground">{comment.comment}</p>
                  )}

                  {/* Réponses (si existantes) */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-l-2 border-border pl-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        {comment.replies.length} réponse{comment.replies.length > 1 ? 's' : ''}
                      </p>
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reply.userAvatar} alt={reply.userName} />
                            <AvatarFallback>{reply.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{reply.userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{reply.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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