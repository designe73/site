import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link: string | null;
  is_active: boolean | null;
  position: number | null;
}

const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link: '',
    is_active: true,
    position: '0',
  });

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('position', { ascending: true });
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bannerData = {
      title: form.title,
      subtitle: form.subtitle || null,
      image_url: form.image_url,
      link: form.link || null,
      is_active: form.is_active,
      position: parseInt(form.position) || 0,
    };

    if (editingBanner) {
      const { error } = await supabase
        .from('banners')
        .update(bannerData)
        .eq('id', editingBanner.id);
      
      if (error) {
        toast.error('Erreur lors de la modification');
        return;
      }
      toast.success('Bannière modifiée');
    } else {
      const { error } = await supabase
        .from('banners')
        .insert(bannerData);
      
      if (error) {
        toast.error('Erreur lors de la création');
        return;
      }
      toast.success('Bannière créée');
    }
    
    setDialogOpen(false);
    fetchBanners();
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link: banner.link || '',
      is_active: banner.is_active ?? true,
      position: (banner.position ?? 0).toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette bannière ?')) {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) {
        toast.error('Erreur lors de la suppression');
      } else {
        toast.success('Bannière supprimée');
        fetchBanners();
      }
    }
  };

  const toggleActive = async (banner: Banner) => {
    const { error } = await supabase
      .from('banners')
      .update({ is_active: !banner.is_active })
      .eq('id', banner.id);
    
    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      fetchBanners();
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setForm({
      title: '',
      subtitle: '',
      image_url: '',
      link: '',
      is_active: true,
      position: '0',
    });
  };

  return (
    <>
      <Helmet>
        <title>Bannières | Admin AutoPièces</title>
      </Helmet>

      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-roboto-condensed text-3xl font-bold">Bannières</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-5 w-5 mr-2" />
                Ajouter une bannière
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? 'Modifier la bannière' : 'Nouvelle bannière'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sous-titre</Label>
                  <Input
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL de l'image *</Label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>

                {form.image_url && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={form.image_url} 
                      alt="Aperçu" 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Lien (URL)</Label>
                  <Input
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="https://... ou /categorie/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      type="number"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                    />
                    <Label>Actif</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="btn-primary">
                    {editingBanner ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Pos.</TableHead>
                <TableHead className="w-24">Image</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Lien</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucune bannière
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        {banner.position ?? 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-20 h-12 bg-muted rounded overflow-hidden">
                        <img 
                          src={banner.image_url} 
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{banner.title}</p>
                        {banner.subtitle && (
                          <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {banner.link || '-'}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleActive(banner)}
                        className={banner.is_active ? 'text-success' : 'text-muted-foreground'}
                      >
                        {banner.is_active ? (
                          <><Eye className="h-4 w-4 mr-1" /> Actif</>
                        ) : (
                          <><EyeOff className="h-4 w-4 mr-1" /> Inactif</>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDelete(banner.id)}
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

export default Banners;
