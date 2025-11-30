import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  parent_id: string | null;
}

interface CategorySpecType {
  category_id: string;
  spec_type: string;
}

const SPEC_TYPES = [
  { value: 'tire', label: 'Pneus' },
  { value: 'battery', label: 'Batteries' },
  { value: 'mechanical', label: 'Pièces mécaniques' },
  { value: 'oil', label: 'Huiles et liquides' },
  { value: 'accessory', label: 'Accessoires' },
];

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [specTypes, setSpecTypes] = useState<CategorySpecType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    icon: '',
    image_url: '',
    parent_id: '',
    spec_type: '',
  });

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    setCategories(data || []);
    setLoading(false);
  };

  const fetchSpecTypes = async () => {
    const { data } = await supabase.from('category_spec_types').select('*');
    setSpecTypes(data || []);
  };

  useEffect(() => {
    fetchCategories();
    fetchSpecTypes();
  }, []);

  const getSpecTypeForCategory = (categoryId: string) => {
    const specType = specTypes.find(st => st.category_id === categoryId);
    return specType?.spec_type || null;
  };

  const getSpecTypeLabel = (specType: string | null) => {
    if (!specType) return null;
    const found = SPEC_TYPES.find(st => st.value === specType);
    return found?.label || specType;
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const getParentCategoryName = (parentId: string | null) => {
    if (!parentId) return '-';
    const parent = categories.find(c => c.id === parentId);
    return parent?.name || '-';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      icon: form.icon || null,
      image_url: form.image_url || null,
      parent_id: form.parent_id || null,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      
      if (error) {
        toast.error('Erreur lors de la modification');
        return;
      }

      // Update spec type
      await supabase.from('category_spec_types').delete().eq('category_id', editingCategory.id);
      if (form.spec_type) {
        await supabase.from('category_spec_types').insert({
          category_id: editingCategory.id,
          spec_type: form.spec_type,
        });
      }

      toast.success('Catégorie modifiée');
      setDialogOpen(false);
      fetchCategories();
      fetchSpecTypes();
    } else {
      const { data: newCat, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();
      
      if (error || !newCat) {
        toast.error('Erreur lors de la création');
        return;
      }

      // Add spec type
      if (form.spec_type) {
        await supabase.from('category_spec_types').insert({
          category_id: newCat.id,
          spec_type: form.spec_type,
        });
      }

      toast.success('Catégorie créée');
      setDialogOpen(false);
      fetchCategories();
      fetchSpecTypes();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    const specType = getSpecTypeForCategory(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id || '',
      spec_type: specType || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette catégorie ?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        toast.error('Erreur lors de la suppression');
      } else {
        toast.success('Catégorie supprimée');
        fetchCategories();
      }
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      slug: '',
      icon: '',
      image_url: '',
      parent_id: '',
      spec_type: '',
    });
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get parent categories (categories without parent)
  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <>
      <Helmet>
        <title>Catégories | Admin AutoPièces</title>
      </Helmet>

      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-roboto-condensed text-3xl font-bold">Catégories</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-5 w-5 mr-2" />
                Ajouter une catégorie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catégorie parente</Label>
                  <Select 
                    value={form.parent_id} 
                    onValueChange={(v) => setForm({ ...form, parent_id: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune (catégorie principale)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune (catégorie principale)</SelectItem>
                      {parentCategories
                        .filter(c => c.id !== editingCategory?.id)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Icône (nom Lucide)</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="Ex: Car, Wrench, Settings..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL de l'image</Label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de filtres spécifiques</Label>
                  <Select 
                    value={form.spec_type} 
                    onValueChange={(v) => setForm({ ...form, spec_type: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun filtre spécifique" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun filtre spécifique</SelectItem>
                      {SPEC_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="btn-primary">
                    {editingCategory ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Catégorie parente</TableHead>
                <TableHead>Type filtres</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucune catégorie trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>{getParentCategoryName(category.parent_id)}</TableCell>
                    <TableCell>
                      {getSpecTypeLabel(getSpecTypeForCategory(category.id)) ? (
                        <Badge variant="secondary">{getSpecTypeLabel(getSpecTypeForCategory(category.id))}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
};

export default Categories;
