import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a valid recovery session
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
      } else {
        toast({
          title: 'Mot de passe mis à jour',
          description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe',
        });
        navigate('/admin/connexion');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-light rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back to login button */}
      <Link 
        to="/admin/connexion" 
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Retour à la connexion</span>
      </Link>

      <Card className="w-full max-w-md shadow-2xl border-2 border-border/50 backdrop-blur-sm bg-card/95 animate-slide-up relative z-10">
        <CardHeader className="space-y-6 text-center pb-8 pt-10">
          {/* Logo SEN PIECES */}
          <div className="mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-gradient-orange text-primary-foreground font-roboto-condensed text-3xl font-bold px-4 py-2 rounded shadow-lg">
                SEN
              </div>
              <span className="font-roboto-condensed text-3xl font-bold text-foreground">
                PIECES
              </span>
            </div>
          </div>

          {/* Key icon with gradient background */}
          <div className="mx-auto w-20 h-20 bg-gradient-orange rounded-full flex items-center justify-center shadow-lg ring-4 ring-primary/20">
            <KeyRound className="h-10 w-10 text-white" />
          </div>

          <div>
            <CardTitle className="text-3xl font-roboto-condensed font-bold text-foreground">
              Nouveau mot de passe
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground">
              Créez un nouveau mot de passe sécurisé
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-foreground font-medium">
                <Lock className="h-4 w-4 text-primary" />
                Nouveau mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-12 border-2 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-foreground font-medium">
                <Lock className="h-4 w-4 text-primary" />
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-12 border-2 focus:border-primary transition-all"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-gradient-orange hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mise à jour...
                </div>
              ) : (
                'Mettre à jour le mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
