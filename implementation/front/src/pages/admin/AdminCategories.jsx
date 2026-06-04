import { useState } from 'react';
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
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Layers } from 'lucide-react';
import { categories } from '../../lib/mock-data';

// Composant StatCard local
function StatCard({ title, value, icon: Icon, description, variant = 'primary' }) {
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
        <div className={`rounded-full p-2 ${variantClasses[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminCategories() {
  const [searchQuery, setSearchQuery] = useState('');
  // Utilisation des catégories mock existantes (avec toolCount)
  const [categoriesList, setCategoriesList] = useState(categories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const filteredCategories = categoriesList.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTools = categoriesList.reduce((sum, cat) => sum + cat.toolCount, 0);

  const handleDelete = (category) => {
    if (window.confirm(`Supprimer la catégorie "${category.name}" ?`)) {
      setCategoriesList(categoriesList.filter(c => c.id !== category.id));
    }
  };

  const openEdit = (category) => {
    setSelectedCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDesc(category.description || '');
    setEditMode(true);
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setSelectedCategory(null);
    setEditMode(false);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editMode && selectedCategory) {
      setCategoriesList(categoriesList.map(c =>
        c.id === selectedCategory.id
          ? { ...c, name: formName, slug: formSlug, description: formDesc }
          : c
      ));
    } else {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name: formName,
        slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'),
        description: formDesc,
        icon: 'Layers',
        toolCount: 0
      };
      setCategoriesList([...categoriesList, newCategory]);
    }
    setIsAddDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des catégories</h1>
          <p className="text-muted-foreground mt-1">Organisez les outils par catégories</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Total catégories" value={categoriesList.length} icon={Layers} variant="primary" />
        <StatCard
          title="Total outils classés"
          value={totalTools}
          icon={Layers}
          description="répartis dans les catégories"
        />
      </div>

      {/* Tableau des catégories */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des catégories</CardTitle>
          <CardDescription>
            {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Outils</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">/{category.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
                        {category.description || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category.toolCount} outils</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(category)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogue d'ajout / modification */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && (resetForm(), setIsAddDialogOpen(false))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie pour organiser les outils'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="catName">Nom *</Label>
              <Input
                id="catName"
                placeholder="Ex: Assistants"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="catSlug">Slug (identifiant)</Label>
              <Input
                id="catSlug"
                placeholder="Ex: assistants"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="catDesc">Description</Label>
              <Textarea
                id="catDesc"
                placeholder="Description de la catégorie..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setIsAddDialogOpen(false); }}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editMode ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}