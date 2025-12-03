import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bell, Send, Trash2, Users, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  user_id: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('promo');
  const [targetUser, setTargetUser] = useState<string>('all');
  const [link, setLink] = useState('');

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone');

    setProfiles(data || []);
  };

  useEffect(() => {
    fetchNotifications();
    fetchProfiles();
  }, []);

  const sendNotification = async () => {
    if (!title || !message) {
      toast.error('Veuillez remplir le titre et le message');
      return;
    }

    setSending(true);

    try {
      if (targetUser === 'all') {
        // Send to all users
        const notifications = profiles.map(profile => ({
          user_id: profile.id,
          title,
          message,
          type,
          link: link || null,
        }));

        const { error } = await supabase.from('notifications').insert(notifications);

        if (error) throw error;
        toast.success(`Notification envoyée à ${profiles.length} utilisateurs`);
      } else {
        // Send to specific user
        const { error } = await supabase.from('notifications').insert({
          user_id: targetUser,
          title,
          message,
          type,
          link: link || null,
        });

        if (error) throw error;
        toast.success('Notification envoyée');
      }

      // Reset form
      setTitle('');
      setMessage('');
      setLink('');
      fetchNotifications();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Notification supprimée');
      fetchNotifications();
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'promo':
        return <Badge className="bg-green-500">Promo</Badge>;
      case 'order':
        return <Badge className="bg-blue-500">Commande</Badge>;
      case 'system':
        return <Badge className="bg-yellow-500">Système</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Notifications | Admin</title>
      </Helmet>

      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="font-roboto-condensed text-3xl font-bold">Notifications</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form to send notification */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Envoyer une notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promo">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-500" />
                        Promotion
                      </div>
                    </SelectItem>
                    <SelectItem value="order">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-blue-500" />
                        Commande
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-yellow-500" />
                        Système
                      </div>
                    </SelectItem>
                    <SelectItem value="info">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Information
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Destinataire</label>
                <Select value={targetUser} onValueChange={setTargetUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Tous les utilisateurs
                      </div>
                    </SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {profile.full_name || profile.phone || 'Utilisateur'}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Titre</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nouvelle promotion!"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex: Profitez de -20% sur tous les pneus..."
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Lien (optionnel)</label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Ex: /categories/pneus"
                />
              </div>

              <Button
                className="w-full"
                onClick={sendNotification}
                disabled={sending}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Envoi en cours...' : 'Envoyer'}
              </Button>
            </CardContent>
          </Card>

          {/* Notifications list */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Historique des notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
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
                  ) : notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucune notification envoyée
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>{getTypeBadge(notification.type)}</TableCell>
                        <TableCell className="font-medium">{notification.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{notification.message}</TableCell>
                        <TableCell>
                          {format(new Date(notification.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Notifications;
