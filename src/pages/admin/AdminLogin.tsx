import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, isAdmin } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in as admin
  if (isAdmin) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError('Email ou mot de passe incorrect');
        toast({
          variant: 'destructive',
          title: 'Erreur de connexion',
          description: 'Email ou mot de passe incorrect',
        });
      } else {
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue dans le back-office',
        });
        navigate('/admin');
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

      {/* Back to home button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Retour au site</span>
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

          {/* Shield icon with gradient background */}
          <div className="mx-auto w-20 h-20 bg-gradient-orange rounded-full flex items-center justify-center shadow-lg ring-4 ring-primary/20">
            <Shield className="h-10 w-10 text-white" />
          </div>

          <div>
            <CardTitle className="text-3xl font-roboto-condensed font-bold text-foreground">
              Back-Office
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground">
              Espace d'administration sécurisé
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-foreground font-medium">
                <Mail className="h-4 w-4 text-primary" />
                Email administrateur
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@senpieces.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 pl-4 pr-4 border-2 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-foreground font-medium">
                <Lock className="h-4 w-4 text-primary" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 pl-4 pr-4 border-2 focus:border-primary transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-gradient-orange hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion en cours...
                </div>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Accéder au Back-Office
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Premier utilisateur ? Le compte sera automatiquement admin
              </p>
              <Button
                variant="outline"
                className="text-primary hover:text-primary hover:bg-primary/5 border-primary/20 hover:border-primary"
                onClick={() => navigate('/auth')}
              >
                Créer un compte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;