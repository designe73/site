import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CategoryBanner {
  id: string;
  category_id: string | null;
  image_url: string;
  link: string | null;
  title: string | null;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

const CategoryBanners = () => {
  const [banners, setBanners] = useState<CategoryBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBanner, setNewBanner] = useState({
    category_id: '',
    image_url: '',
    link: '',
    title: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [bannersRes, categoriesRes] = await Promise.all([
      supabase.from('category_banners').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name').order('name'),
    ]);

    if (bannersRes.data) setBanners(bannersRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newBanner.category_id || !newBanner.image_url) {
      toast.error('Catégorie et image sont requis');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('category_banners').insert({
      category_id: newBanner.category_id,
      image_url: newBanner.image_url,
      link: newBanner.link || null,
      title: newBanner.title || null,
    });

    if (error) {
      toast.error('Erreur lors de l\'ajout');
      console.error(error);
    } else {
      toast.success('Bannière ajoutée');
      setNewBanner({ category_id: '', image_url: '', link: '', title: '' });
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette bannière ?')) return;

    const { error } = await supabase.from('category_banners').delete().eq('id', id);
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Bannière supprimée');
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('category_banners')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      setBanners(banners.map(b => b.id === id ? { ...b, is_active: isActive } : b));
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Aucune';
    return categories.find(c => c.id === categoryId)?.name || 'Inconnue';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Bannières Catégories | Admin</title>
      </Helmet>

      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-roboto-condensed text-3xl font-bold mb-2">
            Bannières par catégorie
          </h1>
          <p className="text-muted-foreground">
            Gérez les bannières latérales affichées à côté des produits de chaque catégorie
          </p>
        </div>

        {/* Add new banner */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ajouter une bannière
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={newBanner.category_id}
                  onValueChange={(value) => setNewBanner({ ...newBanner, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>URL Image</Label>
                <Input
                  value={newBanner.image_url}
                  onChange={(e) => setNewBanner({ ...newBanner, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Titre (optionnel)</Label>
                <Input
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  placeholder="Promo été"
                />
              </div>

              <div className="space-y-2">
                <Label>Lien (optionnel)</Label>
                <Input
                  value={newBanner.link}
                  onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                  placeholder="/categorie/..."
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleAdd} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ajouter'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing banners */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <Card key={banner.id} className={!banner.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-4">
                <div className="aspect-[3/4] relative mb-4 rounded-lg overflow-hidden bg-muted">
                  {banner.image_url ? (
                    <img
                      src={banner.image_url}
                      alt={banner.title || 'Bannière'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="font-medium">{banner.title || 'Sans titre'}</p>
                  <p className="text-sm text-muted-foreground">
                    Catégorie: {getCategoryName(banner.category_id)}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={(checked) => handleToggle(banner.id, checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {banners.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Aucune bannière configurée
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryBanners;
