import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldOff, Loader2, UserCog } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AppRole = 'admin' | 'moderator' | 'user';

interface UserWithRole {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role: AppRole;
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
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create a map of user roles
      const userRolesMap = new Map<string, AppRole>();
      roles?.forEach(r => {
        // Priority: admin > moderator > user
        const currentRole = userRolesMap.get(r.user_id);
        if (!currentRole || (r.role === 'admin') || (r.role === 'moderator' && currentRole === 'user')) {
          userRolesMap.set(r.user_id, r.role as AppRole);
        }
      });
      
      return profiles?.map(profile => ({
        ...profile,
        role: userRolesMap.get(profile.id) || 'user'
      })) as UserWithRole[];
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // First, delete existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) throw deleteError;

      // If new role is not 'user', add the role
      if (newRole !== 'user') {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      const roleLabels: Record<AppRole, string> = {
        admin: 'Administrateur',
        moderator: 'Modérateur',
        user: 'Utilisateur'
      };
      toast({
        title: 'Succès',
        description: `Rôle changé en ${roleLabels[variables.newRole]}`
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

  const handleRoleChange = (userId: string, newRole: AppRole) => {
    setLoadingUserId(userId);
    changeRoleMutation.mutate({ userId, newRole });
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="default" className="gap-1 bg-primary">
            <Shield className="w-3 h-3" />
            Administrateur
          </Badge>
        );
      case 'moderator':
        return (
          <Badge variant="default" className="gap-1 bg-blue-600">
            <UserCog className="w-3 h-3" />
            Modérateur
          </Badge>
        );
      default:
        return <Badge variant="secondary">Utilisateur</Badge>;
    }
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
          Attribuer des rôles aux utilisateurs (Admin, Modérateur, Utilisateur)
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
                <TableHead>Rôle actuel</TableHead>
                <TableHead className="text-right">Changer le rôle</TableHead>
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
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell className="text-right">
                    {loadingUserId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                    ) : (
                      <Select
                        value={user.role}
                        onValueChange={(value: AppRole) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-40 ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="moderator">Modérateur</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
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
