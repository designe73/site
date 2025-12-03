import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
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

          {/* Mail icon with gradient background */}
          <div className="mx-auto w-20 h-20 bg-gradient-orange rounded-full flex items-center justify-center shadow-lg ring-4 ring-primary/20">
            {success ? (
              <CheckCircle className="h-10 w-10 text-white" />
            ) : (
              <Mail className="h-10 w-10 text-white" />
            )}
          </div>

          <div>
            <CardTitle className="text-3xl font-roboto-condensed font-bold text-foreground">
              {success ? 'Email envoyé !' : 'Mot de passe oublié'}
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground">
              {success 
                ? 'Vérifiez votre boîte de réception' 
                : 'Entrez votre email pour réinitialiser votre mot de passe'}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {success ? (
            <div className="space-y-6">
              <Alert className="bg-primary/10 border-primary/20">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-foreground">
                  Un email de réinitialisation a été envoyé à <strong>{email}</strong>. 
                  Cliquez sur le lien dans l'email pour créer un nouveau mot de passe.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vous n'avez pas reçu l'email ?
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSuccess(false)}
                  className="text-primary hover:text-primary hover:bg-primary/5 border-primary/20 hover:border-primary"
                >
                  Renvoyer l'email
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-foreground font-medium">
                  <Mail className="h-4 w-4 text-primary" />
                  Email administrateur
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@senpieces.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Envoi en cours...
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Envoyer le lien de réinitialisation
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center">
            <div className="h-px bg-border mb-4" />
            <Link 
              to="/admin/connexion"
              className="text-sm text-primary hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
