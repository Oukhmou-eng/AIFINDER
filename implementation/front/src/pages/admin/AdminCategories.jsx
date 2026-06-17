import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
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
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Layers,
  Loader2,
  Zap,
  Cpu,
  MessageSquare,
  Image as ImageIcon,
  Music,
  Video,
  Code,
  Globe,
  Shield,
  Search as SearchIcon,
  HelpCircle,
  Eye
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import { AdminAPI } from '../../services/adminAPI';

// Helper to get Lucide icon component from name
const toPascalCase = (str) =>
  str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

const getIcon = (iconName) => {
  if (!iconName) return HelpCircle;
  const pascal = toPascalCase(iconName);
  return Icons[pascal] || HelpCircle;
};

// Available icons for selection
const AVAILABLE_ICONS = [
  { name: 'Layers', icon: Layers },
  { name: 'Zap', icon: Zap },
  { name: 'Cpu', icon: Cpu },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Image', icon: ImageIcon },
  { name: 'Music', icon: Music },
  { name: 'Video', icon: Video },
  { name: 'Code', icon: Code },
  { name: 'Globe', icon: Globe },
  { name: 'Shield', icon: Shield },
  { name: 'Search', icon: SearchIcon },
];

function StatCard({ title, value, icon: Icon, description, variant = 'primary', loading = false }) {
  const variantClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${variantClasses[variant] || variantClasses.primary}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminCategories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Layers');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await AdminAPI.categories();
      setCategoriesList(data.categories || []);
    } catch (err) {
      toast.error(err.message || 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return categoriesList.filter((cat) =>
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query) ||
      (cat.description || '').toLowerCase().includes(query)
    );
  }, [categoriesList, searchQuery]);

  const totalTools = useMemo(() =>
    categoriesList.reduce((sum, cat) => sum + (cat.toolCount || 0), 0)
    , [categoriesList]);

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setFormIcon('Layers');
    setSelectedCategory(null);
    setEditMode(false);
  };

  const openCreate = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEdit = (category) => {
    setSelectedCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDesc(category.description || '');
    setFormIcon(category.icon || 'Layers');
    setEditMode(true);
    setIsAddDialogOpen(true);
  };

  const handleNameChange = (value) => {
    setFormName(value);
    if (!editMode || !formSlug) {
      setFormSlug(slugify(value));
    }
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Le nom de la catégorie est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || slugify(formName),
        description: formDesc.trim(),
        icon: formIcon,
      };

      let result;
      if (editMode && selectedCategory) {
        result = await AdminAPI.updateCategory({ ...payload, id: selectedCategory.id });
      } else {
        result = await AdminAPI.createCategory(payload);
      }

      const savedCategory = result.category;

      setCategoriesList((current) => {
        if (editMode) {
          return current.map((cat) =>
            cat.id === savedCategory.id ? savedCategory : cat
          );
        }
        return [...current, savedCategory].sort((a, b) => a.name.localeCompare(b.name));
      });

      toast.success(editMode ? 'Catégorie mise à jour' : 'Catégorie créée');
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setDeleting(true);
    try {
      await AdminAPI.deleteCategory(categoryToDelete.id);
      setCategoriesList((current) => current.filter((item) => item.id !== categoryToDelete.id));
      toast.success('Catégorie supprimée avec succès');
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des catégories</h1>
          <p className="text-muted-foreground mt-1 text-lg">Organisez les outils IA par domaine d&apos;application</p>
        </div>
        <Button onClick={openCreate} size="lg" className="shadow-sm">
          <Plus className="mr-2 h-5 w-5" />
          Nouvelle catégorie
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Total catégories"
          value={categoriesList.length}
          icon={Layers}
          variant="primary"
          loading={loading}
        />
        <StatCard
          title="Total outils classés"
          value={totalTools}
          icon={Zap}
          description="répartis dans toutes les catégories"
          variant="success"
          loading={loading}
        />
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Liste des catégories</CardTitle>
          <CardDescription>
            {loading
              ? 'Chargement des données...'
              : `${filteredCategories.length} catégorie${filteredCategories.length > 1 ? 's' : ''} trouvée${filteredCategories.length > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, slug ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground font-medium">Chargement des catégories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-20 bg-muted/10">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-lg">Aucune catégorie trouvée</p>
                {searchQuery && (
                  <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">
                    Effacer la recherche
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="w-[300px]">Catégorie</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="text-center">Outils</TableHead>
                    <TableHead className="w-20 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => {
                    const IconComponent = getIcon(category.icon);
                    return (
                      <TableRow key={category.id} className="hover:bg-muted/5 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-base text-foreground truncate">{category.name}</p>
                              <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                /{category.slug}
                              </code>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-[400px]">
                            {category.description || '-'}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={category.toolCount > 0 ? 'secondary' : 'outline'} className="font-semibold">
                            {category.toolCount} outils
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-muted">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => openEdit(category)} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/categories/${category.slug}`)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => confirmDelete(category)}
                                className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Ajout / Modification */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        if (!open && !saving) resetForm();
        setIsAddDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editMode ? 'Modifier la catégorie' : 'Créer une catégorie'}</DialogTitle>
            <DialogDescription>
              {editMode
                ? 'Mettez à jour les informations de la catégorie existante.'
                : 'Ajoutez une nouvelle catégorie pour organiser votre catalogue.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="catName" className="text-sm font-bold">Nom de la catégorie *</Label>
              <Input
                id="catName"
                placeholder="Ex: Assistants de rédaction"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="catSlug" className="text-sm font-bold">Identifiant (Slug)</Label>
              <Input
                id="catSlug"
                placeholder="Ex: assistants-redaction"
                value={formSlug}
                onChange={(e) => setFormSlug(slugify(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Sera utilisé dans l&apos;URL : /categories/{formSlug || '...'}
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-bold mb-1">Icône représentative</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ICONS.map((item) => (
                  <Button
                    key={item.name}
                    variant={formIcon === item.name ? 'default' : 'outline'}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setFormIcon(item.name)}
                    type="button"
                    title={item.name}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="catDesc" className="text-sm font-bold">Description</Label>
              <Textarea
                id="catDesc"
                placeholder="Décrivez brièvement à quoi sert cette catégorie..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} className="min-w-[100px]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                editMode ? 'Enregistrer les modifications' : 'Créer la catégorie'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Êtes-vous absolument sûr ?</DialogTitle>
            <DialogDescription>
              La catégorie <span className="font-bold text-foreground">"{categoryToDelete?.name}"</span> sera définitivement supprimée.
              {categoryToDelete?.toolCount > 0 && (
                <span className="block mt-2 p-2 bg-destructive/10 text-destructive rounded-md border border-destructive/20 text-sm">
                  Attention : Cette catégorie contient actuellement <span className="font-bold">{categoryToDelete.toolCount} outil(s)</span>.
                  Ces outils ne seront plus associés à cette catégorie.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleting}>
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="destructive"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Oui, supprimer définitivement'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
