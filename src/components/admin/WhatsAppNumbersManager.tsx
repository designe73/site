import { useState } from 'react';
import { Plus, Trash2, GripVertical, Loader2, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useWhatsAppNumbersAdmin } from '@/hooks/useWhatsAppNumber';

const WhatsAppNumbersManager = () => {
  const { numbers, loading, addNumber, updateNumber, deleteNumber } = useWhatsAppNumbersAdmin();
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newPhone.trim()) {
      toast.error('Veuillez entrer un numéro de téléphone');
      return;
    }

    setAdding(true);
    try {
      await addNumber(newPhone.trim(), newName.trim() || undefined);
      setNewPhone('');
      setNewName('');
      toast.success('Numéro ajouté avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du numéro');
      console.error(error);
    }
    setAdding(false);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateNumber(id, { is_active: isActive });
      toast.success(isActive ? 'Numéro activé' : 'Numéro désactivé');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce numéro ?')) return;
    
    try {
      await deleteNumber(id);
      toast.success('Numéro supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          Numéros WhatsApp
        </CardTitle>
        <CardDescription>
          Gérez les numéros WhatsApp pour recevoir les commandes. Les numéros sont utilisés en rotation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new number */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label htmlFor="newPhone" className="sr-only">Numéro de téléphone</Label>
            <Input
              id="newPhone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+221 77 123 45 67"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="newName" className="sr-only">Nom (optionnel)</Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom (optionnel)"
            />
          </div>
          <Button onClick={handleAdd} disabled={adding} className="shrink-0">
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </>
            )}
          </Button>
        </div>

        {/* List of numbers */}
        {numbers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun numéro WhatsApp configuré</p>
            <p className="text-sm">Le numéro par défaut des paramètres sera utilisé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {numbers.map((number, index) => (
              <div
                key={number.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  number.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                }`}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{number.phone_number}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  {number.name && (
                    <p className="text-sm text-muted-foreground truncate">{number.name}</p>
                  )}
                </div>

                <Switch
                  checked={number.is_active}
                  onCheckedChange={(checked) => handleToggleActive(number.id, checked)}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleDelete(number.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Les numéros actifs sont utilisés en rotation pour distribuer les commandes équitablement.
        </p>
      </CardContent>
    </Card>
  );
};

export default WhatsAppNumbersManager;