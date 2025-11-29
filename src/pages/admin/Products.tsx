import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatPrice';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  brand: string | null;
  reference: string | null;
  stock: number;
  is_featured: boolean | null;
  is_promo: boolean | null;
  category_id: string | null;
  description: string | null;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    brand: '',
    reference: '',
    stock: '0',
    category_id: '',
    is_featured: false,
    is_promo: false,
  });

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    setCategories(data || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      image_url: form.image_url || null,
      brand: form.brand || null,
      reference: form.reference || null,
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      is_promo: form.is_promo,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      
      if (error) {
        toast.error('Erreur lors de la modification');
      } else {
        toast.success('Produit modifié');
        setDialogOpen(false);
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData);
      
      if (error) {
        toast.error('Erreur lors de la création');
      } else {
        toast.success('Produit créé');
        setDialogOpen(false);
        fetchProducts();
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      image_url: product.image_url || '',
      brand: product.brand || '',
      reference: product.reference || '',
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      is_featured: product.is_featured || false,
      is_promo: product.is_promo || false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce produit ?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        toast.error('Erreur lors de la suppression');
      } else {
        toast.success('Produit supprimé');
        fetchProducts();
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      original_price: '',
      image_url: '',
      brand: '',
      reference: '',
      stock: '0',
      category_id: '',
      is_featured: false,
      is_promo: false,
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Produits | Admin AutoPièces</title>
      </Helmet>

      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-roboto-condensed text-3xl font-bold">Produits</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-5 w-5 mr-2" />
                Ajouter un produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prix (CFA) *</Label>
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix barré (CFA)</Label>
                    <Input
                      type="number"
                      value={form.original_price}
                      onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Marque</Label>
                    <Input
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Référence</Label>
                    <Input
                      value={form.reference}
                      onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_featured}
                      onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                    />
                    <Label>Produit vedette</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_promo}
                      onCheckedChange={(v) => setForm({ ...form, is_promo: v })}
                    />
                    <Label>En promotion</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="btn-primary">
                    {editingProduct ? 'Modifier' : 'Créer'}
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
              placeholder="Rechercher un produit..."
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
                <TableHead>Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun produit trouvé
                  </TableCell>
                </TableRow>
              ) : (
              filteredProducts.map((product) => {
                  const category = categories.find(c => c.id === product.category_id);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                          {product.image_url && (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.reference || '-'}</TableCell>
                      <TableCell>{category?.name || '-'}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <span className={product.stock > 0 ? 'text-success' : 'text-destructive'}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
};

export default Products;
