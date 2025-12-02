import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldOff, Loader2 } from 'lucide-react';

interface UserWithRole {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  is_admin: boolean;
}

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      // Combine data
      const adminUserIds = new Set(roles?.map(r => r.user_id) || []);
      
      return profiles?.map(profile => ({
        ...profile,
        is_admin: adminUserIds.has(profile.id)
      })) as UserWithRole[];
    }
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Succès',
        description: variables.isAdmin 
          ? 'Rôle admin retiré avec succès'
          : 'Rôle admin attribué avec succès'
      });
      setLoadingUserId(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
      setLoadingUserId(null);
    }
  });

  const handleToggleAdmin = (userId: string, isAdmin: boolean) => {
    setLoadingUserId(userId);
    toggleAdminMutation.mutate({ userId, isAdmin });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground mt-2">
          Attribuer ou retirer les rôles administrateur aux utilisateurs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>
            Liste de tous les utilisateurs enregistrés sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'Non renseigné'}
                  </TableCell>
                  <TableCell>{user.phone || 'Non renseigné'}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="default" className="gap-1">
                        <Shield className="w-3 h-3" />
                        Administrateur
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Utilisateur</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={user.is_admin ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                      disabled={loadingUserId === user.id}
                    >
                      {loadingUserId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : user.is_admin ? (
                        <>
                          <ShieldOff className="w-4 h-4 mr-2" />
                          Retirer admin
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Rendre admin
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
