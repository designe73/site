import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, Phone, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isSignUp = searchParams.get('mode') === 'inscription';
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Convertir le numéro de téléphone en email fictif pour Supabase
  const phoneToEmail = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\s/g, '').replace(/^\+/, '');
    return `${cleanPhone}@phone.senpieces.sn`;
  };

  const validatePhone = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    // Accepter les formats: +221XXXXXXXXX, 221XXXXXXXXX, 7XXXXXXXX
    return /^(\+?221)?[0-9]{9}$/.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePhone(phone)) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      setLoading(false);
      return;
    }

    const email = phoneToEmail(phone);

    if (isSignUp) {
      if (!fullName.trim()) {
        toast.error('Veuillez entrer votre nom complet');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères');
        setLoading(false);
        return;
      }
      
      const { error } = await signUp(email, password, fullName, phone);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Ce numéro de téléphone est déjà utilisé');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Compte créé avec succès !');
        navigate('/');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('Numéro de téléphone ou mot de passe incorrect');
      } else {
        toast.success('Connexion réussie !');
        navigate('/');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>{isSignUp ? 'Inscription' : 'Connexion'} | {settings?.site_name || 'Senpieces'}</title>
      </Helmet>
      
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="font-roboto-condensed text-2xl">
                {isSignUp ? 'Créer un compte' : 'Connexion'}
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? `Rejoignez ${settings?.site_name || 'Senpieces'} pour profiter de nos offres` 
                  : 'Connectez-vous à votre compte'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Votre nom complet"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="77 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Format: 77 123 45 67 ou +221 77 123 45 67</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {isSignUp && (
                    <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
                  )}
                </div>

                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? 'Chargement...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                {isSignUp ? (
                  <p className="text-muted-foreground">
                    Déjà un compte ?{' '}
                    <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/connexion')}>
                      Se connecter
                    </Button>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Pas encore de compte ?{' '}
                    <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/inscription')}>
                      S'inscrire
                    </Button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
};

export default Auth;
